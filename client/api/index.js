import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;

let pool = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set. Please add DATABASE_URL in Vercel Project Settings > Environment Variables.');
    }
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

async function query(text, params) {
  const p = getPool();
  return await p.query(text, params);
}

function generateInvoiceNo() {
  const prefix = 'INV-B2C-';
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const time = Date.now().toString().slice(-4);
  return `${prefix}${time}${randomSuffix}`;
}

const app = express();

app.use(cors());
app.use(express.json());

// Normalize URL from Vercel rewrites
app.use((req, res, next) => {
  const matchedPath = req.headers['x-matched-path'];
  if (matchedPath) {
    req.url = matchedPath;
  }
  next();
});

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'vercel-esm-serverless', time: new Date().toISOString() });
});

// Stats
router.get('/stats', async (req, res) => {
  try {
    const totalB2BRes = await query('SELECT COUNT(*) as count FROM b2b_inventory');
    const inStockB2BRes = await query("SELECT COUNT(*) as count FROM b2b_inventory WHERE status = 'In Stock'");
    const soldB2BRes = await query("SELECT COUNT(*) as count FROM b2b_inventory WHERE status = 'Sold to B2C'");
    const totalB2CRes = await query('SELECT COUNT(*) as count FROM b2c_sales');

    const invValRes = await query("SELECT COALESCE(SUM(purchase_price), 0) as val FROM b2b_inventory WHERE status = 'In Stock'");
    const revValRes = await query("SELECT COALESCE(SUM(sale_price), 0) as val FROM b2c_sales");

    const profitRes = await query(`
      SELECT COALESCE(SUM(b2c.sale_price - b2b.purchase_price), 0) as profit
      FROM b2c_sales b2c
      JOIN b2b_inventory b2b ON b2c.b2b_item_id = b2b.id OR b2c.imei = b2b.imei
    `);

    const recentB2BRes = await query(`
      SELECT id, purchased_from, model, imei, TO_CHAR(purchase_date, 'YYYY-MM-DD') as purchase_date, purchase_price, status, created_at 
      FROM b2b_inventory 
      ORDER BY id DESC LIMIT 5
    `);

    const recentB2CRes = await query(`
      SELECT id, from_source, model, imei, sold_to, TO_CHAR(sale_date, 'YYYY-MM-DD') as sale_date, sale_price, invoice_no, created_at 
      FROM b2c_sales 
      ORDER BY id DESC LIMIT 5
    `);

    res.json({
      totalB2B: parseInt(totalB2BRes.rows[0].count, 10),
      inStockB2B: parseInt(inStockB2BRes.rows[0].count, 10),
      soldB2B: parseInt(soldB2BRes.rows[0].count, 10),
      totalB2C: parseInt(totalB2CRes.rows[0].count, 10),
      inventoryValue: parseFloat(invValRes.rows[0].val),
      totalRevenue: parseFloat(revValRes.rows[0].val),
      estimatedProfit: parseFloat(profitRes.rows[0].profit),
      recentB2B: recentB2BRes.rows,
      recentB2C: recentB2CRes.rows
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// B2B
router.get('/b2b', async (req, res) => {
  try {
    const { search, status } = req.query;
    let text = `
      SELECT id, purchased_from, model, imei, TO_CHAR(purchase_date, 'YYYY-MM-DD') as purchase_date, 
             purchase_price, status, invoice_no, notes, created_at
      FROM b2b_inventory 
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      params.push(status);
      text += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      text += ` AND (purchased_from ILIKE $${idx} OR model ILIKE $${idx} OR imei ILIKE $${idx} OR invoice_no ILIKE $${idx})`;
    }

    text += ' ORDER BY id DESC';
    const result = await query(text, params);
    res.json(result.rows);
  } catch (error) {
    console.error('B2B list error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/b2b', async (req, res) => {
  try {
    const { purchased_from, model, imei, purchase_date, purchase_price, status, invoice_no, notes } = req.body;

    if (!purchased_from || !model || !imei || !purchase_date) {
      return res.status(400).json({ error: 'Purchased From, Model, IMEI, and Purchase Date are required.' });
    }

    const dupCheck = await query('SELECT id FROM b2b_inventory WHERE imei = $1', [imei.trim()]);
    if (dupCheck.rows.length > 0) {
      return res.status(400).json({ error: `An item with IMEI "${imei.trim()}" already exists in B2B inventory.` });
    }

    const insertRes = await query(`
      INSERT INTO b2b_inventory (purchased_from, model, imei, purchase_date, purchase_price, status, invoice_no, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, purchased_from, model, imei, TO_CHAR(purchase_date, 'YYYY-MM-DD') as purchase_date, purchase_price, status, invoice_no, notes, created_at
    `, [
      purchased_from.trim(),
      model.trim(),
      imei.trim(),
      purchase_date,
      Number(purchase_price) || 0,
      status || 'In Stock',
      invoice_no ? invoice_no.trim() : null,
      notes ? notes.trim() : null
    ]);

    res.status(201).json(insertRes.rows[0]);
  } catch (error) {
    console.error('B2B create error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/b2b/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { purchased_from, model, imei, purchase_date, purchase_price, status, invoice_no, notes } = req.body;

    if (imei) {
      const dup = await query('SELECT id FROM b2b_inventory WHERE imei = $1 AND id != $2', [imei.trim(), id]);
      if (dup.rows.length > 0) {
        return res.status(400).json({ error: `Another item already has IMEI "${imei.trim()}".` });
      }
    }

    const updateRes = await query(`
      UPDATE b2b_inventory
      SET purchased_from = $1, model = $2, imei = $3, purchase_date = $4, purchase_price = $5, status = $6, invoice_no = $7, notes = $8
      WHERE id = $9
      RETURNING id, purchased_from, model, imei, TO_CHAR(purchase_date, 'YYYY-MM-DD') as purchase_date, purchase_price, status, invoice_no, notes, created_at
    `, [
      purchased_from.trim(),
      model.trim(),
      imei.trim(),
      purchase_date,
      Number(purchase_price) || 0,
      status || 'In Stock',
      invoice_no ? invoice_no.trim() : null,
      notes ? notes.trim() : null,
      id
    ]);

    res.json(updateRes.rows[0]);
  } catch (error) {
    console.error('B2B update error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/b2b/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM b2b_inventory WHERE id = $1', [id]);
    res.json({ success: true, message: 'Item deleted from B2B inventory.' });
  } catch (error) {
    console.error('B2B delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/b2b/:id/transfer-to-b2c', async (req, res) => {
  try {
    const { id } = req.params;
    const { sold_to, customer_phone, customer_email, sale_date, sale_price, payment_method, warranty_months, notes, invoice_no } = req.body;

    const b2bCheck = await query('SELECT * FROM b2b_inventory WHERE id = $1', [id]);
    if (b2bCheck.rows.length === 0) {
      return res.status(404).json({ error: 'B2B inventory item not found.' });
    }

    const b2bItem = b2bCheck.rows[0];

    if (!sold_to || !sale_date) {
      return res.status(400).json({ error: 'Customer Name (Sold To) and Sale Date are required.' });
    }

    const finalInvoiceNo = invoice_no && invoice_no.trim() ? invoice_no.trim() : generateInvoiceNo();

    await query("UPDATE b2b_inventory SET status = 'Sold to B2C' WHERE id = $1", [id]);

    const b2cRes = await query(`
      INSERT INTO b2c_sales (
        from_source, model, imei, sold_to, customer_phone, customer_email,
        sale_date, sale_price, payment_method, warranty_months, invoice_no, b2b_item_id, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, from_source, model, imei, sold_to, customer_phone, customer_email,
                TO_CHAR(sale_date, 'YYYY-MM-DD') as sale_date, sale_price, payment_method,
                warranty_months, invoice_no, b2b_item_id, notes, created_at
    `, [
      b2bItem.purchased_from,
      b2bItem.model,
      b2bItem.imei,
      sold_to.trim(),
      customer_phone ? customer_phone.trim() : null,
      customer_email ? customer_email.trim() : null,
      sale_date,
      Number(sale_price) || 0,
      payment_method || 'Cash',
      Number(warranty_months) || 12,
      finalInvoiceNo,
      b2bItem.id,
      notes ? notes.trim() : `Dispatched from B2B vendor: ${b2bItem.purchased_from}`
    ]);

    res.status(201).json({
      success: true,
      message: 'Item transferred to B2C successfully on Supabase!',
      b2c: b2cRes.rows[0]
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: error.message });
  }
});

// B2C
router.get('/b2c', async (req, res) => {
  try {
    const { search } = req.query;
    let text = `
      SELECT b2c.id, b2c.from_source, b2c.model, b2c.imei, b2c.sold_to, b2c.customer_phone, b2c.customer_email,
             TO_CHAR(b2c.sale_date, 'YYYY-MM-DD') as sale_date, b2c.sale_price, b2c.payment_method,
             b2c.warranty_months, b2c.invoice_no, b2c.b2b_item_id, b2c.notes, b2c.created_at,
             b2b.purchase_price, TO_CHAR(b2b.purchase_date, 'YYYY-MM-DD') as purchase_date, b2b.purchased_from as b2b_vendor
      FROM b2c_sales b2c
      LEFT JOIN b2b_inventory b2b ON b2c.b2b_item_id = b2b.id OR b2c.imei = b2b.imei
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      text += ` AND (b2c.from_source ILIKE $${idx} OR b2c.model ILIKE $${idx} OR b2c.imei ILIKE $${idx} OR b2c.sold_to ILIKE $${idx} OR b2c.invoice_no ILIKE $${idx} OR b2c.customer_phone ILIKE $${idx})`;
    }

    text += ' ORDER BY b2c.id DESC';
    const result = await query(text, params);
    res.json(result.rows);
  } catch (error) {
    console.error('B2C list error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/b2c', async (req, res) => {
  try {
    const {
      from_source,
      model,
      imei,
      sold_to,
      customer_phone,
      customer_email,
      sale_date,
      sale_price,
      payment_method,
      warranty_months,
      invoice_no,
      notes
    } = req.body;

    if (!from_source || !model || !imei || !sold_to || !sale_date) {
      return res.status(400).json({ error: 'From, Model, IMEI, Sold To, and Sale Date are required.' });
    }

    const finalInvoiceNo = invoice_no && invoice_no.trim() ? invoice_no.trim() : generateInvoiceNo();

    const existingInvoice = await query('SELECT id FROM b2c_sales WHERE invoice_no = $1', [finalInvoiceNo]);
    if (existingInvoice.rows.length > 0) {
      return res.status(400).json({ error: `Invoice "${finalInvoiceNo}" already exists.` });
    }

    const matchingB2B = await query('SELECT * FROM b2b_inventory WHERE imei = $1', [imei.trim()]);
    let linkedB2BId = null;
    if (matchingB2B.rows.length > 0) {
      linkedB2BId = matchingB2B.rows[0].id;
      await query("UPDATE b2b_inventory SET status = 'Sold to B2C' WHERE id = $1", [linkedB2BId]);
    }

    const insertRes = await query(`
      INSERT INTO b2c_sales (
        from_source, model, imei, sold_to, customer_phone, customer_email,
        sale_date, sale_price, payment_method, warranty_months, invoice_no, b2b_item_id, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, from_source, model, imei, sold_to, customer_phone, customer_email,
                TO_CHAR(sale_date, 'YYYY-MM-DD') as sale_date, sale_price, payment_method,
                warranty_months, invoice_no, b2b_item_id, notes, created_at
    `, [
      from_source.trim(),
      model.trim(),
      imei.trim(),
      sold_to.trim(),
      customer_phone ? customer_phone.trim() : null,
      customer_email ? customer_email.trim() : null,
      sale_date,
      Number(sale_price) || 0,
      payment_method || 'Cash',
      Number(warranty_months) || 12,
      finalInvoiceNo,
      linkedB2BId,
      notes ? notes.trim() : null
    ]);

    res.status(201).json(insertRes.rows[0]);
  } catch (error) {
    console.error('B2C create error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/b2c/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      from_source,
      model,
      imei,
      sold_to,
      customer_phone,
      customer_email,
      sale_date,
      sale_price,
      payment_method,
      warranty_months,
      invoice_no,
      notes
    } = req.body;

    const updateRes = await query(`
      UPDATE b2c_sales
      SET from_source = $1, model = $2, imei = $3, sold_to = $4, customer_phone = $5, customer_email = $6,
          sale_date = $7, sale_price = $8, payment_method = $9, warranty_months = $10, invoice_no = $11, notes = $12
      WHERE id = $13
      RETURNING id, from_source, model, imei, sold_to, customer_phone, customer_email,
                TO_CHAR(sale_date, 'YYYY-MM-DD') as sale_date, sale_price, payment_method,
                warranty_months, invoice_no, b2b_item_id, notes, created_at
    `, [
      from_source.trim(),
      model.trim(),
      imei.trim(),
      sold_to.trim(),
      customer_phone ? customer_phone.trim() : null,
      customer_email ? customer_email.trim() : null,
      sale_date,
      Number(sale_price) || 0,
      payment_method || 'Cash',
      Number(warranty_months) || 12,
      invoice_no ? invoice_no.trim() : null,
      notes ? notes.trim() : null,
      id
    ]);

    res.json(updateRes.rows[0]);
  } catch (error) {
    console.error('B2C update error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/b2c/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const saleCheck = await query('SELECT * FROM b2c_sales WHERE id = $1', [id]);

    if (saleCheck.rows.length > 0) {
      const sale = saleCheck.rows[0];
      if (sale.b2b_item_id) {
        await query("UPDATE b2b_inventory SET status = 'In Stock' WHERE id = $1", [sale.b2b_item_id]);
      } else if (sale.imei) {
        await query("UPDATE b2b_inventory SET status = 'In Stock' WHERE imei = $1", [sale.imei]);
      }
    }

    await query('DELETE FROM b2c_sales WHERE id = $1', [id]);
    res.json({ success: true, message: 'B2C sale record removed and stock restored if applicable.' });
  } catch (error) {
    console.error('B2C delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// IMEI Tracker
router.get('/imei/lookup/:imei', async (req, res) => {
  try {
    const { imei } = req.params;
    const cleanImei = imei.trim();

    const b2bRes = await query(`
      SELECT id, purchased_from, model, imei, TO_CHAR(purchase_date, 'YYYY-MM-DD') as purchase_date, purchase_price, status, invoice_no, notes 
      FROM b2b_inventory WHERE imei = $1
    `, [cleanImei]);

    const b2cRes = await query(`
      SELECT id, from_source, model, imei, sold_to, customer_phone, customer_email, TO_CHAR(sale_date, 'YYYY-MM-DD') as sale_date, sale_price, payment_method, warranty_months, invoice_no, notes 
      FROM b2c_sales WHERE imei = $1
    `, [cleanImei]);

    const b2bItem = b2bRes.rows[0] || null;
    const b2cSale = b2cRes.rows[0] || null;

    if (!b2bItem && !b2cSale) {
      return res.status(404).json({
        found: false,
        imei: cleanImei,
        message: `No records found for IMEI "${cleanImei}".`
      });
    }

    let status = 'Unknown';
    if (b2cSale) {
      status = 'Sold to Customer (B2C)';
    } else if (b2bItem) {
      status = b2bItem.status === 'In Stock' ? 'Available in B2B Stock' : b2bItem.status;
    }

    const b2cPrice = b2cSale ? parseFloat(b2cSale.sale_price) : null;
    const b2bPrice = b2bItem ? parseFloat(b2bItem.purchase_price) : null;

    const margin = (b2cPrice !== null && b2bPrice !== null) ? (b2cPrice - b2bPrice) : null;
    const marginPercent = margin !== null && b2bPrice > 0 ? ((margin / b2bPrice) * 100).toFixed(1) : null;

    res.json({
      found: true,
      imei: cleanImei,
      status,
      model: (b2bItem && b2bItem.model) || (b2cSale && b2cSale.model),
      margin,
      marginPercent,
      b2b: b2bItem,
      b2c: b2cSale
    });
  } catch (error) {
    console.error('IMEI lookup error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.use('/api', router);
app.use('/', router);

export default app;

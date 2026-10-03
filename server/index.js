const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to generate Invoice No
function generateInvoiceNo() {
  const prefix = 'INV-B2C-';
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const time = Date.now().toString().slice(-4);
  return `${prefix}${time}${randomSuffix}`;
}

// ----------------------------------------------------
// DASHBOARD & STATS API
// ----------------------------------------------------
app.get('/api/stats', (req, res) => {
  try {
    const totalB2B = db.prepare('SELECT COUNT(*) as count FROM b2b_inventory').get().count;
    const inStockB2B = db.prepare("SELECT COUNT(*) as count FROM b2b_inventory WHERE status = 'In Stock'").get().count;
    const soldB2B = db.prepare("SELECT COUNT(*) as count FROM b2b_inventory WHERE status = 'Sold to B2C'").get().count;
    const totalB2C = db.prepare('SELECT COUNT(*) as count FROM b2c_sales').get().count;

    const inventoryValue = db.prepare("SELECT COALESCE(SUM(purchase_price), 0) as val FROM b2b_inventory WHERE status = 'In Stock'").get().val;
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(sale_price), 0) as val FROM b2c_sales").get().val;

    // Calculate profit for items that were sourced through B2B and sold in B2C
    const profitCalc = db.prepare(`
      SELECT COALESCE(SUM(b2c.sale_price - b2b.purchase_price), 0) as profit
      FROM b2c_sales b2c
      JOIN b2b_inventory b2b ON b2c.b2b_item_id = b2b.id OR b2c.imei = b2b.imei
    `).get().profit;

    // Recent 5 transactions
    const recentB2B = db.prepare('SELECT id, purchased_from, model, imei, purchase_date, purchase_price, status, created_at FROM b2b_inventory ORDER BY id DESC LIMIT 5').all();
    const recentB2C = db.prepare('SELECT id, from_source, model, imei, sold_to, sale_date, sale_price, invoice_no, created_at FROM b2c_sales ORDER BY id DESC LIMIT 5').all();

    res.json({
      totalB2B,
      inStockB2B,
      soldB2B,
      totalB2C,
      inventoryValue,
      totalRevenue,
      estimatedProfit: profitCalc,
      recentB2B,
      recentB2C
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// B2B INVENTORY APIS
// ----------------------------------------------------
app.get('/api/b2b', (req, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT * FROM b2b_inventory WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (purchased_from LIKE ? OR model LIKE ? OR imei LIKE ? OR invoice_no LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY id DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (error) {
    console.error('B2B list error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/b2b', (req, res) => {
  try {
    const { purchased_from, model, imei, purchase_date, purchase_price, status, invoice_no, notes } = req.body;

    if (!purchased_from || !model || !imei || !purchase_date) {
      return res.status(400).json({ error: 'Purchased From, Model, IMEI, and Purchase Date are required.' });
    }

    // Check if IMEI already exists in B2B
    const existing = db.prepare('SELECT id FROM b2b_inventory WHERE imei = ?').get(imei.trim());
    if (existing) {
      return res.status(400).json({ error: `An item with IMEI "${imei.trim()}" already exists in B2B inventory.` });
    }

    const stmt = db.prepare(`
      INSERT INTO b2b_inventory (purchased_from, model, imei, purchase_date, purchase_price, status, invoice_no, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      purchased_from.trim(),
      model.trim(),
      imei.trim(),
      purchase_date,
      Number(purchase_price) || 0,
      status || 'In Stock',
      invoice_no ? invoice_no.trim() : null,
      notes ? notes.trim() : null
    );

    const newItem = db.prepare('SELECT * FROM b2b_inventory WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('B2B create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/b2b/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { purchased_from, model, imei, purchase_date, purchase_price, status, invoice_no, notes } = req.body;

    // Check duplicate IMEI on another item
    if (imei) {
      const dup = db.prepare('SELECT id FROM b2b_inventory WHERE imei = ? AND id != ?').get(imei.trim(), id);
      if (dup) {
        return res.status(400).json({ error: `Another item already has IMEI "${imei.trim()}".` });
      }
    }

    const stmt = db.prepare(`
      UPDATE b2b_inventory
      SET purchased_from = ?, model = ?, imei = ?, purchase_date = ?, purchase_price = ?, status = ?, invoice_no = ?, notes = ?
      WHERE id = ?
    `);

    stmt.run(
      purchased_from.trim(),
      model.trim(),
      imei.trim(),
      purchase_date,
      Number(purchase_price) || 0,
      status || 'In Stock',
      invoice_no ? invoice_no.trim() : null,
      notes ? notes.trim() : null,
      id
    );

    const updated = db.prepare('SELECT * FROM b2b_inventory WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('B2B update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/b2b/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM b2b_inventory WHERE id = ?').run(id);
    res.json({ success: true, message: 'Item deleted from B2B inventory.' });
  } catch (error) {
    console.error('B2B delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Transfer / Sell B2B item directly to B2C Customer
app.post('/api/b2b/:id/transfer-to-b2c', (req, res) => {
  try {
    const { id } = req.params;
    const { sold_to, customer_phone, customer_email, sale_date, sale_price, payment_method, warranty_months, notes, invoice_no } = req.body;

    const b2bItem = db.prepare('SELECT * FROM b2b_inventory WHERE id = ?').get(id);
    if (!b2bItem) {
      return res.status(404).json({ error: 'B2B inventory item not found.' });
    }

    if (!sold_to || !sale_date) {
      return res.status(400).json({ error: 'Customer Name (Sold To) and Sale Date are required.' });
    }

    const finalInvoiceNo = invoice_no && invoice_no.trim() ? invoice_no.trim() : generateInvoiceNo();

    const transferTx = db.transaction(() => {
      // 1. Update B2B status to 'Sold to B2C'
      db.prepare("UPDATE b2b_inventory SET status = 'Sold to B2C' WHERE id = ?").run(id);

      // 2. Insert into B2C Sales
      const insertB2C = db.prepare(`
        INSERT INTO b2c_sales (
          from_source, model, imei, sold_to, customer_phone, customer_email,
          sale_date, sale_price, payment_method, warranty_months, invoice_no, b2b_item_id, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const b2cResult = insertB2C.run(
        b2bItem.purchased_from, // auto populated from B2B
        b2bItem.model,          // auto populated from B2B
        b2bItem.imei,           // auto populated from B2B
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
      );

      return b2cResult.lastInsertRowid;
    });

    const newB2CId = transferTx();
    const createdB2C = db.prepare('SELECT * FROM b2c_sales WHERE id = ?').get(newB2CId);
    const updatedB2B = db.prepare('SELECT * FROM b2b_inventory WHERE id = ?').get(id);

    res.status(201).json({
      success: true,
      message: 'Item transferred to B2C successfully!',
      b2c: createdB2C,
      b2b: updatedB2B
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// B2C SALES APIS
// ----------------------------------------------------
app.get('/api/b2c', (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT b2c.*, b2b.purchase_price, b2b.purchase_date, b2b.purchased_from as b2b_vendor
      FROM b2c_sales b2c
      LEFT JOIN b2b_inventory b2b ON b2c.b2b_item_id = b2b.id OR b2c.imei = b2b.imei
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (b2c.from_source LIKE ? OR b2c.model LIKE ? OR b2c.imei LIKE ? OR b2c.sold_to LIKE ? OR b2c.invoice_no LIKE ? OR b2c.customer_phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s, s);
    }

    query += ' ORDER BY b2c.id DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (error) {
    console.error('B2C list error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/b2c', (req, res) => {
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

    // Check if duplicate invoice exists
    const existingInvoice = db.prepare('SELECT id FROM b2c_sales WHERE invoice_no = ?').get(finalInvoiceNo);
    if (existingInvoice) {
      return res.status(400).json({ error: `Invoice "${finalInvoiceNo}" already exists.` });
    }

    // Check if IMEI matches an existing B2B item that is in stock, and optionally link it
    const matchingB2B = db.prepare('SELECT * FROM b2b_inventory WHERE imei = ?').get(imei.trim());

    const result = db.transaction(() => {
      let linkedB2BId = null;
      if (matchingB2B) {
        linkedB2BId = matchingB2B.id;
        db.prepare("UPDATE b2b_inventory SET status = 'Sold to B2C' WHERE id = ?").run(matchingB2B.id);
      }

      const stmt = db.prepare(`
        INSERT INTO b2c_sales (
          from_source, model, imei, sold_to, customer_phone, customer_email,
          sale_date, sale_price, payment_method, warranty_months, invoice_no, b2b_item_id, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertRes = stmt.run(
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
      );

      return insertRes.lastInsertRowid;
    })();

    const newSale = db.prepare('SELECT * FROM b2c_sales WHERE id = ?').get(result);
    res.status(201).json(newSale);
  } catch (error) {
    console.error('B2C create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/b2c/:id', (req, res) => {
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

    const stmt = db.prepare(`
      UPDATE b2c_sales
      SET from_source = ?, model = ?, imei = ?, sold_to = ?, customer_phone = ?, customer_email = ?,
          sale_date = ?, sale_price = ?, payment_method = ?, warranty_months = ?, invoice_no = ?, notes = ?
      WHERE id = ?
    `);

    stmt.run(
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
    );

    const updated = db.prepare('SELECT * FROM b2c_sales WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('B2C update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/b2c/:id', (req, res) => {
  try {
    const { id } = req.params;
    const sale = db.prepare('SELECT * FROM b2c_sales WHERE id = ?').get(id);

    db.transaction(() => {
      // If linked to B2B, restore B2B status back to 'In Stock'
      if (sale && sale.b2b_item_id) {
        db.prepare("UPDATE b2b_inventory SET status = 'In Stock' WHERE id = ?").run(sale.b2b_item_id);
      } else if (sale && sale.imei) {
        db.prepare("UPDATE b2b_inventory SET status = 'In Stock' WHERE imei = ?").run(sale.imei);
      }

      db.prepare('DELETE FROM b2c_sales WHERE id = ?').run(id);
    })();

    res.json({ success: true, message: 'B2C sale record removed and stock restored if applicable.' });
  } catch (error) {
    console.error('B2C delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// IMEI TRACKER & LIFECYCLE API
// ----------------------------------------------------
app.get('/api/imei/lookup/:imei', (req, res) => {
  try {
    const { imei } = req.params;
    const cleanImei = imei.trim();

    const b2bItem = db.prepare('SELECT * FROM b2b_inventory WHERE imei = ?').get(cleanImei);
    const b2cSale = db.prepare('SELECT * FROM b2c_sales WHERE imei = ?').get(cleanImei);

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

    const margin = b2cSale && b2bItem ? (b2cSale.sale_price - b2bItem.purchase_price) : null;
    const marginPercent = margin !== null && b2bItem.purchase_price > 0
      ? ((margin / b2bItem.purchase_price) * 100).toFixed(1)
      : null;

    res.json({
      found: true,
      imei: cleanImei,
      status,
      model: (b2bItem && b2bItem.model) || (b2cSale && b2cSale.model),
      margin,
      marginPercent,
      b2b: b2bItem || null,
      b2c: b2cSale || null
    });
  } catch (error) {
    console.error('IMEI lookup error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Inventory Management Server running on http://localhost:${PORT}`);
});

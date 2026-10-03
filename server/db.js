require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL is not set in .env');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper for queries
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return res;
}

// Initialize tables on Supabase
async function initSchema() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS b2b_inventory (
        id BIGSERIAL PRIMARY KEY,
        purchased_from TEXT NOT NULL,
        model TEXT NOT NULL,
        imei TEXT NOT NULL UNIQUE,
        purchase_date DATE NOT NULL,
        purchase_price NUMERIC(12, 2) DEFAULT 0,
        status TEXT DEFAULT 'In Stock',
        invoice_no TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS b2c_sales (
        id BIGSERIAL PRIMARY KEY,
        from_source TEXT NOT NULL,
        model TEXT NOT NULL,
        imei TEXT NOT NULL,
        sold_to TEXT NOT NULL,
        customer_phone TEXT,
        customer_email TEXT,
        sale_date DATE NOT NULL,
        sale_price NUMERIC(12, 2) DEFAULT 0,
        payment_method TEXT DEFAULT 'Cash',
        warranty_months INT DEFAULT 12,
        invoice_no TEXT NOT NULL UNIQUE,
        b2b_item_id BIGINT REFERENCES b2b_inventory(id) ON DELETE SET NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_b2b_imei ON b2b_inventory(imei);
      CREATE INDEX IF NOT EXISTS idx_b2c_imei ON b2c_sales(imei);
      CREATE INDEX IF NOT EXISTS idx_b2b_status ON b2b_inventory(status);
    `);

    // Check if initial seed is needed
    const countRes = await query('SELECT COUNT(*) as count FROM b2b_inventory');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log('Seeding initial data into Supabase...');
      await seedInitialData();
    }

    console.log('Supabase tables initialized successfully!');
  } catch (err) {
    console.error('Error initializing Supabase schema:', err.message);
  }
}

async function seedInitialData() {
  const sampleB2B = [
    {
      purchased_from: 'Apex Distributors Ltd',
      model: 'iPhone 15 Pro 128GB (Natural Titanium)',
      imei: '359284102948172',
      purchase_date: '2026-09-15',
      purchase_price: 105000,
      status: 'Sold to B2C',
      invoice_no: 'APX-9821',
      notes: 'Batch 1 sealed unit from authorized dealer'
    },
    {
      purchased_from: 'Apex Distributors Ltd',
      model: 'iPhone 15 Pro 128GB (Black Titanium)',
      imei: '359284102948173',
      purchase_date: '2026-09-15',
      purchase_price: 105000,
      status: 'In Stock',
      invoice_no: 'APX-9821',
      notes: 'Sealed unit'
    },
    {
      purchased_from: 'Galaxy Global Wholesalers',
      model: 'Samsung Galaxy S24 Ultra 256GB (Titanium Gray)',
      imei: '354928109384721',
      purchase_date: '2026-09-20',
      purchase_price: 98000,
      status: 'In Stock',
      invoice_no: 'GGW-2045',
      notes: 'Brand new with brand warranty'
    },
    {
      purchased_from: 'Galaxy Global Wholesalers',
      model: 'Samsung Galaxy S24 Ultra 256GB (Titanium Black)',
      imei: '354928109384722',
      purchase_date: '2026-09-20',
      purchase_price: 98000,
      status: 'Sold to B2C',
      invoice_no: 'GGW-2045',
      notes: 'Delivered directly to retail floor'
    },
    {
      purchased_from: 'Zenith Tech Suppliers',
      model: 'OnePlus 12 512GB (Emerald Green)',
      imei: '862093849102834',
      purchase_date: '2026-09-25',
      purchase_price: 54000,
      status: 'In Stock',
      invoice_no: 'ZTS-1102',
      notes: 'Standard stock lot'
    },
    {
      purchased_from: 'Zenith Tech Suppliers',
      model: 'Google Pixel 9 Pro 128GB (Porcelain)',
      imei: '358291039485710',
      purchase_date: '2026-09-28',
      purchase_price: 88000,
      status: 'In Stock',
      invoice_no: 'ZTS-1109',
      notes: 'Indian domestic warranty unit'
    }
  ];

  for (const item of sampleB2B) {
    const insertRes = await query(`
      INSERT INTO b2b_inventory (purchased_from, model, imei, purchase_date, purchase_price, status, invoice_no, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      item.purchased_from,
      item.model,
      item.imei,
      item.purchase_date,
      item.purchase_price,
      item.status,
      item.invoice_no,
      item.notes
    ]);

    if (item.imei === '359284102948172') {
      await query(`
        INSERT INTO b2c_sales (from_source, model, imei, sold_to, customer_phone, customer_email, sale_date, sale_price, payment_method, warranty_months, invoice_no, b2b_item_id, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        item.purchased_from,
        item.model,
        item.imei,
        'Rahul Sharma',
        '+91 98765 43210',
        'rahul.sharma@example.com',
        '2026-09-28',
        124999,
        'UPI / Bank Transfer',
        12,
        'INV-B2C-1001',
        insertRes.rows[0].id,
        'Customer opted for full payment via UPI'
      ]);
    } else if (item.imei === '354928109384722') {
      await query(`
        INSERT INTO b2c_sales (from_source, model, imei, sold_to, customer_phone, customer_email, sale_date, sale_price, payment_method, warranty_months, invoice_no, b2b_item_id, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        item.purchased_from,
        item.model,
        item.imei,
        'Pooja Nair',
        '+91 91234 56789',
        'pooja.nair@example.com',
        '2026-10-01',
        119999,
        'Credit Card',
        12,
        'INV-B2C-1002',
        insertRes.rows[0].id,
        'Sold with complementary protective case'
      ]);
    }
  }
}

initSchema();

module.exports = {
  query,
  pool
};

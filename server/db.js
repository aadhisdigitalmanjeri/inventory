require('dotenv').config();
const { Pool } = require('pg');

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

// Helper for queries
async function query(text, params) {
  const p = getPool();
  return await p.query(text, params);
}

// Initialize tables on Supabase safely
let isInitialized = false;
async function initSchema() {
  if (isInitialized) return;
  if (!process.env.DATABASE_URL) return;

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

    isInitialized = true;
    console.log('Supabase tables initialized successfully!');
  } catch (err) {
    console.error('Notice: Database initialization deferred or tables already exist:', err.message);
  }
}

if (process.env.DATABASE_URL) {
  initSchema().catch(() => {});
}

module.exports = {
  query,
  initSchema,
  getPool
};

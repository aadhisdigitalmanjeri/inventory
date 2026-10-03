const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'inventory.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance and concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS b2b_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchased_from TEXT NOT NULL,
      model TEXT NOT NULL,
      imei TEXT NOT NULL UNIQUE,
      purchase_date TEXT NOT NULL,
      purchase_price REAL DEFAULT 0,
      status TEXT DEFAULT 'In Stock', -- 'In Stock', 'Sold to B2C', 'Returned'
      invoice_no TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS b2c_sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_source TEXT NOT NULL,       -- Source/Vendor or B2B reference
      model TEXT NOT NULL,
      imei TEXT NOT NULL,
      sold_to TEXT NOT NULL,           -- Customer name
      customer_phone TEXT,
      customer_email TEXT,
      sale_date TEXT NOT NULL,
      sale_price REAL DEFAULT 0,
      payment_method TEXT DEFAULT 'Cash', -- Cash, UPI, Card, Net Banking
      warranty_months INTEGER DEFAULT 12,
      invoice_no TEXT NOT NULL UNIQUE,
      b2b_item_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (b2b_item_id) REFERENCES b2b_inventory(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_b2b_imei ON b2b_inventory(imei);
    CREATE INDEX IF NOT EXISTS idx_b2c_imei ON b2c_sales(imei);
    CREATE INDEX IF NOT EXISTS idx_b2b_status ON b2b_inventory(status);
  `);

  // Seed sample data if empty
  const b2bCount = db.prepare('SELECT COUNT(*) as count FROM b2b_inventory').get().count;
  if (b2bCount === 0) {
    seedSampleData();
  }
}

function seedSampleData() {
  const insertB2B = db.prepare(`
    INSERT INTO b2b_inventory (purchased_from, model, imei, purchase_date, purchase_price, status, invoice_no, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertB2C = db.prepare(`
    INSERT INTO b2c_sales (from_source, model, imei, sold_to, customer_phone, customer_email, sale_date, sale_price, payment_method, warranty_months, invoice_no, b2b_item_id, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

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

  const seedTransaction = db.transaction(() => {
    const insertedIds = [];
    for (const item of sampleB2B) {
      const res = insertB2B.run(
        item.purchased_from,
        item.model,
        item.imei,
        item.purchase_date,
        item.purchase_price,
        item.status,
        item.invoice_no,
        item.notes
      );
      insertedIds.push(res.lastInsertRowid);
    }

    // Seed corresponding B2C sales for the two sold items
    insertB2C.run(
      'Apex Distributors Ltd',
      'iPhone 15 Pro 128GB (Natural Titanium)',
      '359284102948172',
      'Rahul Sharma',
      '+91 98765 43210',
      'rahul.sharma@example.com',
      '2026-09-28',
      124999,
      'UPI / Bank Transfer',
      12,
      'INV-B2C-1001',
      insertedIds[0],
      'Customer opted for full payment via UPI'
    );

    insertB2C.run(
      'Galaxy Global Wholesalers',
      'Samsung Galaxy S24 Ultra 256GB (Titanium Black)',
      '354928109384722',
      'Pooja Nair',
      '+91 91234 56789',
      'pooja.nair@example.com',
      '2026-10-01',
      119999,
      'Credit Card',
      12,
      'INV-B2C-1002',
      insertedIds[3],
      'Sold with complementary protective case'
    );
  });

  seedTransaction();
}

initSchema();

module.exports = db;

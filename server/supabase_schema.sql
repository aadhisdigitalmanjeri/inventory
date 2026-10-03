-- ========================================================
-- Aadhis Digital Hub - Supabase Database Schema
-- Run this in your Supabase Dashboard -> SQL Editor
-- ========================================================

-- 1. B2B Inventory Table
CREATE TABLE IF NOT EXISTS b2b_inventory (
  id BIGSERIAL PRIMARY KEY,
  purchased_from TEXT NOT NULL,
  model TEXT NOT NULL,
  imei TEXT NOT NULL UNIQUE,
  purchase_date DATE NOT NULL,
  purchase_price NUMERIC(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'In Stock', -- 'In Stock', 'Sold to B2C', 'Returned'
  invoice_no TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. B2C Sales Table
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

-- Indexes for lightning fast IMEI search and status filtering
CREATE INDEX IF NOT EXISTS idx_b2b_imei ON b2b_inventory(imei);
CREATE INDEX IF NOT EXISTS idx_b2c_imei ON b2c_sales(imei);
CREATE INDEX IF NOT EXISTS idx_b2b_status ON b2b_inventory(status);

-- Enable Row Level Security (RLS) or public access for backend API
ALTER TABLE b2b_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2c_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for b2b_inventory" ON b2b_inventory
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read-write for b2c_sales" ON b2c_sales
  FOR ALL USING (true) WITH CHECK (true);

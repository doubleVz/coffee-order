-- Coffee Order System - Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_sort ON categories(sort_order);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_best_seller ON products(is_best_seller);

-- ============================================
-- PRODUCT OPTIONS (Size, Sugar, Ice)
-- ============================================
CREATE TABLE product_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'RADIO' CHECK (type IN ('RADIO', 'CHECKBOX')),
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_product_options_product ON product_options(product_id);

-- ============================================
-- PRODUCT OPTION VALUES
-- ============================================
CREATE TABLE product_option_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id UUID NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  price_adjustment INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_option_values_option ON product_option_values(option_id);

-- ============================================
-- TABLES
-- ============================================
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  capacity INTEGER DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tables_code ON tables(code);

-- ============================================
-- ORDER CODE SEQUENCE
-- ============================================
CREATE SEQUENCE order_code_seq START 1;

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code VARCHAR(20) NOT NULL UNIQUE DEFAULT 'CF' || LPAD(nextval('order_code_seq')::TEXT, 6, '0'),
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  note TEXT,
  subtotal INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'COUNTER' CHECK (payment_method IN ('CASH', 'COUNTER')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_code ON orders(order_code);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0,
  subtotal INTEGER NOT NULL DEFAULT 0,
  options JSONB,
  options_text TEXT,
  note TEXT
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at
  BEFORE UPDATE ON tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Categories: anyone can read active, authenticated can manage
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Products: anyone can read available, authenticated can manage
CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  USING (is_available = true);

CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Product options: anyone can read
CREATE POLICY "Anyone can view product options"
  ON product_options FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage product options"
  ON product_options FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Product option values: anyone can read
CREATE POLICY "Anyone can view option values"
  ON product_option_values FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage option values"
  ON product_option_values FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Tables: anyone can view active tables
CREATE POLICY "Anyone can view active tables"
  ON tables FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage tables"
  ON tables FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Orders: anyone can insert, authenticated can manage all
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Order items: same as orders
CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage order items"
  ON order_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

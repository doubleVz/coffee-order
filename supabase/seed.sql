-- Coffee Order System - Seed Data
-- Run this after the migration

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (id, name, slug, description, image_url, sort_order, is_active) VALUES
('c1000000-0000-0000-0000-000000000001', 'Cà phê', 'ca-phe', 'Các loại cà phê thơm ngon', '/images/categories/coffee.jpg', 1, true),
('c1000000-0000-0000-0000-000000000002', 'Trà', 'tra', 'Các loại trà tươi mát', '/images/categories/tea.jpg', 2, true),
('c1000000-0000-0000-0000-000000000003', 'Đá xay', 'da-xay', 'Đá xay mát lạnh', '/images/categories/blended.jpg', 3, true),
('c1000000-0000-0000-0000-000000000004', 'Nước ép', 'nuoc-ep', 'Nước ép trái cây tươi', '/images/categories/juice.jpg', 4, true),
('c1000000-0000-0000-0000-000000000005', 'Bánh', 'banh', 'Bánh ngọt thơm ngon', '/images/categories/cake.jpg', 5, true);

-- ============================================
-- PRODUCTS
-- ============================================
-- Cà phê
INSERT INTO products (id, category_id, name, slug, description, price, image_url, is_available, is_featured, is_best_seller, sort_order) VALUES
('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Bạc xỉu', 'bac-xiu', 'Cà phê sữa thơm béo, vị ngọt nhẹ, thích hợp cho những ai yêu thích sự hài hòa giữa cà phê và sữa.', 35000, '/images/products/bac-xiu.jpg', true, true, true, 1),
('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Cà phê đen', 'ca-phe-den', 'Cà phê đen đậm đà, nguyên chất, thức uống kinh điển cho người sành cà phê.', 29000, '/images/products/ca-phe-den.jpg', true, false, true, 2),
('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Cà phê sữa', 'ca-phe-sua', 'Cà phê sữa đá truyền thống, đậm đà hương vị Việt Nam.', 35000, '/images/products/ca-phe-sua.jpg', true, true, true, 3),
('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'Espresso', 'espresso', 'Espresso đậm đặc, chiết xuất từ hạt cà phê rang xay tươi.', 39000, '/images/products/espresso.jpg', true, false, false, 4),
('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'Americano', 'americano', 'Espresso pha loãng, hương vị nhẹ nhàng, thanh mát.', 39000, '/images/products/americano.jpg', true, false, false, 5),
('p1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 'Cappuccino', 'cappuccino', 'Espresso kết hợp sữa tươi đánh bông, lớp foam mềm mịn.', 45000, '/images/products/cappuccino.jpg', true, true, false, 6),
('p1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'Latte', 'latte', 'Espresso hòa quyện cùng sữa tươi nóng, vị êm dịu.', 45000, '/images/products/latte.jpg', true, false, false, 7);

-- Trà
INSERT INTO products (id, category_id, name, slug, description, price, image_url, is_available, is_featured, is_best_seller, sort_order) VALUES
('p1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000002', 'Trà đào', 'tra-dao', 'Trà đào cam sả thơm ngon, thanh mát, giải nhiệt ngày hè.', 39000, '/images/products/tra-dao.jpg', true, true, true, 1),
('p1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000002', 'Trà vải', 'tra-vai', 'Trà vải tươi mát, ngọt thanh tự nhiên, hương thơm dễ chịu.', 39000, '/images/products/tra-vai.jpg', true, false, false, 2),
('p1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000002', 'Trà chanh', 'tra-chanh', 'Trà chanh tươi mát, vị chua nhẹ, giải khát tuyệt vời.', 29000, '/images/products/tra-chanh.jpg', true, false, false, 3),
('p1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000002', 'Trà oolong', 'tra-oolong', 'Trà oolong thượng hạng, hương thơm nhẹ nhàng, vị thanh ngọt.', 35000, '/images/products/tra-oolong.jpg', true, false, false, 4);

-- Đá xay
INSERT INTO products (id, category_id, name, slug, description, price, image_url, is_available, is_featured, is_best_seller, sort_order) VALUES
('p1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000003', 'Matcha đá xay', 'matcha-da-xay', 'Matcha Nhật Bản xay mịn cùng đá, thơm ngon, bổ dưỡng.', 49000, '/images/products/matcha-da-xay.jpg', true, true, true, 1),
('p1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000003', 'Chocolate đá xay', 'chocolate-da-xay', 'Chocolate đậm đà xay cùng đá, ngọt ngào, béo ngậy.', 49000, '/images/products/chocolate-da-xay.jpg', true, false, false, 2);

-- Nước ép
INSERT INTO products (id, category_id, name, slug, description, price, image_url, is_available, is_featured, is_best_seller, sort_order) VALUES
('p1000000-0000-0000-0000-000000000014', 'c1000000-0000-0000-0000-000000000004', 'Nước cam', 'nuoc-cam', 'Nước cam tươi ép nguyên chất, giàu vitamin C.', 35000, '/images/products/nuoc-cam.jpg', true, false, false, 1),
('p1000000-0000-0000-0000-000000000015', 'c1000000-0000-0000-0000-000000000004', 'Nước ép dưa hấu', 'nuoc-ep-dua-hau', 'Nước ép dưa hấu tươi mát, ngọt tự nhiên.', 35000, '/images/products/nuoc-ep-dua-hau.jpg', true, false, false, 2);

-- Bánh
INSERT INTO products (id, category_id, name, slug, description, price, image_url, is_available, is_featured, is_best_seller, sort_order) VALUES
('p1000000-0000-0000-0000-000000000016', 'c1000000-0000-0000-0000-000000000005', 'Tiramisu', 'tiramisu', 'Bánh Tiramisu Ý thơm ngon, lớp kem mềm mịn hòa quyện cà phê.', 55000, '/images/products/tiramisu.jpg', true, true, false, 1),
('p1000000-0000-0000-0000-000000000017', 'c1000000-0000-0000-0000-000000000005', 'Croissant', 'croissant', 'Bánh sừng bò Pháp, giòn xốp, thơm bơ.', 35000, '/images/products/croissant.jpg', true, false, false, 2);

-- ============================================
-- PRODUCT OPTIONS (Global options applied to drink products)
-- ============================================

-- Size options for coffee products
INSERT INTO product_options (id, product_id, name, type, is_required, sort_order)
SELECT 
  uuid_generate_v4(),
  p.id,
  'Size',
  'RADIO',
  true,
  1
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug IN ('ca-phe', 'tra', 'da-xay');

-- Insert size values for each size option
INSERT INTO product_option_values (option_id, label, price_adjustment, is_default, sort_order)
SELECT 
  po.id,
  v.label,
  v.price_adj,
  v.is_def,
  v.s_order
FROM product_options po
CROSS JOIN (
  VALUES 
    ('M', 0, true, 1),
    ('L', 10000, false, 2)
) AS v(label, price_adj, is_def, s_order)
WHERE po.name = 'Size';

-- Sugar options for drink products
INSERT INTO product_options (id, product_id, name, type, is_required, sort_order)
SELECT 
  uuid_generate_v4(),
  p.id,
  'Đường',
  'RADIO',
  false,
  2
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug IN ('ca-phe', 'tra', 'da-xay');

-- Insert sugar values
INSERT INTO product_option_values (option_id, label, price_adjustment, is_default, sort_order)
SELECT 
  po.id,
  v.label,
  0,
  v.is_def,
  v.s_order
FROM product_options po
CROSS JOIN (
  VALUES 
    ('50%', false, 1),
    ('70%', false, 2),
    ('100%', true, 3)
) AS v(label, is_def, s_order)
WHERE po.name = 'Đường';

-- Ice options for drink products
INSERT INTO product_options (id, product_id, name, type, is_required, sort_order)
SELECT 
  uuid_generate_v4(),
  p.id,
  'Đá',
  'RADIO',
  false,
  3
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug IN ('ca-phe', 'tra', 'da-xay');

-- Insert ice values
INSERT INTO product_option_values (option_id, label, price_adjustment, is_default, sort_order)
SELECT 
  po.id,
  v.label,
  0,
  v.is_def,
  v.s_order
FROM product_options po
CROSS JOIN (
  VALUES 
    ('50%', false, 1),
    ('70%', false, 2),
    ('100%', true, 3)
) AS v(label, is_def, s_order)
WHERE po.name = 'Đá';

-- Topping options for drink products
INSERT INTO product_options (id, product_id, name, type, is_required, sort_order)
SELECT 
  uuid_generate_v4(),
  p.id,
  'Topping',
  'CHECKBOX',
  false,
  4
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug IN ('ca-phe', 'tra', 'da-xay');

-- Insert topping values
INSERT INTO product_option_values (option_id, label, price_adjustment, is_default, sort_order)
SELECT 
  po.id,
  v.label,
  v.price_adj,
  false,
  v.s_order
FROM product_options po
CROSS JOIN (
  VALUES 
    ('Trân châu', 10000, 1),
    ('Thạch', 8000, 2),
    ('Kem cheese', 15000, 3)
) AS v(label, price_adj, s_order)
WHERE po.name = 'Topping';

-- ============================================
-- TABLES (10 tables)
-- ============================================
INSERT INTO tables (id, name, code, capacity, is_active) VALUES
('t1000000-0000-0000-0000-000000000001', 'Bàn 01', 'BAN01', 4, true),
('t1000000-0000-0000-0000-000000000002', 'Bàn 02', 'BAN02', 4, true),
('t1000000-0000-0000-0000-000000000003', 'Bàn 03', 'BAN03', 2, true),
('t1000000-0000-0000-0000-000000000004', 'Bàn 04', 'BAN04', 6, true),
('t1000000-0000-0000-0000-000000000005', 'Bàn 05', 'BAN05', 4, true),
('t1000000-0000-0000-0000-000000000006', 'Bàn 06', 'BAN06', 4, true),
('t1000000-0000-0000-0000-000000000007', 'Bàn 07', 'BAN07', 8, true),
('t1000000-0000-0000-0000-000000000008', 'Bàn 08', 'BAN08', 2, true),
('t1000000-0000-0000-0000-000000000009', 'Bàn 09', 'BAN09', 4, true),
('t1000000-0000-0000-0000-000000000010', 'Bàn 10', 'BAN10', 6, true);

-- =====================================================
-- LightingPro Seed Data
-- Date: 2024-12-XX
-- Description: Initial data for development and testing
-- =====================================================

-- =====================================================
-- 1. BRANDS DATA
-- =====================================================

INSERT INTO brands (id, name, commission_rate, affiliate_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Philips Hue', 6.50, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'IKEA', 4.00, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'West Elm', 5.50, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Pottery Barn', 6.00, true),
  ('550e8400-e29b-41d4-a716-446655440005', 'CB2', 5.00, true),
  ('550e8400-e29b-41d4-a716-446655440006', 'Wayfair', 4.50, true),
  ('550e8400-e29b-41d4-a716-446655440007', 'Home Depot', 3.50, true),
  ('550e8400-e29b-41d4-a716-446655440008', 'Lowe''s', 3.50, true),
  ('550e8400-e29b-41d4-a716-446655440009', 'Target', 4.00, true),
  ('550e8400-e29b-41d4-a716-44665544000a', 'Amazon Basics', 7.00, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CATEGORIES DATA
-- =====================================================

-- Root categories
INSERT INTO categories (id, name, slug, parent_id, level, sort_order) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Ceiling Lighting', 'ceiling-lighting', NULL, 0, 1),
  ('650e8400-e29b-41d4-a716-446655440002', 'Table Lamps', 'table-lamps', NULL, 0, 2),
  ('650e8400-e29b-41d4-a716-446655440003', 'Floor Lamps', 'floor-lamps', NULL, 0, 3),
  ('650e8400-e29b-41d4-a716-446655440004', 'Wall Lighting', 'wall-lighting', NULL, 0, 4),
  ('650e8400-e29b-41d4-a716-446655440005', 'Pendant Lights', 'pendant-lights', NULL, 0, 5),
  ('650e8400-e29b-41d4-a716-446655440006', 'Chandeliers', 'chandeliers', NULL, 0, 6)
ON CONFLICT (id) DO NOTHING;

-- Sub-categories
INSERT INTO categories (id, name, slug, parent_id, level, sort_order) VALUES
  ('650e8400-e29b-41d4-a716-446655440011', 'Flush Mount', 'flush-mount', '650e8400-e29b-41d4-a716-446655440001', 1, 1),
  ('650e8400-e29b-41d4-a716-446655440012', 'Semi-Flush Mount', 'semi-flush-mount', '650e8400-e29b-41d4-a716-446655440001', 1, 2),
  ('650e8400-e29b-41d4-a716-446655440013', 'Recessed Lighting', 'recessed-lighting', '650e8400-e29b-41d4-a716-446655440001', 1, 3),
  ('650e8400-e29b-41d4-a716-446655440021', 'Bedside Lamps', 'bedside-lamps', '650e8400-e29b-41d4-a716-446655440002', 1, 1),
  ('650e8400-e29b-41d4-a716-446655440022', 'Desk Lamps', 'desk-lamps', '650e8400-e29b-41d4-a716-446655440002', 1, 2),
  ('650e8400-e29b-41d4-a716-446655440031', 'Reading Lamps', 'reading-lamps', '650e8400-e29b-41d4-a716-446655440003', 1, 1),
  ('650e8400-e29b-41d4-a716-446655440032', 'Arc Lamps', 'arc-lamps', '650e8400-e29b-41d4-a716-446655440003', 1, 2)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. LIGHTING PRODUCTS DATA
-- =====================================================

INSERT INTO lighting_products (
  id, sku, name, brand_id, category_id, price, sale_price, description, 
  specifications, dimensions, colors, materials, rating, review_count, 
  images, style_tags, room_tags, tags, is_featured, status
) VALUES

-- Philips Hue Smart Lights
(
  '750e8400-e29b-41d4-a716-446655440001',
  'PHH-001',
  'Philips Hue White and Color Ambiance A19',
  '550e8400-e29b-41d4-a716-446655440001',
  '650e8400-e29b-41d4-a716-446655440001',
  249.99,
  199.99,
  'Smart LED bulb with 16 million colors and wireless dimming. Compatible with Alexa, Google Assistant, and Apple HomeKit.',
  '{"wattage": 60, "lumens": 800, "connectivity": "Zigbee", "smart_features": ["voice_control", "app_control", "scheduling", "color_changing"]}',
  '{"height": "4.3 inches", "diameter": "2.4 inches", "weight": "0.3 lbs"}',
  ARRAY['white', 'color-changing'],
  ARRAY['plastic', 'LED'],
  4.5,
  1234,
  '[{"url": "/images/philips-hue-a19.jpg", "alt": "Philips Hue A19 Smart Bulb", "is_primary": true}]',
  ARRAY['modern', 'smart', 'minimalist'],
  ARRAY['living', 'bedroom', 'office'],
  ARRAY['smart-home', 'energy-efficient', 'voice-control'],
  true,
  'active'
),

-- IKEA Modern Table Lamp
(
  '750e8400-e29b-41d4-a716-446655440002',
  'IKEA-TL-001',
  'FADO Table Lamp White',
  '550e8400-e29b-41d4-a716-446655440002',
  '650e8400-e29b-41d4-a716-446655440021',
  79.99,
  NULL,
  'Minimalist white table lamp with soft, even light distribution. Perfect for modern and Scandinavian interiors.',
  '{"max_wattage": 40, "bulb_type": "E26", "material": "polypropylene"}',
  '{"height": "10 inches", "diameter": "8 inches", "weight": "1.2 lbs"}',
  ARRAY['white'],
  ARRAY['polypropylene'],
  4.1,
  542,
  '[{"url": "/images/ikea-fado-white.jpg", "alt": "IKEA FADO White Table Lamp", "is_primary": true}]',
  ARRAY['minimalist', 'scandinavian', 'modern'],
  ARRAY['bedroom', 'living', 'office'],
  ARRAY['affordable', 'simple', 'clean-lines'],
  false,
  'active'
),

-- West Elm Industrial Pendant
(
  '750e8400-e29b-41d4-a716-446655440003',
  'WE-PEN-001',
  'Industrial Pendant Light - Brass',
  '550e8400-e29b-41d4-a716-446655440003',
  '650e8400-e29b-41d4-a716-446655440005',
  179.99,
  149.99,
  'Vintage-inspired pendant light with antique brass finish. Adjustable cord length up to 6 feet.',
  '{"cord_length": "6 feet", "bulb_type": "Edison E26", "finish": "antique_brass"}',
  '{"height": "8 inches", "diameter": "6 inches", "weight": "2.1 lbs"}',
  ARRAY['brass', 'antique'],
  ARRAY['metal', 'brass'],
  4.3,
  876,
  '[{"url": "/images/west-elm-industrial-brass.jpg", "alt": "West Elm Industrial Brass Pendant", "is_primary": true}]',
  ARRAY['industrial', 'vintage', 'rustic'],
  ARRAY['kitchen', 'dining', 'living'],
  ARRAY['edison-bulb', 'adjustable', 'statement-piece'],
  true,
  'active'
),

-- Pottery Barn Chandelier
(
  '750e8400-e29b-41d4-a716-446655440004',
  'PB-CHA-001',
  'Clarissa Crystal Drop Chandelier',
  '550e8400-e29b-41d4-a716-446655440004',
  '650e8400-e29b-41d4-a716-446655440006',
  899.99,
  NULL,
  'Elegant crystal chandelier with antique bronze finish. Perfect statement piece for dining rooms and entryways.',
  '{"lights": 5, "crystals": "faceted_glass", "finish": "antique_bronze", "chain_length": "72_inches"}',
  '{"height": "18 inches", "diameter": "24 inches", "weight": "15.5 lbs"}',
  ARRAY['bronze', 'crystal'],
  ARRAY['metal', 'crystal', 'glass'],
  4.7,
  324,
  '[{"url": "/images/pottery-barn-clarissa-chandelier.jpg", "alt": "Pottery Barn Clarissa Crystal Chandelier", "is_primary": true}]',
  ARRAY['traditional', 'elegant', 'classic'],
  ARRAY['dining', 'entryway', 'living'],
  ARRAY['crystal', 'statement-piece', 'luxury'],
  true,
  'active'
),

-- Target Budget Floor Lamp
(
  '750e8400-e29b-41d4-a716-446655440005',
  'TAR-FL-001',
  'Modern Arc Floor Lamp - Black',
  '550e8400-e29b-41d4-a716-446655440009',
  '650e8400-e29b-41d4-a716-446655440032',
  129.99,
  99.99,
  'Contemporary arc floor lamp with adjustable arm. Marble base provides stability and modern aesthetic.',
  '{"arm_length": "60 inches", "base_material": "marble", "shade_material": "fabric"}',
  '{"height": "72 inches", "base_diameter": "12 inches", "weight": "28 lbs"}',
  ARRAY['black', 'marble'],
  ARRAY['metal', 'marble', 'fabric'],
  3.9,
  789,
  '[{"url": "/images/target-arc-floor-lamp.jpg", "alt": "Target Modern Arc Floor Lamp", "is_primary": true}]',
  ARRAY['modern', 'contemporary', 'arc'],
  ARRAY['living', 'reading', 'office'],
  ARRAY['adjustable', 'marble-base', 'affordable'],
  false,
  'active'
),

-- Amazon Basics LED Strip
(
  '750e8400-e29b-41d4-a716-446655440006',
  'AMZ-LED-001',
  'LED Strip Lights 16.4ft Color Changing',
  '550e8400-e29b-41d4-a716-44665544000a',
  '650e8400-e29b-41d4-a716-446655440004',
  39.99,
  29.99,
  'Flexible LED strip lights with remote control. 16.4 feet of color-changing ambient lighting.',
  '{"length": "16.4 feet", "colors": "RGB", "remote_control": true, "adhesive_backing": true}',
  '{"length": "16.4 feet", "width": "0.4 inches", "weight": "0.8 lbs"}',
  ARRAY['rgb', 'multicolor'],
  ARRAY['LED', 'plastic'],
  4.2,
  2156,
  '[{"url": "/images/amazon-led-strip.jpg", "alt": "Amazon Basics LED Strip Lights", "is_primary": true}]',
  ARRAY['modern', 'colorful', 'ambient'],
  ARRAY['bedroom', 'gaming', 'accent'],
  ARRAY['color-changing', 'remote-control', 'flexible'],
  false,
  'active'
)

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. AFFILIATE LINKS DATA
-- =====================================================

INSERT INTO affiliate_links (product_id, platform, url, commission_rate, price, is_active) VALUES

-- Philips Hue links
('750e8400-e29b-41d4-a716-446655440001', 'amazon', 'https://amazon.com/philips-hue-a19', 6.50, 199.99, true),
('750e8400-e29b-41d4-a716-446655440001', 'homedepot', 'https://homedepot.com/philips-hue-a19', 5.00, 204.99, true),

-- IKEA FADO links
('750e8400-e29b-41d4-a716-446655440002', 'amazon', 'https://amazon.com/ikea-fado-lamp', 4.00, 84.99, true),
('750e8400-e29b-41d4-a716-446655440002', 'wayfair', 'https://wayfair.com/ikea-fado-lamp', 4.50, 79.99, true),

-- West Elm pendant links
('750e8400-e29b-41d4-a716-446655440003', 'amazon', 'https://amazon.com/west-elm-industrial-pendant', 5.50, 159.99, true),
('750e8400-e29b-41d4-a716-446655440003', 'wayfair', 'https://wayfair.com/west-elm-industrial-pendant', 5.00, 149.99, true),

-- Pottery Barn chandelier links
('750e8400-e29b-41d4-a716-446655440004', 'amazon', 'https://amazon.com/pottery-barn-clarissa-chandelier', 6.00, 899.99, true),
('750e8400-e29b-41d4-a716-446655440004', 'wayfair', 'https://wayfair.com/pottery-barn-clarissa-chandelier', 5.50, 879.99, true),

-- Target arc lamp links
('750e8400-e29b-41d4-a716-446655440005', 'amazon', 'https://amazon.com/target-arc-floor-lamp', 4.00, 109.99, true),
('750e8400-e29b-41d4-a716-446655440005', 'target', 'https://target.com/arc-floor-lamp-black', 3.50, 99.99, true),

-- Amazon LED strip links
('750e8400-e29b-41d4-a716-446655440006', 'amazon', 'https://amazon.com/led-strip-lights-16ft', 7.00, 29.99, true)

ON CONFLICT (product_id, platform) DO NOTHING;

-- =====================================================
-- 5. SAMPLE ANALYTICS DATA
-- =====================================================

-- Initialize product stats
INSERT INTO product_stats (
  product_id, view_count, click_count, favorite_count, 
  purchase_click_count, conversion_rate, popularity_score
) 
SELECT 
  id,
  FLOOR(RANDOM() * 1000 + 100)::INTEGER,
  FLOOR(RANDOM() * 100 + 10)::INTEGER,
  FLOOR(RANDOM() * 50 + 5)::INTEGER,
  FLOOR(RANDOM() * 20 + 2)::INTEGER,
  ROUND((RANDOM() * 5 + 1)::NUMERIC, 2),
  ROUND((RANDOM() * 100)::NUMERIC, 2)
FROM lighting_products
WHERE status = 'active'
ON CONFLICT (product_id) DO NOTHING;

-- Sample daily analytics (last 30 days)
INSERT INTO daily_analytics (
  date, new_users, active_users, questionnaire_completions,
  product_views, product_clicks, recommendations_generated,
  affiliate_clicks, estimated_revenue, conversion_rate
)
SELECT 
  date_series::DATE,
  FLOOR(RANDOM() * 50 + 10)::INTEGER,
  FLOOR(RANDOM() * 200 + 50)::INTEGER,
  FLOOR(RANDOM() * 80 + 20)::INTEGER,
  FLOOR(RANDOM() * 500 + 100)::INTEGER,
  FLOOR(RANDOM() * 100 + 20)::INTEGER,
  FLOOR(RANDOM() * 120 + 30)::INTEGER,
  FLOOR(RANDOM() * 30 + 5)::INTEGER,
  ROUND((RANDOM() * 200 + 50)::NUMERIC, 2),
  ROUND((RANDOM() * 5 + 1)::NUMERIC, 2)
FROM generate_series(
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '1 day',
  INTERVAL '1 day'
) AS date_series
ON CONFLICT (date) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Insert migration record
INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('003', 'seed_data', NOW())
ON CONFLICT (version) DO NOTHING;
-- ==============================================
-- LightingPro 种子数据
-- 包含完整的产品数据和测试数据
-- ==============================================

-- 插入产品分类
INSERT INTO categories (name, description, icon, slug) VALUES
('LED 灯具', '高效节能的LED照明解决方案，适用于家居和商业场所', '💡', 'led-lights'),
('智能照明', '可通过APP控制的智能照明系统，支持调光调色', '🔆', 'smart-lighting'),
('装饰灯', '创意设计的装饰性照明产品，提升空间美感', '✨', 'decorative-lights'),
('户外照明', '防水耐用的户外照明设备，适合庭院和景观', '🌟', 'outdoor-lighting'),
('工业照明', '大功率工业级照明产品，适用于工厂和仓库', '🏭', 'industrial-lighting'),
('应急照明', '停电应急和安全照明设备，保障应急时刻', '🚨', 'emergency-lighting');

-- 插入品牌数据
INSERT INTO brands (name, description, logo_url, website, country) VALUES
('飞利浦', '全球领先的照明解决方案提供商', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200', 'https://www.philips.com', '荷兰'),
('欧普照明', '中国知名照明品牌，专注LED产品', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200', 'https://www.opple.com', '中国'),
('雷士照明', '专业照明解决方案提供商', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200', 'https://www.nvc.com', '中国'),
('小米', '智能家居生态链照明产品', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200', 'https://www.mi.com', '中国'),
('松下', '日本知名电器品牌照明产品', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200', 'https://www.panasonic.com', '日本'),
('GE通用电气', '美国老牌照明制造商', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200', 'https://www.ge.com', '美国');

-- 插入产品数据
INSERT INTO products (
    name, description, price, original_price, brand_id, category_id, 
    image_url, images, sku, stock_quantity, is_active, 
    power_consumption, color_temperature, lumens, beam_angle, 
    ip_rating, lifespan, warranty_months, energy_rating, 
    dimensions, weight, material, certifications, 
    affiliate_url, commission_rate, tags, features, specifications
) VALUES
-- LED 灯具系列
('飞利浦 LED 球泡灯 9W', '高亮度LED球泡灯，替代传统60W白炽灯，节能80%以上', 
 29.90, 39.90, 1, 1, 
 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500',
 '["https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500"]',
 'PH-LED-9W-001', 150, true,
 9, 3000, 806, 270, 
 'IP20', 25000, 24, 'A++',
 '{"length": 60, "width": 60, "height": 108}', 0.05, '铝合金+PC',
 '["CE", "RoHS", "CCC"]',
 'https://affiliate.example.com/philips-led-9w', 0.08,
 '["LED", "节能", "长寿命", "护眼"]',
 '["即开即亮", "无频闪", "显色指数Ra>80", "环保材质"]',
 '{"voltage": "220V", "base": "E27", "dimmable": false, "smart": false}'),

('小米 Yeelight LED 智能灯泡', '支持1600万色彩调节，可通过米家APP远程控制', 
 79.00, 99.00, 4, 2,
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500", "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500"]',
 'MI-YL-RGB-001', 80, true,
 10, 2700, 800, 270,
 'IP20', 25000, 12, 'A+',
 '{"length": 60, "width": 60, "height": 110}', 0.08, '铝合金+PC',
 '["CE", "FCC", "CCC"]',
 'https://affiliate.example.com/xiaomi-yeelight', 0.10,
 '["智能", "调色", "WiFi", "APP控制"]',
 '["语音控制", "定时开关", "音乐律动", "情景模式"]',
 '{"voltage": "220V", "base": "E27", "dimmable": true, "smart": true}'),

('欧普 LED 吸顶灯 36W', '简约现代设计，适合客厅卧室使用，三档调光', 
 299.00, 399.00, 2, 1,
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
 '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]',
 'OP-CEIL-36W-001', 60, true,
 36, 4000, 3200, 120,
 'IP44', 50000, 36, 'A++',
 '{"diameter": 500, "height": 100}', 1.2, '铝合金+亚克力',
 '["CE", "CCC", "节能认证"]',
 'https://affiliate.example.com/opple-ceiling-36w', 0.12,
 '["吸顶灯", "调光", "现代", "客厅"]',
 '["遥控器控制", "记忆功能", "夜灯模式", "安装简便"]',
 '{"voltage": "220V", "dimmable": true, "remote": true, "smart": false}'),

-- 智能照明系列
('飞利浦 Hue 智能灯带 2米', '可弯曲LED灯带，支持HomeKit和Alexa，1600万色彩', 
 399.00, 499.00, 1, 2,
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500", "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500"]',
 'PH-HUE-STRIP-2M', 40, true,
 20, 2000, 1600, 120,
 'IP65', 25000, 24, 'A+',
 '{"length": 2000, "width": 10, "height": 2}', 0.3, '硅胶+铜线',
 '["CE", "FCC", "RoHS"]',
 'https://affiliate.example.com/philips-hue-strip', 0.15,
 '["智能", "灯带", "防水", "HomeKit"]',
 '["可剪切", "背胶安装", "同步音乐", "渐变效果"]',
 '{"voltage": "24V", "connector": "专用", "dimmable": true, "smart": true}'),

-- 装饰灯系列
('北欧创意吊灯 餐厅灯', '简约北欧风格，适合餐厅和书房使用', 
 589.00, 799.00, 6, 3,
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
 '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]',
 'NORDIC-PENDANT-001', 25, true,
 15, 3000, 1200, 360,
 'IP20', 30000, 24, 'A',
 '{"diameter": 300, "height": 200}', 0.8, '橡木+金属',
 '["CE", "CCC"]',
 'https://affiliate.example.com/nordic-pendant', 0.18,
 '["吊灯", "北欧", "餐厅", "原木"]',
 '["天然木材", "手工制作", "环保漆面", "可调高度"]',
 '{"voltage": "220V", "bulb_type": "E27", "bulb_included": true, "style": "Nordic"}'),

-- 户外照明系列
('LED 太阳能庭院灯', '太阳能充电，自动感应，防水设计', 
 199.00, 299.00, 3, 4,
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
 '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500"]',
 'SOLAR-GARDEN-001', 100, true,
 5, 3000, 500, 360,
 'IP66', 50000, 24, 'A+',
 '{"height": 600, "diameter": 150}', 1.5, '不锈钢+PC',
 '["CE", "IP66", "RoHS"]',
 'https://affiliate.example.com/solar-garden', 0.20,
 '["太阳能", "庭院", "防水", "感应"]',
 '["光感应", "8小时照明", "免布线", "环保节能"]',
 '{"solar_panel": "多晶硅", "battery": "锂电池", "sensor": "PIR", "waterproof": true}'),

-- 工业照明系列
('LED 工矿灯 100W', '高亮度工业照明，适用于工厂车间和仓库', 
 299.00, 399.00, 3, 5,
 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500',
 '["https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500"]',
 'IND-HIGH-100W', 30, true,
 100, 5000, 13000, 120,
 'IP65', 50000, 60, 'A++',
 '{"diameter": 350, "height": 150}', 3.2, '压铸铝+钢化玻璃',
 '["CE", "CCC", "防爆认证"]',
 'https://affiliate.example.com/industrial-100w', 0.25,
 '["工矿灯", "高亮度", "工业", "节能"]',
 '["散热优良", "抗震设计", "长寿命", "维护简便"]',
 '{"voltage": "220V", "mounting": "吊装/吸顶", "beam_angle": 120, "industrial": true}'),

-- 应急照明系列
('应急LED手电筒', '多功能应急照明，支持手摇充电和太阳能充电', 
 89.00, 129.00, 6, 6,
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
 '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500"]',
 'EMRG-TORCH-001', 200, true,
 3, 6000, 300, 30,
 'IPX4', 30000, 12, 'A',
 '{"length": 180, "diameter": 50}', 0.25, 'ABS+橡胶',
 '["CE", "FCC", "IPX4"]',
 'https://affiliate.example.com/emergency-torch', 0.15,
 '["应急", "手摇充电", "太阳能", "多功能"]',
 '["收音机功能", "手机充电", "报警器", "指南针"]',
 '{"battery": "锂电池", "charge_method": "手摇/太阳能/USB", "radio": true, "alarm": true}');

-- 插入产品图片数据
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
-- 飞利浦 LED 球泡灯
(1, 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', '飞利浦LED球泡灯主图', 1, true),
(1, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', '飞利浦LED球泡灯细节', 2, false),
(1, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', '飞利浦LED球泡灯包装', 3, false),

-- 小米 Yeelight
(2, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', '小米Yeelight主图', 1, true),
(2, 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', '小米Yeelight调色展示', 2, false),

-- 欧普吸顶灯
(3, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', '欧普吸顶灯主图', 1, true),
(3, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', '欧普吸顶灯安装效果', 2, false),

-- 飞利浦 Hue 灯带
(4, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', '飞利浦Hue灯带主图', 1, true),
(4, 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', '飞利浦Hue灯带效果', 2, false),

-- 北欧吊灯
(5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', '北欧吊灯主图', 1, true),
(5, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', '北欧吊灯细节', 2, false),

-- 太阳能庭院灯
(6, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', '太阳能庭院灯主图', 1, true),

-- LED工矿灯
(7, 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', 'LED工矿灯主图', 1, true),

-- 应急手电筒
(8, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', '应急手电筒主图', 1, true);

-- 插入产品评价数据
INSERT INTO product_reviews (product_id, user_id, rating, comment, is_verified, helpful_count) VALUES
-- 飞利浦 LED 球泡灯评价
(1, 1, 5, '质量很好，亮度足够，确实很节能，包装也很精美', true, 12),
(1, 2, 4, '灯光柔和不刺眼，替换传统灯泡很方便，性价比不错', true, 8),
(1, 3, 5, '飞利浦的品质值得信赖，用了半年没有任何问题', true, 15),

-- 小米 Yeelight 评价
(2, 1, 5, '智能控制很方便，颜色变化丰富，米家APP操作简单', true, 25),
(2, 4, 4, '连接WiFi稳定，语音控制响应快，就是价格稍贵', true, 18),
(2, 5, 5, '小米生态链产品，与其他设备联动很好，推荐购买', true, 20),

-- 欧普吸顶灯评价
(3, 2, 4, '外观简洁大方，亮度可调节，安装说明清楚', true, 10),
(3, 3, 5, '照明效果均匀，遥控器操作方便，做工精细', true, 14),
(3, 6, 4, '性价比高，适合现代家居装修风格', true, 9),

-- 飞利浦 Hue 灯带评价
(4, 4, 5, 'HomeKit集成完美，色彩丰富，氛围营造效果很好', true, 22),
(4, 5, 4, '安装方便，粘性好，就是价格比较高', true, 16),

-- 北欧吊灯评价
(5, 6, 5, '设计很有品味，木质材料环保，适合餐厅使用', true, 11),
(5, 1, 4, '做工精细，包装很好，发货快', true, 7),

-- 太阳能庭院灯评价
(6, 2, 4, '太阳能充电很实用，夜晚自动亮起，节能环保', true, 13),
(6, 3, 5, '防水效果好，已经用了一个冬天，没有问题', true, 17),

-- LED工矿灯评价
(7, 4, 5, '亮度很高，散热效果好，工厂使用很合适', true, 19),
(7, 5, 4, '质量可靠，价格合理，安装简单', true, 12),

-- 应急手电筒评价
(8, 6, 4, '功能齐全，手摇充电很实用，应急必备', true, 8),
(8, 1, 5, '收音机功能很好，充电宝功能也不错', true, 6);

-- 插入产品属性数据
INSERT INTO product_attributes (product_id, attribute_name, attribute_value) VALUES
-- 飞利浦 LED 球泡灯属性
(1, '光效', '90 lm/W'),
(1, '开关次数', '15,000次'),
(1, '启动时间', '< 0.5秒'),
(1, '工作温度', '-20°C 到 +45°C'),

-- 小米 Yeelight 属性
(2, '连接方式', 'WiFi 2.4GHz'),
(2, '支持协议', 'HomeKit, Google Assistant'),
(2, '调光范围', '1% - 100%'),
(2, '色温范围', '1700K - 6500K'),

-- 欧普吸顶灯属性
(3, '适用面积', '15-25平方米'),
(3, '光束角', '120°'),
(3, '调光档位', '3档'),
(3, '遥控距离', '8米'),

-- 飞利浦 Hue 灯带属性
(4, '可剪切', '每6.5cm一个剪切点'),
(4, '弯曲半径', '最小2cm'),
(4, '控制方式', 'Hue桥接器'),
(4, '扩展长度', '最大10米'),

-- 北欧吊灯属性
(5, '风格', '北欧简约'),
(5, '材质工艺', '天然橡木+烤漆'),
(5, '灯泡规格', 'E27, 最大40W'),
(5, '安装方式', '吊装'),

-- 太阳能庭院灯属性
(6, '太阳能板', '5V/2W多晶硅'),
(6, '电池容量', '2000mAh锂电池'),
(6, '充电时间', '6-8小时'),
(6, '照明时间', '8-10小时'),

-- LED工矿灯属性
(7, '散热方式', '铝合金鳍片+对流'),
(7, '安装高度', '4-8米'),
(7, '防护等级', 'IP65'),
(7, '抗风等级', '12级'),

-- 应急手电筒属性
(8, '充电方式', '手摇/太阳能/USB'),
(8, '收音机频段', 'AM/FM/NOAA'),
(8, '充电容量', '2000mAh'),
(8, '应急功能', '报警器/指南针/温度计');

-- 插入SEO数据
INSERT INTO seo_data (page_type, page_id, title, description, keywords, canonical_url, og_title, og_description, og_image) VALUES
-- 产品页面SEO
('product', 1, '飞利浦LED球泡灯9W - 节能护眼灯泡 | LightingPro', 
 '飞利浦LED球泡灯9W，替代传统60W白炽灯，节能80%，25000小时长寿命，即开即亮无频闪，护眼又环保。', 
 'LED灯泡,节能灯,飞利浦,护眼灯,球泡灯,家用照明', 
 'https://lightingpro.com/product/philips-led-9w-bulb',
 '飞利浦LED球泡灯9W - 节能护眼的理想选择',
 '高品质LED球泡灯，节能80%，25000小时寿命，即开即亮护眼设计',
 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500'),

('product', 2, '小米Yeelight智能灯泡 - 1600万色彩调节 | LightingPro',
 '小米Yeelight智能LED灯泡，支持1600万色彩调节，米家APP控制，语音控制，打造智能家居照明体验。',
 '智能灯泡,小米Yeelight,调色灯泡,WiFi灯泡,智能家居,米家',
 'https://lightingpro.com/product/xiaomi-yeelight-smart-bulb',
 '小米Yeelight智能灯泡 - 智能生活从照明开始',
 '1600万色彩，WiFi控制，语音操控，打造个性化智能照明',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'),

-- 分类页面SEO
('category', 1, 'LED灯具大全 - 节能环保照明产品 | LightingPro',
 'LED灯具专区，汇集各类高品质LED照明产品，包括球泡灯、吸顶灯、筒灯等，节能环保，寿命长久。',
 'LED灯具,节能灯,LED照明,环保照明,家居照明',
 'https://lightingpro.com/category/led-lights',
 'LED灯具大全 - 节能环保照明产品',
 '精选LED灯具，节能环保，品质保证，为您的家居提供完美照明解决方案',
 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500'),

('category', 2, '智能照明系统 - 未来家居照明 | LightingPro',
 '智能照明产品专区，支持APP控制、语音控制、场景模式，打造智能化家居照明体验。',
 '智能照明,智能灯具,智能家居,APP控制,语音控制',
 'https://lightingpro.com/category/smart-lighting',
 '智能照明系统 - 开启智能生活',
 '智能照明产品，APP控制，语音操控，多种场景模式，让照明更智能',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500');

-- 更新产品搜索向量
UPDATE products SET search_vector = 
    setweight(to_tsvector('simple', name), 'A') ||
    setweight(to_tsvector('simple', description), 'B') ||
    setweight(to_tsvector('simple', COALESCE(string_agg(tags, ' '), '')), 'C')
FROM (
    SELECT id, unnest(tags) as tags FROM products
) tag_table
WHERE products.id = tag_table.id
GROUP BY products.id;

-- 插入分析数据
INSERT INTO analytics_events (event_type, page_url, user_id, session_id, properties) VALUES
('page_view', '/product/1', 1, 'session_001', '{"product_id": 1, "referrer": "google"}'),
('page_view', '/product/2', 2, 'session_002', '{"product_id": 2, "referrer": "direct"}'),
('product_click', '/product/1', 1, 'session_001', '{"product_id": 1, "position": 1}'),
('add_to_cart', '/product/1', 1, 'session_001', '{"product_id": 1, "quantity": 1}'),
('page_view', '/category/1', 3, 'session_003', '{"category_id": 1}'),
('search', '/search', 4, 'session_004', '{"query": "LED灯", "results": 5}'),
('page_view', '/product/3', 5, 'session_005', '{"product_id": 3, "referrer": "search"}'),
('product_click', '/product/2', 2, 'session_002', '{"product_id": 2, "position": 2}');

-- 插入用户行为数据
INSERT INTO user_behavior (user_id, action_type, target_id, target_type, metadata) VALUES
(1, 'view', 1, 'product', '{"duration": 45, "scroll_depth": 0.8}'),
(1, 'click', 1, 'product', '{"element": "add_to_cart"}'),
(2, 'view', 2, 'product', '{"duration": 120, "scroll_depth": 0.9}'),
(2, 'click', 2, 'product', '{"element": "image_gallery"}'),
(3, 'view', 1, 'category', '{"duration": 30, "products_viewed": 5}'),
(4, 'search', null, 'global', '{"query": "智能灯", "results": 3}'),
(5, 'view', 3, 'product', '{"duration": 60, "scroll_depth": 0.7}'),
(6, 'click', 5, 'product', '{"element": "affiliate_link"}');

-- 创建视图：热门产品
CREATE OR REPLACE VIEW popular_products AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.image_url,
    COUNT(DISTINCT pr.id) as review_count,
    AVG(pr.rating) as avg_rating,
    COUNT(DISTINCT ub.id) as view_count
FROM products p
LEFT JOIN product_reviews pr ON p.id = pr.product_id
LEFT JOIN user_behavior ub ON p.id = ub.target_id AND ub.target_type = 'product'
WHERE p.is_active = true
GROUP BY p.id, p.name, p.price, p.image_url
ORDER BY view_count DESC, avg_rating DESC
LIMIT 10;

-- 创建视图：分类统计
CREATE OR REPLACE VIEW category_stats AS
SELECT 
    c.id,
    c.name,
    c.slug,
    COUNT(p.id) as product_count,
    AVG(p.price) as avg_price,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
GROUP BY c.id, c.name, c.slug
ORDER BY product_count DESC;

-- 创建视图：品牌统计
CREATE OR REPLACE VIEW brand_stats AS
SELECT 
    b.id,
    b.name,
    b.country,
    COUNT(p.id) as product_count,
    AVG(p.price) as avg_price,
    AVG(pr.rating) as avg_rating
FROM brands b
LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = true
LEFT JOIN product_reviews pr ON p.id = pr.product_id
GROUP BY b.id, b.name, b.country
ORDER BY product_count DESC;

-- 设置统计信息
ANALYZE;

-- 完成提示
SELECT 
    'LightingPro 种子数据插入完成' as status,
    (SELECT COUNT(*) FROM products) as products_count,
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM brands) as brands_count,
    (SELECT COUNT(*) FROM product_reviews) as reviews_count,
    (SELECT COUNT(*) FROM product_images) as images_count;
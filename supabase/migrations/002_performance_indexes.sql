-- =====================================================
-- LightingPro Performance Optimization Indexes
-- Date: 2024-12-XX
-- Description: High-performance indexes for query optimization
-- =====================================================

-- =====================================================
-- 1. USER SYSTEM INDEXES
-- =====================================================

-- User profiles optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_auth_user_id 
  ON user_profiles(auth_user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_email 
  ON user_profiles(email);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_subscription 
  ON user_profiles(subscription_tier, created_at DESC) 
  WHERE subscription_tier != 'free';

-- User sessions optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_id_start 
  ON user_sessions(user_id, session_start DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_active 
  ON user_sessions(user_id, session_start DESC) 
  WHERE session_end IS NULL;

-- =====================================================
-- 2. PRODUCT SYSTEM INDEXES
-- =====================================================

-- Core product queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_status 
  ON lighting_products(category_id, status, created_at DESC) 
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_brand_status 
  ON lighting_products(brand_id, status, rating DESC) 
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price_range 
  ON lighting_products(price, rating DESC) 
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_rating 
  ON lighting_products(rating DESC, review_count DESC) 
  WHERE status = 'active' AND rating > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_featured 
  ON lighting_products(is_featured, created_at DESC) 
  WHERE is_featured = true AND status = 'active';

-- Search optimization indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_search 
  ON lighting_products USING gin(to_tsvector('english', name))
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_description_search 
  ON lighting_products USING gin(to_tsvector('english', description))
  WHERE status = 'active';

-- Tag-based filtering (GIN indexes for arrays)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_style_tags 
  ON lighting_products USING gin(style_tags);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_room_tags 
  ON lighting_products USING gin(room_tags);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_tags 
  ON lighting_products USING gin(tags);

-- Multi-column composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_price_rating 
  ON lighting_products(category_id, price, rating DESC) 
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_style_price 
  ON lighting_products USING gin(style_tags) 
  INCLUDE (price, rating) 
  WHERE status = 'active';

-- Affiliate links optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_links_product_platform 
  ON affiliate_links(product_id, platform) 
  WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_links_commission 
  ON affiliate_links(commission_rate DESC, platform) 
  WHERE is_active = true;

-- =====================================================
-- 3. RECOMMENDATION SYSTEM INDEXES
-- =====================================================

-- Questionnaire optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_questionnaire_user_created 
  ON questionnaire_responses(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_questionnaire_session 
  ON questionnaire_responses(session_id, created_at DESC);

-- Budget range queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_questionnaire_budget_room 
  ON questionnaire_responses(budget_min, budget_max, room_type, created_at DESC);

-- Recommendations optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_questionnaire_rank 
  ON recommendations(questionnaire_id, rank_position);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_product_score 
  ON recommendations(product_id, match_score DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_primary 
  ON recommendations(questionnaire_id, is_primary_recommendation) 
  WHERE is_primary_recommendation = true;

-- =====================================================
-- 4. ANALYTICS INDEXES
-- =====================================================

-- Product interactions optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_user_type_time 
  ON product_interactions(user_id, interaction_type, interaction_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_product_type_time 
  ON product_interactions(product_id, interaction_type, interaction_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_session_time 
  ON product_interactions(session_id, interaction_at DESC);

-- Conversion tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_purchase_clicks 
  ON product_interactions(product_id, platform, interaction_at DESC) 
  WHERE interaction_type = 'purchase_click';

-- Time-based analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_daily_analytics 
  ON product_interactions(DATE(interaction_at), interaction_type);

-- Product stats optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_stats_popularity 
  ON product_stats(popularity_score DESC, last_updated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_stats_trending 
  ON product_stats(trending_score DESC, last_updated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_stats_conversion 
  ON product_stats(conversion_rate DESC, purchase_click_count DESC) 
  WHERE conversion_rate > 0;

-- =====================================================
-- 5. CATEGORY HIERARCHY INDEXES
-- =====================================================

-- Category tree traversal
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent_level 
  ON categories(parent_id, level, sort_order) 
  WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_slug 
  ON categories(slug) 
  WHERE is_active = true;

-- Materialized path for fast hierarchy queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_level_order 
  ON categories(level, sort_order) 
  WHERE is_active = true;

-- =====================================================
-- 6. BRAND OPTIMIZATION
-- =====================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brands_active_commission 
  ON brands(affiliate_active, commission_rate DESC) 
  WHERE affiliate_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brands_name 
  ON brands(name) 
  WHERE affiliate_active = true;

-- =====================================================
-- 7. PARTIAL INDEXES FOR SPECIFIC USE CASES
-- =====================================================

-- High-value products
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_premium 
  ON lighting_products(price DESC, rating DESC) 
  WHERE status = 'active' AND price > 500;

-- Budget products
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_budget 
  ON lighting_products(price, rating DESC) 
  WHERE status = 'active' AND price <= 150;

-- Recently added products
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_recent 
  ON lighting_products(created_at DESC) 
  WHERE status = 'active' AND created_at > NOW() - INTERVAL '30 days';

-- High-rated products
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_top_rated 
  ON lighting_products(rating DESC, review_count DESC) 
  WHERE status = 'active' AND rating >= 4.0 AND review_count >= 10;

-- =====================================================
-- 8. STATISTICS UPDATE
-- =====================================================

-- Analyze tables for query planner optimization
ANALYZE user_profiles;
ANALYZE user_sessions;
ANALYZE lighting_products;
ANALYZE categories;
ANALYZE brands;
ANALYZE affiliate_links;
ANALYZE questionnaire_responses;
ANALYZE recommendations;
ANALYZE product_interactions;
ANALYZE product_stats;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Insert migration record
INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('002', 'performance_indexes', NOW())
ON CONFLICT (version) DO NOTHING;
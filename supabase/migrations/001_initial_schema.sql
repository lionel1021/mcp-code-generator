-- =====================================================
-- LightingPro Database Schema Migration v1.0
-- Date: 2024-12-XX
-- Description: Initial database schema with optimized structure
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- 1. USER SYSTEM TABLES
-- =====================================================

-- Enhanced user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'expert')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- User session tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  page_views INTEGER DEFAULT 0,
  questionnaire_completed BOOLEAN DEFAULT false,
  recommendations_viewed INTEGER DEFAULT 0,
  products_clicked INTEGER DEFAULT 0,
  conversion_value DECIMAL(10,2) DEFAULT 0,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET
);

-- =====================================================
-- 2. PRODUCT SYSTEM TABLES
-- =====================================================

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  affiliate_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories with hierarchy support
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id),
  level INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimized products table
CREATE TABLE IF NOT EXISTS lighting_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id) NOT NULL,
  category_id UUID REFERENCES categories(id) NOT NULL,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  cost DECIMAL(10,2),
  
  -- Product info
  description TEXT,
  short_description TEXT,
  specifications JSONB DEFAULT '{}',
  dimensions JSONB DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  materials TEXT[] DEFAULT '{}',
  
  -- Ratings
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Media
  images JSONB DEFAULT '[]',
  videos JSONB DEFAULT '[]',
  
  -- Tags for matching
  tags TEXT[] DEFAULT '{}',
  style_tags TEXT[] DEFAULT '{}',
  room_tags TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'discontinued')),
  is_featured BOOLEAN DEFAULT false,
  inventory_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Affiliate links table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES lighting_products(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(product_id, platform)
);

-- =====================================================
-- 3. RECOMMENDATION SYSTEM TABLES
-- =====================================================

-- Structured questionnaire responses
CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  session_id UUID,
  
  -- Questionnaire data
  room_type TEXT NOT NULL,
  room_size TEXT NOT NULL,
  style_preference TEXT NOT NULL,
  budget_min INTEGER NOT NULL,
  budget_max INTEGER NOT NULL,
  current_lighting TEXT,
  special_requirements TEXT[],
  
  -- Results tracking
  recommendations_generated BOOLEAN DEFAULT false,
  recommendation_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET
);

-- Recommendation results
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID REFERENCES questionnaire_responses(id) ON DELETE CASCADE,
  product_id UUID REFERENCES lighting_products(id) ON DELETE CASCADE,
  
  -- Algorithm scoring
  match_score DECIMAL(5,2) NOT NULL,
  algorithm_version TEXT DEFAULT 'v1.0',
  scoring_factors JSONB,
  
  -- Display ranking
  rank_position INTEGER NOT NULL,
  is_primary_recommendation BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User interaction tracking
CREATE TABLE IF NOT EXISTS product_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  session_id UUID,
  product_id UUID REFERENCES lighting_products(id) ON DELETE CASCADE,
  
  -- Interaction details
  interaction_type TEXT NOT NULL CHECK (
    interaction_type IN ('view', 'click', 'favorite', 'share', 'compare', 'purchase_click')
  ),
  
  -- Context
  source TEXT,
  recommendation_id UUID REFERENCES recommendations(id),
  platform TEXT,
  
  -- Metadata
  interaction_at TIMESTAMPTZ DEFAULT NOW(),
  page_url TEXT,
  referrer TEXT
);

-- =====================================================
-- 4. ANALYTICS TABLES
-- =====================================================

-- Product statistics cache
CREATE TABLE IF NOT EXISTS product_stats (
  product_id UUID PRIMARY KEY REFERENCES lighting_products(id) ON DELETE CASCADE,
  
  -- Interaction counts
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  recommendation_count INTEGER DEFAULT 0,
  
  -- Conversion metrics
  purchase_click_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  
  -- Timestamps
  last_viewed_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Scoring
  popularity_score DECIMAL(8,2) DEFAULT 0,
  trending_score DECIMAL(8,2) DEFAULT 0
);

-- Daily analytics summary
CREATE TABLE IF NOT EXISTS daily_analytics (
  date DATE PRIMARY KEY,
  
  -- User metrics
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  questionnaire_completions INTEGER DEFAULT 0,
  
  -- Product metrics
  product_views INTEGER DEFAULT 0,
  product_clicks INTEGER DEFAULT 0,
  recommendations_generated INTEGER DEFAULT 0,
  
  -- Revenue metrics
  affiliate_clicks INTEGER DEFAULT 0,
  estimated_revenue DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on user tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_interactions ENABLE ROW LEVEL SECURITY;

-- User profile policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = auth_user_id::text);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = auth_user_id::text);

-- Questionnaire policies  
CREATE POLICY "Users can view own questionnaires" ON questionnaire_responses
  FOR SELECT USING (
    auth.uid()::text = (SELECT auth_user_id::text FROM user_profiles WHERE id = user_id)
  );

CREATE POLICY "Users can create questionnaires" ON questionnaire_responses
  FOR INSERT WITH CHECK (true);

-- Product tables are publicly readable
CREATE POLICY "Products are publicly readable" ON lighting_products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Brands are publicly readable" ON brands
  FOR SELECT USING (true);

CREATE POLICY "Categories are publicly readable" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Affiliate links are publicly readable" ON affiliate_links
  FOR SELECT USING (is_active = true);

CREATE POLICY "Recommendations are publicly readable" ON recommendations
  FOR SELECT USING (true);

-- =====================================================
-- 6. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lighting_products_updated_at BEFORE UPDATE ON lighting_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Category path generation function
CREATE OR REPLACE FUNCTION generate_category_path()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.level = 0;
  ELSE
    SELECT level + 1 INTO NEW.level 
    FROM categories 
    WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_category_level BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION generate_category_path();

-- Product stats update function
CREATE OR REPLACE FUNCTION update_product_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO product_stats (product_id) VALUES (NEW.product_id)
  ON CONFLICT (product_id) DO NOTHING;
  
  UPDATE product_stats 
  SET 
    view_count = view_count + CASE WHEN NEW.interaction_type = 'view' THEN 1 ELSE 0 END,
    click_count = click_count + CASE WHEN NEW.interaction_type = 'click' THEN 1 ELSE 0 END,
    favorite_count = favorite_count + CASE WHEN NEW.interaction_type = 'favorite' THEN 1 ELSE 0 END,
    purchase_click_count = purchase_click_count + CASE WHEN NEW.interaction_type = 'purchase_click' THEN 1 ELSE 0 END,
    last_viewed_at = CASE WHEN NEW.interaction_type = 'view' THEN NEW.interaction_at ELSE last_viewed_at END,
    last_updated_at = NOW()
  WHERE product_id = NEW.product_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stats_on_interaction AFTER INSERT ON product_interactions
  FOR EACH ROW EXECUTE FUNCTION update_product_stats();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Insert migration record
INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('001', 'initial_schema', NOW())
ON CONFLICT (version) DO NOTHING;
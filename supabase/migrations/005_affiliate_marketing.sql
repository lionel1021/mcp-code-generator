-- =====================================================
-- LightingPro Affiliate Marketing Enhancement v1.0
-- Date: 2024-12-XX
-- Description: Enhanced affiliate marketing tables and functions
-- =====================================================

-- =====================================================
-- 1. AFFILIATE PROVIDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS affiliate_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.05,
  tracking_param TEXT NOT NULL,
  api_endpoint TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'testing')),
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default providers
INSERT INTO affiliate_providers (id, name, domain, commission_rate, tracking_param, status) VALUES
('amazon', 'Amazon Associates', 'amazon.com', 0.08, 'tag', 'active'),
('taobao', '淘宝联盟', 'taobao.com', 0.05, 'pid', 'active'),
('tmall', '天猫联盟', 'tmall.com', 0.06, 'pid', 'active'),
('jd', '京东联盟', 'jd.com', 0.04, 'unionId', 'active'),
('lighting_direct', 'Lighting Direct', 'lightingdirect.com', 0.12, 'aff', 'active')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. ENHANCED AFFILIATE LINKS TABLE
-- =====================================================

-- Drop existing simple affiliate_links table if exists
DROP TABLE IF EXISTS affiliate_links CASCADE;

-- Create enhanced affiliate links table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES lighting_products(id) ON DELETE CASCADE,
  provider_id TEXT REFERENCES affiliate_providers(id) NOT NULL,
  original_url TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL,
  priority INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'broken')),
  last_validated TIMESTAMPTZ DEFAULT NOW(),
  validation_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(product_id, provider_id)
);

-- =====================================================
-- 3. AFFILIATE TRACKING TABLES
-- =====================================================

-- Affiliate link generations tracking
CREATE TABLE IF NOT EXISTS affiliate_link_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES lighting_products(id) ON DELETE CASCADE,
  affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE SET NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  generated_url TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate clicks tracking
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  event_type TEXT DEFAULT 'click' CHECK (event_type IN ('click', 'impression', 'conversion')),
  converted BOOLEAN DEFAULT false,
  conversion_value DECIMAL(10,2),
  commission_earned DECIMAL(10,2),
  order_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate conversions detail tracking
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  product_id UUID REFERENCES lighting_products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL,
  commission_earned DECIMAL(10,2) NOT NULL,
  order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. AFFILIATE ANALYTICS TABLES
-- =====================================================

-- Daily affiliate performance summary
CREATE TABLE IF NOT EXISTS affiliate_daily_stats (
  date DATE NOT NULL,
  provider_id TEXT REFERENCES affiliate_providers(id),
  product_id UUID REFERENCES lighting_products(id) ON DELETE CASCADE,
  
  -- Click metrics
  total_clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  
  -- Conversion metrics
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  total_conversion_value DECIMAL(10,2) DEFAULT 0,
  total_commission_earned DECIMAL(10,2) DEFAULT 0,
  
  -- Performance metrics
  avg_time_to_conversion INTERVAL,
  bounce_rate DECIMAL(5,4) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (date, provider_id, product_id)
);

-- Affiliate provider performance summary
CREATE TABLE IF NOT EXISTS affiliate_provider_stats (
  provider_id TEXT PRIMARY KEY REFERENCES affiliate_providers(id),
  
  -- Totals
  total_links INTEGER DEFAULT 0,
  active_links INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  
  -- Averages
  avg_commission_rate DECIMAL(5,4) DEFAULT 0,
  avg_conversion_rate DECIMAL(5,4) DEFAULT 0,
  avg_order_value DECIMAL(10,2) DEFAULT 0,
  
  -- Rankings
  performance_rank INTEGER,
  revenue_rank INTEGER,
  
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. AFFILIATE FUNCTIONS
-- =====================================================

-- Function to update affiliate provider stats
CREATE OR REPLACE FUNCTION update_affiliate_provider_stats()
RETURNS TRIGGER AS $$
DECLARE
  provider_record RECORD;
BEGIN
  -- Update stats for the affected provider
  FOR provider_record IN 
    SELECT DISTINCT al.provider_id 
    FROM affiliate_links al
    WHERE al.id = COALESCE(NEW.affiliate_link_id, OLD.affiliate_link_id)
  LOOP
    INSERT INTO affiliate_provider_stats (provider_id) 
    VALUES (provider_record.provider_id)
    ON CONFLICT (provider_id) DO NOTHING;
    
    -- Update comprehensive stats
    UPDATE affiliate_provider_stats 
    SET 
      total_links = (
        SELECT COUNT(*) 
        FROM affiliate_links 
        WHERE provider_id = provider_record.provider_id
      ),
      active_links = (
        SELECT COUNT(*) 
        FROM affiliate_links 
        WHERE provider_id = provider_record.provider_id AND status = 'active'
      ),
      total_clicks = (
        SELECT COUNT(*) 
        FROM affiliate_clicks ac
        JOIN affiliate_links al ON ac.affiliate_link_id = al.id
        WHERE al.provider_id = provider_record.provider_id
      ),
      total_conversions = (
        SELECT COUNT(*) 
        FROM affiliate_clicks ac
        JOIN affiliate_links al ON ac.affiliate_link_id = al.id
        WHERE al.provider_id = provider_record.provider_id AND ac.converted = true
      ),
      total_revenue = (
        SELECT COALESCE(SUM(ac.commission_earned), 0)
        FROM affiliate_clicks ac
        JOIN affiliate_links al ON ac.affiliate_link_id = al.id
        WHERE al.provider_id = provider_record.provider_id AND ac.converted = true
      ),
      avg_commission_rate = (
        SELECT COALESCE(AVG(commission_rate), 0)
        FROM affiliate_links
        WHERE provider_id = provider_record.provider_id AND status = 'active'
      ),
      last_updated = NOW()
    WHERE provider_id = provider_record.provider_id;
  END LOOP;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for stats updates
CREATE TRIGGER update_provider_stats_on_click 
  AFTER INSERT OR UPDATE OR DELETE ON affiliate_clicks
  FOR EACH ROW EXECUTE FUNCTION update_affiliate_provider_stats();

CREATE TRIGGER update_provider_stats_on_link 
  AFTER INSERT OR UPDATE OR DELETE ON affiliate_links
  FOR EACH ROW EXECUTE FUNCTION update_affiliate_provider_stats();

-- Function to calculate conversion rates
CREATE OR REPLACE FUNCTION calculate_conversion_metrics()
RETURNS void AS $$
BEGIN
  -- Update conversion rates in affiliate_daily_stats
  UPDATE affiliate_daily_stats 
  SET 
    conversion_rate = CASE 
      WHEN total_clicks > 0 THEN conversions::decimal / total_clicks 
      ELSE 0 
    END,
    bounce_rate = CASE 
      WHEN total_clicks > 0 THEN 
        (total_clicks - conversions)::decimal / total_clicks 
      ELSE 0 
    END,
    updated_at = NOW()
  WHERE updated_at < NOW() - INTERVAL '1 hour';
  
  -- Update provider conversion rates
  UPDATE affiliate_provider_stats 
  SET 
    avg_conversion_rate = CASE 
      WHEN total_clicks > 0 THEN total_conversions::decimal / total_clicks 
      ELSE 0 
    END,
    avg_order_value = CASE 
      WHEN total_conversions > 0 THEN total_revenue / total_conversions 
      ELSE 0 
    END,
    last_updated = NOW()
  WHERE last_updated < NOW() - INTERVAL '1 hour';
END;
$$ language 'plpgsql';

-- =====================================================
-- 6. AFFILIATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes on affiliate_links
CREATE INDEX IF NOT EXISTS idx_affiliate_links_product_provider 
  ON affiliate_links(product_id, provider_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_status 
  ON affiliate_links(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_priority 
  ON affiliate_links(priority DESC);

-- Indexes on affiliate_clicks
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_link_id 
  ON affiliate_clicks(affiliate_link_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_session 
  ON affiliate_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_timestamp 
  ON affiliate_clicks(timestamp);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted 
  ON affiliate_clicks(converted);

-- Indexes on affiliate_conversions
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_link_session 
  ON affiliate_conversions(affiliate_link_id, session_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_product 
  ON affiliate_conversions(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_created 
  ON affiliate_conversions(created_at);

-- Indexes on affiliate_daily_stats
CREATE INDEX IF NOT EXISTS idx_affiliate_daily_stats_date_provider 
  ON affiliate_daily_stats(date, provider_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_daily_stats_product 
  ON affiliate_daily_stats(product_id);

-- =====================================================
-- 7. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_link_generations ENABLE ROW LEVEL SECURITY;

-- Public read access for affiliate links and providers
CREATE POLICY "Affiliate providers are publicly readable" ON affiliate_providers
  FOR SELECT USING (status = 'active');

CREATE POLICY "Active affiliate links are publicly readable" ON affiliate_links
  FOR SELECT USING (status = 'active');

-- Restricted access for tracking data
CREATE POLICY "Affiliate clicks are admin only" ON affiliate_clicks
  FOR ALL USING (false);

CREATE POLICY "Affiliate conversions are admin only" ON affiliate_conversions
  FOR ALL USING (false);

-- =====================================================
-- 8. VIEWS FOR REPORTING
-- =====================================================

-- Affiliate performance summary view
CREATE OR REPLACE VIEW affiliate_performance_summary AS
SELECT 
  ap.id as provider_id,
  ap.name as provider_name,
  aps.total_links,
  aps.active_links,
  aps.total_clicks,
  aps.total_conversions,
  aps.total_revenue,
  aps.avg_commission_rate,
  aps.avg_conversion_rate,
  aps.avg_order_value,
  aps.last_updated
FROM affiliate_providers ap
LEFT JOIN affiliate_provider_stats aps ON ap.id = aps.provider_id
WHERE ap.status = 'active'
ORDER BY aps.total_revenue DESC NULLS LAST;

-- Product affiliate performance view
CREATE OR REPLACE VIEW product_affiliate_performance AS
SELECT 
  lp.id as product_id,
  lp.name as product_name,
  lp.price,
  COUNT(al.id) as affiliate_link_count,
  COUNT(CASE WHEN al.status = 'active' THEN 1 END) as active_link_count,
  COALESCE(SUM(ads.total_clicks), 0) as total_clicks,
  COALESCE(SUM(ads.conversions), 0) as total_conversions,
  COALESCE(SUM(ads.total_commission_earned), 0) as total_commission_earned,
  CASE 
    WHEN SUM(ads.total_clicks) > 0 THEN 
      SUM(ads.conversions)::decimal / SUM(ads.total_clicks)
    ELSE 0 
  END as conversion_rate
FROM lighting_products lp
LEFT JOIN affiliate_links al ON lp.id = al.product_id
LEFT JOIN affiliate_daily_stats ads ON lp.id = ads.product_id
WHERE lp.status = 'active'
GROUP BY lp.id, lp.name, lp.price
ORDER BY total_commission_earned DESC;

-- =====================================================
-- 9. SCHEDULED JOBS SETUP
-- =====================================================

-- Note: These would typically be set up with pg_cron extension or external scheduler
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily stats aggregation (example - would need pg_cron)
-- SELECT cron.schedule('affiliate-daily-stats', '0 1 * * *', 'SELECT calculate_conversion_metrics();');

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Insert migration record
INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('005', 'affiliate_marketing', NOW())
ON CONFLICT (version) DO NOTHING;
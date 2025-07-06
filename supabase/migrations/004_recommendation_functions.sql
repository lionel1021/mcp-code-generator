-- =====================================================
-- Recommendation Algorithm Functions
-- Advanced scoring and matching system
-- =====================================================

-- Enable required extensions for better text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =====================================================
-- 1. SMART PRODUCT RECOMMENDATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_product_recommendations(questionnaire_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  brand_name TEXT,
  category_name TEXT,
  price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  description TEXT,
  short_description TEXT,
  specifications JSONB,
  dimensions JSONB,
  colors TEXT[],
  materials TEXT[],
  rating DECIMAL(3,2),
  review_count INTEGER,
  images JSONB,
  tags TEXT[],
  style_tags TEXT[],
  room_tags TEXT[],
  match_score DECIMAL(5,2),
  match_reasons JSONB,
  affiliate_links JSONB,
  popularity_score DECIMAL(8,2),
  is_featured BOOLEAN
) AS $$
DECLARE
  q_response RECORD;
  base_score DECIMAL(5,2) := 0;
  style_weight DECIMAL(3,2) := 30;
  price_weight DECIMAL(3,2) := 25;
  room_weight DECIMAL(3,2) := 20;
  rating_weight DECIMAL(3,2) := 15;
  popularity_weight DECIMAL(3,2) := 10;
BEGIN
  -- Get questionnaire response details
  SELECT qr.room_type, qr.room_size, qr.style_preference, 
         qr.budget_min, qr.budget_max, qr.special_requirements
  INTO q_response
  FROM questionnaire_responses qr
  WHERE qr.id = questionnaire_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Questionnaire not found: %', questionnaire_id;
  END IF;
  
  RETURN QUERY
  WITH scored_products AS (
    SELECT 
      p.id,
      p.name,
      b.name as brand_name,
      c.name as category_name,
      p.price,
      p.sale_price,
      p.description,
      p.short_description,
      p.specifications,
      p.dimensions,
      p.colors,
      p.materials,
      p.rating,
      p.review_count,
      p.images,
      p.tags,
      p.style_tags,
      p.room_tags,
      p.is_featured,
      
      -- Calculate popularity score from stats
      COALESCE(ps.popularity_score, 0) as popularity_score,
      
      -- Core matching algorithm
      (
        -- 1. Style preference matching (30%)
        CASE 
          WHEN q_response.style_preference = ANY(p.style_tags) THEN style_weight
          WHEN similarity(q_response.style_preference, array_to_string(p.style_tags, ' ')) > 0.3 THEN style_weight * 0.6
          ELSE 0
        END +
        
        -- 2. Price range matching (25%)
        CASE 
          WHEN COALESCE(p.sale_price, p.price) BETWEEN q_response.budget_min AND q_response.budget_max THEN price_weight
          WHEN COALESCE(p.sale_price, p.price) <= q_response.budget_max * 1.1 THEN price_weight * 0.8
          WHEN COALESCE(p.sale_price, p.price) >= q_response.budget_min * 0.9 THEN price_weight * 0.6
          ELSE 0
        END +
        
        -- 3. Room type matching (20%)
        CASE 
          WHEN q_response.room_type = ANY(p.room_tags) THEN room_weight
          WHEN similarity(q_response.room_type, array_to_string(p.room_tags, ' ')) > 0.4 THEN room_weight * 0.7
          ELSE room_weight * 0.2
        END +
        
        -- 4. Product rating bonus (15%)
        CASE 
          WHEN p.rating >= 4.5 THEN rating_weight
          WHEN p.rating >= 4.0 THEN rating_weight * 0.8
          WHEN p.rating >= 3.5 THEN rating_weight * 0.6
          WHEN p.rating >= 3.0 THEN rating_weight * 0.4
          ELSE 0
        END +
        
        -- 5. Popularity bonus (10%)
        CASE 
          WHEN COALESCE(ps.popularity_score, 0) >= 80 THEN popularity_weight
          WHEN COALESCE(ps.popularity_score, 0) >= 60 THEN popularity_weight * 0.8
          WHEN COALESCE(ps.popularity_score, 0) >= 40 THEN popularity_weight * 0.6
          WHEN COALESCE(ps.popularity_score, 0) >= 20 THEN popularity_weight * 0.4
          ELSE 0
        END +
        
        -- Bonus factors
        CASE WHEN p.is_featured THEN 5 ELSE 0 END +
        CASE WHEN p.review_count > 100 THEN 3 ELSE 0 END +
        CASE WHEN p.sale_price IS NOT NULL THEN 2 ELSE 0 END
        
      ) as calculated_score,
      
      -- Generate match reasons
      jsonb_build_object(
        'style_match', q_response.style_preference = ANY(p.style_tags),
        'price_match', COALESCE(p.sale_price, p.price) BETWEEN q_response.budget_min AND q_response.budget_max,
        'room_match', q_response.room_type = ANY(p.room_tags),
        'high_rating', p.rating >= 4.0,
        'popular', COALESCE(ps.popularity_score, 0) >= 60,
        'featured', p.is_featured,
        'on_sale', p.sale_price IS NOT NULL
      ) as match_reasons,
      
      -- Collect affiliate links
      (
        SELECT jsonb_object_agg(al.platform, jsonb_build_object(
          'url', al.url,
          'price', al.price,
          'commission_rate', al.commission_rate
        ))
        FROM affiliate_links al
        WHERE al.product_id = p.id AND al.is_active = true
      ) as affiliate_links
      
    FROM lighting_products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_stats ps ON p.id = ps.product_id
    WHERE 
      p.status = 'active'
      AND p.inventory_count > 0
      AND COALESCE(p.sale_price, p.price) >= q_response.budget_min * 0.5  -- Not too cheap
      AND COALESCE(p.sale_price, p.price) <= q_response.budget_max * 1.5  -- Not too expensive
  )
  SELECT 
    sp.id,
    sp.name,
    sp.brand_name,
    sp.category_name,
    sp.price,
    sp.sale_price,
    sp.description,
    sp.short_description,
    sp.specifications,
    sp.dimensions,
    sp.colors,
    sp.materials,
    sp.rating,
    sp.review_count,
    sp.images,
    sp.tags,
    sp.style_tags,
    sp.room_tags,
    sp.calculated_score as match_score,
    sp.match_reasons,
    sp.affiliate_links,
    sp.popularity_score,
    sp.is_featured
  FROM scored_products sp
  WHERE sp.calculated_score > 20  -- Minimum score threshold
  ORDER BY 
    sp.calculated_score DESC,
    sp.popularity_score DESC,
    sp.rating DESC,
    sp.review_count DESC
  LIMIT 50;
  
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. PRODUCT SEARCH FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT DEFAULT '',
  category_filter UUID DEFAULT NULL,
  brand_filter UUID DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  min_rating DECIMAL DEFAULT NULL,
  style_filter TEXT DEFAULT NULL,
  room_filter TEXT DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevance',
  page_offset INTEGER DEFAULT 0,
  page_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  brand_name TEXT,
  category_name TEXT,
  price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  rating DECIMAL(3,2),
  review_count INTEGER,
  images JSONB,
  match_score DECIMAL(5,2),
  relevance_score DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH search_results AS (
    SELECT 
      p.id,
      p.name,
      b.name as brand_name,
      c.name as category_name,
      p.price,
      p.sale_price,
      p.rating,
      p.review_count,
      p.images,
      
      -- Text search relevance
      CASE 
        WHEN search_query = '' THEN 50
        ELSE (
          ts_rank_cd(
            to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || array_to_string(p.tags, ' ')),
            plainto_tsquery('english', search_query)
          ) * 100
        )
      END as relevance_score,
      
      -- Overall match score considering filters
      (
        CASE WHEN search_query = '' THEN 50 
             ELSE ts_rank_cd(
               to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || array_to_string(p.tags, ' ')),
               plainto_tsquery('english', search_query)
             ) * 50
        END +
        CASE WHEN category_filter IS NULL OR p.category_id = category_filter THEN 20 ELSE 0 END +
        CASE WHEN brand_filter IS NULL OR p.brand_id = brand_filter THEN 15 ELSE 0 END +
        CASE WHEN style_filter IS NULL OR style_filter = ANY(p.style_tags) THEN 10 ELSE 0 END +
        CASE WHEN room_filter IS NULL OR room_filter = ANY(p.room_tags) THEN 5 ELSE 0 END
      ) as match_score
      
    FROM lighting_products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 
      p.status = 'active'
      AND (search_query = '' OR (
        to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || array_to_string(p.tags, ' ')) 
        @@ plainto_tsquery('english', search_query)
      ))
      AND (category_filter IS NULL OR p.category_id = category_filter)
      AND (brand_filter IS NULL OR p.brand_id = brand_filter)
      AND (min_price IS NULL OR COALESCE(p.sale_price, p.price) >= min_price)
      AND (max_price IS NULL OR COALESCE(p.sale_price, p.price) <= max_price)
      AND (min_rating IS NULL OR p.rating >= min_rating)
      AND (style_filter IS NULL OR style_filter = ANY(p.style_tags))
      AND (room_filter IS NULL OR room_filter = ANY(p.room_tags))
  )
  SELECT 
    sr.id,
    sr.name,
    sr.brand_name,
    sr.category_name,
    sr.price,
    sr.sale_price,
    sr.rating,
    sr.review_count,
    sr.images,
    sr.match_score,
    sr.relevance_score
  FROM search_results sr
  WHERE sr.match_score > 10
  ORDER BY
    CASE 
      WHEN sort_by = 'price_low' THEN COALESCE(sr.sale_price, sr.price)
      ELSE NULL
    END ASC,
    CASE 
      WHEN sort_by = 'price_high' THEN COALESCE(sr.sale_price, sr.price)
      ELSE NULL
    END DESC,
    CASE 
      WHEN sort_by = 'rating' THEN sr.rating
      ELSE NULL
    END DESC,
    CASE 
      WHEN sort_by = 'popularity' THEN sr.review_count
      ELSE NULL
    END DESC,
    CASE 
      WHEN sort_by = 'relevance' THEN sr.match_score
      ELSE sr.match_score
    END DESC,
    sr.relevance_score DESC
  OFFSET page_offset
  LIMIT page_limit;
  
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. ANALYTICS FUNCTIONS
-- =====================================================

-- Daily analytics aggregation
CREATE OR REPLACE FUNCTION update_daily_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_analytics (
    date,
    new_users,
    active_users,
    questionnaire_completions,
    product_views,
    product_clicks,
    recommendations_generated,
    affiliate_clicks,
    estimated_revenue,
    conversion_rate
  )
  SELECT 
    target_date,
    COUNT(DISTINCT CASE WHEN up.created_at::date = target_date THEN up.id END) as new_users,
    COUNT(DISTINCT CASE WHEN us.session_start::date = target_date THEN us.user_id END) as active_users,
    COUNT(DISTINCT CASE WHEN qr.created_at::date = target_date THEN qr.id END) as questionnaire_completions,
    COUNT(CASE WHEN pi.interaction_type = 'view' AND pi.interaction_at::date = target_date THEN 1 END) as product_views,
    COUNT(CASE WHEN pi.interaction_type = 'click' AND pi.interaction_at::date = target_date THEN 1 END) as product_clicks,
    COUNT(DISTINCT CASE WHEN r.created_at::date = target_date THEN r.questionnaire_id END) as recommendations_generated,
    COUNT(CASE WHEN pi.interaction_type = 'purchase_click' AND pi.interaction_at::date = target_date THEN 1 END) as affiliate_clicks,
    
    -- Estimated revenue calculation
    COALESCE(SUM(CASE 
      WHEN pi.interaction_type = 'purchase_click' AND pi.interaction_at::date = target_date 
      THEN (
        SELECT AVG(al.price * al.commission_rate / 100)
        FROM affiliate_links al 
        WHERE al.product_id = pi.product_id AND al.is_active = true
      )
      ELSE 0
    END), 0) as estimated_revenue,
    
    -- Conversion rate
    CASE 
      WHEN COUNT(CASE WHEN pi.interaction_type = 'view' AND pi.interaction_at::date = target_date THEN 1 END) > 0
      THEN (
        COUNT(CASE WHEN pi.interaction_type = 'purchase_click' AND pi.interaction_at::date = target_date THEN 1 END)::DECIMAL /
        COUNT(CASE WHEN pi.interaction_type = 'view' AND pi.interaction_at::date = target_date THEN 1 END)::DECIMAL * 100
      )
      ELSE 0
    END as conversion_rate
    
  FROM user_profiles up
  FULL OUTER JOIN user_sessions us ON up.id = us.user_id
  FULL OUTER JOIN questionnaire_responses qr ON up.id = qr.user_id
  FULL OUTER JOIN product_interactions pi ON up.id = pi.user_id
  FULL OUTER JOIN recommendations r ON qr.id = r.questionnaire_id
  
  ON CONFLICT (date) DO UPDATE SET
    new_users = EXCLUDED.new_users,
    active_users = EXCLUDED.active_users,
    questionnaire_completions = EXCLUDED.questionnaire_completions,
    product_views = EXCLUDED.product_views,
    product_clicks = EXCLUDED.product_clicks,
    recommendations_generated = EXCLUDED.recommendations_generated,
    affiliate_clicks = EXCLUDED.affiliate_clicks,
    estimated_revenue = EXCLUDED.estimated_revenue,
    conversion_rate = EXCLUDED.conversion_rate;
    
END;
$$ LANGUAGE plpgsql;

-- Update product popularity scores
CREATE OR REPLACE FUNCTION update_product_popularity()
RETURNS VOID AS $$
BEGIN
  -- Update popularity scores based on recent interactions
  UPDATE product_stats 
  SET 
    popularity_score = (
      LEAST(100, GREATEST(0, (
        (view_count * 1.0) +
        (click_count * 5.0) +
        (favorite_count * 10.0) +
        (purchase_click_count * 25.0) +
        (recommendation_count * 2.0)
      ) / 10))
    ),
    trending_score = (
      SELECT LEAST(100, GREATEST(0, (
        COUNT(CASE WHEN pi.interaction_at >= NOW() - INTERVAL '7 days' THEN 1 END) * 2.0 +
        COUNT(CASE WHEN pi.interaction_at >= NOW() - INTERVAL '24 hours' THEN 1 END) * 5.0
      ) / 5))
      FROM product_interactions pi 
      WHERE pi.product_id = product_stats.product_id
    ),
    last_updated_at = NOW()
  WHERE last_updated_at < NOW() - INTERVAL '1 hour';
  
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_products_fulltext 
ON lighting_products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || array_to_string(tags, ' ')));

-- Array search indexes
CREATE INDEX IF NOT EXISTS idx_products_style_tags ON lighting_products USING gin(style_tags);
CREATE INDEX IF NOT EXISTS idx_products_room_tags ON lighting_products USING gin(room_tags);
CREATE INDEX IF NOT EXISTS idx_products_tags ON lighting_products USING gin(tags);

-- Price range queries
CREATE INDEX IF NOT EXISTS idx_products_price_range ON lighting_products (COALESCE(sale_price, price), rating DESC);

-- Recommendation query optimization
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_lookup ON questionnaire_responses (id, room_type, room_size, style_preference, budget_min, budget_max);

-- Analytics optimization
CREATE INDEX IF NOT EXISTS idx_product_interactions_analytics ON product_interactions (interaction_at, interaction_type, product_id);
CREATE INDEX IF NOT EXISTS idx_product_stats_popularity ON product_stats (popularity_score DESC, trending_score DESC);

-- =====================================================
-- Insert migration record
-- =====================================================

INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('004', 'recommendation_functions', NOW())
ON CONFLICT (version) DO NOTHING;
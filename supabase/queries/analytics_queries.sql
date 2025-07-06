-- =====================================================
-- ANALYTICS QUERIES: Dashboard & Reporting
-- Usage: Admin dashboard, business intelligence
-- Target: <500ms response time (acceptable for analytics)
-- =====================================================

-- =====================================================
-- 1. CONVERSION FUNNEL ANALYSIS
-- =====================================================

-- Daily conversion funnel metrics
WITH daily_funnel AS (
  SELECT 
    DATE(pi.interaction_at) as date,
    
    -- Funnel steps
    COUNT(DISTINCT CASE WHEN pi.interaction_type = 'view' THEN pi.session_id END) as sessions_with_views,
    COUNT(DISTINCT CASE WHEN pi.interaction_type = 'click' THEN pi.session_id END) as sessions_with_clicks,
    COUNT(DISTINCT CASE WHEN pi.interaction_type = 'purchase_click' THEN pi.session_id END) as sessions_with_purchases,
    
    -- Raw counts
    COUNT(CASE WHEN pi.interaction_type = 'view' THEN 1 END) as total_views,
    COUNT(CASE WHEN pi.interaction_type = 'click' THEN 1 END) as total_clicks,
    COUNT(CASE WHEN pi.interaction_type = 'purchase_click' THEN 1 END) as total_purchase_clicks
    
  FROM product_interactions pi
  WHERE pi.interaction_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(pi.interaction_at)
)
SELECT 
  date,
  sessions_with_views,
  sessions_with_clicks,
  sessions_with_purchases,
  
  -- Conversion rates
  ROUND(
    CASE WHEN sessions_with_views > 0 
      THEN (sessions_with_clicks::decimal / sessions_with_views) * 100 
      ELSE 0 END, 2
  ) as view_to_click_rate,
  
  ROUND(
    CASE WHEN sessions_with_clicks > 0 
      THEN (sessions_with_purchases::decimal / sessions_with_clicks) * 100 
      ELSE 0 END, 2
  ) as click_to_purchase_rate,
  
  ROUND(
    CASE WHEN sessions_with_views > 0 
      THEN (sessions_with_purchases::decimal / sessions_with_views) * 100 
      ELSE 0 END, 2
  ) as overall_conversion_rate

FROM daily_funnel
ORDER BY date DESC;

-- =====================================================
-- 2. TOP PERFORMING PRODUCTS
-- =====================================================

-- Product performance dashboard
SELECT 
  p.id,
  p.name,
  b.name as brand_name,
  p.price,
  p.rating,
  
  -- Performance metrics
  ps.view_count,
  ps.click_count,
  ps.purchase_click_count,
  ps.conversion_rate,
  ps.revenue_generated,
  
  -- Calculated metrics
  ROUND(
    CASE WHEN ps.view_count > 0 
      THEN (ps.click_count::decimal / ps.view_count) * 100 
      ELSE 0 END, 2
  ) as ctr_percentage,
  
  ROUND(ps.revenue_generated / NULLIF(ps.view_count, 0), 2) as revenue_per_view,
  
  -- Ranking
  DENSE_RANK() OVER (ORDER BY ps.revenue_generated DESC) as revenue_rank,
  DENSE_RANK() OVER (ORDER BY ps.conversion_rate DESC) as conversion_rank

FROM lighting_products p
JOIN brands b ON b.id = p.brand_id
JOIN product_stats ps ON ps.product_id = p.id
WHERE 
  p.status = 'active'
  AND ps.view_count >= 10  -- Minimum views for statistical significance
ORDER BY ps.revenue_generated DESC
LIMIT 50;

-- =====================================================
-- 3. RECOMMENDATION ENGINE PERFORMANCE
-- =====================================================

-- Recommendation effectiveness analysis
WITH recommendation_performance AS (
  SELECT 
    r.questionnaire_id,
    r.product_id,
    r.match_score,
    r.rank_position,
    r.is_primary_recommendation,
    
    -- Check if recommended product was clicked
    CASE WHEN pi.product_id IS NOT NULL THEN 1 ELSE 0 END as was_clicked,
    CASE WHEN pi.interaction_type = 'purchase_click' THEN 1 ELSE 0 END as was_purchased
    
  FROM recommendations r
  LEFT JOIN product_interactions pi ON (
    pi.product_id = r.product_id 
    AND pi.recommendation_id = r.id
    AND pi.interaction_type IN ('click', 'purchase_click')
  )
  WHERE r.created_at >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 
  -- Overall metrics
  COUNT(*) as total_recommendations,
  COUNT(DISTINCT questionnaire_id) as unique_questionnaires,
  
  -- Click performance by rank
  AVG(CASE WHEN rank_position = 1 THEN was_clicked END) * 100 as rank_1_ctr,
  AVG(CASE WHEN rank_position = 2 THEN was_clicked END) * 100 as rank_2_ctr,
  AVG(CASE WHEN rank_position = 3 THEN was_clicked END) * 100 as rank_3_ctr,
  AVG(CASE WHEN rank_position <= 5 THEN was_clicked END) * 100 as top_5_ctr,
  
  -- Purchase performance
  AVG(was_purchased) * 100 as overall_purchase_rate,
  AVG(CASE WHEN is_primary_recommendation THEN was_purchased END) * 100 as primary_rec_purchase_rate,
  
  -- Match score effectiveness
  CORR(match_score, was_clicked) as match_score_click_correlation,
  CORR(match_score, was_purchased) as match_score_purchase_correlation

FROM recommendation_performance;

-- =====================================================
-- 4. REVENUE ATTRIBUTION ANALYSIS
-- =====================================================

-- Platform and source revenue attribution
SELECT 
  pi.platform,
  pi.source,
  COUNT(*) as clicks,
  COUNT(DISTINCT pi.session_id) as unique_sessions,
  
  -- Estimated revenue (based on average order values)
  SUM(
    CASE pi.platform
      WHEN 'amazon' THEN p.price * 0.06    -- 6% commission
      WHEN 'wayfair' THEN p.price * 0.045  -- 4.5% commission  
      WHEN 'homedepot' THEN p.price * 0.035 -- 3.5% commission
      ELSE p.price * 0.04                   -- 4% default
    END
  ) as estimated_revenue,
  
  -- Conversion metrics
  ROUND(
    COUNT(*)::decimal / COUNT(DISTINCT pi.session_id), 2
  ) as clicks_per_session

FROM product_interactions pi
JOIN lighting_products p ON p.id = pi.product_id
WHERE 
  pi.interaction_type = 'purchase_click'
  AND pi.interaction_at >= CURRENT_DATE - INTERVAL '30 days'
  AND pi.platform IS NOT NULL
GROUP BY pi.platform, pi.source
ORDER BY estimated_revenue DESC;

-- =====================================================
-- 5. USER BEHAVIOR COHORT ANALYSIS
-- =====================================================

-- User engagement cohorts (by questionnaire completion week)
WITH user_cohorts AS (
  SELECT 
    DATE_TRUNC('week', qr.created_at) as cohort_week,
    qr.user_id,
    COUNT(DISTINCT pi.id) as total_interactions,
    COUNT(DISTINCT CASE WHEN pi.interaction_type = 'purchase_click' THEN pi.id END) as purchase_interactions,
    MAX(pi.interaction_at) as last_activity
    
  FROM questionnaire_responses qr
  LEFT JOIN user_profiles up ON up.id = qr.user_id
  LEFT JOIN product_interactions pi ON pi.user_id = qr.user_id
  WHERE qr.created_at >= CURRENT_DATE - INTERVAL '12 weeks'
  GROUP BY DATE_TRUNC('week', qr.created_at), qr.user_id
)
SELECT 
  cohort_week,
  COUNT(DISTINCT user_id) as cohort_size,
  AVG(total_interactions) as avg_interactions_per_user,
  
  -- Retention metrics
  COUNT(DISTINCT CASE WHEN last_activity >= cohort_week + INTERVAL '1 week' THEN user_id END) as week_1_retained,
  COUNT(DISTINCT CASE WHEN last_activity >= cohort_week + INTERVAL '4 weeks' THEN user_id END) as week_4_retained,
  
  -- Conversion metrics
  ROUND(
    AVG(CASE WHEN purchase_interactions > 0 THEN 1.0 ELSE 0.0 END) * 100, 2
  ) as conversion_rate

FROM user_cohorts
GROUP BY cohort_week
ORDER BY cohort_week DESC;

-- =====================================================
-- PERFORMANCE NOTES:
-- - Uses pre-aggregated product_stats for fast lookups
-- - Time-partitioned queries for better performance
-- - Correlation functions for ML insights
-- - Cohort analysis for retention understanding
-- =====================================================
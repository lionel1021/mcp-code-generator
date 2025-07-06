-- =====================================================
-- CRITICAL QUERY: Product Recommendations
-- Usage: 80% of all queries, performance critical
-- Target: <50ms response time
-- =====================================================

-- Optimized recommendation query with scoring
WITH user_preferences AS (
  SELECT 
    room_type,
    style_preference,
    budget_min,
    budget_max
  FROM questionnaire_responses 
  WHERE id = $1 -- questionnaire_id parameter
),
matching_products AS (
  SELECT DISTINCT
    p.id,
    p.name,
    p.brand_id,
    p.price,
    p.rating,
    p.review_count,
    p.images,
    p.style_tags,
    p.room_tags,
    
    -- Scoring algorithm
    (
      -- Room match score (40 points)
      CASE 
        WHEN up.room_type = ANY(p.room_tags) THEN 40
        WHEN up.room_type = 'living' AND 'general' = ANY(p.room_tags) THEN 30
        ELSE 0
      END +
      
      -- Style match score (30 points)
      CASE 
        WHEN up.style_preference = ANY(p.style_tags) THEN 30
        WHEN up.style_preference = 'modern' AND 'contemporary' = ANY(p.style_tags) THEN 25
        WHEN up.style_preference = 'traditional' AND 'classic' = ANY(p.style_tags) THEN 25
        ELSE 0
      END +
      
      -- Price match score (20 points)
      CASE 
        WHEN p.price BETWEEN up.budget_min AND up.budget_max THEN 20
        WHEN p.price <= up.budget_max * 1.1 THEN 15 -- 10% over budget tolerance
        WHEN p.price >= up.budget_min * 0.9 THEN 10  -- 10% under budget tolerance
        ELSE 0
      END +
      
      -- Quality score (10 points)
      LEAST(p.rating * 2, 10)
      
    ) AS match_score,
    
    -- Additional metrics for ranking
    COALESCE(ps.popularity_score, 0) AS popularity,
    COALESCE(al.commission_rate, 0) AS max_commission
    
  FROM lighting_products p
  CROSS JOIN user_preferences up
  LEFT JOIN product_stats ps ON ps.product_id = p.id
  LEFT JOIN (
    -- Get highest commission rate per product
    SELECT 
      product_id, 
      MAX(commission_rate) as commission_rate
    FROM affiliate_links 
    WHERE is_active = true 
    GROUP BY product_id
  ) al ON al.product_id = p.id
  
  WHERE 
    p.status = 'active'
    AND p.price <= up.budget_max * 1.2 -- Allow 20% budget flexibility
    AND (
      up.room_type = ANY(p.room_tags) 
      OR up.style_preference = ANY(p.style_tags)
      OR p.is_featured = true
    )
)
SELECT 
  mp.*,
  b.name as brand_name,
  
  -- Final ranking score (business logic)
  (
    mp.match_score * 0.7 +           -- 70% user preference match
    mp.popularity * 0.2 +            -- 20% popularity
    mp.max_commission * 0.1          -- 10% commission (business incentive)
  ) AS final_score,
  
  -- Performance metrics
  ROW_NUMBER() OVER (ORDER BY 
    mp.match_score DESC, 
    mp.rating DESC, 
    mp.popularity DESC
  ) as rank_position

FROM matching_products mp
JOIN brands b ON b.id = mp.brand_id
WHERE mp.match_score >= 20  -- Minimum match threshold
ORDER BY final_score DESC, mp.rating DESC
LIMIT 20;

-- =====================================================
-- PERFORMANCE NOTES:
-- - Uses composite indexes on (room_tags, style_tags, price, status)
-- - GIN indexes for array operations on tags
-- - Materialized product_stats for fast popularity lookup
-- - Commission pre-aggregation reduces JOINs
-- =====================================================
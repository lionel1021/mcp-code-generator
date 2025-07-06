-- =====================================================
-- CRITICAL QUERY: Product Search & Filtering
-- Usage: 60% of browse queries, performance critical
-- Target: <100ms response time
-- =====================================================

-- Advanced product search with filters
WITH search_base AS (
  SELECT 
    p.id,
    p.sku,
    p.name,
    p.brand_id,
    p.category_id,
    p.price,
    p.sale_price,
    p.rating,
    p.review_count,
    p.images,
    p.style_tags,
    p.room_tags,
    p.is_featured,
    
    -- Text search ranking
    CASE 
      WHEN $1::text IS NOT NULL THEN
        ts_rank(
          to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')),
          plainto_tsquery('english', $1)
        )
      ELSE 0
    END AS text_rank,
    
    -- Popularity boost
    COALESCE(ps.popularity_score, 0) as popularity,
    COALESCE(ps.view_count, 0) as views
    
  FROM lighting_products p
  LEFT JOIN product_stats ps ON ps.product_id = p.id
  
  WHERE 
    p.status = 'active'
    
    -- Text search filter (optional)
    AND (
      $1::text IS NULL 
      OR to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) 
         @@ plainto_tsquery('english', $1)
    )
    
    -- Category filter (optional)
    AND ($2::uuid IS NULL OR p.category_id = $2)
    
    -- Brand filter (optional)  
    AND ($3::uuid IS NULL OR p.brand_id = $3)
    
    -- Price range filters
    AND ($4::decimal IS NULL OR p.price >= $4)  -- min_price
    AND ($5::decimal IS NULL OR p.price <= $5)  -- max_price
    
    -- Rating filter (optional)
    AND ($6::decimal IS NULL OR p.rating >= $6)  -- min_rating
    
    -- Style filter (optional)
    AND ($7::text IS NULL OR $7 = ANY(p.style_tags))  -- style
    
    -- Room filter (optional)
    AND ($8::text IS NULL OR $8 = ANY(p.room_tags))   -- room_type
),
ranked_results AS (
  SELECT 
    sb.*,
    b.name as brand_name,
    c.name as category_name,
    
    -- Combined ranking score
    (
      -- Text relevance (if searching)
      CASE WHEN $1::text IS NOT NULL THEN sb.text_rank * 40 ELSE 0 END +
      
      -- Rating quality
      sb.rating * 15 +
      
      -- Review count (social proof)
      LEAST(LOG(GREATEST(sb.review_count, 1)), 5) * 10 +
      
      -- Popularity
      sb.popularity * 0.2 +
      
      -- Featured boost
      CASE WHEN sb.is_featured THEN 20 ELSE 0 END +
      
      -- Sale boost
      CASE WHEN sb.sale_price IS NOT NULL THEN 10 ELSE 0 END
      
    ) AS relevance_score
    
  FROM search_base sb
  JOIN brands b ON b.id = sb.brand_id
  JOIN categories c ON c.id = sb.category_id
)
SELECT 
  rr.*,
  
  -- Aggregate stats for faceting
  COUNT(*) OVER() as total_results,
  
  -- Price summary for filters
  MIN(rr.price) OVER() as min_price_available,
  MAX(rr.price) OVER() as max_price_available,
  
  -- Pagination support
  ROW_NUMBER() OVER (ORDER BY rr.relevance_score DESC, rr.rating DESC) as row_num

FROM ranked_results rr
ORDER BY 
  rr.relevance_score DESC,
  rr.rating DESC,
  rr.review_count DESC
LIMIT COALESCE($9, 20)   -- limit (default 20)
OFFSET COALESCE($10, 0); -- offset (default 0)

-- =====================================================
-- FACETED SEARCH AGGREGATIONS (separate query)
-- =====================================================

-- Brand facets
WITH search_products AS (
  SELECT p.brand_id, COUNT(*) as product_count
  FROM lighting_products p
  WHERE p.status = 'active'
    -- Apply same filters as main search
  GROUP BY p.brand_id
  HAVING COUNT(*) > 0
)
SELECT 
  b.id,
  b.name,
  sp.product_count
FROM search_products sp
JOIN brands b ON b.id = sp.brand_id
ORDER BY sp.product_count DESC, b.name
LIMIT 10;

-- =====================================================
-- PERFORMANCE OPTIMIZATIONS:
-- - Full-text search indexes on name/description
-- - Composite indexes for common filter combinations
-- - Materialized product_stats for instant popularity
-- - Separate facet queries for better caching
-- =====================================================
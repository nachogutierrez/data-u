WITH price_data AS (
  SELECT price
  FROM `housing.datapoints-latest`
  WHERE currency = "usd"
    AND price IS NOT NULL 
    AND dimension_covered_m2 IS NOT NULL {{where_conditions}}
),
price_percentiles AS (
  SELECT
    price,
    PERCENTILE_CONT(price, 0.25) OVER() AS q1_price,
    PERCENTILE_CONT(price, 0.50) OVER() AS median_price,
    PERCENTILE_CONT(price, 0.75) OVER() AS q3_price,
    MIN(price) OVER() AS min_price,
    MAX(price) OVER() AS max_price
  FROM price_data
), dimension_covered_m2_data AS (
  SELECT dimension_covered_m2
  FROM `housing.datapoints-latest`
  WHERE currency = "usd"
    AND price IS NOT NULL 
    AND dimension_covered_m2 IS NOT NULL {{where_conditions}}
),
dimension_covered_m2_percentiles AS (
  SELECT
    dimension_covered_m2,
    PERCENTILE_CONT(dimension_covered_m2, 0.25) OVER() AS q1_dimension_covered_m2,
    PERCENTILE_CONT(dimension_covered_m2, 0.50) OVER() AS median_dimension_covered_m2,
    PERCENTILE_CONT(dimension_covered_m2, 0.75) OVER() AS q3_dimension_covered_m2,
    MIN(dimension_covered_m2) OVER() AS min_dimension_covered_m2,
    MAX(dimension_covered_m2) OVER() AS max_dimension_covered_m2
  FROM dimension_covered_m2_data
), price_m2_data AS (
  SELECT price / dimension_covered_m2 as price_m2
  FROM `housing.datapoints-latest`
  WHERE currency = "usd"
    AND price IS NOT NULL 
    AND dimension_covered_m2 IS NOT NULL {{where_conditions}}
),
price_m2_percentiles AS (
  SELECT
    price_m2,
    PERCENTILE_CONT(price_m2, 0.25) OVER() AS q1_price_m2,
    PERCENTILE_CONT(price_m2, 0.50) OVER() AS median_price_m2,
    PERCENTILE_CONT(price_m2, 0.75) OVER() AS q3_price_m2,
    MIN(price_m2) OVER() AS min_price_m2,
    MAX(price_m2) OVER() AS max_price_m2
  FROM price_m2_data
)
SELECT
  q1_price,
  q1_price_m2,
  q1_dimension_covered_m2,
  median_price,
  median_price_m2,
  median_dimension_covered_m2,
  q3_price,
  q3_price_m2,
  q3_dimension_covered_m2,
  min_price,
  min_price_m2,
  min_dimension_covered_m2,
  max_price,
  max_price_m2,
  max_dimension_covered_m2
FROM price_percentiles 
CROSS JOIN dimension_covered_m2_percentiles
CROSS JOIN price_m2_percentiles
LIMIT 1;

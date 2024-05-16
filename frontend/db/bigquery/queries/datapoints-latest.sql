SELECT *, price / dimension_covered_m2 AS price_m2 
FROM `housing.datapoints-latest`
WHERE dimension_covered_m2 > 0 AND currency = "usd" {{where_conditions}}
{{order_by_clause}}
LIMIT {{page_size}} OFFSET {{skip_results}}
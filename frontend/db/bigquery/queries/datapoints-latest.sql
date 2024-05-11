select *, price / dimension_covered_m2 as price_m2 from `housing.datapoints-latest`
WHERE dimension_covered_m2 > 0 {{where_conditions}}
{{order_by_clause}}
LIMIT {{page_size}} OFFSET {{skip_results}}
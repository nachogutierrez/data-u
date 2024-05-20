import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { BigQuery, BigQueryDate } from '@google-cloud/bigquery';
import { replacePlaceholders } from '@/lib/render';
import TTLCache from '@isaacs/ttlcache';
import { Coordinate, DataPoint, Filters, Insights, Operation, OrderByDirection, OrderByOption, PropertyType } from './types';
import { measure } from '@/lib/utils';

// Get the file path of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let cachedClient: BigQuery;
const ttlCache = new TTLCache({ max: 1000, ttl: 1800000 }); // Cache with TTL of 30 minutes

export type DateDataPoint = {
    date: BigQueryDate,
    name: string,
    value: number
}

/**
 * Get or create a BigQuery client instance.
 */
export async function getClient(): Promise<BigQuery> {
    if (cachedClient) return cachedClient;

    // Fetch secrets in parallel
    const [privateKey, projectId, clientEmail] = await Promise.all([
        process.env.BIGQUERY_PRIVATE_KEY,
        process.env.BIGQUERY_PROJECT_ID,
        process.env.BIGQUERY_CLIENT_EMAIL
    ]);

    const decodedPrivateKey = Buffer.from(privateKey!, 'base64').toString('utf-8');

    // Initialize the BigQuery client
    cachedClient = new BigQuery({
        projectId,
        credentials: {
            client_email: clientEmail,
            private_key: decodedPrivateKey.replace(/\\n/g, '\n')
        }
    });

    return cachedClient;
}

/**
 * Run a BigQuery query with optional placeholders and caching.
 */
export async function runQuery(queryName: string, placeholders: Record<string, any> = {}, dryrun = false) {
    const bigquery = await getClient();
    const sqlQueryTemplate = await fs.readFile(`${__dirname}/queries/${queryName}`, { encoding: 'utf-8' });
    const sqlQuery = replacePlaceholders(sqlQueryTemplate, placeholders);

    if (dryrun) {
        console.log(`[DRYRUN] Running query:\n${sqlQuery}`);
        return [];
    }

    if (ttlCache.has(sqlQuery)) {
        console.log(`[Cache HIT] ${queryName}`);
        return ttlCache.get(sqlQuery);
    }

    console.log(`[Cache MISS] ${queryName}`);

    // Execute the query and cache the result
    const [rows] = await bigquery.query(sqlQuery);
    ttlCache.set(sqlQuery, rows);

    return rows;
}

/**
 * Fetch new posts data points.
 */
export async function getNewPosts(): Promise<DateDataPoint[]> {
    return await runQuery('new-posts.sql') as DateDataPoint[];
}

/**
 * Build the WHERE conditions for the SQL query based on filters.
 */
function buildWhereConditions(filters: Filters): string {
    const conditions: string[] = [];

    // Helper function to add min and max conditions
    const addCondition = (field: string, min?: number, max?: number) => {
        if (min !== undefined) conditions.push(`${field} >= ${min}`);
        if (max !== undefined) conditions.push(`${field} <= ${max}`);
    };

    // Add conditions based on filters
    if (filters.price) addCondition('price', filters.price.min, filters.price.max);
    if (filters.priceM2) addCondition('price / dimension_covered_m2', filters.priceM2.min, filters.priceM2.max);
    if (filters.priceDowns) addCondition('last_30d_price_downs', filters.priceDowns.min, filters.priceDowns.max);
    if (filters.priceDelta) addCondition('last_30d_delta_price', filters.priceDelta.min, filters.priceDelta.max);
    if (filters.dimensionCovered) addCondition('dimension_covered_m2', filters.dimensionCovered.min, filters.dimensionCovered.max);

    // Add polygon condition if provided
    if (filters.polygon) {
        const polygonCoords = filters.polygon.map((coord: Coordinate) => `${coord.lng.toFixed(3)} ${coord.lat.toFixed(3)}`).join(', ');
        conditions.push(`ST_CONTAINS(ST_GEOGFROMTEXT('POLYGON((${polygonCoords}))'), location)`);
    }

    // Add type and operation conditions
    if (filters.type !== undefined) conditions.push(`type = '${PropertyType[filters.type].toLocaleLowerCase()}'`);
    if (filters.operation !== undefined) conditions.push(`operation = '${Operation[filters.operation].toLocaleLowerCase()}'`);

    return conditions.length > 0 ? `\nAND ${conditions.join('\nAND ')}` : '';
}

export async function getInsightsLatest(filters: Filters): Promise<Insights|undefined> {

    let filtersCopy = { ...filters }
    filtersCopy.price = undefined
    filtersCopy.priceM2 = undefined
    filtersCopy.priceDowns = undefined
    filtersCopy.priceDelta = undefined

    const placeholders = {
        where_conditions: buildWhereConditions(filtersCopy),
    }

    const results = await measure(`insights-latest.sql`, () => runQuery('insights-latest.sql', placeholders)) as any[]

    if (results.length > 1) {
        throw new Error(`Expected 1 result for insights, got ${results.length}`)
    } else if (results.length === 0) {
        return Promise.resolve(undefined)
    }

    const {
        median_price,
        median_price_m2,
        median_dimension_covered_m2,
        q1_price,
        q1_price_m2,
        q1_dimension_covered_m2,
        q3_price,
        q3_price_m2,
        q3_dimension_covered_m2,
        min_price,
        min_price_m2,
        min_dimension_covered_m2,
        max_price,
        max_price_m2,
        max_dimension_covered_m2
    } = results[0]

    return Promise.resolve({
        price: {
            median: median_price,
            q1: q1_price,
            q3: q3_price,
            min: min_price,
            max: max_price
        },
        price_m2: {
            median: median_price_m2,
            q1: q1_price_m2,
            q3: q3_price_m2,
            min: min_price_m2,
            max: max_price_m2
        },
        dimension_covered_m2: {
            median: median_dimension_covered_m2,
            q1: q1_dimension_covered_m2,
            q3: q3_dimension_covered_m2,
            min: min_dimension_covered_m2,
            max: max_dimension_covered_m2
        }
    })
}

/**
 * Fetch the latest data points based on the provided filters.
 */
export async function getDataPointsLatest(filters: Filters): Promise<DataPoint[]> {
    const placeholders = {
        where_conditions: buildWhereConditions(filters),
        order_by_clause: `ORDER BY ${OrderByOption[filters.sort.option].toLocaleLowerCase()} ${OrderByDirection[filters.sort.direction]}`,
        page_size: filters.pagination.pageSize,
        skip_results: filters.pagination.pageNumber * filters.pagination.pageSize
    };

    return await measure(`datapoints-latest.sql`, () => runQuery('datapoints-latest.sql', placeholders)) as DataPoint[];
}

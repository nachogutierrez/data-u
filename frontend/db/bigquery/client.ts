import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { BigQuery, BigQueryDate } from "@google-cloud/bigquery";
import { getSecret } from "@/secret-manager";
import { replacePlaceholders } from '@/lib/render';
import TTLCache from '@isaacs/ttlcache';
import { Coordinate, DataPoint, Filters, OrderByDirection, OrderByOption } from './types';

// Get the file path of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

let cachedClient: BigQuery
const ttlCache = new TTLCache({ max: 1000, ttl: 1800000 })

export type DateDataPoint = {
    date: BigQueryDate,
    name: string,
    value: number
}

export async function getClient() {

    if (!cachedClient) {
        cachedClient = new BigQuery({
            projectId: await getSecret('BIGQUERY_PROJECT_ID'),
            credentials: {
                client_email: await getSecret('BIGQUERY_CLIENT_EMAIL'),
                private_key: (await getSecret('BIGQUERY_PRIVATE_KEY')).replace(/\\n/g, '\n'),
            },
        });
    }

    return cachedClient;
}

export async function runQuery(queryName: string, placeholders = {}, dryrun = false) {
    const bigquery = await getClient()
    const sqlQueryTemplate = await fs.readFile(`${__dirname}/queries/${queryName}`, { encoding: 'utf-8' })
    const sqlQuery = replacePlaceholders(sqlQueryTemplate, placeholders)

    if (dryrun) {
        console.log(`[DRYRUN] Running query:\n${sqlQuery}`);
        return []
    }

    if (ttlCache.has(sqlQuery)) {
        console.log(`[Cache HIT] ${queryName}`);
        return ttlCache.get(sqlQuery)
    }

    console.log(`[Cache MISS] ${queryName}`);

    // TODO: measure query time, log metrics
    const [rows] = await bigquery.query(sqlQuery)

    ttlCache.set(sqlQuery, rows)
    return rows
}

export async function getNewPosts(): Promise<DateDataPoint[]> {
    return await runQuery('new-posts.sql') as DateDataPoint[]
}

export async function getDataPointsLatest(filters: Filters): Promise<DataPoint[]> {
    let where_conditions = ''
    let order_by_clause = `ORDER BY ${OrderByOption[filters.sort.option].toLocaleLowerCase()} ${OrderByDirection[filters.sort.direction]}`
    let page_size = filters.pagination.pageSize
    let skip_results = filters.pagination.pageNumber * filters.pagination.pageSize
    let placeholders: any = {}

    let conditions = []
    if (filters.price) {
        if (filters.price.min) conditions.push(`price >= ${filters.price.min}`)
        if (filters.price.max) conditions.push(`price <= ${filters.price.max}`)
    }
    if (filters.priceM2) {
        if (filters.priceM2.min) conditions.push(`price / dimension_covered_m2 >= ${filters.priceM2.min}`)
        if (filters.priceM2.max) conditions.push(`price / dimension_covered_m2 <= ${filters.priceM2.max}`)
    }
    if (filters.dimensionCovered) {
        if (filters.dimensionCovered.min) conditions.push(`dimension_covered_m2 >= ${filters.dimensionCovered.min}`)
        if (filters.dimensionCovered.max) conditions.push(`dimension_covered_m2 <= ${filters.dimensionCovered.max}`)
    }
    if (filters.polygon) {
        conditions.push(`ST_CONTAINS( ST_GEOGFROMTEXT('POLYGON((${filters.polygon.map((coord: Coordinate) => `${coord.lng.toFixed(3)} ${coord.lat.toFixed(3)}`).join(', ')}))'), location )`)
    }

    if (conditions.length > 0) {
        where_conditions = `\nAND ${conditions.join(' \nAND ')}`
    }

    placeholders.where_conditions = where_conditions
    placeholders.order_by_clause = order_by_clause
    placeholders.page_size = page_size
    placeholders.skip_results = skip_results

    return await runQuery('datapoints-latest.sql', placeholders) as DataPoint[]
}
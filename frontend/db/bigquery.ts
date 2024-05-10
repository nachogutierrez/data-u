import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { BigQuery, BigQueryDate } from "@google-cloud/bigquery";
import { getSecret } from "@/secret-manager";
import { replacePlaceholders } from '@/lib/render';
import TTLCache from '@isaacs/ttlcache';

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

export async function runQuery(queryName: string, placeholders = {}) {
    const bigquery = await getClient()
    const sqlQueryTemplate = await fs.readFile(`${__dirname}/queries/${queryName}`, { encoding: 'utf-8' })
    const sqlQuery = replacePlaceholders(sqlQueryTemplate, placeholders)

    const cachedResponse = ttlCache.get(sqlQuery)
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
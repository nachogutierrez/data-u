import { BigQuery } from '@google-cloud/bigquery'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bigquery = new BigQuery({
    keyFilename: path.join(__dirname, 'service-account.json')
})

export async function uploadObjectToBigQuery(datasetId, tableId, rows = []) {

    // Specify the dataset and table
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);

    // Insert data into BigQuery table
    try {
        await table.insert(rows);
        console.log('Inserted rows successfully');
    } catch (error) {
        console.error('ERROR:', error.errors[0].errors);
    }
}
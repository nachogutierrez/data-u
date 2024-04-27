import data from './tmp/normalized.json' assert { type: 'json' }
import { uploadObjectToBigQuery } from 'common/gcloud-bigquery.js'
// import fs from 'fs/promises'

async function main() {
    const chunkSize = 1000
    for (let k = 0; k * chunkSize < data.length; k++) {
        const chunk = data.slice(k*chunkSize, (k+1)*chunkSize)
        console.log(`Uploading chunk ${k}, ${chunk.length} data points`)

        await uploadObjectToBigQuery('housing', 'datapoints', chunk)

        // console.log({ response });

        // break
    }
}

main()
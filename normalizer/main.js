import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import fs from 'fs/promises'

import { uploadObjectToBigQuery } from 'common/gcloud-bigquery.js'
import { downloadObjectFromGCS, listObjectsWithPrefix } from 'common/gcloud-storage.js'
import normalizers from './normalizers/index.js'

const workloadIdPattern = /^(\w+)-(\d{4}-\d{2}-\d{2})$/

function validateInteger(name, value) {
    if (isNaN(value)) {
        throw new Error(`Flag --${name} must be number, got ${value}`)
    }

    const num = Number(value)
    if (!Number.isInteger(num)) {
        throw new Error(`Flag --${name} must be an integer, got ${value}`)
    }
}

function validateArgs(flags) {
    validateInteger('n', flags.n)
    validateInteger('k', flags.k)
    validateInteger('maxPaths', flags.maxPaths)

    if (flags.n < 1 || flags.n > 10) {
        throw new Error(`Flag --n must be at least 1 and not greater than 10.`)
    }

    if (flags.k < 0 || flags.k >= flags.n) {
        throw new Error(`Flag --k must be at least 0 and less than --n.`)
    }

    if (!normalizers[flags.normalizerName]) {
        throw new Error(`Invalid normalizer name '${flags.normalizerName}', choose one from [${Object.keys(normalizers)}]`)
    }
}

async function main(flags = {}) {
    validateArgs(flags)
    const { n, k, normalizerName, workloadId, maxPaths } = flags

    const { normalize } = normalizers[normalizerName]

    console.log({ n, k, normalizerName, workloadId, maxPaths });

    let allPaths = await listObjectsWithPrefix('workloads', `${workloadId}/`)

    const workloadIdMatches = workloadId.match(workloadIdPattern)

    if (!workloadIdMatches) {
        throw new Error(`workloadId doesn't match expected pattern: ${workloadId}`)
    }

    const host = workloadIdMatches[1]
    const date = workloadIdMatches[2]
    const timestamp = new Date(date).toISOString()

    // Remove error files
    allPaths = allPaths.filter(p => !p.includes('error'))

    // Sort
    allPaths = allPaths.sort()

    let normalizedData = []
    for (let i = 0; i < allPaths.length; i++) {
        if (maxPaths >= 0 && i >= maxPaths) {
            break
        }

        if ((i - k) % n !== 0) {
            continue
        }

        console.log(`processing path ${i}: ${allPaths[i]}`);

        const response = await downloadObjectFromGCS('workloads', allPaths[i])
        const allRawData = response.data

        for (let rawData of allRawData) {
            try {
                // TODO: change data type of date
                normalizedData.push({ ...normalize(rawData), host, timestamp })
            } catch(error) {
                // TODO: handle errors
                // console.error(error);
            }
        }

        const dataMem = new Set()
        normalizedData = normalizedData.filter(d => {
            if (dataMem.has(d.id)) {
                console.log(`Id ${d.id} was duplicated`);
                return false
            }
            dataMem.add(d.id)
            return true
        })
    }

    console.log(`inserting ${normalizedData.length} datapoints`)


    await fs.mkdir('tmp/', { recursive: true })
    await fs.writeFile('tmp/normalized.json', JSON.stringify(normalizedData, null, 4), 'utf-8')

    const chunkSize = 500
    for (let i = 0; i < normalizedData.length; i += chunkSize) {
        const chunk = normalizedData.slice(i, i + chunkSize)
        if (chunk.length > 0) {
            console.log(`Uploading data points ${i} to ${i + chunkSize - 1}`)
            // await uploadObjectToBigQuery('housing', 'datapoints', chunk)
        }
    }

    // console.log(JSON.stringify(normalizedData, null, 4));
    // TODO: add option to store data locally, for testing purposes
    // await uploadObjectToBigQuery('housing', 'datapoints', normalizedData)
}

const argv = yargs(hideBin(process.argv)).options({
    workloadId: { type: 'string', demandOption: true, describe: 'Workload ID to process' },
    normalizerName: { type: 'string', demandOption: true, describe: 'Set the normalizer' },
    n: { type: 'number', demandOption: true, describe: 'Set n value' },
    k: { type: 'number', demandOption: true, describe: 'Set k value' },
    maxPaths: { type: 'number', default: -1, describe: 'Limits the amount of paths processed, used for testing purposes' },
  }).argv

main(argv)
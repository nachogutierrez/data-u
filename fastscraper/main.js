import fs from 'fs/promises'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import { sleep } from 'common/promise-utils.js'
import { stats } from 'common/stats-utils.js'
import { serializeError } from 'common/error-utils.js'
import { validateInteger } from 'common/validation-utils.js'
import { today } from 'common/date-utils.js'

import iterators from './iterator/index.js'
import normalizers from './normalizer/index.js'
import sinks from './sink/index.js'

const workloadIdPattern = /^(\w+)-(\d{4}-\d{2}-\d{2})$/

function validateArgs(flags) {
    validateInteger('maxPages', flags.maxPages)
    validateInteger('pageSize', flags.pageSize)
    validateInteger('chunkSize', flags.chunkSize)

    if (!iterators[flags.host]) {
        throw new Error(`Invalid host name '${flags.host}', choose one from [${Object.keys(iterators)}]`)
    }

    if (!sinks[flags.sink]) {
        throw new Error(`Invalid sink '${flags.sink}', choose one from [${Object.keys(sinks)}]`)
    }
}

async function main(flags = {}) {
    validateArgs(flags)

    const { qps, maxPages, pageSize, host, sink, chunkSize } = flags

    const date = today()
    const timestamp = new Date(date).toISOString()
    const workloadId = `${host}-${date}`

    // Clean up when running locally
    if (sink === 'local') {
        try {
            await fs.rm('tmp/', { recursive: true })
        } catch(error) {
            // tmp/ didn't exist
        }
    }

    let normalizedData = []
    const errors = []
    const responseTimes = []
    const loopTimes = []
    const pushChunkTimes = []
    let nextFailures = 0

    const { iterator } = iterators[host]
    const { normalize } = normalizers[host]
    const { pushData, pushStats, pushErrors } = sinks[sink]
    const { hasNext, next, close } = iterator({ maxPages, pageSize })

    const scrapingStart = new Date().getTime()
    while(await hasNext()) {

        if (nextFailures >= 20) {
            console.log(`20 calls to next() failed, stopping...`);
            break
        }

        const loopStart = new Date().getTime()

        console.log(new Date())

        let rawData
        let elapsedMillis
        try {
            const start = new Date().getTime()
            rawData = await next()
            elapsedMillis = new Date().getTime() - start
            responseTimes.push(elapsedMillis)
        } catch(error) {
            nextFailures++
            errors.push({ error: serializeError(error), context: {} })
            await sleep((1/qps) * 1000)
            continue
        }


        for (let rawDataPoint of rawData) {
            try {
                normalizedData.push({ ...normalize(rawDataPoint), timestamp })
            } catch(error) {
                errors.push({ error: serializeError(error), context: rawDataPoint })
            }
        }

        // sleep so that we generate the intended QPS
        const sleepFor = (1/qps) * 1000 - elapsedMillis
        if (sleepFor > 0) {
            await sleep((1/qps) * 1000 - elapsedMillis)
        }

        loopTimes.push(new Date().getTime() - loopStart)
    }
    const scrapingElapsedMillis = new Date().getTime() - scrapingStart

    const cache = new Set()
    normalizedData = normalizedData.reverse().filter(datapoint => {
        if (cache.has(datapoint.id)) {
            return false
        }
        cache.add(datapoint.id)
        return true
    })

    // Push data in chunks
    const pushingDataStart = new Date().getTime()
    for (let k = 0; k * chunkSize < normalizedData.length; k++) {
        console.log(`Pushing datapoints ${ k * chunkSize } to ${ Math.min((k + 1) * chunkSize, normalizedData.length - 1) }.`)
        const chunk = normalizedData.slice(k * chunkSize, (k + 1)  * chunkSize)
        const pushChunkStart = new Date().getTime()
        try {
            await pushData(workloadId, chunk)
        } catch(error) {
            errors.push({ error: serializeError(error), context: chunk[0] })
        }
        pushChunkTimes.push(new Date().getTime() - pushChunkStart)
    }
    const pushingDataElapsedMillis = new Date().getTime() - pushingDataStart

    // TODO: find a better way to record errors
    // Push errors
    // const pushingErrorsStart = new Date().getTime()
    // if (errors.length > 0) {
    //     await pushErrors(workloadId, errors)
    // }
    // const pushingErrorsElapsedMillis = new Date().getTime() - pushingErrorsStart

    // Push stats
    const allStats = {
        responseTimes: stats(responseTimes),
        loopTimes: stats(loopTimes),
        pushChunkTimes: stats(pushChunkTimes),
        scrapingElapsedMillis,
        pushingDataElapsedMillis,
        nextFailures
    }
    // if (errors.length > 0) {
    //     allStats.pushingErrorsElapsedMillis = pushingErrorsElapsedMillis
    // }
    await pushStats(workloadId, allStats)

    await close()
}

const argv = yargs(hideBin(process.argv)).options({
    host: { type: 'string', demandOption: true, describe: 'Sets the iterator and normalizer.' },
    sink: { type: 'string', default: 'local', describe: 'Determines where the output data is written to.' },
    qps: { type: 'number', default: 0.2, describe: 'Limits the rate of requests set to the scraped website.' },
    chunkSize: { type: 'number', default: 500, describe: 'Size of chunks pushed to sink.' },
    maxPages: { type: 'number', default: 1, describe: 'Limits the amount of paths processed, used for testing purposes. Set to -1 for unlimited.' },
    pageSize: { type: 'number', default: 1, describe: 'Limits the amount of items processed in each page.' },
  }).argv

main(argv)
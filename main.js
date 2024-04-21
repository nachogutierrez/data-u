import puppeteer from "puppeteer"
import { handleFeed } from './feed-handler.js'
import { nkPaginator } from './paginator.js'

import scrappers from './scrappers/index.js'
import dataHandlers from './data-handlers/index.js'

function today() {
    const currentDate = new Date();
    return currentDate.toISOString().split('T')[0];
}

function validateArgs(args) {
    if (args.length !== 6) {
        throw new Error(`Expected exactly 6 arguments, got ${args.length}`)
    }

    for (let i = 0; i < 4; i++) {
        const arg = args[i]
        if (isNaN(arg)) {
            throw new Error(`The first 4 arguments should be numbers, ${arg} is not a number`)
        }

        const num = Number(arg)
        if (!Number.isInteger(num)) {
            throw new Error(`The first 4 arguments should be integers, ${arg} is not an integer`)
        }
    }

    if (scrappers[args[4]] === undefined) {
        throw new Error(`Invalid scrapper name '${args[4]}', choose one from [${Object.keys(scrappers)}]`)
    }

    if (dataHandlers[args[5]] === undefined) {
        throw new Error(`Invalid data handler name '${args[5]}', choose one from [${Object.keys(dataHandlers)}]`)
    }
}

async function main(args = []) {
    validateArgs(args)
    const n = parseInt(args[0], 10), k = parseInt(args[1], 10), pageSize = parseInt(args[2], 10), maxPages = parseInt(args[3], 10)
    const scrapperName = args[4], dataHandlerName = args[5]
    const scrapper = scrappers[scrapperName]
    const dataHandler = dataHandlers[dataHandlerName]

    const workloadId = `${scrapper.name}-${today()}`

    // Launch a new browser session.
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Add sandbox flags
    })

    // Create paginator
    const paginator = await nkPaginator(n, k, pageSize)

    const opts = { maxPages }

    await handleFeed(workloadId, browser, scrapper, dataHandler, paginator, opts)

    // Close browser session
    await browser.close()
}

main(process.argv.slice(2))
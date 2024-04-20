import { handlePage } from './page-handler.js'
// import { handleFailedPage } from './error-handler.js'

export async function handleFeed(workloadId, browser, scrapper, dataHandler, paginator, opts = {}) {

    const { createFeedLink } = scrapper
    const { storeData, hasData, logFailedPage } = dataHandler
    const { maxPages } = opts

    const start = new Date().getTime()

    if (!paginator.hasNext()) {
        return
    }
    const { pageSize, pageNumber } = paginator.next()

    // maxPages can limit the amount of pages available, used for testing purposes.
    if (maxPages >= 0 && pageNumber >= maxPages) {
        return
    }

    // Avoid processing the same page twice for the same workload
    if (await hasData(workloadId, pageSize, pageNumber)) {
        console.error(`SKIPPING: pageSize=${pageSize} pageNumber=${pageNumber}`)
        return handleFeed(workloadId, browser, scrapper, dataHandler, paginator, opts)
    }

    let failures = 0
    let data
    let lastError

    // This loop is here to try fetching the data a total of 3 times.
    for (let i = 0; i < 1; i++) {
        try {
            // Retrieve data for current page
            data = await handlePage(browser, scrapper, pageSize, pageNumber)
        } catch (error) {
            // Move to next loop cycle to try again
            lastError = error
            failures++
            continue
        }
        // If retrieving data succeeded, break the loop
        break
    }

    if (data === undefined) {
        console.error(`FAILURE: pageSize=${pageSize} pageNumber=${pageNumber}`)
        await logFailedPage(workloadId, pageSize, pageNumber, lastError)

        // Call recursively to handle next page
        return handleFeed(workloadId, browser, scrapper, dataHandler, paginator, opts)
    }

    const elapsedMillis = new Date().getTime() - start

    if (data.length > 0) {
        console.log(`SUCCESS: pageSize=${pageSize} pageNumber=${pageNumber} elapsedMillis=${elapsedMillis} failures=${failures}.`)

        const metadata = {
            elapsedMillis,
            failures,
            pageSize,
            pageNumber
        }

        // Store data before proceeding to next page
        await storeData(workloadId, data, metadata)

        // Call recursively to handle next page
        await handleFeed(workloadId, browser, scrapper, dataHandler, paginator, opts)
    } else {
        console.log(`EMPTY: pageSize=${pageSize} pageNumber=${pageNumber}`);
    }
}
import { handlePage } from './page-handler.js'

export async function handleFeed(workloadId, browser, scrapper, dataHandler, paginator, opts = {}) {

    const { createFeedLink } = scrapper
    const { storeData, hasData } = dataHandler
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

    // Get all data for current page
    const data = await handlePage(workloadId, browser, scrapper, dataHandler, pageSize, pageNumber)

    if (data.length > 0) {
        const elapsedMillis = new Date().getTime() - start
        console.log(`SUCCESS: pageSize=${pageSize} pageNumber=${pageNumber} elapsedMillis=${elapsedMillis}.`)

        const metadata = {
            elapsedMillis,
            pageSize,
            pageNumber,
            feedLink: createFeedLink(pageSize, pageNumber)
        }

        // Store data before proceeding to next page
        await storeData(workloadId, pageSize, pageNumber, { data, metadata })

        // Call recursively to handle next page
        await handleFeed(workloadId, browser, scrapper, dataHandler, paginator, opts)
    } else {
        console.log(`EMPTY: pageSize=${pageSize} pageNumber=${pageNumber}`);
    }
}
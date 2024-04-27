import { serializeError } from 'common/error-utils.js'

export async function handlePage(workloadId, browser, scrapper, dataHandler, pageSize, pageNumber) {

    const { feedSelector, createFeedLink, extractLinks, handleItem } = scrapper
    const { logFailedItem, logFailedPage } = dataHandler

    const feedLink = createFeedLink(pageSize, pageNumber)

    // Open a new page.
    const page = await browser.newPage();

    // Extract links from page.
    let links = []
    try {
        // Navigate to the URL.
        await page.goto(feedLink, { waitUntil: 'networkidle0', timeout: 60000 })

        // Wait for the table to be loaded. Use a CSS selector for the table items.
        await page.waitForSelector(feedSelector, { timeout: 45000 })

        // Extract all item links
        links = await page.evaluate(extractLinks)
    } catch(error) {
        const payload = {
            feedLink,
            error: serializeError(error)
        }
        console.error(`Something went wrong while processing feedLink:\n`, payload)
        await logFailedPage(workloadId, pageSize, pageNumber, payload)
        throw error
    }

    const data = []

    // Note: if all items fail and the returned data is empty, it'll be interpreted as if there are no pages left to process.
    // This should ideally be fixed at some point, but the likelihood that all items fail is expected to be really low for pageSize=100
    for (let i = 0; i < links.length; i++) {
        const link = links[i]
        try {
            if (i === 1) {
                throw new Error('pa mono')
            }
            const itemData = await handleItem(page, link)
            data.push(itemData)
        } catch(error) {
            const payload = {
                feedLink,
                itemLink: link,
                error: serializeError(error)
            }
            console.error(`Something went wrong while processing itemLink:\n`, payload)
            await logFailedItem(workloadId, pageSize, pageNumber, i, payload)
        }
    }

    // Close page instance.
    await page.close()

    return data
}
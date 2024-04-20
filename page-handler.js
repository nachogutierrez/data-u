export async function handlePage(browser, scrapper, pageSize, pageNumber) {

    const { feedSelector, createFeedLink, extractLinks, handleItem } = scrapper

    const feedLink = createFeedLink(pageSize, pageNumber)

    // Open a new page.
    const page = await browser.newPage();

    // Navigate to the URL.
    await page.goto(feedLink, { waitUntil: 'networkidle0', timeout: 60000 })

    // Wait for the table to be loaded. Use a CSS selector for the table items.
    await page.waitForSelector(feedSelector, { timeout: 45000 })

    // Extract links from page.
    const links = await page.evaluate(extractLinks)

    const data = []

    for (let link of links) {
        data.push(await handleItem(page, link))
    }

    // Close page instance.
    await page.close()

    return data
}
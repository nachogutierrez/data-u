import puppeteer from "puppeteer";
import { promises as fs } from 'fs';

let failedPages = []

async function loadErrors(directory) {
    try {
        const contents = await fs.readFile(`${directory}/errors.json`, 'utf8')
        return JSON.parse(contents)
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {
                failedPages: []
            }
        } else {
            console.error('An error occurred:', error);
            throw error; // re-throw the error if it's not a 'file not found' error
        }
    }
}

async function saveFailedPages(directory) {
    if (failedPages.length === 0) {
        return
    }
    const errors = await loadErrors(directory)
    errors.failedPages = [...errors.failedPages, ...failedPages]
    await fs.writeFile(`${directory}/errors.json`, JSON.stringify(errors, null, 4), 'utf8')
}

const createLink = (pageSize, pageNumber) => `https://www.remax.com.ar/listings/buy?page=${pageNumber}&pageSize=${pageSize}&sort=-createdAt&in:operationId=1&filterCount=0&viewMode=listViewMode`

/**
 * 
 * @param {*} browser puppeter browser object
 * @param {*} pageNumber number of page in pagination
 * @param {*} pageSize size of each page in pagination
 * @returns list of property titles unchanged, need to be curated to create links
 */
async function handlePage(browser, pageNumber, pageSize) {

    const selector = 'p.card__description'
    const link = createLink(pageSize, pageNumber)

    // Open a new page.
    const page = await browser.newPage();

    // Navigate to the URL.
    await page.goto(link, { waitUntil: 'networkidle0', timeout: 60000 });

    // Wait for the table to be loaded. Use a unique identifier for the table, e.g., a CSS selector.
    await page.waitForSelector(selector, { timeout: 45000 });

    // Extract data from the table.
    const data = await page.evaluate((selector) => {
        const rows = Array.from(document.querySelectorAll(selector));
        return rows.map(row => row.innerHTML);
    }, selector);

    // Close page instance.
    await page.close()

    return data
}

async function failedPagesPaginator(directory) {
    const errors = await loadErrors(directory)
    let { failedPages } = errors
    errors.failedPages = []
    await fs.writeFile(`${directory}/errors.json`, JSON.stringify(errors, null, 4), 'utf8')

    return {
        hasNext: () => failedPages.length > 0,
        next: () => failedPages.shift()
    }
}

async function allPagesPaginator(pageSize = 100) {
    let nextPage = 0

    return {
        hasNext: () => true,
        next: () => ({ pageSize, pageNumber: nextPage++ })
    }
}

async function handlePages(directory, browser, opts = {}) {

    const { parallelSize = 2, pageSize = 100, retryFailures = false } = opts
    let paginator

    if (retryFailures) {
        paginator = await failedPagesPaginator(directory)
    } else {
        paginator = await allPagesPaginator(pageSize)
    }

    // Array with all promises to later use in a call to await Promise.all()
    const promises = []

    /**
     * Handles a single page of the list, writes results and calls itself
     * recursively until the current page yields 0 results.
     */
    async function pageHandler() {
        const start = new Date().getTime()

        if (!paginator.hasNext()) {
            return
        }
        const { pageSize, pageNumber } = paginator.next()
        let failures = 0

        let data

        // This loop is here to try fetching the data a total of 3 times.
        for (let i = 0; i < 3; i++) {
            try {
                // Retrieve data for current page
                data = await handlePage(browser, pageNumber, pageSize)
            } catch (error) {
                // Move to next loop cycle to try again
                failures++
                continue
            }
            // If retrieving data succeeded, break the loop
            break
        }

        if (!data) {
            console.error(`FAILURE: pageSize=${pageSize} pageNumber=${pageNumber}`)
            failedPages.push({ pageSize, pageNumber })
            return pageHandler()
        }

        // Simulate only 5 pages for testing purposes.
        // TODO: remove
        if (pageNumber >= 5) {
            data = []
        }

        const elapsedMillis = new Date().getTime() - start

        if (data.length > 0) {
            console.log(`SUCCESS: pageSize=${pageSize} pageNumber=${pageNumber} elapsedMillis=${elapsedMillis} failures=${failures}.`)

            const resultsObject = {
                metadata: {
                    elapsedMillis,
                    failures,
                    pageSize,
                    pageNumber,
                    link: createLink(pageSize, pageNumber)
                },
                data
            }

            // Write results to file
            await fs.writeFile(`${directory}/ps_${pageSize}_pn_${pageNumber}.json`, JSON.stringify(resultsObject, null, 4), 'utf8');

            // Call recursively to handle next page
            await pageHandler()
        } else {
            console.log(`EMPTY: pageSize=${pageSize} pageNumber=${pageNumber}`);
        }
    }

    for (let i = 0; i < parallelSize; i++) {
        promises.push(pageHandler())
    }

    await Promise.all(promises)

    await saveFailedPages(directory)
}

function currentDirectory() {
    const currentDate = new Date();
    return currentDate.toISOString().split('T')[0];
}

async function readAllPages(opts = {}) {

    const { retryFailures = false } = opts

    // Launch a new browser session.
    const browser = await puppeteer.launch();

    const start = new Date().getTime()

    const dir = currentDirectory()

    const pagesDirectory = `tmp/${dir}/pages`

    try {
        await fs.mkdir(pagesDirectory, { recursive: true })
        console.log(`Pages directory ${pagesDirectory} created successfully.`);
    } catch(error) {
        console.log(`Pages directory ${pagesDirectory} already exists.`);
    }

    let oldDirs = (await fs.readdir('tmp/')).filter(d => d !== dir)
    for (let i = 0; i < oldDirs.length; i++) {
        await fs.rm(`tmp/${oldDirs[i]}`, { recursive: true, force: true })
        console.log(`Deleted old directory '${oldDirs[i]}'`);
    }

    await handlePages(pagesDirectory, browser, { retryFailures })

    const elapsed = new Date().getTime() - start

    console.log(`Total extraction time is ${elapsed}ms.`);
    console.log('Files written successfully');

    // Close the browser.
    await browser.close();
}

readAllPages({ retryFailures: false })
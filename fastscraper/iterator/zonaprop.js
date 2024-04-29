import { connect } from 'puppeteer-real-browser'
import { sleep } from 'common/promise-utils.js'

const createLink = (pageNumber) => `https://www.zonaprop.com.ar/casas-venta-pagina-${pageNumber}.html`

export function iterator(opts = {}) {

    const { maxPages, pageSize } = opts

    let browser
    let page

    let pageNumber = 1
    let lastData
    let cache = new Set()
    let repeated = new Set()

    // hasNext :: () => boolean
    async function hasNext() {
        if (repeated.size >= 25) {
            console.log('detected too many repeated ids, stopping.');
        }
        return (maxPages < 0 || pageNumber <= maxPages) && (lastData === undefined || lastData.length > 0) && repeated.size < 25
    }

    // next :: () => [RawDataPoint]
    async function next() {
        try {
            if (!browser) {
                const connection = await connect({
                    headless: 'auto',
                    turnstile: true
                })
                console.log('Connected to chromium')
                browser = connection.browser
                page = connection.page
            }
    
            const link = createLink(pageNumber)
            await page.goto(link)
            console.log(`navigated to page ${pageNumber}`)

            let data
            const start = new Date().getTime()
            while(new Date().getTime() - start < 20000) {
                data = await page.evaluate(() => {
                    return window.__PRELOADED_STATE__
                })
                if (data) {
                    break
                }
                await sleep(25)
            }

            if (!data) {
                throw new Error('Failed all attempts to retrieve data')
            }

            lastData = data.listStore.listPostings

            console.log(`retrieved data, found ${lastData.length} items`)

            for (let dataPoint of lastData) {
                if (cache.has(dataPoint.postingId)) {
                    repeated.add(dataPoint.postingId)
                }

                cache.add(dataPoint.postingId)
            }

            return lastData
        } finally {
            pageNumber++
        }
    }

    async function close() {
        if (browser) {
            await browser.close()
        }
    }

    return {
        hasNext,
        next,
        close
    }
}
export const name = 'remax'

export const createFeedLink = (pageSize, pageNumber) => `https://www.remax.com.ar/listings/buy?page=${pageNumber}&pageSize=${pageSize}&sort=-createdAt&in:operationId=1&filterCount=0&viewMode=listViewMode`

export const feedSelector = 'qr-card-property > a'

export function extractLinks() {
    const rows = Array.from(document.querySelectorAll('qr-card-property > a'))
    return rows.map(el => el.href)
}

export async function handleItem(page, link) {

    const start = new Date().getTime()

    try {
        await page.goto(link, { waitUntil: 'networkidle0', timeout: 60000 })

        let waitForSelectors = [
            '#publication-code',
            '#price-container p',
            '#ubication-text',
            '#second-item .column-item .feature-detail',
        ]

        for (let selector of waitForSelectors) {
            await page.waitForSelector(selector, { timeout: 20000 })
        }

        let data = await page.evaluate(() => {
            const id = document.getElementById('publication-code').innerHTML.split(':')[1].trim()
            const price = document.getElementById('price-container').querySelector('p').innerHTML.trim()
            const location = document.getElementById('ubication-text').innerHTML.trim()

            const features = {}
            const featureList = Array.from(document.getElementById('second-item').querySelectorAll('.column-item .feature-detail')).map(el => el.innerHTML)
            for (let feature of featureList) {
                const split = feature.split(':')
                features[split[0].trim()] = split[1].trim()
            }


            return {
                id,
                price,
                location,
                features,
            }
        })

        try {
            await page.waitForSelector('#third-item .column-item p', { timeout: 500 })
            const services = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('#third-item .column-item p')).map(el => el.innerHTML.trim()).slice(1)
            })
            data = { ...data, services }
        } catch(e) {
            // Doesn't have services
        }

        const elapsedMillis = new Date().getTime() - start
        const metadata = {
            link,
            elapsedMillis
        }

        return {
            data,
            metadata
        }
    } catch(error) {
        const newError = new Error(`Failed to process ${link}: ${error.message}`)
        newError.stack = error.stack
        throw newError
    }
}
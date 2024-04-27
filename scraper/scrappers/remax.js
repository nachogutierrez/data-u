export const name = 'remax'

export const createFeedLink = (pageSize, pageNumber) => `https://www.remax.com.ar/listings/buy?page=${pageNumber}&pageSize=${pageSize}&sort=-createdAt&in:operationId=1&filterCount=0&viewMode=listViewMode`

export const feedSelector = 'qr-card-property > a'

export function extractLinks() {
    const rows = Array.from(document.querySelectorAll('qr-card-property > a'))
    return rows.map(el => el.href)
}

const idEvaluator = () => document.getElementById('publication-code').innerHTML.split(':')[1].trim()
const priceEvaluator = () => document.getElementById('price-container').querySelector('p').innerHTML.trim()
const locationEvaluator = () => document.getElementById('ubication-text').innerHTML.trim()

function servicesEvaluator() {
    const servicesEl = document.querySelectorAll('#third-item .column-item p')
    return Array.from(servicesEl)
        .map(el => el.innerHTML.trim())
        .slice(1)
}

function featuresEvaluator() {
    const features = {}
    const featuresEl = document.getElementById('second-item').querySelectorAll('.column-item .feature-detail')
    const featureList = Array.from(featuresEl).map(el => el.innerHTML)
    for (let feature of featureList) {
        const split = feature.split(':')
        features[split[0].trim()] = split[1].trim()
    }
    return features
}

export const itemEvaluators = () => ([
    { name: 'id', selector: '#publication-code', evaluator: idEvaluator, timeout: 10000 },
    { name: 'price', selector: '#price-container p', evaluator: priceEvaluator, timeout: 10000 },
    { name: 'location', selector: '#ubication-text', evaluator: locationEvaluator, timeout: 10000 },
    { name: 'services', selector: '#third-item .column-item p', evaluator: servicesEvaluator, defaultValue: [] },
    { name: 'features', selector: '#second-item .column-item .feature-detail', evaluator: featuresEvaluator, defaultValue: {} },
])

export async function handleItem(page, link) {

    const start = new Date().getTime()

    try {
        await page.goto(link, { waitUntil: 'networkidle0', timeout: 60000 })

        const data = {}
        for (let itemEvaluator of itemEvaluators()) {
            const { name, selector, evaluator, defaultValue, timeout = 1000 } = itemEvaluator
            try {
                await page.waitForSelector(selector, { timeout })
                data[name] = await page.evaluate(evaluator)
            } catch (error) {
                if (defaultValue) {
                    data[name] = defaultValue
                } else {
                    throw error
                }
            }
        }

        const elapsedMillis = new Date().getTime() - start

        // TODO: maybe move metadata to page-handler.js to be consistent with how metadata is added in feed-handler.js
        const metadata = {
            link,
            elapsedMillis
        }

        return {
            data,
            metadata
        }
    } catch (error) {
        const newError = new Error(`Failed to process ${link}:\n${error.message}`)
        newError.stack = error.stack
        throw newError
    }
}
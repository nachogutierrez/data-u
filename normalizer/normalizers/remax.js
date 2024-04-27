const priceRegex = /^((?:\d+\.)?(?:\d+\.)?\d+) (usd|ars)$/
const surfaceRegex = /^(\d{1,3}|\d{1,3}\.\d{3})(?:\.\d{2})? m²$/

function normalizeAllSurfaces(features) {
    const surface = {}
    const featureNames = {
        total: 'superficie total',
        covered: 'superficie cubierta',
        terrain: 'superficie terreno'
    }

    for (let key of Object.keys(featureNames)) {
        if (!features[featureNames[key]]) {
            continue
        }
        const surfaceMatches = features[featureNames[key]].match(surfaceRegex)
        if (!surfaceMatches) {
            continue
        }
        surface[`surface_${key}`] = parseInt(surfaceMatches[1].replaceAll('.', ''), 10)
    }

    return surface
}

export function normalize(rawData = {}) {
    const { data, metadata } = rawData
    let { id, price, location, features, services } = data
    const { link } = metadata

    id = id.trim().toLowerCase()

    price = price.toLowerCase().trim()
    const priceMatches = price.match(priceRegex)
    if (!priceMatches) {
        throw new Error(`Price doesn't match expected pattern: ${price}`)
    }

    const priceAmount = parseInt(priceMatches[1].replaceAll('.', ''), 10)
    const currency = priceMatches[2]

    let locations = location
        .trim()
        .toLowerCase()
        .replaceAll('á', 'a')
        .replaceAll('é', 'e')
        .replaceAll('í', 'i')
        .replaceAll('ó', 'o')
        .replaceAll('ú', 'u')
        .split(',')
        .map(l => l.trim())
    const locationMem = new Set()
    locations = locations.filter(l => {
        if (locationMem.has(l)) {
            return false
        }

        locationMem.add(l)
        return true
    })

    const surface = normalizeAllSurfaces(features)

    return {
        id,
        price: priceAmount,
        currency,
        location: locations,
        ...surface,
        link
    }
}
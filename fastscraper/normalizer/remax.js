function normalizeAddress(displayAddress, addressInfo) {
    const displayAddressNormalized = displayAddress.trim()
        .toLowerCase()
        .replaceAll('á', 'a')
        .replaceAll('é', 'e')
        .replaceAll('í', 'i')
        .replaceAll('ó', 'o')
        .replaceAll('ú', 'u')

    const addressInfoNormalizedList = addressInfo.trim()
        .toLowerCase()
        .replaceAll('á', 'a')
        .replaceAll('é', 'e')
        .replaceAll('í', 'i')
        .replaceAll('ó', 'o')
        .replaceAll('ú', 'u')
        .split(',')
        .map(l => l.trim())

    const normalizedList = [displayAddressNormalized]
    const cache = new Set([displayAddressNormalized])
    for (let x of addressInfoNormalizedList) {
        if (cache.has(x)) {
            continue
        }
        cache.add(x)
        normalizedList.push(x)
    }

    return normalizedList
}

// normalize :: RawDataPoint => NormalizedDataPoint
export function normalize(rawDataPoint = {}) {
    const requiredFields = ['internalId', 'price', 'currency', 'operation', 'slug', 'displayAddress', 'addressInfo']
    for (let requiredField of requiredFields) {
        if (!rawDataPoint[requiredField]) {
            throw new Error(`Expected field not found: ${requiredField}`)
        }
    }

    const id = rawDataPoint.internalId
    const price = rawDataPoint.price
    const currency = rawDataPoint.currency.value.toLowerCase()
    const operation = rawDataPoint.operation.value.toLowerCase()

    let dimensionTotal
    if (rawDataPoint?.dimensionTotalBuilt) {
        dimensionTotal = rawDataPoint.dimensionTotalBuilt
    }

    let dimensionCovered
    if (rawDataPoint?.dimensionCovered) {
        dimensionCovered = rawDataPoint.dimensionCovered
    }

    let location
    let maps
    if (rawDataPoint?.location?.coordinates) {
        const [longitude, latitude] = rawDataPoint.location.coordinates
        location = `POINT(${longitude} ${latitude})`
        maps = `https://www.google.com/maps/?q=${latitude},${longitude}`
    }

    const address = normalizeAddress(rawDataPoint.displayAddress, rawDataPoint.addressInfo)
    const link = `https://www.remax.com.ar/listings/${rawDataPoint.slug}`

    return {
        host: 'remax',
        id,
        price,
        currency,
        operation,
        dimensionTotal,
        dimensionCovered,
        address,
        location,
        maps,
        link
    }
}
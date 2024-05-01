function normalizeAddress(postingLocation) {
    let address = []
    let node = postingLocation?.location
    while(node) {
        address.push(node.name
            .trim()
            .toLowerCase()
            .replaceAll('á', 'a')
            .replaceAll('é', 'e')
            .replaceAll('í', 'i')
            .replaceAll('ó', 'o')
            .replaceAll('ú', 'u'))
        node = node.parent
    }

    const cache = new Set()
    address = address.filter(x => {
        if (cache.has(x)) {
            return false
        }

        cache.add(x)
        return true
    })

    return address
}

// normalize :: RawDataPoint => NormalizedDataPoint
export function normalize(rawDataPoint = {}) {
    const requiredFields = ["postingId", "priceOperationTypes", "postingLocation", "url"]
    for (let requiredField of requiredFields) {
        if (!rawDataPoint[requiredField]) {
            throw new Error(`Expected field not found: ${requiredField}`)
        }
    }

    const id = rawDataPoint.postingId

    // price
    if (rawDataPoint.priceOperationTypes.length !== 1) {
        throw new Error(`Expected single priceOperationType.`)
    }
    const operationTypeMapping = { 'Venta': 'sale', 'Alquiler': 'rent' }
    if (!Object.keys(operationTypeMapping).includes(rawDataPoint.priceOperationTypes[0]?.operationType?.name)) {
        throw new Error(`Unexpected operation type`)
    }
    if (rawDataPoint.priceOperationTypes[0]?.prices.length > 1) {
        throw new Error(`Was expecting single price.`)
    }
    if (!rawDataPoint.priceOperationTypes[0]?.prices[0]?.amount || !rawDataPoint.priceOperationTypes[0]?.prices[0]?.currency) {
        throw new Error(`Was expecting to find both price amount and currency.`)
    }
    const price = parseInt(rawDataPoint.priceOperationTypes[0]?.prices[0]?.amount, 10)
    const currency = rawDataPoint.priceOperationTypes[0]?.prices[0]?.currency.trim().toLowerCase()
    const operation = operationTypeMapping[rawDataPoint.priceOperationTypes[0]?.operationType?.name]

    // dimensions
    let dimensionTotal
    let dimensionCovered
    if (rawDataPoint?.mainFeatures?.CFT100?.label === 'Superficie total' && rawDataPoint?.mainFeatures?.CFT100?.measure === 'm²') {
        dimensionTotal = parseInt(rawDataPoint?.mainFeatures?.CFT100?.value, 10)
    }
    if (rawDataPoint?.mainFeatures?.CFT101?.label === 'Superficie cubierta' && rawDataPoint?.mainFeatures?.CFT101?.measure === 'm²') {
        dimensionCovered = parseInt(rawDataPoint?.mainFeatures?.CFT101?.value, 10)
    }

    // location
    const address = normalizeAddress(rawDataPoint.postingLocation)
    if (!rawDataPoint?.postingLocation?.postingGeolocation?.geolocation?.latitude || !rawDataPoint?.postingLocation?.postingGeolocation?.geolocation?.longitude) {
        throw new Error(`Was expecting latitude and longitude`)
    }
    const latitude = rawDataPoint?.postingLocation?.postingGeolocation?.geolocation?.latitude
    const longitude = rawDataPoint?.postingLocation?.postingGeolocation?.geolocation?.longitude
    const location = `POINT(${longitude} ${latitude})`
    const maps = `https://www.google.com/maps/?q=${latitude},${longitude}`

    const link = `https://www.zonaprop.com.ar${rawDataPoint.url}`

    return {
        host: 'zonaprop',
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
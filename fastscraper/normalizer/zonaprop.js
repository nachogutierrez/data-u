import crypto from 'crypto'

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

    // return rawDataPoint

    const requiredFields = ["title", "postingId", "priceOperationTypes", "postingLocation", "url", "realEstateType", "visiblePictures"]
    for (let requiredField of requiredFields) {
        if (!rawDataPoint[requiredField]) {
            throw new Error(`Expected field not found: ${requiredField}`)
        }
    }

    const internal_id = rawDataPoint.postingId
    const id = crypto.createHash('md5').update(`zonaprop:${internal_id}`).digest('hex')

    const title = rawDataPoint.title

    const houseIds = [
        1, // Casas
        11, // Quintas vacacionales
        2001, // PH
    ]

    const apartmentIds = [
        2, // Departamentos
    ]

    const ruralIds = [
        14, // Campos
    ]

    const landIds = [
        26, // Terrenos
    ]

    const parkingIds = [
        32, // Cocheras
    ]

    const commercialIds = [
        4, // Oficinas Comerciales
        5, // Locales Comerciales
        8, // Bodegas/Galpones
        45, // Depositos
        99, // Fondos de comercio
    ]

    const typeId = Number(rawDataPoint.realEstateType.realEstateTypeId)
    let type = 'other'

    if (houseIds.includes(typeId)) type = 'house'
    else if (apartmentIds.includes(typeId)) type = 'apartment'
    else if (ruralIds.includes(typeId)) type = 'rural'
    else if (landIds.includes(typeId)) type = 'land'
    else if (parkingIds.includes(typeId)) type = 'parking'
    else if (commercialIds.includes(typeId)) type = 'commercial'

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
    let dimension_total_m2
    let dimension_covered_m2
    if (rawDataPoint?.mainFeatures?.CFT100?.label === 'Superficie total' && rawDataPoint?.mainFeatures?.CFT100?.measure === 'm²') {
        dimension_total_m2 = parseInt(rawDataPoint?.mainFeatures?.CFT100?.value, 10)
    }
    if (rawDataPoint?.mainFeatures?.CFT101?.label === 'Superficie cubierta' && rawDataPoint?.mainFeatures?.CFT101?.measure === 'm²') {
        dimension_covered_m2 = parseInt(rawDataPoint?.mainFeatures?.CFT101?.value, 10)
    }

    // location
    const address = normalizeAddress(rawDataPoint.postingLocation)
        .filter(x => !x.match(/\d/)) // exclude strings with numbers
    if (!rawDataPoint?.postingLocation?.postingGeolocation?.geolocation?.latitude || !rawDataPoint?.postingLocation?.postingGeolocation?.geolocation?.longitude) {
        throw new Error(`Was expecting latitude and longitude`)
    }
    const latitude = rawDataPoint?.postingLocation?.postingGeolocation?.geolocation?.latitude
    const longitude = rawDataPoint?.postingLocation?.postingGeolocation?.geolocation?.longitude
    const location = `POINT(${longitude} ${latitude})`

    const link = `https://www.zonaprop.com.ar${rawDataPoint.url}`

    const photos = rawDataPoint.visiblePictures.pictures.map(x => x.url360x266).filter(x => x).filter((x, i) => i < 3)

    return {
        title,
        host: 'zonaprop',
        id,
        type,
        internal_id,
        price,
        currency,
        operation,
        dimension_total_m2,
        dimension_covered_m2,
        address,
        location,
        link,
        photos
    }
}
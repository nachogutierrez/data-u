import crypto from 'crypto'

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
    const requiredFields = ['internalId', 'price', 'currency', 'operation', 'slug', 'displayAddress', 'addressInfo', 'title', 'photos', 'type']
    for (let requiredField of requiredFields) {
        if (!rawDataPoint[requiredField]) {
            throw new Error(`Expected field not found: ${requiredField}`)
        }
    }

    const photos = rawDataPoint.photos.filter((x, i) => i < 3).map(x => `https://d1acdg20u0pmxj.cloudfront.net/${x.value}`)
    const title = rawDataPoint.title

    const internal_id = rawDataPoint.internalId
    const id = crypto.createHash('md5').update(`remax:${internal_id}`).digest('hex')
    const price = parseInt(rawDataPoint.price, 10)
    const currency = rawDataPoint.currency.value.toLowerCase()
    const operation = rawDataPoint.operation.value.toLowerCase()

    const houseIds = [
        9, // casa
        10, // casa duplex
        11, // casa triplex
        23 // quinta
    ]

    const apartmentIds = [
        1, // departamento duplex
        2, // departamento estandar
        3, // departamento loft
        4, // departamento monoambiente
        5, // departamento penthouse
        6, // departamento piso
        7, // departamento semipiso
        8 // departamento triplex
    ]

    const ruralIds = [
        19, // campo
        26 // chacra
    ]

    const landIds = [
        18 // terreno y lotes
    ]

    const parkingIds = [
        21 // cocheras
    ]

    const commercialIds = [
        16, // oficina
        17, // local
        20, // fondo de comercio
        22, // galpon
        28, // deposito
    ]

    const typeId = rawDataPoint.type.id
    let type = 'other'

    if (houseIds.includes(typeId)) type = 'house'
    else if (apartmentIds.includes(typeId)) type = 'apartment'
    else if (ruralIds.includes(typeId)) type = 'rural'
    else if (landIds.includes(typeId)) type = 'land'
    else if (parkingIds.includes(typeId)) type = 'parking'
    else if (commercialIds.includes(typeId)) type = 'commercial'

    let dimension_total_m2
    if (rawDataPoint?.dimensionTotalBuilt) {
        dimension_total_m2 = parseInt(rawDataPoint.dimensionTotalBuilt, 10)
    }

    let dimension_covered_m2
    if (rawDataPoint?.dimensionCovered) {
        dimension_covered_m2 = parseInt(rawDataPoint.dimensionCovered, 10)
    }

    let location
    if (rawDataPoint?.location?.coordinates) {
        const [longitude, latitude] = rawDataPoint.location.coordinates
        location = `POINT(${longitude} ${latitude})`
    }

    const address = normalizeAddress(rawDataPoint.displayAddress, rawDataPoint.addressInfo)
        .filter(x => !x.match(/\d/)) // exclude strings with numbers
    const link = `https://www.remax.com.ar/listings/${rawDataPoint.slug}`

    return {
        title,
        photos,
        type,
        host: 'remax',
        id,
        internal_id,
        price,
        currency,
        operation,
        dimension_total_m2,
        dimension_covered_m2,
        address,
        location,
        link
    }
}
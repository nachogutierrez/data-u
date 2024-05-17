import { connect } from 'puppeteer-real-browser'

const ZONAPROP_LINK = 'https://www.zonaprop.com.ar'

const OP_RENT = '2'
const OP_SALE = '1'

const createPayload = (pageNumber, pageSize, operation) => ({
    ambientesmaximo: 0,
    ambientesminimo: 0,
    amenidades: "",
    antiguedad: null,
    areaComun: "",
    areaPrivativa: "",
    auctions: null,
    banks: "",
    banos: null,
    caracteristicasprop: null,
    city: null,
    comodidades: "",
    condominio: "",
    coordenates: null,
    direccion: null,
    disposicion: null,
    etapaDeDesarrollo: "",
    excludePostingContacted: "",
    expensasmaximo: null,
    expensasminimo: null,
    garages: null,
    general: "",
    grupoTipoDeMultimedia: "",
    habitacionesmaximo: 0,
    habitacionesminimo: 0,
    idInmobiliaria: null,
    idunidaddemedida: 1,
    metroscuadradomax: null,
    metroscuadradomin: null,
    moneda: null,
    multipleRets: "",
    outside: "",
    places: "",
    polygonApplied: null,
    preciomax: null,
    preciomin: null,
    province: null,
    publicacion: null,
    pagina: pageNumber,
    limit: pageSize,
    roomType: "",
    searchbykeyword: "",
    services: "",
    sort: "relevance",
    subZone: null,
    subtipoDePropiedad: null,
    superficieCubierta: 1,
    tipoAnunciante: "ALL",
    tipoDeOperacion: operation,
    valueZone: null,
    zone: null
})

export function iterator(opts = {}) {

    const { maxPages, pageSize } = opts

    let browser
    let page

    let pageNumber = 1
    let lastData
    let cache = new Set()
    let repeated = new Set()

    let hasNextPage = true

    // hasNext :: () => boolean
    async function hasNext() {
        if (repeated.size >= 1500) {
            console.log('detected too many repeated ids, stopping.');
        }
        return (maxPages < 0 || pageNumber <= maxPages) 
            && (lastData === undefined || lastData.length > 0) 
            && repeated.size < 25
            && hasNextPage
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

                await page.goto(ZONAPROP_LINK, { waitUntil: 'networkidle0', timeout: 30000 })
                console.log(`Navigated to ${ZONAPROP_LINK}`);
            }

            const result = await page.evaluate(async (payload) => {
                const response = await fetch('/rplis-api/postings', {
                    method: 'POST',
                    credentials: 'include', // This ensures cookies are included
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                return response.json(); // Assuming the response is in JSON format
            }, createPayload(pageNumber, pageSize, OP_SALE));

            // console.log(result.paging);

            hasNextPage = !result.paging.lastPage || pageNumber < result.paging.totalPages

            lastData = result.listPostings

            for (let datapoint of lastData) {

                if (cache.has(datapoint.postingId)) {
                    repeated.add(datapoint.postingId)
                }
                
                cache.add(datapoint.postingId)
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
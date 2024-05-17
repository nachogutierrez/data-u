import axios from 'axios'

const API = "https://api-ar.redremax.com"
const ENDPOINT = "/remaxweb-ar/api/listings/findAll"

const OP_SALE = '1'
const OP_RENT = '2'

const createLink = ({ pageNumber, pageSize, operation }) => `${API}${ENDPOINT}?page=${pageNumber}&pageSize=${pageSize}&sort=-createdAt&in=operationId:${operation}`

export function iterator(opts = {}) {

    const { maxPages, pageSize } = opts

    let page = 0
    let lastData

    // hasNext :: () => boolean
    async function hasNext() {
        return (maxPages < 0 || page < maxPages) && (lastData === undefined || lastData.length > 0)
    }

    // next :: () => [RawDataPoint]
    async function next() {
        try {
            const response = await axios.get(createLink({ pageNumber: page, pageSize, operation: OP_SALE }))
            lastData = response.data.data.data
            return lastData
        } finally {
            page++
        }
    }

    async function close() {
        // do nothing
    }

    return {
        hasNext,
        next,
        close
    }
}
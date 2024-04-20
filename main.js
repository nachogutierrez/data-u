import axios from 'axios';
import { JSDOM } from 'jsdom'

const link = 'https://www.remax.com.ar/listings/buy?page=1&pageSize=21&sort=-createdAt&in:operationId=1&filterCount=0&viewMode=listViewMode'

function getRemaxPropertyLink(propertyTitle) {
    return propertyTitle
        .toLowerCase()
        .trim()
        .replaceAll(' ', '-')
        .replaceAll('/', '-')
        .replaceAll('+', '-')
        .replaceAll('.', '-')
        .replaceAll(/-{2,}/g, '-')
        .replaceAll('ñ', 'n')
        .replaceAll('á', 'a')
        .replaceAll('é', 'e')
        .replaceAll('í', 'i')
        .replaceAll('ó', 'o')
        .replaceAll('ú', 'u')
}

axios.get(link)
.then(response => response.data)
.then(console.log)
// .then(html => new JSDOM(html))
// .then(dom => dom.window.document.querySelector('.card__description'))
// .then(result => {
//     console.log(result)
// })
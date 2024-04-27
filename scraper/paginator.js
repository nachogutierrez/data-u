export async function nkPaginator(n, k, pageSize) {
    let next = 0

    return {
        hasNext: () => true,
        next: () => ({ pageSize, pageNumber: n*(next++) + k })
    }
}
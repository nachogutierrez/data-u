export function stats(values) {
    if (values.length === 0) {
        return []
    }

    const sum = values.reduce((x, y) => x + y, 0)
    const avg = sum / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)

    return [values.length, min, avg, max]
}
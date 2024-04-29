export function validateInteger(name, value) {
    if (isNaN(value)) {
        throw new Error(`Flag --${name} must be number, got ${value}`)
    }

    const num = Number(value)
    if (!Number.isInteger(num)) {
        throw new Error(`Flag --${name} must be an integer, got ${value}`)
    }
}
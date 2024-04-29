export function today() {
    const currentDate = new Date();
    return currentDate.toISOString().split('T')[0];
}
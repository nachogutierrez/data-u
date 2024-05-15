// TODO: integrate Google Cloud Secret Manager
export async function getSecret(secretName: string): Promise<string> {
    if (process.env[secretName]) {
        return process.env[secretName] || 'undefined'
    }

    throw new Error(`Env variable not found: ${secretName}`)
}
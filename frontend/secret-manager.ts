// import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

// const client = new SecretManagerServiceClient();

let cache: any = {}

export async function getSecret(secretName: string): Promise<string> {
    console.log(`Fetching secret ${secretName}`);
    
    if (process.env[secretName]) {
        return process.env[secretName] || 'undefined'
    }

    throw new Error(`Env variable not found: ${secretName}`)

    // TODO: integrate Google Cloud Secret Manager

    // if (cache[secretName]) {
    //     return cache[secretName]
    // }

    // if (!process.env.GC_PROJECT_ID) {
    //     throw new Error('Env variable not found: GC_PROJECT_ID')
    // }
    // const [version] = await client.accessSecretVersion({
    //     name: `projects/${process.env.GC_PROJECT_ID}/secrets/${secretName}/versions/latest`,
    // });

    // if (!version?.payload?.data) {
    //     throw new Error('Something went wrong while fetching the secrets: ' + version)
    // }

    // const payload = version.payload.data.toString()
    
    // cache[secretName] = payload
    // return payload;
}
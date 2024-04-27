import { Storage } from '@google-cloud/storage'
import stream from 'stream'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Google Cloud Storage client with credentials
const storage = new Storage({
    keyFilename: path.join(__dirname, 'service-account.json')
})

const bucketName = 'workloads'

export async function uploadObjectToGCS(filePath, object) {
    try {
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(filePath);
        const contents = JSON.stringify(object, null, 4);

        // Use a PassThrough stream to create a stream buffer from the JSON string
        const bufferStream = new stream.PassThrough();
        bufferStream.end(Buffer.from(contents, 'utf-8'));

        // Wrap the pipe in a promise to handle asynchronous upload properly
        await new Promise((resolve, reject) => {
            bufferStream.pipe(file.createWriteStream({
                metadata: {
                    contentType: 'application/json',
                    cacheControl: 'public, max-age=31536000',
                }
            }))
                .on('error', (error) => {
                    console.error('ERROR:', error);
                    reject(error);
                })
                .on('finish', () => {
                    console.log(`${filePath} uploaded to ${bucketName}.`);
                    resolve();
                });
        });

    } catch (error) {
        console.error('ERROR:', error);
    }
}

export async function fileExistsInGCS(filePath) {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    try {
        // exists() returns an array where the first element is a boolean
        const [exists] = await file.exists();
        if (exists) {
            console.log(`The file ${filePath} exists in the bucket ${bucketName}.`);
            return true;
        } else {
            console.log(`The file ${filePath} does not exist in the bucket ${bucketName}.`);
            return false;
        }
    } catch (error) {
        console.error('ERROR:', error);
        return false;
    }
}
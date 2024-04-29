import fs from 'fs/promises'

const DATA_PATH = 'tmp/data.json'
const STATS_PATH = 'tmp/stats.json'
const ERRORS_PATH = 'tmp/errors.json'

async function readFile(path, defaultValue) {
    try {
        const data = await fs.readFile(path, 'utf8');
        return data
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File does not exist, return default value
            return defaultValue;
        } else {
            // Other errors, rethrow them
            throw error;
        }
    }
}

export async function pushData(workloadId, normalizedData = []) {
    await fs.mkdir(`tmp/${workloadId}`, { recursive: true })

    let currentData = JSON.parse(await readFile(DATA_PATH, '[]'))
    currentData = [...currentData, ...normalizedData]

    await fs.writeFile(`tmp/${workloadId}/data.json`, JSON.stringify(currentData, null, 4), 'utf8')
}

export async function pushStats(workloadId, stats = {}) {
    await fs.mkdir(`tmp/${workloadId}`, { recursive: true })
    await fs.writeFile(`tmp/${workloadId}/stats.json`, JSON.stringify(stats, null, 4), 'utf8')
}

export async function pushErrors(workloadId, errors = []) {
    await fs.mkdir(`tmp/${workloadId}`, { recursive: true })
    await fs.writeFile(`tmp/${workloadId}/errors.json`, JSON.stringify(errors, null, 4), 'utf8')
}
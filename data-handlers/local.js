import { promises as fs } from 'fs';

const pageFilePath = (workloadId, pageSize, pageNumber) => `tmp/${workloadId}/ps_${pageSize}_pn_${pageNumber}.json`
const pageErrorFilePath = (workloadId, pageSize, pageNumber) => `tmp/${workloadId}/error_ps_${pageSize}_pn_${pageNumber}.json`

async function checkFileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

export async function storeData(workloadId, data, metadata) {
    const { pageSize, pageNumber } = metadata
    const allData = { data, metadata }
    await fs.mkdir(`tmp/${workloadId}`, { recursive: true })
    await fs.writeFile(pageFilePath(workloadId, pageSize, pageNumber), JSON.stringify(allData, null, 4), 'utf8');
}

export async function hasData(workloadId, pageSize, pageNumber) {
    return checkFileExists(pageFilePath(workloadId, pageSize, pageNumber))
}

function serializeError(error) {
    return {
      message: error.message,    // Error message
      stack: error.stack,        // Stack trace
      name: error.name,          // Error name (e.g., ReferenceError)
      ...(error.code && { code: error.code }),  // Include code if it exists (useful for Node.js errors)
    };
  }

export async function logFailedPage(workloadId, pageSize, pageNumber, error) {
    const serializedError = JSON.stringify(serializeError(error), null, 4)
    await fs.mkdir(`tmp/${workloadId}`, { recursive: true })
    await fs.writeFile(pageErrorFilePath(workloadId, pageSize, pageNumber), serializedError, 'utf8')
}
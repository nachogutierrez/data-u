import { uploadObjectToGCS, fileExistsInGCS } from '../gcloud-storage.js'

const pageFilePath = (workloadId, pageSize, pageNumber) => `${workloadId}/ps_${pageSize}_pn_${pageNumber}.json`
const pageErrorFilePath = (workloadId, pageSize, pageNumber) => `${workloadId}/error_ps_${pageSize}_pn_${pageNumber}.json`

export async function storeData(workloadId, data, metadata) {
    const { pageSize, pageNumber } = metadata
    const allData = { data, metadata }
    await uploadObjectToGCS(pageFilePath(workloadId, pageSize, pageNumber), allData)
}

export async function hasData(workloadId, pageSize, pageNumber) {
    return fileExistsInGCS(pageFilePath(workloadId, pageSize, pageNumber))
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
    await uploadObjectToGCS(pageErrorFilePath(workloadId, pageSize, pageNumber), serializeError)
}
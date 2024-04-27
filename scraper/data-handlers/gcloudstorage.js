import { uploadObjectToGCS, fileExistsInGCS } from 'common/gcloud-storage.js'

const pageFilePath = (workloadId, pageSize, pageNumber) => `${workloadId}/ps_${pageSize}_pn_${pageNumber}.json`
const pageErrorFilePath = (workloadId, pageSize, pageNumber) => `${workloadId}/error_ps_${pageSize}_pn_${pageNumber}.json`
const itemErrorFilePath = (workloadId, pageSize, pageNumber, itemNumber) => `${workloadId}/error_ps_${pageSize}_pn_${pageNumber}_i_${itemNumber}.json`

export async function storeData(workloadId, pageSize, pageNumber, payload) {
  await uploadObjectToGCS('workloads', pageFilePath(workloadId, pageSize, pageNumber), payload)
}

export async function hasData(workloadId, pageSize, pageNumber) {
  return fileExistsInGCS('workloads', pageFilePath(workloadId, pageSize, pageNumber))
}

export async function logFailedPage(workloadId, pageSize, pageNumber, payload) {
  await uploadObjectToGCS('workloads', pageErrorFilePath(workloadId, pageSize, pageNumber), payload)
}

export async function logFailedItem(workloadId, pageSize, pageNumber, itemNumber, payload) {
  await uploadObjectToGCS('workloads', itemErrorFilePath(workloadId, pageSize, pageNumber, itemNumber), payload)
}
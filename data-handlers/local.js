import { promises as fs } from 'fs';

const pageFilePath = (workloadId, pageSize, pageNumber) => `${workloadId}/ps_${pageSize}_pn_${pageNumber}.json`
const pageErrorFilePath = (workloadId, pageSize, pageNumber) => `${workloadId}/error_ps_${pageSize}_pn_${pageNumber}.json`
const itemErrorFilePath = (workloadId, pageSize, pageNumber, itemNumber) => `${workloadId}/error_ps_${pageSize}_pn_${pageNumber}_i_${itemNumber}.json`

async function checkFileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

export async function storeData(workloadId, pageSize, pageNumber, payload) {
    await fs.mkdir(`tmp/${workloadId}`, { recursive: true })
    await fs.writeFile(`tmp/${pageFilePath(workloadId, pageSize, pageNumber)}`, JSON.stringify(payload, null, 4), 'utf8');
}

export async function hasData(workloadId, pageSize, pageNumber) {
    return checkFileExists(`tmp/${pageFilePath(workloadId, pageSize, pageNumber)}`)
}

export async function logFailedPage(workloadId, pageSize, pageNumber, payload) {
    await fs.mkdir(`tmp/${workloadId}`, { recursive: true })
    await fs.writeFile(`tmp/${pageErrorFilePath(workloadId, pageSize, pageNumber)}`, JSON.stringify(payload, null, 4), 'utf8')
}

export async function logFailedItem(workloadId, pageSize, pageNumber, itemNumber, payload) {
  await fs.mkdir(`tmp/${workloadId}`, { recursive: true })
  await fs.writeFile(`tmp/${itemErrorFilePath(workloadId, pageSize, pageNumber, itemNumber)}`, JSON.stringify(payload, null, 4), 'utf8')
}
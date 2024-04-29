import { uploadObjectToBigQuery } from 'common/gcloud-bigquery.js'
import { uploadObjectToGCS } from 'common/gcloud-storage.js'

export async function pushData(workloadId, normalizedData = []) {
    await uploadObjectToBigQuery('housing', 'datapoints', normalizedData)
}

export async function pushStats(workloadId, stats = {}) {
    await uploadObjectToGCS('workloads', `${workloadId}/stats.json`, stats)
}

export async function pushErrors(workloadId, errors = []) {
    await uploadObjectToGCS(`workloads`, `${workloadId}/errors.json`, errors)
}
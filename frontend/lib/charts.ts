import { BigQueryDate } from "@google-cloud/bigquery"

export type DataItem = {
    date: BigQueryDate,
    name: string,
    value: number
}

type XAxisItem = {
    scaleType: string,
    data: Array<string>
}

type SeriesItem = {
    data: Array<number>
}

type BarChartData = {
    xAxis: Array<XAxisItem>,
    series: Array<SeriesItem>
}



export function barChartData(data: Array<DataItem> = []): any {
    
    const byDate = new Map<string, Map<string, number>>();
    const names = new Set<string>();

    for (let dataItem of data) {
        const { date, name, value } = dataItem

        if (!byDate.has(date.value)) {
            byDate.set(date.value, new Map<string, number>())
        }

        byDate.get(date.value)?.set(name, value)
        names.add(name)
    }

    // TODO: fill gaps

    const keys = Array.from(byDate.keys()).sort()
    const namesList = Array.from(names).sort()

    const dataset = []

    for (let key of keys) {
        const datapoint: any = {
            date: key
        }
        for (let name of namesList) {
            if (byDate.get(key)?.has(name)) {
                datapoint[name] = byDate.get(key)?.get(name)
            } else {
                datapoint[name] = 0
            }
        }
        dataset.push(datapoint)
    }

    const series = []

    for (let name of namesList) {
        series.push({
            dataKey: name,
            label: name
        })
    }

    return {
        dataset,
        series
    }
}
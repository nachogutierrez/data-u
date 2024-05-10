import { DateDataPoint } from "@/db/bigquery"

type SeriesItem = {
    dataKey: string,
    label: string
}

type BarChartDataPoint = {
    [key: string]: string | number; // These should all be numbers
    date: string;
};

type BarChartData = {
    dataset: BarChartDataPoint[],
    series: SeriesItem[]
}



export function barChartData(data: Array<DateDataPoint> = []): BarChartData {
    
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
        const datapoint: BarChartDataPoint = {
            date: key
        }
        for (let name of namesList) {
            if (byDate.get(key)?.has(name)) {
                datapoint[name] = byDate.get(key)!.get(name)!
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
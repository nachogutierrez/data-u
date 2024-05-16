import React from 'react'
import SimpleBoxPlot from '../charts/SimpleBoxPlot'
import { Insights } from '@/db/bigquery/types'

export type DataPointsTableStatisticsProps = {
    insights: Insights
}

export default function DataPointsTableStatistics(props: DataPointsTableStatisticsProps) {

    const { insights } = props

    return (
        <div className="flex justify-around flex-wrap">
            <SimpleBoxPlot name='PRICE' data={insights.price} />
            <SimpleBoxPlot name='PRICE PER M2' data={insights.price_m2} />
        </div>
    )
}

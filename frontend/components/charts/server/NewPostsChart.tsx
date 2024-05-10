import React from 'react'
import { DateDataPoint, getNewPosts } from '@/db/bigquery'
import { barChartData } from '@/lib/charts'
import DateBarChart from '../client/DateBarChart'

export default async function NewPostsChart() {
    
    const data: DateDataPoint[] = await getNewPosts()
    const chartData = barChartData(data)    

    return (
        <DateBarChart title={'New posts'} chartData={chartData} />
    )
}

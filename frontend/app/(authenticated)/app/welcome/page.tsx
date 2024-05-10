import { runQuery } from '@/db/bigquery'
import { DataItem, barChartData } from '@/lib/charts';
// import { BarChart } from '@mui/x-charts';
import React from 'react'
import DateBarChart from './DateBarChart';
import Mobile from '@/components/Mobile';
import Desktop from '@/components/Desktop';

export default async function WelcomePage() {

  const data: DataItem[] = await runQuery('new-posts.sql') as DataItem[]
  const chartData = barChartData(data)

  return (
    <main className='m-0 p-0 w-full max-w-full'>
      <Mobile>
        <div className="flex flex-col items-center">
          <DateBarChart title={'New posts'} chartData={chartData} />
          <DateBarChart title={'New posts'} chartData={chartData} />
          <DateBarChart title={'New posts'} chartData={chartData} />
        </div>
      </Mobile>
      <Desktop>
        <div className="flex items-center flex-wrap justify-around">
          <DateBarChart title={'New posts'} chartData={chartData} />
          <DateBarChart title={'New posts'} chartData={chartData} />
          <DateBarChart title={'New posts'} chartData={chartData} />
        </div>
      </Desktop>
    </main>
  )
}

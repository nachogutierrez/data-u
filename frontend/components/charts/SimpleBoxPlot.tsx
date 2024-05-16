import { BoxPlotDataPoint } from '@/db/bigquery/types'
import React from 'react'
import { COLOR_HIGH, COLOR_LOW, COLOR_VERY_HIGH, COLOR_VERY_LOW } from '../table/TableRow'
import { formatMoney } from '@/lib/format'

export type SimpleBoxPlotProps = {
    name: string,
    data: BoxPlotDataPoint
}

const Segment = ({ name, backgroundColor }: { name: string, backgroundColor: string }) => (
    <div className="p-2 rounded-md" style={{ backgroundColor }}>{name}</div>
)

export default function SimpleBoxPlot(props: SimpleBoxPlotProps) {

    const { name, data } = props

    return (
        <div className="flex flex-col card select-none">
            <p className="self-center">{name}</p>
            <div className="flex items-center gap-1">
                <Segment name='Very low' backgroundColor={COLOR_VERY_LOW} />
                <p className="min-w-32 text-center">{`<= ${formatMoney(data.q1, 'usd')} <`}</p>
                <Segment name='Low' backgroundColor={COLOR_LOW} />
                <p className="min-w-32 text-center">{`<= ${formatMoney(data.median, 'usd')} <`}</p>
                <Segment name='High' backgroundColor={COLOR_HIGH} />
                <p className="min-w-32 text-center">{`<= ${formatMoney(data.q3, 'usd')} <`}</p>
                <Segment name='Very high' backgroundColor={COLOR_VERY_HIGH} />
            </div>
        </div>
    )
}

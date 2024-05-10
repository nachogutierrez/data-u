"use client";

import React from 'react'
import { BarChart } from '@mui/x-charts';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import Mobile from '@/components/Mobile';
import Desktop from '@/components/Desktop';

export default function DateBarChart({ title, chartData }: { title: string, chartData: any }) {
    const { dataset, series } = chartData

    const { width, height } = useWindowDimensions()

    return (
        <div className="card shadow-xl inline-block">
            <Mobile>
                <BarChart
                    title={title}
                    dataset={dataset}
                    series={series}
                    xAxis={[{ scaleType: 'band', dataKey: 'date', label: title }]}
                    width={Math.min(0.75 * width, 350)}
                    height={200}
                    className="w-full" />
            </Mobile>
            <Desktop>
                <BarChart
                    title={title}
                    dataset={dataset}
                    series={series}
                    xAxis={[{ scaleType: 'band', dataKey: 'date', label: title }]}
                    width={0.45*width}
                    height={300}
                    className="w-full max-w-full" />
            </Desktop>
        </div>
    )
}

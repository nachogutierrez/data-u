"use client";

import React from 'react';
import { LineChart } from '@mui/x-charts';

const generateNormalDistributionData = (mean: number, stdDev: number, numPoints: number) => {
    const xValues = [];
    const yValues = [];
    const step = (6 * stdDev) / numPoints;
    for (let i = -3 * stdDev; i <= 3 * stdDev; i += step) {
        xValues.push(i + mean);
        yValues.push((1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((i / stdDev), 2)));
    }
    return { xValues, yValues };
};

export function BellCurveChart({ mean, std }: { mean: number, std: number }) {

    const { xValues, yValues } = generateNormalDistributionData(mean, std, 10)

    const chartData = xValues.map((x, index) => ({ x, y: yValues[index] }));

    return (typeof window !== 'undefined') && (
        <LineChart
            xAxis={[{
                data: xValues,
                hideTooltip: true,
                valueFormatter: (value) => ''
            }]}
            yAxis={[{ hideTooltip: true, valueFormatter: () => '' }]} // Hide y-axis values
            disableAxisListener={true}
            disableLineItemHighlight={true}
            series={[
                {
                    data: yValues,
                    showMark: false,
                    disableHighlight: true
                },
            ]}
            tooltip={{
                trigger: 'none'
            }}
            grid={{
                vertical: false,
                horizontal: false
            }}
            axisHighlight={{
                x: 'none',
                y: 'none'
            }}
            width={500}
            height={300}
        />
    )
}
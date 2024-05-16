"use client";

import React from "react";
import Chart from "react-apexcharts";

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

function normalCDF(x, mean, std) {
    const z = (x - mean) / std;
    const cdf = 0.5 * (1 + erf(z / Math.sqrt(2)));
    return cdf;
}

function erf(x) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
}

export default function BellCurveChart({ name, mean, std }: any) {
    if (typeof window === 'undefined') {
        return null
    }

    const { xValues, yValues } = generateNormalDistributionData(mean, std, 500)

    const data = []
    for (let i = 0; i < xValues.length; i++) {
        let veracity = ''
        if (normalCDF(xValues[i], mean, std) <= 0.0675) {
            veracity = 'very low'
        } else if (normalCDF(xValues[i], mean, std) <= 0.5) {
            veracity = 'low'
        } else if (normalCDF(xValues[i], mean, std) <= 0.9325) {
            veracity = 'high'
        } else {
            veracity = 'very high'
        }
        data.push({
            x: xValues[i],
            y: yValues[i],
            veracity
        })
    }

    function extractColor(element: any) {
        switch (element.veracity) {
            case 'very low':
                return '#66CC66'
            case 'low':
                return '#FFCC66'
            case 'high':
                return '#FF9966'
            case 'very high':
                return '#FF6666'
            default:
                return 'black'
        }
    }

    const dataSets: any = [];

    let previousColor = null;
    for (const element of data.sort((a, b) => a.x - b.x)) {
        const color = extractColor(element);

        let dataSet;
        if (dataSets.length === 0 || previousColor !== color) {
            const previousDataSet =
                dataSets.length !== 0 ? dataSets[dataSets.length - 1] : null;
            dataSet = {
                name: `${element.veracity} veracity`,
                color: color,
                data:
                    previousDataSet === null
                        ? []
                        : [previousDataSet.data[previousDataSet.data.length - 1]]
            };
            dataSets.push(dataSet);
        } else {
            dataSet = dataSets[dataSets.length - 1];
        }

        dataSet.data.push([element.x, element.y]);
        previousColor = color;
    }

    const breakingPoints = [-3 * std + mean, -2 * std + mean, -1 * std + mean, mean, 1 * std + mean, 2 * std + mean, 3 * std + mean];

    const options = {
        chart: {
            type: "area",
            toolbar: {
                show: false
            },
            animations: {
                enabled: false
            }
        },
        title: {
            text: name,
            align: "center"
        },
        tooltip: {
            shared: true
        },
        legend: {
            show: false
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            curve: "smooth",
            colors: ["silver"],
            width: 2
        },
        fill: {
            colors: [(series) => dataSets[series.seriesIndex]?.color || "black"],
            type: "gradient",
            gradient: {
                stops: [100]
            }
        },
        xaxis: {
            type: "numeric",
            tickAmount: 4,
            labels: {
                formatter: function (value) {
                    if (value < 0) {
                        return ""
                    }

                    return Math.floor(value)
                }
            }
        },
        yaxis: {
            labels: {
                show: false
            },
            axisBorder: {
                show: true
            }
        }
    };



    return <Chart type="area" width="500" options={options} series={dataSets} />;
};

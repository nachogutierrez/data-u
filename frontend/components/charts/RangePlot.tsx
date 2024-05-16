"use client";

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RangePlot = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Min to Max Range',
        data: data.map(item => ({
          x: item.label,
          y: [item.min, item.max],
        })),
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
        pointRadius: 0,
      },
      {
        label: 'Mean',
        data: data.map(item => item.mean),
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        // beginAtZero: true,
      },
      y: {
        // beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default RangePlot;

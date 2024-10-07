'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SalesChartProps {
  data: Sale[];
  title: string;
}

export default function SalesChart({ data, title }: SalesChartProps) {
  // Process data for the chart
  const chartData = {
    labels: data.map(sale => new Date(sale.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Sales',
        data: data.map(sale => sale.sale_price),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Bar options={options} data={chartData} />;
}

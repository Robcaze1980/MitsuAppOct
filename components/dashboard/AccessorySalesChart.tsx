'use client';

import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Sale } from '@/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type AccessorySalesChartProps = {
  data: Sale[]
}

export default function AccessorySalesChart({ data }: AccessorySalesChartProps) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    const accessorySalesByDate: { [key: string]: number } = {}
    data.forEach((sale) => {
      const date = new Date(sale.date).toISOString().split('T')[0]
      if (accessorySalesByDate[date]) {
        accessorySalesByDate[date] += sale.accessory_price
      } else {
        accessorySalesByDate[date] = sale.accessory_price
      }
    })

    const sortedDates = Object.keys(accessorySalesByDate).sort()

    setChartData({
      labels: sortedDates,
      datasets: [
        {
          label: 'Accessory Sales Trend',
          data: sortedDates.map((date) => accessorySalesByDate[date]),
          fill: false,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        },
      ],
    })
  }, [data])

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Accessory Sales Trend',
      },
    },
  }

  return <Line options={options} data={chartData} />
}

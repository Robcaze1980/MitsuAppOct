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

type SalesTrendChartProps = {
  data: Sale[]
}

export default function SalesTrendChart({ data }: SalesTrendChartProps) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    const salesByDate: { [key: string]: number } = {}
    data.forEach((sale) => {
      const date = new Date(sale.date).toISOString().split('T')[0]
      if (salesByDate[date]) {
        salesByDate[date] += sale.sale_price
      } else {
        salesByDate[date] = sale.sale_price
      }
    })

    const sortedDates = Object.keys(salesByDate).sort()

    setChartData({
      labels: sortedDates,
      datasets: [
        {
          label: 'Daily Sales Trend',
          data: sortedDates.map((date) => salesByDate[date]),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
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
        text: 'Daily Sales Trend',
      },
    },
  }

  return <Line options={options} data={chartData} />
}

'use client';

import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Sale } from '@/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

type TopSalespeopleChartProps = {
  data: Sale[]
}

export default function TopSalespeopleChart({ data }: TopSalespeopleChartProps) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    const salesBySalesperson: { [key: string]: number } = {}
    data.forEach((sale) => {
      if (salesBySalesperson[sale.salesperson_id]) {
        salesBySalesperson[sale.salesperson_id] += sale.sale_price
      } else {
        salesBySalesperson[sale.salesperson_id] = sale.sale_price
      }
    })

    const sortedSalespeople = Object.entries(salesBySalesperson)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    setChartData({
      labels: sortedSalespeople.map(([id]) => `Salesperson ${id}`),
      datasets: [
        {
          label: 'Total Sales',
          data: sortedSalespeople.map(([, amount]) => amount),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
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
        text: 'Top 5 Salespeople',
      },
    },
  }

  return <Bar options={options} data={chartData} />
}

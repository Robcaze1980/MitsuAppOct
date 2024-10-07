'use client';

import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Sale } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type SalesChartProps = {
  data: Sale[]
}

export default function SalesChart({ data }: SalesChartProps) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    const salesByMonth: { [key: string]: number } = {}
    data.forEach((sale) => {
      const date = new Date(sale.date)
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
      if (salesByMonth[monthYear]) {
        salesByMonth[monthYear] += sale.sale_price
      } else {
        salesByMonth[monthYear] = sale.sale_price
      }
    })

    const sortedMonths = Object.keys(salesByMonth).sort((a, b) => {
      const [monthA, yearA] = a.split('/')
      const [monthB, yearB] = b.split('/')
      return new Date(parseInt(yearA), parseInt(monthA) - 1).getTime() - new Date(parseInt(yearB), parseInt(monthB) - 1).getTime()
    })

    setChartData({
      labels: sortedMonths,
      datasets: [
        {
          label: 'Total Sales',
          data: sortedMonths.map((month) => salesByMonth[month]),
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
        text: 'Monthly Sales',
      },
    },
  }

  return <Bar options={options} data={chartData} />
}

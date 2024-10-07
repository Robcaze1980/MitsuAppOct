'use client';

import { useEffect, useState } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Sale } from '@/types'

ChartJS.register(ArcElement, Tooltip, Legend)

type VehiclePopularityChartProps = {
  data: Sale[]
}

export default function VehiclePopularityChart({ data }: VehiclePopularityChartProps) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    const vehicleCounts: { [key: string]: number } = {}
    data.forEach((sale) => {
      const vehicleKey = `${sale.make} ${sale.model}`
      if (vehicleCounts[vehicleKey]) {
        vehicleCounts[vehicleKey]++
      } else {
        vehicleCounts[vehicleKey] = 1
      }
    })

    const sortedVehicles = Object.entries(vehicleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    const backgroundColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
    ]

    setChartData({
      labels: sortedVehicles.map(([vehicle]) => vehicle),
      datasets: [
        {
          data: sortedVehicles.map(([, count]) => count),
          backgroundColor: backgroundColors,
        },
      ],
    })
  }, [data])

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Top 10 Most Popular Vehicles',
      },
    },
  }

  return <Pie data={chartData} options={options} />
}

import { useState } from 'react'

type Sale = {
  id: string
  customer_name: string
  total_amount: number
  created_at: string
  salesperson: {
    name: string
  }
}

type ReportTableProps = {
  data: Sale[]
}

export default function ReportTable({ data }: ReportTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Sale>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const sortedData = [...data].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (column: keyof Sale) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <button onClick={() => handleSort('created_at')}>Date</button>
          </th>
          <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <button onClick={() => handleSort('customer_name')}>Customer</button>
          </th>
          <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <button onClick={() => handleSort('total_amount')}>Amount</button>
          </th>
          <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Salesperson
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((sale) => (
          <tr key={sale.id}>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
              {new Date(sale.created_at).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
              {sale.customer_name}
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
              ${sale.total_amount.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
              {sale.salesperson.name}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

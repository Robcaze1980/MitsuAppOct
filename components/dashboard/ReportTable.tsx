'use client';

// Remove or update this import if @/types doesn't exist
// import { Sale } from '@/types'

// If you don't have a specific type for Sale, you can define it here:
type Sale = {
  id: string
  date: string
  amount: number
  // Add other properties as needed
}

interface ReportTableProps {
  data: Sale[]
}

const ReportTable: React.FC<ReportTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Amount</th>
            {/* Add other headers as needed */}
          </tr>
        </thead>
        <tbody>
          {data.map((sale) => (
            <tr key={sale.id}>
              <td className="border px-4 py-2">{sale.date}</td>
              <td className="border px-4 py-2">${sale.amount.toFixed(2)}</td>
              {/* Add other cells as needed */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ReportTable

import React from 'react';

// Remove the import for types, as they are now global

interface ClientReportTableProps {
  data: (Sale & { customer: Customer })[];
}

export default function ClientReportTable({ data }: ClientReportTableProps) {
  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="px-4 py-2 text-left">Date</th>
          <th className="px-4 py-2 text-left">Stock #</th>
          <th className="px-4 py-2 text-left">Price</th>
          <th className="px-4 py-2 text-left">Customer</th>
        </tr>
      </thead>
      <tbody>
        {data.map((sale) => (
          <tr key={sale.id}>
            <td className="border px-4 py-2">{new Date(sale.date).toLocaleDateString()}</td>
            <td className="border px-4 py-2">{sale.stock_number}</td>
            <td className="border px-4 py-2">${sale.sale_price.toFixed(2)}</td>
            <td className="border px-4 py-2">{`${sale.customer.first_name} ${sale.customer.last_name}`}</td> {/* Adjusted to access customer data */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

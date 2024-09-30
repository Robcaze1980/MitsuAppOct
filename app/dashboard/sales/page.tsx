import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SaleForm from '@/components/SaleForm'

export default async function Sales() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: sales } = await supabase.from('sales').select('*')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sales Management</h1>
      <SaleForm />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Recent Sales</h2>
        <ul>
          {sales?.map((sale) => (
            <li key={sale.id} className="mb-2">
              {sale.customer_name} - ${sale.total_amount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

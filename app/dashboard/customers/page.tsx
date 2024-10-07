import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import CustomerForm from '@/components/forms/CustomerForm'

export default async function Customers() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: customers } = await supabase.from('customers').select('*')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customer Management</h1>
      <CustomerForm />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Customer List</h2>
        <ul>
          {customers?.map((customer) => (
            <li key={customer.id} className="mb-2">
              {customer.name} - {customer.email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

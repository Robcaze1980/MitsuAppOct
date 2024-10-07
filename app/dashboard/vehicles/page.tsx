import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import VehicleForm from '@/components/forms/VehicleForm'

export default async function Vehicles() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: vehicles } = await supabase.from('vehicles').select('*')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Vehicle Management</h1>
      <VehicleForm />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Vehicle Inventory</h2>
        <ul>
          {vehicles?.map((vehicle) => (
            <li key={vehicle.id} className="mb-2">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function SaleForm() {
  const supabase = useSupabaseClient()
  const [formData, setFormData] = useState({
    customer_name: '',
    vehicle_id: '',
    total_amount: '',
    accessories_amount: '',
    warranty_price: '',
    warranty_cost: '',
    maintenance_amount: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from('sales').insert([formData])
    if (error) {
      console.error('Error inserting sale:', error)
    } else {
      console.log('Sale inserted successfully:', data)
      setFormData({
        customer_name: '',
        vehicle_id: '',
        total_amount: '',
        accessories_amount: '',
        warranty_price: '',
        warranty_cost: '',
        maintenance_amount: '',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="customer_name" className="block mb-1">Customer Name</label>
        <input
          type="text"
          id="customer_name"
          name="customer_name"
          value={formData.customer_name}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label htmlFor="vehicle_id" className="block mb-1">Vehicle ID</label>
        <input
          type="text"
          id="vehicle_id"
          name="vehicle_id"
          value={formData.vehicle_id}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label htmlFor="total_amount" className="block mb-1">Total Amount</label>
        <input
          type="number"
          id="total_amount"
          name="total_amount"
          value={formData.total_amount}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label htmlFor="accessories_amount" className="block mb-1">Accessories Amount</label>
        <input
          type="number"
          id="accessories_amount"
          name="accessories_amount"
          value={formData.accessories_amount}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label htmlFor="warranty_price" className="block mb-1">Warranty Price</label>
        <input
          type="number"
          id="warranty_price"
          name="warranty_price"
          value={formData.warranty_price}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label htmlFor="warranty_cost" className="block mb-1">Warranty Cost</label>
        <input
          type="number"
          id="warranty_cost"
          name="warranty_cost"
          value={formData.warranty_cost}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label htmlFor="maintenance_amount" className="block mb-1">Maintenance Amount</label>
        <input
          type="number"
          id="maintenance_amount"
          name="maintenance_amount"
          value={formData.maintenance_amount}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Submit Sale
      </button>
    </form>
  )
}

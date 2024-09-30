import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function VehicleForm() {
  const supabase = useSupabaseClient()
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    stock_number: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from('vehicles').insert([formData])
    if (error) {
      console.error('Error inserting vehicle:', error)
    } else {
      console.log('Vehicle inserted successfully:', data)
      setFormData({ make: '', model: '', year: '', vin: '', stock_number: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="make" className="block mb-1">Make</label>
        <input
          type="text"
          id="make"
          name="make"
          value={formData.make}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label htmlFor="model" className="block mb-1">Model</label>
        <input
          type="text"
          id="model"
          name="model"
          value={formData.model}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label htmlFor="year" className="block mb-1">Year</label>
        <input
          type="number"
          id="year"
          name="year"
          value={formData.year}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label htmlFor="vin" className="block mb-1">VIN</label>
        <input
          type="text"
          id="vin"
          name="vin"
          value={formData.vin}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label htmlFor="stock_number" className="block mb-1">Stock Number</label>
        <input
          type="text"
          id="stock_number"
          name="stock_number"
          value={formData.stock_number}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Add Vehicle
      </button>
    </form>
  )
}

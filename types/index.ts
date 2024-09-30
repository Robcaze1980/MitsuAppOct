export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'salesperson'
}

export interface Sale {
  id: string
  customer_name: string
  vehicle_id: string
  total_amount: number
  accessories_amount: number
  warranty_price: number
  warranty_cost: number
  maintenance_amount: number
  salesperson_id: string
  created_at: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  vin: string
  stock_number: string
}

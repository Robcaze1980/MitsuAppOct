// sales.ts
export interface Customer {
  first_name: string;
  last_name: string;
  // Add other relevant fields from the customers table
}

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  // Add other relevant fields from the vehicles table
}

export interface Sale { 
  id: string;
  date: string;
  stock_number: string;
  sale_price: number;
  accessory_price: number;
  warranty_price: number;
  warranty_cost: number;
  maintenance_price: number;
  maintenance_cost: number;
  bonus: number;
  trade_in: number;
  shared: boolean;
  shared_with_email: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  ethnicity: string;
  monthly_income: number;
  tin_ssn: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  customer_id: string;
  vehicle_id: string;
  auth_users_id: string;
  type: "New" | "Used";
  customer?: Customer;
  vehicle?: Vehicle;
  salesperson_id: string;
}
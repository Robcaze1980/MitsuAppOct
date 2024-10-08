// types/supabase.ts

export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  ethnicity: string;
  monthly_income: number;
  tin_ssn: boolean; // Change this to boolean
};

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  stock_number: string;
  vin: string;
};

export interface Sale {
  id: string;
  date: string;
  stock_number: string;
  salesperson_id: string | null;  // Changed to allow null
  sale_price: number;
  accessory_price: number;
  warranty_price: number;
  warranty_cost: number;
  maintenance_price: number;
  bonus: number;
  trade_in: number;
  shared: boolean;
  shared_with_salesperson_id: string | null;  // Changed to allow null
  customer_id: string | null;  // Changed to allow null
  vehicle_id: string | null;  // Changed to allow null
  type: 'New' | 'Used';  // Changed to specific string literal type
  maintenance_cost: number;
  accessory_cost: number;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  ethnicity: string;
  monthly_income: number;
  tin_ssn: boolean;
  make: string;
  model: string;
  year: number;
  vin: string;
}

export type SaleWithRelations = Sale & {
  customers?: Customer;
  vehicles?: Vehicle;
};

export type Salesperson = {
  id: string;
  name: string;
  email: string;
};
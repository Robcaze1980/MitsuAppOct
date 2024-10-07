// types/supabase.ts

export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  ethnicity: string;
  monthly_income: number;
  tin_ssn: string;
};

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  stock_number: string;
  vin: string;
};

// Mantenemos la definición de Sale aquí y le añadimos las referencias a Customer y Vehicle
export type Sale = {
  id: string;
  date: string;
  stock_number: string;
  salesperson_id: string;
  sale_price: number;
  accessory_price: number;
  warranty_price: number;
  warranty_cost: number;
  maintenance_price: number;
  maintenance_cost: number;
  bonus: number;
  trade_in: number;
  shared: boolean;
  shared_with_email: string | null;
  type: 'New' | 'Used';
  customer_id: string;
  vehicle_id: string;
  auth_users_id: string;

  // Añadimos las propiedades de Customer y Vehicle para acceder a ellas más fácilmente
  customers?: Customer;
  vehicles?: Vehicle;
};

export type SalespersonSupabase = {
  id: string;
  name: string;
  email: string;
};


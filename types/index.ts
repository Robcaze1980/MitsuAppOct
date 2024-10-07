// types/index.ts

export * from './supabase';    // Exportamos todos los tipos desde supabase.ts, incluido SalespersonSupabase
export * from './salesperson'; // Exportamos el tipo Salesperson de salesperson.ts

// Exportar interfaces adicionales
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'salesperson';
}

export interface Bonus {
  id: string;
  sale_id: string;
  type: string;
  amount: number;
  status: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

// Extender la interfaz Customer si es necesario
export interface ExtendedCustomer extends Customer {
  otherEthnicity?: string;
}

// types/index.ts

export interface Sale {
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
}

// Export other interfaces as needed

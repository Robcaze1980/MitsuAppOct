export interface Sale {
  id: string;
  date: string;
  stock_number: string;
  sale_price: number;
  accessory_price: number;
  warranty_price: number;
  warranty_cost: number;
  maintenance_price: number;
  maintenance_cost: number; // Add this line
  bonus: number;
  trade_in: number;
  shared: boolean;
  shared_with_email: string | null;
  auth_users_id: string;
  customer_id: string;
  vehicle_id: string;
  salesperson_id: string;
  customers?: {
    first_name: string;
    last_name: string;
    age: number;
    gender: string;
    ethnicity: string;
    monthly_income: number;
    tin_ssn: string;
  };
  vehicles?: {
    make: string;
    model: string;
    year: number;
    vin: string;
  };
}
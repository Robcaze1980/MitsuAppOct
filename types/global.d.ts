// types/global.d.ts

import { Database as DB } from './supabase';

declare global {
  type Database = DB;
  type Customer = DB['public']['Tables']['customers']['Row'];
  type Vehicle = DB['public']['Tables']['vehicles']['Row'];
  type Sale = DB['public']['Tables']['sales']['Row']; // Reference to the Sale type from supabase.ts
}

export {}; // Ensures the file is treated as a module

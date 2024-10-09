'use client';

import SaleForm from '@/components/SaleForm';
import { Sale } from '@/types/supabase';

export default function SalesPage() {
  const handleSubmit = async (sale: Sale) => {
    // Implement the logic to submit the sale
    console.log('Sale submitted:', sale);
    // You might want to add API call or state update here
  };

  return (
    <div>
      <SaleForm 
        onSubmit={handleSubmit}
        onSaleAdded={() => {
          console.log('Sale Added');
        }} 
        onClose={() => {
          console.log('Sale Form Closed');
        }}
      />
    </div>
  );
}


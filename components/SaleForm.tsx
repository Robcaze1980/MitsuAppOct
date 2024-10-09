// components/SaleForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { calculateCommission } from '@/lib/commissionCalculations';
import { Sale } from '@/types/supabase';

interface SaleFormProps {
  onSubmit: (sale: Sale) => Promise<void>;
  onSaleAdded: () => void;
  onClose: () => void;
  initialData?: Sale | null;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSubmit, onSaleAdded, onClose, initialData }) => {
  const [saleData, setSaleData] = useState<Sale>(() => {
    if (initialData) {
      return initialData;
    }
    return {
      id: '',
      date: new Date().toISOString().split('T')[0],
      stock_number: '',
      salesperson_id: '',
      sale_price: 0,
      accessory_price: 0,
      accessory_cost: 0,
      warranty_price: 0,
      warranty_cost: 0,
      maintenance_price: 0,
      maintenance_cost: 0,
      bonus: 0,
      trade_in: 0,
      shared: false,
      shared_with_salesperson_id: null,
      customer_id: null,
      vehicle_id: null,
      type: 'New',
      first_name: '',
      last_name: '',
      age: 0,
      gender: '',
      ethnicity: '',
      monthly_income: 0,
      tin_ssn: false,
      make: '',
      model: '',
      year: 0,
      vin: '',
    };
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSubmit(saleData);
      onSaleAdded();
      onClose();
    } catch (error) {
      console.error('Error submitting sale:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields go here */}
    </form>
  );
};

export default SaleForm; // Ensure this line is present
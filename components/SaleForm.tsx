// components/SaleForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { calculateCommission } from '@/lib/commissionCalculations';
import { Sale, Salesperson } from '@/types/supabase';

interface SaleFormProps {
  onSubmit: (sale: Sale) => Promise<void>;
  onSaleAdded: () => void;
  onClose: () => void;
  initialData?: Sale | null;
}

type SaleType = 'New' | 'Used';

type SaleFormData = Omit<Sale, 'id' | 'customer_id' | 'vehicle_id'> & {
  type: SaleType;
};

export default function SaleForm({ onSubmit, onSaleAdded, onClose, initialData }: SaleFormProps) {
  const supabase = createClientComponentClient();

  const [saleData, setSaleData] = useState<SaleFormData>({
    date: initialData?.date ?? new Date().toISOString().split('T')[0],
    stock_number: initialData?.stock_number ?? '',
    salesperson_id: initialData?.salesperson_id ?? '',
    shared_with_salesperson_id: initialData?.shared_with_salesperson_id ?? '',
    sale_price: initialData?.sale_price ?? 0,
    accessory_price: initialData?.accessory_price ?? 0,
    accessory_cost: initialData?.accessory_cost ?? 0, // Add this line
    warranty_price: initialData?.warranty_price ?? 0,
    warranty_cost: initialData?.warranty_cost ?? 0,
    maintenance_price: initialData?.maintenance_price ?? 0,
    maintenance_cost: initialData?.maintenance_cost ?? 0,
    bonus: initialData?.bonus ?? 0,
    trade_in: initialData?.trade_in ?? 0,
    shared: initialData?.shared ?? false,
    type: initialData?.type as SaleType ?? 'New',
    first_name: initialData?.first_name ?? '',
    last_name: initialData?.last_name ?? '',
    age: initialData?.age ?? 0,
    gender: initialData?.gender ?? '',
    ethnicity: initialData?.ethnicity ?? '',
    monthly_income: initialData?.monthly_income ?? 0,
    tin_ssn: initialData?.tin_ssn ?? false,
    make: initialData?.make ?? '',
    model: initialData?.model ?? '',
    year: initialData?.year ?? new Date().getFullYear(),
    vin: initialData?.vin ?? '',
  });

  const [error, setError] = useState<string | null>(null);
  const [totalCommission, setTotalCommission] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);

  useEffect(() => {
    const newCommission = calculateCommission({
      ...saleData,
      salesperson_id: saleData.salesperson_id || undefined
    });
    setTotalCommission(newCommission);
  }, [saleData]);

  useEffect(() => {
    async function fetchSalespeople() {
      const { data, error } = await supabase.from('salespeople').select('*');
      if (error) {
        console.error('Error fetching salespeople:', error);
      } else if (data) {
        setSalespeople(data);
      }
    }
    fetchSalespeople();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSaleData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? parseFloat(value) || 0
          : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(saleData as Sale);
      onSaleAdded();
    } catch (error) {
      console.error('Error submitting sale:', error);
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (label: string, name: keyof SaleFormData, type: string = 'text', required: boolean = true) => (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={saleData[name] as string | number}
        onChange={handleChange}
        className="w-full p-1 border rounded text-sm"
        required={required}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-lg max-w-4xl mx-auto text-sm">
      <h2 className="text-xl font-bold mb-4 text-center text-red-600">
        {initialData ? 'Edit Sale' : 'New Sale'}
      </h2>

      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Sales Details */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Sales Details</h3>
        <div className="grid grid-cols-3 gap-3">
          {renderInput('Date', 'date', 'date')}
          {renderInput('Stock Number', 'stock_number')}
          {renderInput('Sale Price', 'sale_price', 'number')}
          {renderInput('Accessory Price', 'accessory_price', 'number')}
          {/* Remove the Accessory Cost input as requested */}
          {renderInput('Warranty Price', 'warranty_price', 'number')}
          {renderInput('Warranty Cost', 'warranty_cost', 'number')}
          {renderInput('Maintenance Price', 'maintenance_price', 'number')}
          {renderInput('Maintenance Cost', 'maintenance_cost', 'number')}
          {renderInput('Bonus', 'bonus', 'number')}
          {renderInput('Trade-In', 'trade_in', 'number')}
          <div className="mb-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="shared"
                checked={saleData.shared}
                onChange={handleChange}
                className="mr-1"
              />
              <span className="text-sm font-medium text-blue-600">Shared Commission</span>
            </label>
          </div>
          {saleData.shared && (
            <div className="mb-2">
              <label className="block text-sm font-medium text-blue-600 mb-1">Shared With</label>
              <select
                name="shared_with_salesperson_id"
                value={saleData.shared_with_salesperson_id || ''}
                onChange={handleChange}
                className="w-full p-1 border rounded text-sm"
                required
              >
                <option value="">Select Salesperson</option>
                {salespeople.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Vehicle Details</h3>
        <div className="grid grid-cols-3 gap-3">
          {renderInput('Make', 'make')}
          {renderInput('Model', 'model')}
          {renderInput('Year', 'year', 'number')}
          {renderInput('VIN', 'vin')}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={saleData.type}
              onChange={handleChange}
              className="w-full p-1 border rounded text-sm"
              required
            >
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Customer Details</h3>
        <div className="grid grid-cols-3 gap-3">
          {renderInput('First Name', 'first_name')}
          {renderInput('Last Name', 'last_name')}
          {renderInput('Age', 'age', 'number')}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={saleData.gender}
              onChange={handleChange}
              className="w-full p-1 border rounded text-sm"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          {renderInput('Country', 'ethnicity')}
          {renderInput('Monthly Income', 'monthly_income', 'number')}
          <div className="mb-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="tin_ssn"
                checked={saleData.tin_ssn}
                onChange={handleChange}
                className="mr-1"
              />
              <span className="text-sm font-medium text-blue-600">Has ITIN-Social Security</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-md font-semibold">
          Total Commission: <span className="text-red-600">${totalCommission.toFixed(2)}</span>
        </p>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          type="submit"
          className={`flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : initialData ? 'Update Sale' : 'Record Sale'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
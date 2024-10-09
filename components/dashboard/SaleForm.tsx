import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// Remove or comment out the Database import if it's not being used
// import type { Database } from '@/types/supabase';
import type { Sale } from '@/types';
import type { Salesperson } from '@/types/salesperson';

interface SaleFormProps {
  onSaleAdded: () => void;
  onClose: () => void;
}

type SaleFormData = {
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
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  ethnicity: string;
  otherEthnicity: string;
  monthly_income: number;
  has_itin_ssn: 'Yes' | 'No';
  itin_ssn: string;
  make: string;
  model: string;
  year: number;
  vin: string;
};

export default function SaleForm({ onSaleAdded, onClose }: SaleFormProps) {
  const [saleData, setSaleData] = useState<SaleFormData>(() => ({
    date: new Date().toISOString().split('T')[0],
    stock_number: '',
    salesperson_id: '',
    sale_price: 0,
    accessory_price: 0,
    warranty_price: 0,
    warranty_cost: 0,
    maintenance_price: 0,
    maintenance_cost: 0,
    bonus: 0,
    trade_in: 0,
    shared: false,
    shared_with_email: null,
    type: 'New',
    first_name: '',
    last_name: '',
    age: 0,
    gender: '',
    ethnicity: '',
    otherEthnicity: '',
    monthly_income: 0,
    has_itin_ssn: 'No',
    itin_ssn: '',
    make: '',
    model: '',
    year: 0,
    vin: '',
  }));

  const [error, setError] = useState<string | null>(null);
  const [totalCommission, setTotalCommission] = useState(0);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const supabase = createClientComponentClient<Database>();

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
    setSaleData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
               type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  useEffect(() => {
    calculateTotalCommission();
  }, [saleData]);

  const calculateTotalCommission = () => {
    const commission = saleData.sale_price * 0.05; // Example: 5% commission
    setTotalCommission(commission);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ... (rest of the submit logic remains the same)
  };

  const ethnicityOptions = [
    "African American", "Asian", "Caucasian", "Hispanic",
    "Native American", "Pacific Islander", "Other"
  ];

  return (
    <div className="relative bg-white p-6 rounded-lg shadow-lg">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" id="date" name="date" value={saleData.date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="stock_number" className="block text-sm font-medium text-gray-700">Stock #</label>
            <input type="text" id="stock_number" name="stock_number" value={saleData.stock_number} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="salesperson_id" className="block text-sm font-medium text-gray-700">Salesperson</label>
            <select id="salesperson_id" name="salesperson_id" value={saleData.salesperson_id} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              <option value="">Select Salesperson</option>
              {salespeople.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Sale Type</label>
            <select id="type" name="type" value={saleData.type} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>
          </div>
          <div>
            <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700">Sale Price</label>
            <input type="number" id="sale_price" name="sale_price" value={saleData.sale_price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="accessory_price" className="block text-sm font-medium text-gray-700">Accessory Price</label>
            <input type="number" id="accessory_price" name="accessory_price" value={saleData.accessory_price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="warranty_price" className="block text-sm font-medium text-gray-700">Warranty Price</label>
            <input type="number" id="warranty_price" name="warranty_price" value={saleData.warranty_price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="warranty_cost" className="block text-sm font-medium text-gray-700">Warranty Cost</label>
            <input type="number" id="warranty_cost" name="warranty_cost" value={saleData.warranty_cost} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="maintenance_price" className="block text-sm font-medium text-gray-700">Maintenance Price</label>
            <input type="number" id="maintenance_price" name="maintenance_price" value={saleData.maintenance_price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="maintenance_cost" className="block text-sm font-medium text-gray-700">Maintenance Cost</label>
            <input type="number" id="maintenance_cost" name="maintenance_cost" value={saleData.maintenance_cost} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="bonus" className="block text-sm font-medium text-gray-700">Bonus</label>
            <input type="number" id="bonus" name="bonus" value={saleData.bonus} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="trade_in" className="block text-sm font-medium text-gray-700">Trade-In Value</label>
            <input type="number" id="trade_in" name="trade_in" value={saleData.trade_in} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="shared" className="block text-sm font-medium text-gray-700">Shared Sale</label>
            <input type="checkbox" id="shared" name="shared" checked={saleData.shared} onChange={handleChange} className="mt-1 rounded" />
          </div>
          {saleData.shared && (
            <div>
              <label htmlFor="shared_with_email" className="block text-sm font-medium text-gray-700">Shared With (Email)</label>
              <input type="email" id="shared_with_email" name="shared_with_email" value={saleData.shared_with_email || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
            </div>
          )}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Customer First Name</label>
            <input type="text" id="first_name" name="first_name" value={saleData.first_name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Customer Last Name</label>
            <input type="text" id="last_name" name="last_name" value={saleData.last_name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
            <input type="number" id="age" name="age" value={saleData.age} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <select id="gender" name="gender" value={saleData.gender} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700">Ethnicity</label>
            <select id="ethnicity" name="ethnicity" value={saleData.ethnicity} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              <option value="">Select Ethnicity</option>
              {ethnicityOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          {saleData.ethnicity === 'Other' && (
            <div>
              <label htmlFor="otherEthnicity" className="block text-sm font-medium text-gray-700">Specify Ethnicity</label>
              <input type="text" id="otherEthnicity" name="otherEthnicity" value={saleData.otherEthnicity} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
            </div>
          )}
          <div>
            <label htmlFor="monthly_income" className="block text-sm font-medium text-gray-700">Monthly Income</label>
            <input type="number" id="monthly_income" name="monthly_income" value={saleData.monthly_income} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="has_itin_ssn" className="block text-sm font-medium text-gray-700">Has ITIN/SSN</label>
            <select 
              id="has_itin_ssn" 
              name="has_itin_ssn" 
              value={saleData.has_itin_ssn} 
              onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          {saleData.has_itin_ssn === 'Yes' && (
            <div>
              <label htmlFor="itin_ssn" className="block text-sm font-medium text-gray-700">ITIN/SSN</label>
              <input 
                type="text" 
                id="itin_ssn" 
                name="itin_ssn" 
                value={saleData.itin_ssn} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" 
              />
            </div>
          )}
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700">Make</label>
            <input type="text" id="make" name="make" value={saleData.make} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
            <input type="text" id="model" name="model" value={saleData.model} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
            <input type="number" id="year" name="year" value={saleData.year} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
          <div>
            <label htmlFor="vin" className="block text-sm font-medium text-gray-700">VIN</label>
            <input type="text" id="vin" name="vin" value={saleData.vin} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Commission</label>
          <p className="text-xl font-bold">${totalCommission.toFixed(2)}</p>
        </div>
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Record Sale
        </button>
        {error && <p className="text-red-500 text-xs italic">{error}</p>}
      </form>
    </div>
  );
}
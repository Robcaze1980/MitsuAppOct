// components/SaleForm.tsx
import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { calculateCommission } from '@/lib/commissionCalculations';
import { Customer, Sale, Vehicle, Salesperson } from '@/types/supabase';

interface SaleFormProps {
  onSaleAdded: () => void;
  onClose: () => void;
  initialData?: Sale | null;
}

type SaleFormData = Omit<Sale, 'id' | 'customer_id' | 'vehicle_id' | 'auth_users_id'>;
type VehicleFormData = Omit<Vehicle, 'id'>;

interface StatsData {
  totalSales: number;
  totalCommission: number;
  numberOfSales: number;
  sharedSales: number;
}

export default function SaleForm({ onSaleAdded, onClose, initialData }: SaleFormProps) {
  const supabase = createClientComponentClient();

  // State for sale data
  const [saleData, setSaleData] = useState<SaleFormData>({
    date: initialData ? initialData.date : new Date().toISOString().split('T')[0],
    stock_number: initialData ? initialData.stock_number : '',
    salesperson_id: initialData ? initialData.salesperson_id : '',
    sale_price: initialData ? initialData.sale_price : 0,
    accessory_price: initialData ? initialData.accessory_price : 0,
    warranty_price: initialData ? initialData.warranty_price : 0,
    warranty_cost: initialData ? initialData.warranty_cost : 0,
    maintenance_price: initialData ? initialData.maintenance_price : 0,
    maintenance_cost: initialData ? initialData.maintenance_cost : 0,
    bonus: initialData ? initialData.bonus : 0,
    trade_in: initialData ? initialData.trade_in : 0,
    shared: initialData ? initialData.shared : false,
    shared_with_email: initialData ? initialData.shared_with_email : null,
    type: initialData ? initialData.type : 'New',
  });

  // State for customer data
  const [customerData, setCustomerData] = useState<Omit<Customer, 'id'>>({
    first_name: '',
    last_name: '',
    age: 0,
    gender: '',
    ethnicity: '',
    monthly_income: 0,
    tin_ssn: '',
  });

  // State for vehicle data
  const [vehicleData, setVehicleData] = useState<VehicleFormData>({
    make: '',
    model: '',
    year: 0,
    stock_number: '',
    vin: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [totalCommission, setTotalCommission] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [existingVehicles, setExistingVehicles] = useState<Vehicle[]>([]);

  const [currentStats, setCurrentStats] = useState<StatsData>({
    totalSales: 0,
    totalCommission: 0,
    numberOfSales: 0,
    sharedSales: 0,
  });
  const [previousStats, setPreviousStats] = useState<StatsData>({
    totalSales: 0,
    totalCommission: 0,
    numberOfSales: 0,
    sharedSales: 0,
  });

  // Calculate total commission whenever saleData changes
  useEffect(() => {
    const newCommission = calculateCommission({ ...saleData });
    setTotalCommission(newCommission);
  }, [saleData]);

  // Fetch salespeople and existing vehicles
  useEffect(() => {
    async function fetchSalespeople() {
      const { data, error } = await supabase.from('salespeople').select('*');
      if (error) {
        console.error('Error fetching salespeople:', error);
      } else if (data) {
        setSalespeople(data);
      }
    }

    async function fetchExistingVehicles() {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) {
        console.error('Error fetching vehicles:', error);
      } else if (data) {
        setExistingVehicles(data);
      }
    }

    fetchSalespeople();
    fetchExistingVehicles();

    if (initialData) {
      // Fetch customer data
      supabase
        .from('customers')
        .select('*')
        .eq('id', initialData.customer_id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching customer:', error);
          } else if (data) {
            setCustomerData({
              first_name: data.first_name,
              last_name: data.last_name,
              age: data.age,
              gender: data.gender,
              ethnicity: data.ethnicity,
              monthly_income: data.monthly_income,
              tin_ssn:
                typeof data.tin_ssn === 'string' ? data.tin_ssn : String(data.tin_ssn || ''),
            });
          }
        });

      // Fetch vehicle data
      supabase
        .from('vehicles')
        .select('*')
        .eq('id', initialData.vehicle_id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching vehicle:', error);
          } else if (data) {
            setVehicleData({
              make: data.make,
              model: data.model,
              year: data.year,
              stock_number: data.stock_number,
              vin: data.vin,
            });
          }
        });
    }
  }, [supabase, initialData]);

  // Fetch stats and previous month stats
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-based
    const currentYear = currentDate.getFullYear();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentStatsData = await getMonthStats(currentYear, currentMonth);
    const previousStatsData = await getMonthStats(previousYear, previousMonth);

    setCurrentStats(currentStatsData);
    setPreviousStats(previousStatsData);
  };

  const getMonthStats = async (year: number, month: number): Promise<StatsData> => {
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from('sales')
      .select('sale_price, bonus, shared')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      console.error('Error fetching stats:', error);
      return {
        totalSales: 0,
        totalCommission: 0,
        numberOfSales: 0,
        sharedSales: 0,
      };
    }

    const totalSales = data?.reduce((sum, sale) => sum + sale.sale_price, 0) || 0;
    const totalCommission = data?.reduce((sum, sale) => sum + sale.bonus, 0) || 0;
    const numberOfSales = data?.length || 0;
    const sharedSales = data?.filter((sale) => sale.shared).length || 0;

    return {
      totalSales,
      totalCommission,
      numberOfSales,
      sharedSales,
    };
  };

  // Calculate percentage change
  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Render stat card with percentage change
  const renderStatCard = (
    title: string,
    value: string | number,
    change: number
  ) => {
    const isIncrease = change >= 0;
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p
          className={`text-sm mt-1 ${
            isIncrease ? 'text-green-500' : 'text-red-500'
          } flex items-center`}
        >
          {isIncrease ? (
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          {Math.abs(change).toFixed(2)}%
        </p>
      </div>
    );
  };

  // Handle changes in sale data
  const handleSaleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
  };

  // Handle changes in customer data
  const handleCustomerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  // Handle changes in vehicle data
  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setVehicleData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    if (
      typeof customerData.tin_ssn !== 'string' ||
      customerData.tin_ssn.trim() === ''
    ) {
      setError('TIN/SSN is required.');
      return false;
    }
    if (typeof vehicleData.vin !== 'string' || !vehicleData.vin.trim()) {
      setError('VIN is required.');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      // Insert or update customer
      const customerDataToUpsert: Omit<Customer, 'id'> = {
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        age: customerData.age,
        gender: customerData.gender,
        ethnicity: customerData.ethnicity,
        monthly_income: customerData.monthly_income,
        tin_ssn: customerData.tin_ssn.trim(),
      };
      const { data: insertedCustomer, error: customerError } = await supabase
        .from('customers')
        .upsert([customerDataToUpsert], { onConflict: 'tin_ssn' })
        .select()
        .single();
      if (customerError) throw customerError;
      if (!insertedCustomer || !insertedCustomer.id)
        throw new Error('Failed to upsert customer.');

      // Check if the VIN already exists
      const existingVehicle = existingVehicles.find(
        (vehicle) =>
          vehicle.vin.toLowerCase() === vehicleData.vin.trim().toLowerCase()
      );

      let vehicleId: string;

      if (existingVehicle) {
        // VIN exists, use existing vehicle's ID
        vehicleId = existingVehicle.id;
      } else {
        // VIN does not exist, create a new vehicle
        const vehicleDataToUpsert: Omit<Vehicle, 'id'> = {
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          stock_number: vehicleData.stock_number,
          vin: vehicleData.vin.trim(),
        };
        const { data: insertedVehicle, error: vehicleError } = await supabase
          .from('vehicles')
          .upsert([vehicleDataToUpsert], { onConflict: 'vin' })
          .select()
          .single();
        if (vehicleError) throw vehicleError;
        if (!insertedVehicle || !insertedVehicle.id)
          throw new Error('Failed to upsert vehicle.');
        vehicleId = insertedVehicle.id;

        // Update existingVehicles state
        setExistingVehicles((prev) => [...prev, insertedVehicle]);
      }

      // Prepare sale data
      const fullSaleData: Omit<Sale, 'id'> = {
        ...saleData,
        customer_id: insertedCustomer.id,
        vehicle_id: vehicleId,
        auth_users_id: user.id,
      };

      if (initialData?.id) {
        const { data, error } = await supabase
          .from('sales')
          .update(fullSaleData)
          .eq('id', initialData.id)
          .select()
          .single();
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('sales')
          .insert([fullSaleData])
          .select()
          .single();
        if (error) throw error;
      }

      onSaleAdded();
    } catch (error) {
      console.error('Error submitting/updating sale:', error);
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {renderStatCard(
          'Total Sales This Month',
          `$${currentStats.totalSales.toLocaleString()}`,
          calculatePercentageChange(currentStats.totalSales, previousStats.totalSales)
        )}
        {renderStatCard(
          'Total Commission',
          `$${currentStats.totalCommission.toLocaleString()}`,
          calculatePercentageChange(currentStats.totalCommission, previousStats.totalCommission)
        )}
        {renderStatCard(
          'Number of Sales',
          currentStats.numberOfSales,
          calculatePercentageChange(currentStats.numberOfSales, previousStats.numberOfSales)
        )}
        {renderStatCard(
          'Shared Sales',
          currentStats.sharedSales,
          calculatePercentageChange(currentStats.sharedSales, previousStats.sharedSales)
        )}
      </div>

      {/* Sale Form Section */}
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sale Data Fields */}
          <h2 className="text-xl font-bold text-red-600 border-b pb-2">Sale Information</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Date Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                name="date"
                type="date"
                value={saleData.date}
                onChange={handleSaleChange}
                className="w-full mt-1 p-2 rounded"
                required
                autoComplete="bday" // Adjust based on your requirements
              />
            </div>
            {/* Stock Number Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Stock Number</label>
              <input
                name="stock_number"
                value={vehicleData.stock_number}
                onChange={handleVehicleChange}
                className="w-full mt-1 p-2 rounded"
                required
                autoComplete="off"
              />
            </div>
            {/* VIN Number Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">VIN Number</label>
              <input
                name="vin"
                type="text"
                value={vehicleData.vin}
                onChange={handleVehicleChange}
                placeholder="Enter VIN"
                className="w-full mt-1 p-2 rounded"
                required
                autoComplete="off"
              />
              {vehicleData.vin &&
                existingVehicles.find(
                  (v) => v.vin.toLowerCase() === vehicleData.vin.trim().toLowerCase()
                ) && (
                  <p className="text-green-600 text-xs mt-1">
                    VIN exists. Sale will be linked to existing vehicle.
                  </p>
                )}
            </div>
            {/* Make Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Make</label>
              <input
                name="make"
                value={vehicleData.make}
                onChange={handleVehicleChange}
                className="w-full mt-1 p-2 rounded"
                required
                autoComplete="off"
              />
            </div>
            {/* Model Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <input
                name="model"
                value={vehicleData.model}
                onChange={handleVehicleChange}
                className="w-full mt-1 p-2 rounded"
                required
                autoComplete="off"
              />
            </div>
            {/* Year Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input
                name="year"
                type="number"
                value={vehicleData.year}
                onChange={handleVehicleChange}
                className="w-full mt-1 p-2 rounded"
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                autoComplete="off"
              />
            </div>
            {/* Sale Price Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Sale Price</label>
              <input
                name="sale_price"
                type="number"
                value={saleData.sale_price}
                onChange={handleSaleChange}
                className="w-full mt-1 p-2 rounded"
                required
                min="0"
                step="0.01"
                autoComplete="off"
              />
            </div>
            {/* Accessory Price Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Accessory Price</label>
              <input
                name="accessory_price"
                type="number"
                value={saleData.accessory_price}
                onChange={handleSaleChange}
                className="w-full mt-1 p-2 rounded"
                min="0"
                step="0.01"
                autoComplete="off"
              />
            </div>
            {/* Warranty Price Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Warranty Price</label>
              <input
                name="warranty_price"
                type="number"
                value={saleData.warranty_price}
                onChange={handleSaleChange}
                className="w-full mt-1 p-2 rounded"
                min="0"
                step="0.01"
                autoComplete="off"
              />
            </div>
            {/* Warranty Cost Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Warranty Cost</label>
              <input
                name="warranty_cost"
                type="number"
                value={saleData.warranty_cost}
                onChange={handleSaleChange}
                className="w-full mt-1 p-2 rounded"
                min="0"
                step="0.01"
                autoComplete="off"
              />
            </div>
            {/* Maintenance Price Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Maintenance Price</label>
              <input
                name="maintenance_price"
                type="number"
                value={saleData.maintenance_price}
                onChange={handleSaleChange}
                className="w-full mt-1 p-2 rounded"
                min="0"
                step="0.01"
                autoComplete="off"
              />
            </div>
            {/* Maintenance Cost Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Maintenance Cost</label>
              <input
                name="maintenance_cost"
                type="number"
                value={saleData.maintenance_cost}
                onChange={handleSaleChange}
                className="w-full mt-1 p-2 rounded"
                min="0"
                step="0.01"
                autoComplete="off"
              />
            </div>
            {/* Bonus Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Bonus</label>
              <input
                name="bonus"
                type="number"
                value={saleData.bonus}
                onChange={handleSaleChange}
                className="w-full mt-1 p-2 rounded"
                min="0"
                step="0.01"
                autoComplete="off"
              />
            </div>
            {/* Trade-In Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Trade-In</label>
              <input
                name="trade_in"
                type="number"
                value={saleData.trade_in}
                onChange={handleSaleChange}
                className="w-full mt-1 p-2 rounded"
                min="0"
                step="0.01"
                autoComplete="off"
              />
            </div>
            {/* Shared Commission Field */}
            <div className="border border-gray-300 p-2 rounded col-span-2">
              <label className="block text-sm font-medium text-gray-700">Shared Commission</label>
              <div className="flex items-center mt-1">
                <input
                  name="shared"
                  type="checkbox"
                  checked={saleData.shared}
                  onChange={handleSaleChange}
                  className="mr-2"
                  autoComplete="off"
                />
                <span className="text-sm">
                  Share commission with another salesperson
                </span>
              </div>
              {saleData.shared && (
                <input
                  name="shared_with_email"
                  type="email"
                  value={saleData.shared_with_email || ''}
                  onChange={handleSaleChange}
                  placeholder="Enter email of other salesperson"
                  className="w-full mt-2 p-2 rounded"
                  required
                  autoComplete="email"
                />
              )}
            </div>
          </div>

          {/* Customer Data Fields */}
          <h2 className="text-xl font-bold text-red-600 border-b pb-2">Customer Information</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* First Name Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                name="first_name"
                value={customerData.first_name}
                onChange={handleCustomerChange}
                className="w-full mt-1 p-2 rounded"
                required
                autoComplete="given-name"
              />
            </div>
            {/* Last Name Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                name="last_name"
                value={customerData.last_name}
                onChange={handleCustomerChange}
                className="w-full mt-1 p-2 rounded"
                required
                autoComplete="family-name"
              />
            </div>
            {/* Gender Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={customerData.gender}
                onChange={handleCustomerChange}
                className="w-full mt-1 p-2 rounded"
                required
                autoComplete="gender"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {/* Age Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                name="age"
                type="number"
                value={customerData.age}
                onChange={handleCustomerChange}
                className="w-full mt-1 p-2 rounded"
                required
                min="0"
                autoComplete="off"
              />
            </div>
            {/* Ethnicity Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Ethnicity</label>
              <select
                name="ethnicity"
                value={customerData.ethnicity}
                onChange={handleCustomerChange}
                className="w-full mt-1 p-2 rounded"
                required
                autoComplete="off"
              >
                <option value="">Select Ethnicity</option>
                <option value="Hispanic">Hispanic</option>
                <option value="Caucasian">Caucasian</option>
                <option value="African American">African American</option>
                <option value="Asian">Asian</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {/* Monthly Income Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">Monthly Income</label>
              <input
                name="monthly_income"
                type="number"
                value={customerData.monthly_income}
                onChange={handleCustomerChange}
                className="w-full mt-1 p-2 rounded"
                required
                min="0"
                step="0.01"
                autoComplete="off"
              />
            </div>
            {/* TIN/SSN Field */}
            <div className="border border-gray-300 p-2 rounded">
              <label className="block text-sm font-medium text-gray-700">TIN/SSN</label>
              <input
                name="tin_ssn"
                type="text"
                value={customerData.tin_ssn}
                onChange={handleCustomerChange}
                placeholder="Enter TIN or SSN"
                className="w-full mt-1 p-2 rounded"
                required
                autoComplete="tax-id" // Use "off" if "tax-id" isn't widely supported
              />
            </div>
          </div>

          {/* Total Commission and Submit */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Total Commission</label>
            <p className="text-xl font-bold text-red-600">
              ${totalCommission.toFixed(2)}
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
            disabled={isSubmitting}
            // Remove autoComplete attribute from button
          >
            {isSubmitting
              ? 'Submitting...'
              : initialData
              ? 'Update Sale'
              : 'Record Sale'}
          </button>
          {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}

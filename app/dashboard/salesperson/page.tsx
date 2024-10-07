'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Sale, Customer, Vehicle, Salesperson } from '@/types';
import SaleForm from '@/components/SaleForm';
import { calculateCommission } from '@/lib/commissionCalculations';
import Image from 'next/image';
import SideNav from '@/components/dashboard/SideNav';
import TopBar from '@/components/dashboard/TopBar';

// Import additional icons for percentage changes
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const supabase = createClientComponentClient();

// Helper function to format numbers with comma separator and no decimals
const formatNumber = (num: number) => {
  return Math.round(num).toLocaleString('en-US');
};

// Define interface for stats data
interface StatsData {
  totalSales: number;
  totalCommission: number;
  numberOfSales: number;
  sharedSales: number;
}

// Define interface for percentage changes
interface PercentageChange {
  totalSalesChange: number;
  totalCommissionChange: number;
  numberOfSalesChange: number;
  sharedSalesChange: number;
}

// Fetch sales data within a date range
const fetchSalesData = async (startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      customers:customer_id (*),
      vehicles:vehicle_id (*)
    `)
    .gte('date', startDate)
    .lt('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching sales data:', error);
    return [];
  }

  return data || [];
};

export default function SalespersonDashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [sharedSales, setSharedSales] = useState(0);
  const [userName, setUserName] = useState('');
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Format: YYYY-MM

  // State for current and previous month stats
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

  // State for percentage changes
  const [percentageChange, setPercentageChange] = useState<PercentageChange>({
    totalSalesChange: 0,
    totalCommissionChange: 0,
    numberOfSalesChange: 0,
    sharedSalesChange: 0,
  });

  useEffect(() => {
    fetchUserData();
    fetchStats();
  }, [selectedMonth]);

  async function fetchUserData() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) {
        setUserName(user.user_metadata.username || user.email);
      } else {
        setError('No user found. Please log in.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Error fetching user data. Please try again.');
    }
  }

  async function fetchUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setError('Error fetching user profile. Please try again.');
        return null;
      }

      return data;
    }
    return null;
  }

  async function fetchStats() {
    try {
      const userProfile = await fetchUserProfile();
      if (!userProfile) {
        setError('No user profile found. Please log in.');
        return;
      }

      const [currentMonthStats, previousMonthStats] = await Promise.all([
        getMonthStats(selectedMonth),
        getMonthStats(getPreviousMonth(selectedMonth)),
      ]);

      setCurrentStats(currentMonthStats);
      setPreviousStats(previousMonthStats);

      setPercentageChange({
        totalSalesChange: calculatePercentageChange(currentMonthStats.totalSales, previousMonthStats.totalSales),
        totalCommissionChange: calculatePercentageChange(currentMonthStats.totalCommission, previousMonthStats.totalCommission),
        numberOfSalesChange: calculatePercentageChange(currentMonthStats.numberOfSales, previousMonthStats.numberOfSales),
        sharedSalesChange: calculatePercentageChange(currentMonthStats.sharedSales, previousMonthStats.sharedSales),
      });

      const salesData = await fetchSalesData(getStartOfMonth(selectedMonth), getEndOfMonth(selectedMonth));
      setSales(salesData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(`Error fetching stats data: ${(error as Error).message}`);
    }
  }

  // Helper functions to get start and end of month
  const getStartOfMonth = (month: string) => {
    return `${month}-01`;
  };

  const getEndOfMonth = (month: string) => {
    const [year, mon] = month.split('-').map(Number);
    const date = new Date(year, mon, 0, 23, 59, 59);
    return date.toISOString();
  };

  const getPreviousMonth = (month: string) => {
    const [year, mon] = month.split('-').map(Number);
    const previousDate = new Date(year, mon - 1, 1);
    const prevYear = previousDate.getFullYear();
    const prevMonth = previousDate.getMonth() + 1; // Months are 0-based
    return `${prevYear}-${prevMonth < 10 ? '0' + prevMonth : prevMonth}`;
  };

  // Fetch stats for a given month
  const getMonthStats = async (month: string): Promise<StatsData> => {
    const startDate = getStartOfMonth(month);
    const endDate = getEndOfMonth(month);

    const { data, error } = await supabase
      .from('sales')
      .select('sale_price, bonus, shared')
      .gte('date', startDate)
      .lt('date', endDate);

    if (error) {
      console.error('Error fetching month stats:', error);
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
          {isIncrease ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
          {Math.abs(change).toFixed(2)}%
        </p>
      </div>
    );
  };

  // Handle changes in sale data
  const handleEditSale = async (sale: Sale) => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers (*),
          vehicles (*)
        `)
        .eq('id', sale.id)
        .single();

      if (error) throw error;

      if (data) {
        setEditingSale(data);
        setShowSaleForm(true);
      }
    } catch (error) {
      console.error('Error fetching sale data for editing:', error);
      setError('Error fetching sale data for editing. Please try again.');
    }
  };

  const handleSaleAdded = () => {
    setShowSaleForm(false);
    setEditingSale(null);
    fetchStats();
  };

  const handleDeleteSale = async (saleId: string) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        const { error } = await supabase
          .from('sales')
          .delete()
          .eq('id', saleId);

        if (error) throw error;

        fetchStats();
      } catch (error) {
        console.error('Error deleting sale:', error);
        setError('Error deleting sale. Please try again.');
      }
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen">
      <TopBar userName={userName} />
      <div className="flex flex-grow bg-gray-100">
        <SideNav />
        <div className="flex-grow p-4">
          <main className="bg-white rounded-lg shadow-sm h-full overflow-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-red-600">Commission Tracking</h1>
                <p className="text-gray-600">Welcome, {userName.split('@')[0]}!</p>
              </div>
              <div className="text-right">
                <Image
                  src="/images/mitsubishi-logo.png"
                  alt="Mitsubishi Logo"
                  width={300}
                  height={150}
                />
              </div>
            </div>

            <hr className="border-t border-gray-300 my-6" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {renderStatCard(
                'Total Sales This Month',
                `$${formatNumber(currentStats.totalSales)}`,
                percentageChange.totalSalesChange
              )}
              {renderStatCard(
                'Total Commission',
                `$${formatNumber(currentStats.totalCommission)}`,
                percentageChange.totalCommissionChange
              )}
              {renderStatCard(
                'Number of Sales',
                currentStats.numberOfSales,
                percentageChange.numberOfSalesChange
              )}
              {renderStatCard(
                'Shared Sales',
                currentStats.sharedSales,
                percentageChange.sharedSalesChange
              )}
            </div>

            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setShowSaleForm(true)}
                className="bg-red-500 hover:bg-red-700 text-white px-6 py-2 rounded-md text-sm font-semibold transition duration-300 ease-in-out"
              >
                Add Sale
              </button>
              
              <div className="flex items-center">
                <label htmlFor="month-selector" className="mr-2 text-sm font-medium text-gray-700">Select Month:</label>
                <input
                  type="month"
                  id="month-selector"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Stock #</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Accessory</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Warranty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Maint.</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Trade-In</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Bonus</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-200">COMMISSION</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Shared</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vehicle</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length > 0 ? (
                    sales.map((sale) => (
                      <React.Fragment key={sale.id}>
                        <tr className="border-b">
                          <td className="px-4 py-2 text-sm">
                            {sale.date ? new Date(sale.date).toLocaleDateString() : 'Invalid Date'}
                          </td>
                          <td className="px-4 py-2 text-sm">{sale.stock_number}</td>
                          <td className="px-4 py-2 text-sm text-right">${formatNumber(sale.sale_price)}</td>
                          <td className="px-4 py-2 text-sm text-right">${formatNumber(sale.accessory_price)}</td>
                          <td className="px-4 py-2 text-sm text-right">${formatNumber(sale.warranty_price)}</td>
                          <td className="px-4 py-2 text-sm text-right">${formatNumber(sale.maintenance_price)}</td>
                          <td className="px-4 py-2 text-sm text-right">${formatNumber(sale.trade_in)}</td>
                          <td className="px-4 py-2 text-sm text-right">${formatNumber(sale.bonus)}</td>
                          <td className="px-4 py-2 text-sm font-bold bg-gray-200 text-right">${formatNumber(calculateCommission(sale))}</td>
                          <td className="px-4 py-2 text-sm text-center">{sale.shared ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-2 text-sm">
                            {sale.customers ? `${sale.customers.first_name} ${sale.customers.last_name}` : 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {sale.vehicles ? `${sale.vehicles.make} ${sale.vehicles.model} (${sale.vehicles.year})` : 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-center">
                            <button
                              onClick={() => handleEditSale(sale)}
                              className="text-blue-600 hover:text-blue-800 mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSale(sale.id)}
                              className="text-red-600 hover:text-red-800 mr-2"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={13} className="px-4 py-2 text-sm text-center">No sales data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {showSaleForm && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                  <SaleForm
                    onSaleAdded={handleSaleAdded}
                    onClose={() => {
                      setShowSaleForm(false);
                      setEditingSale(null);
                    }}
                    initialData={editingSale}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
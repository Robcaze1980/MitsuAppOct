// app/dashboard/salesperson/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Sale } from '@/types/supabase';
import SaleForm from '@/components/SaleForm';
import { calculateCommission } from '@/lib/commissionCalculations';
import Image from 'next/image';
import SideNav from '@/components/dashboard/SideNav';
import TopBar from '@/components/dashboard/TopBar';
import { FaCaretUp, FaCaretDown } from 'react-icons/fa';

const supabase = createClientComponentClient();

const formatNumber = (num: number | null | undefined) => {
  if (num == null) return '0';
  return Math.round(num).toLocaleString('en-US');
};

interface StatsData {
  totalSales: number;
  totalCommission: number;
  numberOfSales: number;
  sharedSales: number;
  newCarSales: number;  // New Property
  usedCarSales: number; // New Property
}

interface PercentageChange {
  totalSalesChange: number;
  totalCommissionChange: number;
  numberOfSalesChange: number;
  sharedSalesChange: number;
  newCarSalesChange: number;  // New Property
  usedCarSalesChange: number; // New Property
}

export default function SalespersonDashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

  const [currentStats, setCurrentStats] = useState<StatsData>({
    totalSales: 0,
    totalCommission: 0,
    numberOfSales: 0,
    sharedSales: 0,
    newCarSales: 0,  // Initialize
    usedCarSales: 0, // Initialize
  });

  const [previousStats, setPreviousStats] = useState<StatsData>({
    totalSales: 0,
    totalCommission: 0,
    numberOfSales: 0,
    sharedSales: 0,
    newCarSales: 0,  // Initialize
    usedCarSales: 0, // Initialize
  });

  const [percentageChange, setPercentageChange] = useState<PercentageChange>({
    totalSalesChange: 0,
    totalCommissionChange: 0,
    numberOfSalesChange: 0,
    sharedSalesChange: 0,
    newCarSalesChange: 0,  // Initialize
    usedCarSalesChange: 0, // Initialize
  });

  // Add this new state for storing shared salesperson names
  const [sharedSalespersonNames, setSharedSalespersonNames] = useState<{[key: string]: string}>({});

  /**
   * Fetches user data, sales statistics, and sales data for the selected month.
   */
  useEffect(() => {
    fetchUserData();
    fetchStats();
    fetchSalesDataForMonth(selectedMonth);
    setError(null); // Clear error when month changes
  }, [selectedMonth]);

  /**
   * Fetches the authenticated user's data and sets the userName state.
   */
  async function fetchUserData() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
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

  /**
   * Fetches statistics for the selected month and the previous month.
   * Updates the currentStats, previousStats, and percentageChange states.
   */
  const fetchStats = async () => {
    try {
      const [yearStr, monthStr] = selectedMonth.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr) - 1; // JavaScript months are 0-based

      const previousDate = new Date(year, month - 1, 1);
      const previousYear = previousDate.getFullYear();
      const previousMonth = previousDate.getMonth();

      const currentStatsData = await getMonthStats(year, month);
      const previousStatsData = await getMonthStats(previousYear, previousMonth);

      console.log('Current month stats:', currentStatsData);
      console.log('Previous month stats:', previousStatsData);

      setCurrentStats(currentStatsData);
      setPreviousStats(previousStatsData);

      setPercentageChange({
        totalSalesChange: calculatePercentageChange(
          currentStatsData.totalSales,
          previousStatsData.totalSales
        ),
        totalCommissionChange: calculatePercentageChange(
          currentStatsData.totalCommission,
          previousStatsData.totalCommission
        ),
        numberOfSalesChange: calculatePercentageChange(
          currentStatsData.numberOfSales,
          previousStatsData.numberOfSales
        ),
        sharedSalesChange: calculatePercentageChange(
          currentStatsData.sharedSales,
          previousStatsData.sharedSales
        ),
        newCarSalesChange: calculatePercentageChange(
          currentStatsData.newCarSales,
          previousStatsData.newCarSales
        ),
        usedCarSalesChange: calculatePercentageChange(
          currentStatsData.usedCarSales,
          previousStatsData.usedCarSales
        ),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Error fetching statistics. Please try again.');
    }
  };

  /**
   * Fetches statistics for a specific month and year.
   * @param year - The year for which to fetch stats.
   * @param month - The month (0-based) for which to fetch stats.
   * @returns StatsData object containing totalSales, totalCommission, numberOfSales, sharedSales, newCarSales, usedCarSales.
   */
  const getMonthStats = async (year: number, month: number): Promise<StatsData> => {
    const startDate = new Date(Date.UTC(year, month, 1)).toISOString();
    const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)).toISOString();

    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*') // Fetch all fields, including duplicated customer and vehicle fields
        .gte('date', startDate)
        .lt('date', endDate);

      if (error) throw error;

      console.log('Fetched data:', data);

      if (!data || data.length === 0) {
        console.log('No data found for the selected month');
        return { totalSales: 0, totalCommission: 0, numberOfSales: 0, sharedSales: 0, newCarSales: 0, usedCarSales: 0 };
      }

      let totalSales = 0;
      let totalCommission = 0;
      let numberOfSales = 0;
      let sharedSales = 0;
      let newCarSales = 0;  // Initialize
      let usedCarSales = 0; // Initialize

      for (const sale of data) {
        totalSales += sale.sale_price || 0;

        // Use calculateCommission(sale) to compute individual commission
        const commission = calculateCommission(sale);
        if (typeof commission === 'number' && !isNaN(commission)) {
          totalCommission += commission;
        } else {
          console.warn(`Invalid commission for sale ID ${sale.id}, setting to 0`);
          totalCommission += 0;
        }

        numberOfSales++;
        if (sale.shared) sharedSales++;

        // Count New and Used Car Sales
        if (sale.type === 'New') {
          newCarSales++;
        } else if (sale.type === 'Used') {
          usedCarSales++;
        }
      }

      console.log('Calculated stats:', { totalSales, totalCommission, numberOfSales, sharedSales, newCarSales, usedCarSales });

      return { totalSales, totalCommission, numberOfSales, sharedSales, newCarSales, usedCarSales };
    } catch (error) {
      console.error('Error fetching month stats:', error);
      return { totalSales: 0, totalCommission: 0, numberOfSales: 0, sharedSales: 0, newCarSales: 0, usedCarSales: 0 };
    }
  };

  /**
   * Calculates the percentage change between current and previous values.
   * @param current - The current value.
   * @param previous - The previous value.
   * @returns The percentage change.
   */
  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  /**
   * Fetches sales data for the selected month, utilizing duplicated customer and vehicle fields.
   * @param month - The selected month in 'YYYY-MM' format.
   */
  const fetchSalesDataForMonth = async (month: string) => {
    const startDate = getStartOfMonth(month);
    const endDate = getEndOfMonth(month);

    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*, shared_with_salesperson:salespeople!shared_with_salesperson_id(name)')
        .gte('date', startDate)
        .lt('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching sales data:', error);
        setError('Error fetching sales data. Please try again.');
        return;
      }

      setSales(data as Sale[]);
      
      // Create a map of shared salesperson names
      const sharedNames = data.reduce((acc, sale) => {
        if (sale.shared && sale.shared_with_salesperson) {
          acc[sale.id] = sale.shared_with_salesperson.name;
        }
        return acc;
      }, {} as {[key: string]: string});
      setSharedSalespersonNames(sharedNames);

      console.log('Fetched Sales Data:', data);
    } catch (error) {
      console.error('Unexpected error fetching sales data:', error);
      setError('Unexpected error fetching sales data. Please try again.');
    }
  };

  /**
   * Returns the start date of the month in 'YYYY-MM-DD' format.
   * @param month - The month in 'YYYY-MM' format.
   * @returns The start date as a string.
   */
  const getStartOfMonth = (month: string) => {
    return `${month}-01`;
  };

  /**
   * Returns the end date of the month in ISO format.
   * @param month - The month in 'YYYY-MM' format.
   * @returns The end date as a string.
   */
  const getEndOfMonth = (month: string) => {
    const [year, mon] = month.split('-').map(Number);
    const date = new Date(year, mon, 0, 23, 59, 59); // Last day of the month
    return date.toISOString();
  };

  /**
   * Fetches the salesperson's name based on their ID.
   * @param salespersonId - The ID of the salesperson.
   * @returns The name of the salesperson or 'Unknown'.
   */
  const getSalespersonName = async (salespersonId: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('salespeople')
        .select('name')
        .eq('id', salespersonId)
        .single();

      if (error) {
        console.error('Error fetching salesperson name:', error);
        return 'Unknown';
      }

      return data.name;
    } catch (error) {
      console.error('Unexpected error fetching salesperson name:', error);
      return 'Unknown';
    }
  };

  /**
   * Handles adding a new sale with duplicate checks.
   * @param newSale - The sale data to add.
   */
  const handleAddSale = async (newSale: Sale) => {
    try {
      console.log('Attempting to add new sale:', newSale);

      // Check for duplicate VIN or stock number
      const { data: existingSale, error: checkError } = await supabase
        .from('sales')
        .select('id, vin, stock_number, salesperson_id')
        .or(`vin.eq.${newSale.vin},stock_number.eq.${newSale.stock_number}`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking for duplicate sale:', checkError);
        throw new Error('Error checking for duplicate sale. Please try again.');
      }

      if (existingSale) {
        let errorMessage = '';
        if (existingSale.vin === newSale.vin) {
          errorMessage = `A sale with VIN ${newSale.vin} already exists.`;
        } else if (existingSale.stock_number === newSale.stock_number) {
          errorMessage = `A sale with Stock Number ${newSale.stock_number} already exists.`;
        }

        // Fetch the salesperson's name
        const { data: salesperson, error: salespersonError } = await supabase
          .from('salespeople')
          .select('name')
          .eq('id', existingSale.salesperson_id)
          .single();

        if (salespersonError) {
          console.error('Error fetching salesperson:', salespersonError);
        } else if (salesperson) {
          errorMessage += ` It was recorded by ${salesperson.name}.`;
        }

        errorMessage += ' Duplicate sales are not allowed.';
        throw new Error(errorMessage);
      }

      const saleData = {
        ...newSale,
        vin: newSale.vin?.trim() || '',
        stock_number: newSale.stock_number?.trim() || '',
        salesperson_id: newSale.salesperson_id || null,
        customer_id: newSale.customer_id || null,
        vehicle_id: newSale.vehicle_id || null,
      };

      // Only include shared_with_salesperson_id if it's defined and the sale is shared
      if (saleData.shared && saleData.shared_with_salesperson_id) {
        saleData.shared_with_salesperson_id = saleData.shared_with_salesperson_id;
      } else {
        saleData.shared_with_salesperson_id = null;
      }

      const { data: insertData, error: insertError } = await supabase
        .from('sales')
        .insert([saleData]);

      if (insertError) {
        console.error('Error adding sale:', insertError);
        throw new Error('Error adding sale. Please try again.');
      }

      console.log('Sale added successfully:', insertData);

      // Refresh stats and sales data
      handleSaleAdded();
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Unexpected error adding sale:', error);
      setError(`Error adding sale: ${(error as Error).message}`);
    }
  };

  /**
   * Renders a statistic card with title, value, and percentage change.
   * @param value - The value to display.
   * @param title - The title of the statistic.
   * @param change - The percentage change.
   * @returns A JSX element representing the stat card.
   */
  const renderStatCard = (
    value: string | number,
    title: string,
    change: number,
    isUnitComparison: boolean = false,
    valueColor: string = 'text-gray-900'
  ) => {
    console.log(`Rendering stat card for ${title}:`, value);
    const isIncrease = change >= 0;
    const changeText = `${Math.abs(change).toFixed(2)}%`;
    const formattedValue = typeof value === 'number' 
      ? isUnitComparison || title === 'Number of Sales' || title === 'Shared Sales'
        ? Math.round(value).toString()
        : `$${formatNumber(value)}`
      : value;
    return (
      <div className="p-4 rounded-lg shadow-md flex flex-col bg-white">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">{title}</h3>
        <p className={`text-2xl font-bold ${valueColor}`}>
          {formattedValue}
        </p>
        <div className="text-sm mt-1 flex items-center justify-start w-full">
          {isIncrease ? (
            <FaCaretUp className="mr-1 text-green-500" size={28} />
          ) : (
            <FaCaretDown className="mr-1 text-red-500" size={28} />
          )}
          <span className="text-gray-500">
            {changeText} this month
          </span>
        </div>
      </div>
    );
  };

  /**
   * Handles the editing of a sale by setting the editingSale state and showing the SaleForm.
   * @param sale - The sale to edit.
   */
  const handleEditSale = (sale: Sale) => {
    try {
      setEditingSale(sale);
      setShowSaleForm(true);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error preparing sale for editing:', error);
      setError('Error preparing sale for editing. Please try again.');
    }
  };

  /**
   * Handles the addition or update of a sale by closing the SaleForm and refreshing data.
   */
  const handleSaleAdded = () => {
    setShowSaleForm(false);
    setEditingSale(null);
    fetchStats();
    fetchSalesDataForMonth(selectedMonth);
  };

  /**
   * Handles the deletion of a sale after user confirmation.
   * @param saleId - The ID of the sale to delete.
   */
  const handleDeleteSale = async (saleId: string) => {
    if (window.confirm('Are you sure you want to delete this sale? This will also delete any associated bonuses.')) {
      try {
        console.log('Attempting to delete sale with ID:', saleId);
        
        // Call the updated stored procedure
        const { data, error } = await supabase.rpc('delete_sale_and_bonuses', { sale_id_param: saleId });

        if (error) {
          console.error('Error deleting sale and bonuses:', error);
          setError(`Error deleting sale: ${error.message}`);
          return;
        }

        console.log(`Sale with ID ${saleId} and associated bonuses deleted successfully.`);
        setError(null); // Clear any previous errors
        fetchStats();
        fetchSalesDataForMonth(selectedMonth);
      } catch (error) {
        console.error('Unexpected error deleting sale:', error);
        setError('Unexpected error deleting sale. Please try again.');
      }
    }
  };

  /**
   * Handles the change of the selected month.
   * @param e - The change event from the month input.
   */
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  useEffect(() => {
    console.log('Current stats updated:', currentStats);
  }, [currentStats]);

  // Update this function to calculate commission for a single sale
  const calculateSaleCommission = (sale: Sale): number => {
    return calculateCommission({
      ...sale,
      customer_id: sale.customer_id || undefined,
      salesperson_id: sale.salesperson_id || undefined,
      vehicle_id: sale.vehicle_id || undefined
    });
  };

  return (
    <div className="flex flex-col h-screen font-sans">
      {/* Top Navigation Bar */}
      <TopBar userName={userName} />

      <div className="flex flex-grow bg-gray-100">
        {/* Side Navigation */}
        <SideNav />

        {/* Main Content */}
        <div className="flex-grow p-4">
          <main className="bg-white rounded-lg shadow-sm h-full overflow-auto p-6">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-red-600">COMMISSION TRACKING</h1>
                <p className="text-gray-600 mb-2">
                  {new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
                <p className="text-gray-600">Welcome, {userName.split('@')[0].toUpperCase()}!</p>
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

            {/* Statistics Cards */}
            <div className="grid grid-cols-6 gap-4 mb-8">
              {renderStatCard(
                currentStats.totalSales,
                'Total Sales',
                percentageChange.totalSalesChange,
                false,
                'text-blue-600'
              )}
              {renderStatCard(
                currentStats.totalCommission,
                'Total Commission',
                percentageChange.totalCommissionChange,
                false,
                'text-blue-600'
              )}
              {renderStatCard(
                currentStats.numberOfSales,
                'Number of Sales',
                percentageChange.numberOfSalesChange,
                false,
                'text-purple-600'
              )}
              {renderStatCard(
                currentStats.sharedSales,
                'Shared Sales',
                percentageChange.sharedSalesChange,
                false,
                'text-purple-600'
              )}
              {renderStatCard(
                currentStats.newCarSales,
                'New Car Sales',
                percentageChange.newCarSalesChange,
                true,
                'text-orange-600'  // Changed from red to orange
              )}
              {renderStatCard(
                currentStats.usedCarSales,
                'Used Car Sales',
                percentageChange.usedCarSalesChange,
                true,
                'text-orange-600'  // Changed from red to orange
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-6">
              {/* Add Sale Button */}
              <button
                onClick={() => {
                  setShowSaleForm(true);
                  setEditingSale(null);
                  setError(null);
                }}
                className="bg-red-500 hover:bg-red-700 text-white px-6 py-2 rounded-md text-sm font-semibold transition duration-300 ease-in-out"
              >
                Add Sale
              </button>

              {/* Month Selector */}
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

            {/* Error Message */}
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Sales/Commission Grid */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Stock #</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vehicle</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Accessory</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Warranty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Maint.</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Trade-In</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Bonus</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">COMMISSION</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Shared</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length > 0 ? (
                    sales.map((sale) => (
                      <tr key={sale.id} className="border-b">
                        <td className="px-4 py-2 text-sm">
                          {sale.date ? new Date(sale.date).toLocaleDateString() : 'Invalid Date'}
                        </td>
                        <td className="px-4 py-2 text-sm">{sale.stock_number}</td>
                        <td className="px-4 py-2 text-sm">
                          {sale.first_name && sale.last_name ? `${sale.first_name} ${sale.last_name}` : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {sale.make && sale.model && sale.year ? `${sale.make} ${sale.model} (${sale.year})` : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">${formatNumber(sale.sale_price)}</td>
                        <td className="px-4 py-2 text-sm text-right">${formatNumber(sale.accessory_price)}</td>
                        <td className="px-4 py-2 text-sm text-right">${formatNumber(sale.warranty_price)}</td>
                        <td className="px-4 py-2 text-sm text-right">${formatNumber(sale.maintenance_price)}</td>
                        <td className="px-4 py-2 text-sm text-right">${formatNumber(sale.trade_in)}</td>
                        <td className="px-4 py-2 text-sm text-right">${formatNumber(sale.bonus)}</td>
                        <td className="px-4 py-2 text-sm font-bold text-right bg-gray-200">
                          ${formatNumber(calculateSaleCommission(sale))}
                        </td>
                        <td className="px-4 py-2 text-sm text-center">
                          {sale.shared ? `Yes${sharedSalespersonNames[sale.id] ? ` (${sharedSalespersonNames[sale.id]})` : ''}` : 'No'}
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
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={13} className="px-4 py-2 text-sm text-center">No sales data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Sale Form Modal */}
            {showSaleForm && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                  {/* Close Button */}
                  <button
                    onClick={() => {
                      setShowSaleForm(false);
                      setEditingSale(null);
                      setError(null); // Clear any previous errors
                    }}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    aria-label="Close Form"
                  >
                    &times;
                  </button>

                  {/* Sale Form */}
                  <SaleForm
                    onSubmit={handleAddSale}
                    onSaleAdded={handleSaleAdded}
                    onClose={() => {
                      setShowSaleForm(false);
                      setEditingSale(null);
                      setError(null);
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
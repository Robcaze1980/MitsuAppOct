import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface StatsData {
  totalSales: number;
  totalCommission: number;
  numberOfSales: number;
  sharedSales: number;
}

export default function StatsDashboard() {
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
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentStats = await getMonthStats(currentYear, currentMonth);
    const prevStats = await getMonthStats(previousYear, previousMonth);

    setCurrentStats(currentStats);
    setPreviousStats(prevStats);
  };

  const getMonthStats = async (year: number, month: number): Promise<StatsData> => {
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0).toISOString();

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

    const totalSales = data.reduce((sum, sale) => sum + sale.sale_price, 0);
    const totalCommission = data.reduce((sum, sale) => sum + sale.bonus, 0);
    const numberOfSales = data.length;
    const sharedSales = data.filter(sale => sale.shared).length;

    return {
      totalSales,
      totalCommission,
      numberOfSales,
      sharedSales,
    };
  };

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const renderPercentageChange = (current: number, previous: number) => {
    const percentageChange = calculatePercentageChange(current, previous);
    const isIncrease = percentageChange >= 0;

    return (
      <div className={`absolute top-2 right-2 flex items-center ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
        <span className="mr-1">{isIncrease ? '▲' : '▼'}</span>
        <span className="text-xs font-medium">{Math.abs(percentageChange).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-blue-100 p-4 rounded-lg shadow relative">
        <h3 className="text-lg font-semibold text-blue-800">Total Sales This Month</h3>
        <p className="text-2xl font-bold text-blue-900">${currentStats.totalSales.toLocaleString()}</p>
        {renderPercentageChange(currentStats.totalSales, previousStats.totalSales)}
      </div>
      <div className="bg-green-100 p-4 rounded-lg shadow relative">
        <h3 className="text-lg font-semibold text-green-800">Total Commission</h3>
        <p className="text-2xl font-bold text-green-900">${currentStats.totalCommission.toLocaleString()}</p>
        {renderPercentageChange(currentStats.totalCommission, previousStats.totalCommission)}
      </div>
      <div className="bg-yellow-100 p-4 rounded-lg shadow relative">
        <h3 className="text-lg font-semibold text-yellow-800">Number of Sales</h3>
        <p className="text-2xl font-bold text-yellow-900">{currentStats.numberOfSales}</p>
        {renderPercentageChange(currentStats.numberOfSales, previousStats.numberOfSales)}
      </div>
      <div className="bg-purple-100 p-4 rounded-lg shadow relative">
        <h3 className="text-lg font-semibold text-purple-800">Shared Sales</h3>
        <p className="text-2xl font-bold text-purple-900">{currentStats.sharedSales}</p>
        {renderPercentageChange(currentStats.sharedSales, previousStats.sharedSales)}
      </div>
    </div>
  );
}
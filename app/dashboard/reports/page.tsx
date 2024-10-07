import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ClientReportTable from '../../../components/dashboard/ClientReportTable'
import SalesChart from '@/components/charts/SalesChart'
import { Sale } from '../../../types'

export default async function Reports() {
  const supabase = createServerComponentClient({ cookies })
  
  try {
    const { data: salesReport, error } = await supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching sales data:', error)
      return <div>Error loading sales data. Please try again later.</div>
    }

    if (!salesReport) {
      return <div>Loading sales data...</div>
    }

    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold mb-4">Sales Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SalesChart data={salesReport} title="Monthly Sales Chart" />
          <SalesChart data={salesReport} title="Daily Sales Trend" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SalesChart data={salesReport} title="Top Salespeople" />
          <SalesChart data={salesReport} title="Accessory Sales Trend" />
        </div>
        <SalesChart data={salesReport} title="Vehicle Popularity" />
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Sales Table</h2>
          <ClientReportTable data={salesReport as Sale[]} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in Reports component:', error)
    return <div>An unexpected error occurred. Please try again later.</div>
  }
}

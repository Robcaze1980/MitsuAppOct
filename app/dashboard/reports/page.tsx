import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ReportTable from '@/components/ReportTable'

export default async function Reports() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: salesReport } = await supabase
    .from('sales')
    .select('*, salesperson:profiles(*)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sales Reports</h1>
      <ReportTable data={salesReport || []} />
    </div>
  )
}

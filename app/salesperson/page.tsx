import React, { useState, useEffect } from 'react';
import SaleForm from '../../components/SaleForm';
import { supabase } from '../../lib/supabase';
import { Sale } from '../../types';

export default function SalespersonPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      setSales(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching sales');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSale = () => {
    setSelectedSale(null);
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
  };

  const handleFormSuccess = () => {
    setSelectedSale(null);
    fetchSales();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Salesperson Dashboard</h1>
      
      <button
        onClick={handleAddSale}
        className="mb-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
      >
        Add New Sale
      </button>
      {selectedSale !== null && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{selectedSale ? 'Edit Sale' : 'Add New Sale'}</h2>
          <SaleForm 
            initialData={selectedSale as import('../../types/supabase').Sale} 
            onSubmit={async (sale: import('../../types/supabase').Sale) => {
              await handleFormSuccess();
              return Promise.resolve();
            }} 
            onSaleAdded={handleFormSuccess} 
            onClose={() => setSelectedSale(null)} 
          />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Sales List</h2>
      <ul className="space-y-2">
        {sales.map((sale) => (
          <li key={sale.id} className="border p-4 rounded">
            <span>{new Date(sale.date).toLocaleDateString()} - ${sale.sale_price}</span>
            <button
              onClick={() => handleEditSale(sale)}
              className="ml-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

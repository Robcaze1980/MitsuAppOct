import React, { useState, useEffect } from 'react';
import SaleForm from '@/components/SaleForm';
import { Sale } from '@/types/supabase';

function SalesPage() {
  console.log('Rendering SalesPage');

  const [key, setKey] = useState(0);
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    console.log('SalesPage mounted');
    setTimestamp(new Date().toISOString());
  }, []);

  const handleSaleAdded = () => {
    console.log('Sale added');
    // Implement any logic you need when a sale is added
  };

  const handleClose = () => {
    console.log('SaleForm closed');
    // Implement any logic you need when the form is closed
  };

  const handleSubmit = async (sale: Sale): Promise<void> => {
    // Handle the form submission
    console.log(sale);
    handleSaleAdded();
    // If you need to perform any asynchronous operations, do them here
    // For example:
    // await saveSaleToDatabase(sale);
  };

  return (
    <div>
      <h1>Sales Page</h1>
      <SaleForm 
        key={key}
        onSaleAdded={handleSaleAdded} 
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
      {timestamp && <p>Page update check: {timestamp}</p>}
      <button onClick={() => setKey(prev => prev + 1)}>Force Re-render</button>
    </div>
  );
}

export default SalesPage;
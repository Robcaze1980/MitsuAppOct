import SaleForm from '@/components/SaleForm';

export default function SalesPage() {
  return (
    <div>
      <SaleForm 
        onSaleAdded={() => {
          console.log('Sale Added');
        }} 
        onClose={() => {
          console.log('Sale Form Closed');
        }}
      />
    </div>
  );
}


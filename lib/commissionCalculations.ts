import { Sale } from '@/types';

const DEFAULT_NEW_CAR_ACCESSORIES = 998;
const DEFAULT_USED_CAR_ACCESSORIES = 498;
const ACCESSORY_COMMISSION_THRESHOLD = 900;

export function calculateCommission(sale: Partial<Sale>): number {
  let commission = 0;

  // Base commission on sale price
  if (sale.sale_price) {
    if (sale.sale_price < 10000) {
      commission += 200;
    } else if (sale.sale_price < 20000) {
      commission += 300;
    } else if (sale.sale_price < 30000) {
      commission += 400;
    } else {
      commission += 500;
    }
  }

  // Accessory commission
  const defaultAccessories = sale.type === 'Used' ? DEFAULT_USED_CAR_ACCESSORIES : DEFAULT_NEW_CAR_ACCESSORIES;
  const extraAccessories = Math.max(0, (sale.accessory_price || 0) - defaultAccessories);
  if (sale.type === 'New' && extraAccessories >= ACCESSORY_COMMISSION_THRESHOLD) {
    commission += Math.floor(extraAccessories / 900) * 100;
  } else if (sale.type === 'Used') {
    commission += Math.floor((sale.accessory_price || 0) / 800) * 100;
  }

  // Warranty commission
  if (sale.warranty_price && sale.warranty_cost && sale.warranty_price > sale.warranty_cost) {
    const warrantyProfit = sale.warranty_price - sale.warranty_cost;
    commission += Math.floor(warrantyProfit / 1000) * 100;
  }

  // Maintenance commission
  if (sale.maintenance_price && sale.maintenance_price > 800) {
    commission += 100;
  }

  // Add trade-in commission and bonus
  commission += (sale.trade_in || 0) + (sale.bonus || 0);

  // If shared, split the commission
  if (sale.shared) {
    commission /= 2;
  }

  return Number(commission.toFixed(2));
}
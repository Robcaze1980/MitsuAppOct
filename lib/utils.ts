export function calculateCommission(sale_price: number, accessory_price: number, warranty_price: number, warranty_cost: number, maintenance_price: number): number {
  let commission = 0

  // Commission on vehicle price
  if (sale_price < 10000) {
    commission += 200
  } else if (sale_price < 20000) {
    commission += 300
  } else if (sale_price < 30000) {
    commission += 400
  } else {
    commission += 500
  }

  // Commission on accessories
  if (accessory_price > 800) {
    commission += Math.floor(accessory_price / 800) * 100
  }

  // Commission on warranty
  const warrantyProfit = warranty_price - warranty_cost
  if (warrantyProfit > 0) {
    commission += Math.floor(warrantyProfit / 1000) * 100
  }

  // Commission on maintenance package
  if (maintenance_price > 800) {
    commission += 100
  }

  return commission
}

export function calculateTotalSaleAmount(sale_price: number, accessory_price: number, warranty_price: number, maintenance_price: number): number {
  return sale_price + accessory_price + warranty_price + maintenance_price
}

export function calculateCommission(saleAmount: number, accessoriesAmount: number, warrantyPrice: number, warrantyCost: number, maintenanceAmount: number): number {
  let commission = 0

  // Commission on vehicle price
  if (saleAmount < 10000) {
    commission += 200
  } else if (saleAmount < 20000) {
    commission += 300
  } else if (saleAmount < 30000) {
    commission += 400
  } else {
    commission += 500
  }

  // Commission on accessories
  if (accessoriesAmount > 800) {
    commission += Math.floor(accessoriesAmount / 800) * 100
  }

  // Commission on warranty
  const warrantyProfit = warrantyPrice - warrantyCost
  if (warrantyProfit > 0) {
    commission += Math.floor(warrantyProfit / 1000) * 100
  }

  // Commission on maintenance package
  if (maintenanceAmount > 800) {
    commission += 100
  }

  return commission
}

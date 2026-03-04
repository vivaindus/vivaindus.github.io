import Decimal from 'decimal.js';

Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_EVEN });

export const CalculateInvoice = (invoice) => {
  const {
    items = [],
    globalDiscountPreTax = { value: 0, type: 'fixed' },
    isTaxInclusive = false,
    extraCharges = 0,
    tdsRate = 0,
    roundingMethod = 'HALF_EVEN'
  } = invoice;

  // 1-3: Base, Line Charges, Line Discounts
  let processedItems = items.map(item => {
    const qty = new Decimal(item.qty || 0);
    const rate = new Decimal(item.rate || 0);
    let base = qty.mul(rate);
    
    if (item.discountValue) {
      const d = new Decimal(item.discountValue);
      base = item.discountType === 'percent' ? base.sub(base.mul(d.div(100))) : base.sub(d);
    }
    return { ...item, lineBase: base };
  });

  const totalLineBase = processedItems.reduce((acc, i) => acc.add(i.lineBase), new Decimal(0));

  // 4: Pre-Tax Global Discount (Pro-rata)
  const gDiscPre = globalDiscountPreTax.type === 'percent'
    ? totalLineBase.mul(new Decimal(globalDiscountPreTax.value || 0).div(100))
    : new Decimal(globalDiscountPreTax.value || 0);

  processedItems = processedItems.map(item => {
    const share = totalLineBase.isZero() ? new Decimal(0) : item.lineBase.div(totalLineBase);
    const taxableBase = item.lineBase.sub(gDiscPre.mul(share));

    // 5: Multi-Tax Engine
    const taxRate = new Decimal(item.taxP || 0);
    let taxAmount, netAmount;
    if (isTaxInclusive) {
      netAmount = taxableBase.div(taxRate.div(100).add(1));
      taxAmount = taxableBase.sub(netAmount);
    } else {
      netAmount = taxableBase;
      taxAmount = netAmount.mul(taxRate.div(100));
    }
    return { ...item, netAmount, taxAmount, lineTotal: netAmount.add(taxAmount) };
  });

  // 6-10: Final Calculations
  const subtotal = processedItems.reduce((acc, i) => acc.add(i.netAmount), new Decimal(0));
  const totalTax = processedItems.reduce((acc, i) => acc.add(i.taxAmount), new Decimal(0));
  const tds = subtotal.mul(new Decimal(tdsRate).div(100));
  const rawTotal = subtotal.add(totalTax).add(extraCharges).sub(tds);

  const methods = { 'HALF_EVEN': Decimal.ROUND_HALF_EVEN, 'UP': Decimal.ROUND_UP, 'DOWN': Decimal.ROUND_DOWN };
  const grandTotal = rawTotal.toDecimalPlaces(2, methods[roundingMethod] || Decimal.ROUND_HALF_EVEN);

  return {
    items: processedItems,
    subtotal: subtotal.toNumber(),
    totalTax: totalTax.toNumber(),
    tdsDeduction: tds.toNumber(),
    grandTotal: grandTotal.toNumber()
  };
};
import Decimal from 'decimal.js';

// Setup high-precision environment
Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_EVEN });

export const CalculateInvoice = (invoice) => {
  const {
    items = [],
    globalDiscountPreTax = { value: 0, type: 'fixed' },
    globalDiscountPostTax = { value: 0, type: 'fixed' },
    extraCharges = 0,
    tdsRate = 0,
    isTaxInclusive = false,
    roundingMethod = 'HALF_EVEN'
  } = invoice;

  // 1-3. Line Level Calculation
  let processedItems = items.map(item => {
    const qty = new Decimal(item.qty || 0);
    const rate = new Decimal(item.rate || 0);
    
    // Step 1: Base
    let base = qty.mul(rate);
    
    // Step 2 & 3: Line Adjustments
    const lineDiscount = item.discountType === 'percent' 
      ? base.mul(new Decimal(item.discountValue || 0).div(100))
      : new Decimal(item.discountValue || 0);
    
    return { ...item, lineBase: base.sub(lineDiscount) };
  });

  const totalLineBase = processedItems.reduce((acc, i) => acc.add(i.lineBase), new Decimal(0));

  // Step 4: Pre-Tax Global Discount (Pro-rata distribution)
  const gDiscPre = globalDiscountPreTax.type === 'percent'
    ? totalLineBase.mul(new Decimal(globalDiscountPreTax.value).div(100))
    : new Decimal(globalDiscountPreTax.value);

  processedItems = processedItems.map(item => {
    const share = totalLineBase.isZero() ? new Decimal(0) : item.lineBase.div(totalLineBase);
    const taxableBase = item.lineBase.sub(gDiscPre.mul(share));
    
    // Step 5: Tax Engine
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

  // Step 6: TDS
  const subtotal = processedItems.reduce((acc, i) => acc.add(i.netAmount), new Decimal(0));
  const totalTax = processedItems.reduce((acc, i) => acc.add(i.taxAmount), new Decimal(0));
  const tdsDeduction = subtotal.mul(new Decimal(tdsRate).div(100));

  // Step 7-9: Final Adjustments
  const charges = new Decimal(extraCharges);
  const totalBeforePostDisc = subtotal.add(totalTax).add(charges).sub(tdsDeduction);
  
  const gDiscPost = globalDiscountPostTax.type === 'percent'
    ? totalBeforePostDisc.mul(new Decimal(globalDiscountPostTax.value).div(100))
    : new Decimal(globalDiscountPostTax.value);

  const rawGrandTotal = totalBeforePostDisc.sub(gDiscPost);

  // Step 10: Rounding Engine
  const methods = { 
    'HALF_EVEN': Decimal.ROUND_HALF_EVEN, 
    'UP': Decimal.ROUND_UP, 
    'DOWN': Decimal.ROUND_DOWN 
  };
  const grandTotal = rawGrandTotal.toDecimalPlaces(2, methods[roundingMethod] || Decimal.ROUND_HALF_EVEN);

  return {
    items: processedItems,
    subtotal: subtotal.toNumber(),
    totalTax: totalTax.toNumber(),
    tdsDeduction: tdsDeduction.toNumber(),
    grandTotal: grandTotal.toNumber(),
    roundingDiff: grandTotal.sub(rawGrandTotal).toNumber()
  };
};
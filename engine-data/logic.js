import Decimal from 'decimal.js';

// Internal precision: 20 decimal places
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_EVEN });

export const calculateInvoice = (data, config) => {
  const {
    items = [],
    globalDiscount = { value: 0, type: 'fixed' },
    extraCharges = 0,
    roundingMode = 'HALF_EVEN',
    isTaxInclusive = false
  } = data;

  // 1. Base Amount & 2/3. Line Adjustments
  let processedItems = items.map(item => {
    const qty = new Decimal(item.qty || 0);
    const rate = new Decimal(item.rate || 0);
    let base = qty.mul(rate);

    // Line Charge
    if (item.charge) {
      base = item.chargeType === 'percent' 
        ? base.add(base.mul(new Decimal(item.charge).div(100)))
        : base.add(new Decimal(item.charge));
    }

    // Line Discount
    if (item.discount) {
      base = item.discountType === 'percent'
        ? base.sub(base.mul(new Decimal(item.discount).div(100)))
        : base.sub(new Decimal(item.discount));
    }

    return { ...item, lineBase: base };
  });

  const totalLineBase = processedItems.reduce((acc, item) => acc.add(item.lineBase), new Decimal(0));

  // 4. Pre-Tax Global Discount (Pro-rata distribution)
  const gDisc = globalDiscount.type === 'percent' 
    ? totalLineBase.mul(new Decimal(globalDiscount.value).div(100))
    : new Decimal(globalDiscount.value);

  processedItems = processedItems.map(item => {
    const share = totalLineBase.isZero() ? new Decimal(0) : item.lineBase.div(totalLineBase);
    const itemDiscount = gDisc.mul(share);
    return { ...item, taxableAmount: item.lineBase.sub(itemDiscount) };
  });

  // 5/6. Multi-Tax Engine & Aggregation
  let taxRegistry = {};
  processedItems = processedItems.map(item => {
    const taxRate = new Decimal(item.taxP || 0);
    let taxAmount;

    if (isTaxInclusive) {
      // Amount = Total - (Total / (1 + rate))
      const net = item.taxableAmount.div(taxRate.div(100).add(1));
      taxAmount = item.taxableAmount.sub(net);
      item.taxableAmount = net;
    } else {
      taxAmount = item.taxableAmount.mul(taxRate.div(100));
    }

    const rateKey = taxRate.toString();
    taxRegistry[rateKey] = (taxRegistry[rateKey] || new Decimal(0)).add(taxAmount);
    
    return { ...item, lineTax: taxAmount, lineTotal: item.taxableAmount.add(taxAmount) };
  });

  // 7-12. Totals and Rounding
  const subtotal = processedItems.reduce((acc, i) => acc.add(i.taxableAmount), new Decimal(0));
  const totalTax = Object.values(taxRegistry).reduce((acc, v) => acc.add(v), new Decimal(0));
  
  let grandTotal = subtotal.add(totalTax).add(new Decimal(extraCharges));
  
  // Final Rounding
  const finalTotal = grandTotal.toDecimalPlaces(2, Decimal[`ROUND_${roundingMode}`]);

  return {
    items: processedItems,
    taxSummary: taxRegistry,
    subtotal: subtotal.toNumber(),
    totalTax: totalTax.toNumber(),
    grandTotal: finalTotal.toNumber(),
    roundingDiff: finalTotal.sub(grandTotal).toNumber()
  };
};
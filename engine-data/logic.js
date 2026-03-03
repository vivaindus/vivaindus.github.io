import Decimal from 'decimal.js';

Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_EVEN });

export const FinancialPipeline = {
  execute: (invoice, config) => {
    const {
      items = [],
      globalDiscount = { value: 0, type: 'fixed', timing: 'pre-tax' },
      extraCharges = 0,
      partialPayments = [],
      isTaxInclusive = false,
      isReverseCharge = false,
      withholdingTax = 0, // TDS
      roundingConfig = { precision: 2, method: 'HALF_EVEN' }
    } = invoice;

    const roundMode = {
      'HALF_EVEN': Decimal.ROUND_HALF_EVEN,
      'UP': Decimal.ROUND_UP,
      'DOWN': Decimal.ROUND_DOWN
    }[roundingConfig.method] || Decimal.ROUND_HALF_EVEN;

    // 1-3. Base Amount, Line Charges, and Line Discounts
    let processedItems = items.map(item => {
      let qty = new Decimal(item.qty || 0);
      let rate = new Decimal(item.rate || 0);
      
      // Step 1: Base Amount
      let base = qty.mul(rate);

      // Step 2: Line Charges (Fixed or Percent)
      if (item.chargeValue) {
        let c = new Decimal(item.chargeValue);
        base = item.chargeType === 'percent' ? base.add(base.mul(c.div(100))) : base.add(c);
      }

      // Step 3: Line Discounts
      if (item.discountValue) {
        let d = new Decimal(item.discountValue);
        base = item.discountType === 'percent' ? base.sub(base.mul(d.div(100))) : base.sub(d);
      }

      return { ...item, step3_lineBase: base };
    });

    const totalStep3 = processedItems.reduce((acc, i) => acc.add(i.step3_lineBase), new Decimal(0));

    // Step 4: Pre-Tax Global Discount (Pro-rata distribution)
    const preTaxGlobalDisc = (globalDiscount.timing === 'pre-tax') 
      ? (globalDiscount.type === 'percent' ? totalStep3.mul(new Decimal(globalDiscount.value).div(100)) : new Decimal(globalDiscount.value))
      : new Decimal(0);

    processedItems = processedItems.map(item => {
      const share = totalStep3.isZero() ? new Decimal(0) : item.step3_lineBase.div(totalStep3);
      const itemDiscountShare = preTaxGlobalDisc.mul(share);
      return { ...item, step4_taxableBase: item.step3_lineBase.sub(itemDiscountShare) };
    });

    // Step 5-6: Multi-Tax Engine & Aggregation
    let taxRegistry = {};
    processedItems = processedItems.map(item => {
      if (isReverseCharge) {
        return { ...item, step6_taxAmount: new Decimal(0), step6_lineTotal: item.step4_taxableBase };
      }

      const rate = new Decimal(item.taxP || 0);
      let taxAmt, netAmt;

      if (isTaxInclusive) {
        netAmt = item.step4_taxableBase.div(rate.div(100).add(1));
        taxAmt = item.step4_taxableBase.sub(netAmt);
      } else {
        netAmt = item.step4_taxableBase;
        taxAmt = netAmt.mul(rate.div(100));
      }

      const rKey = rate.toString();
      taxRegistry[rKey] = (taxRegistry[rKey] || new Decimal(0)).add(taxAmt);

      return { ...item, step6_net: netAmt, step6_tax: taxAmt, step6_lineTotal: netAmt.add(taxAmt) };
    });

    // Step 7: TDS / Withholding deduction
    const subtotal = processedItems.reduce((acc, i) => acc.add(i.step6_net || i.step4_taxableBase), new Decimal(0));
    const totalTax = processedItems.reduce((acc, i) => acc.add(i.step6_tax || 0), new Decimal(0));
    const tdsAmount = subtotal.mul(new Decimal(withholdingTax).div(100));

    // Step 8-9: Extra Charges & Post-Tax Global Discount
    const charges = new Decimal(extraCharges);
    const postTaxGlobalDisc = (globalDiscount.timing === 'post-tax')
      ? (globalDiscount.type === 'percent' ? subtotal.add(totalTax).mul(new Decimal(globalDiscount.value).div(100)) : new Decimal(globalDiscount.value))
      : new Decimal(0);

    // Step 10: Partial Payments
    const paidSum = partialPayments.reduce((acc, p) => acc.add(new Decimal(p.amount || 0)), new Decimal(0));

    // Step 11: Final Rounding Engine
    const rawTotal = subtotal.add(totalTax).add(charges).sub(tdsAmount).sub(postTaxGlobalDisc);
    const grandTotal = rawTotal.toDecimalPlaces(roundingConfig.precision, roundMode);
    const balanceDue = grandTotal.sub(paidSum);

    return {
      items: processedItems,
      taxSummary: Object.entries(taxRegistry).map(([rate, amt]) => ({ rate, amount: amt.toNumber() })),
      subtotal: subtotal.toNumber(),
      totalTax: totalTax.toNumber(),
      tdsAmount: tdsAmount.toNumber(),
      grandTotal: grandTotal.toNumber(),
      paidAmount: paidSum.toNumber(),
      balanceDue: balanceDue.toNumber(),
      roundingDiff: grandTotal.sub(rawTotal).toNumber()
    };
  }
};
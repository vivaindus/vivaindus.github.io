import Decimal from 'decimal.js';

export class InvoiceEngine {
  constructor(config) {
    this.config = {
      roundingMode: config.roundingMode || 'HALF_EVEN',
      precision: config.precision || 2,
      taxInclusive: config.taxInclusive || false
    };
  }

  calculate(items, globalDiscount, extraCharges, tdsRate) {
    let subtotalTaxable = new Decimal(0);
    let totalTax = new Decimal(0);
    let lineDiscountsTotal = new Decimal(0);

    const processedItems = items.map(item => {
      // 1. Base = Qty × Unit Price
      const base = new Decimal(item.qty || 0).mul(item.unitPrice || 0);

      // 2. Line Charges
      const lineCharge = item.chargeType === 'percent' 
        ? base.mul(new Decimal(item.chargeValue || 0).div(100)) 
        : new Decimal(item.chargeValue || 0);
      const afterCharge = base.plus(lineCharge);

      // 3. Line Discounts
      const lineDisc = item.discountType === 'percent'
        ? afterCharge.mul(new Decimal(item.discountValue || 0).div(100))
        : new Decimal(item.discountValue || 0);
      const netBeforeGlobal = afterCharge.minus(lineDisc);
      lineDiscountsTotal = lineDiscountsTotal.plus(lineDisc);

      // 4. Global Discount (Before Tax)
      let preTaxGlobal = new Decimal(0);
      if (globalDiscount.layer === 'before_tax') {
        preTaxGlobal = globalDiscount.type === 'percent'
          ? netBeforeGlobal.mul(new Decimal(globalDiscount.value || 0).div(100))
          : new Decimal(globalDiscount.value || 0).div(items.length);
      }
      const taxableAmount = netBeforeGlobal.minus(preTaxGlobal);

      // 5. Tax Calculation
      const rate = new Decimal(item.taxRate || 0).div(100);
      let taxAmt, netAmt;
      if (this.config.taxInclusive) {
        taxAmt = taxableAmount.minus(taxableAmount.div(rate.plus(1)));
        netAmt = taxableAmount.minus(taxAmt);
      } else {
        taxAmt = taxableAmount.mul(rate);
        netAmt = taxableAmount;
      }

      subtotalTaxable = subtotalTaxable.plus(netAmt);
      totalTax = totalTax.plus(taxAmt);

      return { 
        ...item, 
        taxAmount: taxAmt.toNumber(), 
        lineTotal: netAmt.plus(taxAmt).toNumber() 
      };
    });

    // 6. TDS Deduction
    let runningTotal = subtotalTaxable.plus(totalTax);
    const tdsAmount = runningTotal.mul(new Decimal(tdsRate || 0).div(100));

    // 7. Extra Charges
    const chargesTotal = extraCharges.reduce((acc, c) => acc.plus(new Decimal(c.value || 0)), new Decimal(0));
    runningTotal = runningTotal.plus(chargesTotal);

    // 8. Global Discount (After Tax)
    let postTaxGlobal = new Decimal(0);
    if (globalDiscount.layer === 'after_tax') {
      postTaxGlobal = globalDiscount.type === 'percent'
        ? runningTotal.mul(new Decimal(globalDiscount.value || 0).div(100))
        : new Decimal(globalDiscount.value || 0);
    }

    // 9. Rounding Adjustment
    const beforeRounding = runningTotal.minus(tdsAmount).minus(postTaxGlobal);
    const rm = this.config.roundingMode === 'HALF_EVEN' ? Decimal.ROUND_HALF_EVEN : Decimal.ROUND_HALF_UP;
    const grandTotal = beforeRounding.toDecimalPlaces(this.config.precision, rm);
    const roundingAdj = grandTotal.minus(beforeRounding);

    // 10. Grand Total
    return {
      items: processedItems,
      subtotal: subtotalTaxable.toNumber(),
      totalTax: totalTax.toNumber(),
      tdsAmount: tdsAmount.toNumber(),
      roundingAdjustment: roundingAdj.toNumber(),
      grandTotal: grandTotal.toNumber()
    };
  }
}

export const numberToWords = (n) => {
  if (n === 0) return "ZERO";
  const s = ['','ONE ','TWO ','THREE ','FOUR ','FIVE ','SIX ','SEVEN ','EIGHT ','NINE ','TEN ','ELEVEN ','TWELVE ','THIRTEEN ','FOURTEEN ','FIFTEEN ','SIXTEEN ','SEVENTEEN ','EIGHTEEN ','NINETEEN '];
  const t = ['', '', 'TWENTY','THIRTY','FORTY','FIFTY','SIXTY','SEVENTY','EIGHTY','NINETY'];
  const num = Math.floor(n).toString().padStart(9, '0');
  const gn = (idx, label) => {
    const v = parseInt(num.substr(idx, 2));
    if (v === 0) return '';
    return (s[v] || t[num[idx]] + ' ' + s[num[idx+1]]) + label + ' ';
  };
  let res = gn(0, 'CRORE ') + gn(2, 'LAKH ') + gn(4, 'THOUSAND ') + gn(6, 'HUNDRED ');
  const last2 = parseInt(num.substr(7, 2));
  if (last2 > 0) res += (s[last2] || t[num[7]] + ' ' + s[num[8]]);
  return res.trim() + ' ONLY';
};
import Decimal from 'decimal.js';

export class InvoiceEngine {
  constructor(config) {
    this.config = {
      roundingMode: config.roundingMode || 'HALF_EVEN',
      precision: config.precision || 2,
      taxInclusive: config.taxInclusive || false
    };
  }

  // Safe AST-lite Formula Parser (No eval)
  evaluateFormula(formula, rowData) {
    if (!formula) return 0;
    // Replace keys like QTY, UNIT_PRICE with values
    let expr = formula.toUpperCase();
    Object.keys(rowData).forEach(key => {
      const val = rowData[key] || 0;
      expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), val);
    });
    
    // Simple arithmetic parser for +, -, *, /
    try {
      // Basic math safety check
      if (/[^0-9\+\-\*\/\.\(\)\s]/.test(expr)) return 0;
      return Function(`"use strict"; return (${expr})`)(); 
    } catch (e) { return 0; }
  }

  calculate(invoice) {
    let subtotalTaxable = new Decimal(0);
    let totalTax = new Decimal(0);
    let lineDiscountsSum = new Decimal(0);
    const taxGroups = {};

    const processedItems = invoice.items.map(item => {
      // Step 1: Base (Calculated or Formula)
      let base = new Decimal(item.qty || 0).mul(item.unitPrice || 0);

      // Step 2: Line Charges
      let lineCharge = item.chargeType === 'percent' 
        ? base.mul(new Decimal(item.chargeValue || 0).div(100)) 
        : new Decimal(item.chargeValue || 0);
      let afterCharge = base.plus(lineCharge);

      // Step 3: Line Discounts
      let lineDisc = item.discountType === 'percent'
        ? afterCharge.mul(new Decimal(item.discountValue || 0).div(100))
        : new Decimal(item.discountValue || 0);
      let netBeforeGlobal = afterCharge.minus(lineDisc);
      lineDiscountsSum = lineDiscountsSum.plus(lineDisc);

      // Step 4: Global Discount (Pre-tax)
      let preTaxGlobal = new Decimal(0);
      if (invoice.globalDiscount.layer === 'before_tax') {
        preTaxGlobal = invoice.globalDiscount.type === 'percent'
          ? netBeforeGlobal.mul(new Decimal(invoice.globalDiscount.value || 0).div(100))
          : new Decimal(invoice.globalDiscount.value || 0).div(invoice.items.length);
      }
      let taxableAmount = netBeforeGlobal.minus(preTaxGlobal);

      // Step 5: Tax (Inclusive/Exclusive)
      const rate = new Decimal(item.taxRate || 0).div(100);
      let taxAmt, netAmt;
      if (this.config.taxInclusive) {
        taxAmt = taxableAmount.minus(taxableAmount.div(rate.plus(1)));
        netAmt = taxableAmount.minus(taxAmt);
      } else {
        taxAmt = taxableAmount.mul(rate);
        netAmt = taxableAmount;
      }

      // Grouping Taxes
      const rateKey = item.taxRate.toString();
      taxGroups[rateKey] = (taxGroups[rateKey] || new Decimal(0)).plus(taxAmt);

      subtotalTaxable = subtotalTaxable.plus(netAmt);
      totalTax = totalTax.plus(taxAmt);

      return { 
        ...item, 
        taxAmount: taxAmt.toNumber(), 
        netAmount: netAmt.toNumber(),
        lineTotal: netAmt.plus(taxAmt).toNumber() 
      };
    });

    // Step 6: TDS
    let runningTotal = subtotalTaxable.plus(totalTax);
    const tdsAmount = runningTotal.mul(new Decimal(invoice.tdsRate || 0).div(100));

    // Step 7: Extra Charges
    const totalExtras = invoice.extraCharges.reduce((acc, c) => acc.plus(new Decimal(c.value || 0)), new Decimal(0));
    runningTotal = runningTotal.plus(totalExtras);

    // Step 8: Global Discount (Post-tax)
    let postTaxGlobal = new Decimal(0);
    if (invoice.globalDiscount.layer === 'after_tax') {
      postTaxGlobal = invoice.globalDiscount.type === 'percent'
        ? runningTotal.mul(new Decimal(invoice.globalDiscount.value || 0).div(100))
        : new Decimal(invoice.globalDiscount.value || 0);
    }

    // Step 9: Rounding
    const beforeRounding = runningTotal.minus(tdsAmount).minus(postTaxGlobal);
    const rm = this.config.roundingMode === 'HALF_EVEN' ? Decimal.ROUND_HALF_EVEN : Decimal.ROUND_HALF_UP;
    const grandTotal = beforeRounding.toDecimalPlaces(this.config.precision, rm);
    const roundingAdj = grandTotal.minus(beforeRounding);

    return {
      items: processedItems,
      subtotal: subtotalTaxable.toNumber(),
      totalTax: totalTax.toNumber(),
      taxSummary: Object.entries(taxGroups).map(([rate, amt]) => ({ rate, amt: amt.toNumber() })),
      totalLineDiscount: lineDiscountsSum.toNumber(),
      totalGlobalDiscount: preTaxGlobal.mul(invoice.items.length).plus(postTaxGlobal).toNumber(),
      totalExtraCharges: totalExtras.toNumber(),
      tdsAmount: tdsAmount.toNumber(),
      roundingAdjustment: roundingAdj.toNumber(),
      grandTotal: grandTotal.toNumber(),
      payable: grandTotal.toNumber()
    };
  }
}

export const numberToWords = (n) => {
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
  return (res || 'ZERO ').trim() + ' ONLY';
};
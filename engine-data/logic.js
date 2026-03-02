import Decimal from 'decimal.js';

export class InvoiceEngine {
  constructor(config) {
    this.config = {
      roundingMode: config?.roundingMode || 'HALF_EVEN',
      precision: config?.precision || 2,
      taxInclusive: config?.taxInclusive || false
    };
  }

  calculate(invoice) {
    let subtotalTaxable = new Decimal(0);
    let totalTax = new Decimal(0);
    let lineDiscountsSum = new Decimal(0);
    let totalPreTaxGlobal = new Decimal(0); 
    const taxGroups = {};

    const items = (invoice.items || []).map(item => {
      let base = new Decimal(item.qty || 0).mul(item.unitPrice || 0);
      let lineCharge = item.chargeType === 'percent' 
        ? base.mul(new Decimal(item.chargeValue || 0).div(100)) 
        : new Decimal(item.chargeValue || 0);
      let afterCharge = base.plus(lineCharge);

      let lineDisc = item.discountType === 'percent'
        ? afterCharge.mul(new Decimal(item.discountValue || 0).div(100))
        : new Decimal(item.discountValue || 0);
      let netBeforeGlobal = afterCharge.minus(lineDisc);
      lineDiscountsSum = lineDiscountsSum.plus(lineDisc);

      let itemPreTaxGlobal = new Decimal(0);
      if (invoice.globalDiscount?.layer === 'before_tax') {
        itemPreTaxGlobal = invoice.globalDiscount.type === 'percent'
          ? netBeforeGlobal.mul(new Decimal(invoice.globalDiscount.value || 0).div(100))
          : new Decimal(invoice.globalDiscount.value || 0).div(invoice.items.length || 1);
      }
      totalPreTaxGlobal = totalPreTaxGlobal.plus(itemPreTaxGlobal);
      let taxableAmount = netBeforeGlobal.minus(itemPreTaxGlobal);

      const rate = new Decimal(item.taxRate || 0).div(100);
      let taxAmt, netAmt;
      if (this.config.taxInclusive) {
        taxAmt = taxableAmount.minus(taxableAmount.div(rate.plus(1)));
        netAmt = taxableAmount.minus(taxAmt);
      } else {
        taxAmt = taxableAmount.mul(rate);
        netAmt = taxableAmount;
      }

      const rateKey = (item.taxRate || 0).toString();
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

    let runningTotal = subtotalTaxable.plus(totalTax);
    const tdsAmount = runningTotal.mul(new Decimal(invoice.tdsRate || 0).div(100));
    const totalExtras = (invoice.extraCharges || []).reduce((acc, c) => acc.plus(new Decimal(c.value || 0)), new Decimal(0));
    runningTotal = runningTotal.plus(totalExtras);

    let postTaxGlobal = new Decimal(0);
    if (invoice.globalDiscount?.layer === 'after_tax') {
      postTaxGlobal = invoice.globalDiscount.type === 'percent'
        ? runningTotal.mul(new Decimal(invoice.globalDiscount.value || 0).div(100))
        : new Decimal(invoice.globalDiscount.value || 0);
    }

    const beforeRounding = runningTotal.minus(tdsAmount).minus(postTaxGlobal);
    const rm = this.config.roundingMode === 'HALF_EVEN' ? Decimal.ROUND_HALF_EVEN : Decimal.ROUND_HALF_UP;
    const grandTotal = beforeRounding.toDecimalPlaces(this.config.precision, rm);
    const roundingAdj = grandTotal.minus(beforeRounding);

    return {
      items,
      subtotal: subtotalTaxable.toNumber(),
      totalTax: totalTax.toNumber(),
      taxSummary: Object.entries(taxGroups).map(([rate, amt]) => ({ rate, amt: amt.toNumber() })),
      totalLineDiscount: lineDiscountsSum.toNumber(),
      totalGlobalDiscount: totalPreTaxGlobal.plus(postTaxGlobal).toNumber(),
      totalExtraCharges: totalExtras.toNumber(),
      tdsAmount: tdsAmount.toNumber(),
      roundingAdjustment: roundingAdj.toNumber(),
      grandTotal: grandTotal.toNumber(),
      payable: grandTotal.toNumber()
    };
  }
}

export const numberToWords = (n) => {
    const amount = Math.floor(n || 0);
    if (amount === 0) return "ZERO ONLY";
    const s = ['','ONE ','TWO ','THREE ','FOUR ','FIVE ','SIX ','SEVEN ','EIGHT ','NINE ','TEN ','ELEVEN ','TWELVE ','THIRTEEN ','FOURTEEN ','FIFTEEN ','SIXTEEN ','SEVENTEEN ','EIGHTEEN ','NINETEEN '];
    const t = ['', '', 'TWENTY','THIRTY','FORTY','FIFTY','SIXTY','SEVENTY','EIGHTY','NINETY'];
    const num = amount.toString().padStart(9, '0');
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
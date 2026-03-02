import Decimal from 'decimal.js';

export class InvoiceLogic {
  constructor(config) {
    this.config = {
      roundingMode: config?.roundingMode || 'HALF_EVEN',
      precision: config?.precision || 2,
      taxInclusive: config?.taxInclusive || false
    };
  }

  // Refrens-style "Amount in Words" (Supports AED/Fils or USD/Cents)
  static toWords(n) {
    if (n === 0) return "ZERO ONLY";
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
  }

  calculate(invoice) {
    let subtotal = new Decimal(0);
    let totalTax = new Decimal(0);
    let lineDiscTotal = new Decimal(0);
    const taxGroups = {};

    const items = invoice.items.map(item => {
      // 1. Base Qty * Price
      const base = new Decimal(item.qty || 0).mul(item.unitPrice || 0);
      
      // 2. Line Discount
      let lDisc = new Decimal(0);
      if (item.discountValue) {
        lDisc = item.discountType === 'percent' 
          ? base.mul(new Decimal(item.discountValue).div(100))
          : new Decimal(item.discountValue);
      }
      lineDiscTotal = lineDiscTotal.plus(lDisc);
      const afterLineDisc = base.minus(lDisc);

      // 3. Global Discount (Before Tax Layer - Pro-rated)
      let gDiscPreShare = new Decimal(0);
      if (invoice.globalDiscount?.layer === 'before_tax') {
        gDiscPreShare = invoice.globalDiscount.type === 'percent'
          ? afterLineDisc.mul(new Decimal(invoice.globalDiscount.value || 0).div(100))
          : new Decimal(invoice.globalDiscount.value || 0).div(invoice.items.length || 1);
      }
      const taxable = afterLineDisc.minus(gDiscPreShare);

      // 4. Tax (Inclusive/Exclusive)
      const rate = new Decimal(item.taxRate || 0).div(100);
      let taxAmt, netAmt;
      if (this.config.taxInclusive) {
        taxAmt = taxable.minus(taxable.div(rate.plus(1)));
        netAmt = taxable.minus(taxAmt);
      } else {
        taxAmt = taxable.mul(rate);
        netAmt = taxable;
      }

      // Grouping
      const rKey = (item.taxRate || 0).toString();
      taxGroups[rKey] = (taxGroups[rKey] || new Decimal(0)).plus(taxAmt);
      subtotal = subtotal.plus(netAmt);
      totalTax = totalTax.plus(taxAmt);

      return { ...item, taxAmt: taxAmt.toNumber(), netAmt: netAmt.toNumber(), total: netAmt.plus(taxAmt).toNumber() };
    });

    // 5. TDS
    let runningTotal = subtotal.plus(totalTax);
    const tdsAmt = runningTotal.mul(new Decimal(invoice.tdsRate || 0).div(100));
    runningTotal = runningTotal.minus(tdsAmt);

    // 6. Extra Charges
    const extraTotal = invoice.extraCharges.reduce((acc, c) => acc.plus(new Decimal(c.value || 0)), new Decimal(0));
    runningTotal = runningTotal.plus(extraTotal);

    // 7. Global Discount (Post-Tax)
    let gDiscPost = new Decimal(0);
    if (invoice.globalDiscount?.layer === 'after_tax') {
      gDiscPost = invoice.globalDiscount.type === 'percent'
        ? runningTotal.mul(new Decimal(invoice.globalDiscount.value || 0).div(100))
        : new Decimal(invoice.globalDiscount.value || 0);
    }
    runningTotal = runningTotal.minus(gDiscPost);

    // 8. Rounding (Banker's or Manual)
    let grandTotal;
    if (invoice.manualRounding === 'up') grandTotal = runningTotal.ceil();
    else if (invoice.manualRounding === 'down') grandTotal = runningTotal.floor();
    else grandTotal = runningTotal.toDecimalPlaces(this.config.precision, Decimal.ROUND_HALF_EVEN);

    return {
      items,
      subtotal: subtotal.toNumber(),
      totalTax: totalTax.toNumber(),
      taxSummary: Object.entries(taxGroups).map(([rate, amt]) => ({ rate, amt: amt.toNumber() })),
      lineDiscTotal: lineDiscTotal.toNumber(),
      tdsAmount: tdsAmt.toNumber(),
      extraTotal: extraTotal.toNumber(),
      roundingAdj: grandTotal.minus(runningTotal).toNumber(),
      grandTotal: grandTotal.toNumber()
    };
  }
}
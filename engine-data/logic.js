import Decimal from 'decimal.js';

export class EnterpriseInvoiceEngine {
  constructor(config) {
    this.config = {
      roundingMode: config?.roundingMode || 'HALF_EVEN',
      precision: config?.precision || 2,
      taxInclusive: config?.taxInclusive || false
    };
    Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_EVEN });
  }

  // 10-STEP DETERMINISTIC CALCULATION PIPELINE
  calculate(invoice) {
    let subtotalNet = new Decimal(0);
    let totalTax = new Decimal(0);
    let totalLineDiscount = new Decimal(0);
    let totalLineCharge = new Decimal(0);
    let totalPreTaxGlobalDiscount = new Decimal(0);
    const taxBreakdown = {};

    const items = (invoice.items || []).map((item, idx) => {
      // 1. Base = Qty × Unit Price
      const qty = new Decimal(item.qty || 0);
      const rate = new Decimal(item.unitPrice || 0);
      let amount = qty.mul(rate);

      // 2. Line Charges (Fixed or %)
      let lCharge = new Decimal(0);
      if (item.chargeValue) {
        lCharge = item.chargeType === 'percent' 
          ? amount.mul(new Decimal(item.chargeValue).div(100)) 
          : new Decimal(item.chargeValue);
      }
      amount = amount.plus(lCharge);
      totalLineCharge = totalLineCharge.plus(lCharge);

      // 3. Line Discounts (Fixed or %)
      let lDisc = new Decimal(0);
      if (item.discountValue) {
        lDisc = item.discountType === 'percent' 
          ? amount.mul(new Decimal(item.discountValue).div(100)) 
          : new Decimal(item.discountValue);
      }
      amount = amount.minus(lDisc);
      totalLineDiscount = totalLineDiscount.plus(lDisc);

      // 4. Global Discount Share (Before Tax - Pro-rated)
      let preTaxGlobalShare = new Decimal(0);
      if (invoice.globalDiscount?.layer === 'before_tax' && invoice.globalDiscount.value) {
        preTaxGlobalShare = invoice.globalDiscount.type === 'percent'
          ? amount.mul(new Decimal(invoice.globalDiscount.value).div(100))
          : new Decimal(invoice.globalDiscount.value).div(invoice.items.length || 1);
      }
      amount = amount.minus(preTaxGlobalShare);
      totalPreTaxGlobalDiscount = totalPreTaxGlobalDiscount.plus(preTaxGlobalShare);

      // 5. Tax Calculation (Inclusive vs Exclusive)
      const taxRate = new Decimal(item.taxRate || 0).div(100);
      let tAmt, nAmt;
      if (this.config.taxInclusive) {
        tAmt = amount.minus(amount.div(taxRate.plus(1)));
        nAmt = amount.minus(tAmt);
      } else {
        tAmt = amount.mul(taxRate);
        nAmt = amount;
      }

      // Aggregate Tax Breakdown
      const rKey = (item.taxRate || 0).toString();
      taxBreakdown[rKey] = (taxBreakdown[rKey] || new Decimal(0)).plus(tAmt);
      
      subtotalNet = subtotalNet.plus(nAmt);
      totalTax = totalTax.plus(tAmt);

      return { 
        ...item, 
        sn: idx + 1,
        netAmount: nAmt.toNumber(), 
        taxAmount: tAmt.toNumber(), 
        lineTotal: nAmt.plus(tAmt).toNumber() 
      };
    });

    // 6. TDS / Withholding
    let runningTotal = subtotalNet.plus(totalTax);
    const tdsAmount = runningTotal.mul(new Decimal(invoice.tdsRate || 0).div(100));
    runningTotal = runningTotal.minus(tdsAmount);

    // 7. Extra Charges (After Tax)
    const extraTotal = (invoice.extraCharges || []).reduce((acc, c) => acc.plus(new Decimal(c.value || 0)), new Decimal(0));
    runningTotal = runningTotal.plus(extraTotal);

    // 8. Global Discount (Post-Tax Layer)
    let postTaxGlobal = new Decimal(0);
    if (invoice.globalDiscount?.layer === 'after_tax' && invoice.globalDiscount.value) {
      postTaxGlobal = invoice.globalDiscount.type === 'percent'
        ? runningTotal.mul(new Decimal(invoice.globalDiscount.value).div(100))
        : new Decimal(invoice.globalDiscount.value);
    }
    runningTotal = runningTotal.minus(postTaxGlobal);

    // 9. Rounding Adjustment
    const rm = this.config.roundingMode === 'HALF_EVEN' ? Decimal.ROUND_HALF_EVEN : Decimal.ROUND_HALF_UP;
    let grandTotal;
    if (invoice.manualRounding === 'up') grandTotal = runningTotal.ceil();
    else if (invoice.manualRounding === 'down') grandTotal = runningTotal.floor();
    else grandTotal = runningTotal.toDecimalPlaces(this.config.precision, rm);

    // 10. Final Result
    return {
      items,
      subtotal: subtotalNet.toNumber(),
      totalTax: totalTax.toNumber(),
      taxSummary: Object.entries(taxBreakdown).map(([rate, amt]) => ({ rate, amt: amt.toNumber() })),
      totalDiscount: totalPreTaxGlobalDiscount.plus(postTaxGlobal).plus(totalLineDiscount).toNumber(),
      tdsAmount: tdsAmount.toNumber(),
      extraChargesTotal: extraTotal.toNumber(),
      roundingAdjustment: grandTotal.minus(runningTotal).toNumber(),
      grandTotal: grandTotal.toNumber()
    };
  }

  static toWords(n) {
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
  }
}
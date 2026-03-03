import Decimal from 'decimal.js';

export class InvoiceLogicEngine {
  constructor(config) {
    this.config = {
      roundingMode: config?.roundingMode || 'HALF_EVEN', // Banker's Rounding
      precision: config?.precision || 2,
      taxInclusive: config?.taxInclusive || false
    };
    // Configure Decimal.js globally for this instance
    Decimal.set({ precision: this.config.precision + 5 }); // Internal precision higher than display
  }

  // --- Core Calculation Pipeline (10-Steps) ---
  calculate(invoiceData) {
    let subtotalNet = new Decimal(0);
    let totalTax = new Decimal(0);
    let totalLineDiscount = new Decimal(0);
    let totalLineCharge = new Decimal(0);
    let totalPreTaxGlobalDiscount = new Decimal(0); // Sum of pre-tax global discounts applied
    const taxSummary = {}; // Grouped by rate

    const items = (invoiceData.items || []).map(item => {
      // Step 1: Base = Qty × Unit Price
      const qty = new Decimal(item.qty || 0);
      const unitPrice = new Decimal(item.unitPrice || 0);
      let baseAmount = qty.mul(unitPrice);

      // Step 2: Apply Line Charges
      let lineCharge = new Decimal(0);
      if (item.chargeValue) {
        lineCharge = item.chargeType === 'percent'
          ? baseAmount.mul(new Decimal(item.chargeValue).div(100))
          : new Decimal(item.chargeValue);
      }
      baseAmount = baseAmount.plus(lineCharge);
      totalLineCharge = totalLineCharge.plus(lineCharge);

      // Step 3: Apply Line Discounts
      let lineDiscount = new Decimal(0);
      if (item.discountValue) {
        lineDiscount = item.discountType === 'percent'
          ? baseAmount.mul(new Decimal(item.discountValue).div(100))
          : new Decimal(item.discountValue);
      }
      baseAmount = baseAmount.minus(lineDiscount);
      totalLineDiscount = totalLineDiscount.plus(lineDiscount);

      // Step 4: Apply Global Discount (before tax if configured) - Pro-rated distribution
      let preTaxGlobalShare = new Decimal(0);
      if (invoiceData.globalDiscount?.layer === 'before_tax' && invoiceData.globalDiscount.value) {
        preTaxGlobalShare = invoiceData.globalDiscount.type === 'percent'
          ? baseAmount.mul(new Decimal(invoiceData.globalDiscount.value).div(100))
          : new Decimal(invoiceData.globalDiscount.value).div(invoiceData.items.length || 1);
      }
      baseAmount = baseAmount.minus(preTaxGlobalShare);
      totalPreTaxGlobalDiscount = totalPreTaxGlobalDiscount.plus(preTaxGlobalShare); // Sum for overall total

      // Step 5: Calculate Tax (inclusive or exclusive)
      const taxRate = new Decimal(item.taxRate || 0).div(100);
      let taxAmount = new Decimal(0);
      let netAmount = new Decimal(0); // This is the amount before tax is added

      if (this.config.taxInclusive) {
        // Tax = Amount - (Amount / (1 + Rate))
        taxAmount = baseAmount.minus(baseAmount.div(taxRate.plus(1)));
        netAmount = baseAmount.minus(taxAmount);
      } else {
        taxAmount = baseAmount.mul(taxRate);
        netAmount = baseAmount;
      }

      // Update overall totals
      subtotalNet = subtotalNet.plus(netAmount);
      totalTax = totalTax.plus(taxAmount);

      // Group tax by rate for summary
      const rateKey = (item.taxRate || 0).toFixed(this.config.precision);
      taxSummary[rateKey] = (taxSummary[rateKey] || new Decimal(0)).plus(taxAmount);

      return {
        ...item,
        calculatedBase: baseAmount.toNumber(),
        lineChargeAmount: lineCharge.toNumber(),
        lineDiscountAmount: lineDiscount.toNumber(),
        netAmount: netAmount.toNumber(), // Amount before tax
        taxAmount: taxAmount.toNumber(), // Tax on this line
        grossAmount: netAmount.plus(taxAmount).toNumber() // Net + Tax
      };
    });

    let currentTotalBeforeRounding = subtotalNet.plus(totalTax);

    // Step 6: Apply TDS / Withholding
    const tdsAmount = currentTotalBeforeRounding.mul(new Decimal(invoiceData.tdsRate || 0).div(100));
    currentTotalBeforeRounding = currentTotalBeforeRounding.minus(tdsAmount);

    // Step 7: Add Extra Charges (global)
    const extraChargesTotal = (invoiceData.extraCharges || []).reduce((acc, charge) => {
      const chargeValue = new Decimal(charge.value || 0);
      return acc.plus(chargeValue);
    }, new Decimal(0));
    currentTotalBeforeRounding = currentTotalBeforeRounding.plus(extraChargesTotal);

    // Step 8: Apply Global Discount (after tax if configured)
    let postTaxGlobalDiscount = new Decimal(0);
    if (invoiceData.globalDiscount?.layer === 'after_tax' && invoiceData.globalDiscount.value) {
      postTaxGlobalDiscount = invoiceData.globalDiscount.type === 'percent'
        ? currentTotalBeforeRounding.mul(new Decimal(invoiceData.globalDiscount.value).div(100))
        : new Decimal(invoiceData.globalDiscount.value);
    }
    currentTotalBeforeRounding = currentTotalBeforeRounding.minus(postTaxGlobalDiscount);

    // Step 9: Apply Rounding (configurable mode & precision / manual)
    const rm = this.config.roundingMode === 'HALF_EVEN' ? Decimal.ROUND_HALF_EVEN : Decimal.ROUND_HALF_UP;
    let finalGrandTotal = new Decimal(0);
    let roundingAdjustment = new Decimal(0);

    if (invoiceData.manualRounding === 'up') {
      finalGrandTotal = currentTotalBeforeRounding.ceil();
    } else if (invoiceData.manualRounding === 'down') {
      finalGrandTotal = currentTotalBeforeRounding.floor();
    } else {
      finalGrandTotal = currentTotalBeforeRounding.toDecimalPlaces(this.config.precision, rm);
    }
    roundingAdjustment = finalGrandTotal.minus(currentTotalBeforeRounding);

    // Step 10: Produce Final Grand Total
    return {
      items,
      subtotal: subtotalNet.toNumber(),
      totalTax: totalTax.toNumber(),
      totalLineDiscount: totalLineDiscount.toNumber(),
      totalGlobalDiscount: totalPreTaxGlobalDiscount.plus(postTaxGlobalDiscount).toNumber(),
      totalExtraCharges: extraChargesTotal.toNumber(),
      tdsAmount: tdsAmount.toNumber(),
      roundingAdjustment: roundingAdjustment.toNumber(),
      grandTotal: finalGrandTotal.toNumber(),
      payableAfterTds: finalGrandTotal.toNumber() // For now, same as grandTotal
    };
  }

  // --- Utility Functions ---
  static numberToWords(n) {
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

  static validate(invoice) {
    const errors = [];
    if (!invoice.items || invoice.items.length === 0) {
      errors.push("At least one line item is required.");
    }
    invoice.items.forEach((item, index) => {
      if ((item.qty || 0) <= 0) errors.push(`Line ${index + 1}: Quantity must be positive.`);
      if ((item.unitPrice || 0) < 0) errors.push(`Line ${index + 1}: Unit price cannot be negative.`);
      if ((item.taxRate || 0) > 100 || (item.taxRate || 0) < 0) errors.push(`Line ${index + 1}: Tax rate must be between 0-100%.`);
      if (item.discountValue && item.discountType === 'percent' && (item.discountValue > 100 || item.discountValue < 0)) {
        errors.push(`Line ${index + 1}: Discount percentage must be between 0-100%.`);
      }
    });
    // Add more validation rules as needed
    return errors;
  }
}
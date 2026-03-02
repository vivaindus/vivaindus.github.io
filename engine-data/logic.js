import { Decimal } from 'decimal.js';

/**
 * 1. FORMULA ENGINE (AST-lite)
 * Resolves column dependencies using Topological Sorting
 */
export const FormulaEngine = {
  // Simple regex parser to find column keys (Uppercase letters)
  getDependencies: (formula) => formula.match(/[A-Z_]{2,}/g) || [],

  resolveCalculationOrder: (columns) => {
    const sorted = [];
    const visited = new Set();
    const temp = new Set();

    const visit = (col) => {
      if (temp.has(col.key)) throw new Error(`Cycle detected at ${col.key}`);
      if (!visited.has(col.key)) {
        temp.add(col.key);
        const deps = FormulaEngine.getDependencies(col.formula || '');
        deps.forEach(depKey => {
          const depCol = columns.find(c => c.key === depKey);
          if (depCol) visit(depCol);
        });
        visited.add(col.key);
        temp.delete(col.key);
        sorted.push(col);
      }
    };

    columns.forEach(col => visit(col));
    return sorted;
  }
};

/**
 * 2. DETERMINISTIC CALCULATION PIPELINE
 * Strictly follows the 10-step sequence requested.
 */
export class InvoiceLogic {
  constructor(config) {
    this.config = {
      roundingMode: config.roundingMode || 'HALF_EVEN', // Banker's Rounding
      precision: config.precision || 2,
      taxInclusive: config.taxInclusive || false,
      ...config
    };
  }

  calculate(items, globalDiscount, extraCharges, tdsRate) {
    let subtotalTaxable = new Decimal(0);
    let totalTaxAmount = new Decimal(0);
    let totalDiscount = new Decimal(0);

    const processedItems = items.map(item => {
      // 1. Base = Qty × Unit Price
      let base = new Decimal(item.qty || 0).mul(item.unitPrice || 0);

      // 2. Apply Line Charges
      let lineCharge = item.chargeType === 'percent' 
        ? base.mul(new Decimal(item.chargeValue || 0).div(100)) 
        : new Decimal(item.chargeValue || 0);
      let afterCharge = base.plus(lineCharge);

      // 3. Apply Line Discounts
      let lineDiscount = item.discountType === 'percent'
        ? afterCharge.mul(new Decimal(item.discountValue || 0).div(100))
        : new Decimal(item.discountValue || 0);
      let netBeforeGlobal = afterCharge.minus(lineDiscount);

      // 4. Global Discount (Before Tax Layer)
      let preTaxGlobal = new Decimal(0);
      if (globalDiscount.layer === 'before_tax') {
        preTaxGlobal = globalDiscount.type === 'percent' 
          ? netBeforeGlobal.mul(new Decimal(globalDiscount.value).div(100))
          : new Decimal(globalDiscount.value).div(items.length);
      }
      let taxableAmount = netBeforeGlobal.minus(preTaxGlobal);

      // 5. Tax Calculation
      let taxAmount = new Decimal(0);
      const taxRate = new Decimal(item.taxRate || 0).div(100);
      if (this.config.taxInclusive) {
        // Tax = Amount - (Amount / (1 + Rate))
        taxAmount = taxableAmount.minus(taxableAmount.div(taxRate.plus(1)));
        taxableAmount = taxableAmount.minus(taxAmount);
      } else {
        taxAmount = taxableAmount.mul(taxRate);
      }

      const lineTotal = taxableAmount.plus(taxAmount);
      
      subtotalTaxable = subtotalTaxable.plus(taxableAmount);
      totalTaxAmount = totalTaxAmount.plus(taxAmount);
      totalDiscount = totalDiscount.plus(lineDiscount).plus(preTaxGlobal);

      return { ...item, base, taxableAmount, taxAmount, lineTotal };
    });

    // 6. TDS / Withholding
    let runningTotal = subtotalTaxable.plus(totalTaxAmount);
    const tdsAmount = runningTotal.mul(new Decimal(tdsRate || 0).div(100));
    runningTotal = runningTotal.minus(tdsAmount);

    // 7. Extra Charges (Before/After Tax handled by placement)
    extraCharges.forEach(c => {
      runningTotal = runningTotal.plus(new Decimal(c.value || 0));
    });

    // 8. Global Discount (After Tax Layer)
    if (globalDiscount.layer === 'after_tax') {
      const postTaxDisc = globalDiscount.type === 'percent'
        ? runningTotal.mul(new Decimal(globalDiscount.value).div(100))
        : new Decimal(globalDiscount.value);
      runningTotal = runningTotal.minus(postTaxDisc);
      totalDiscount = totalDiscount.plus(postTaxDisc);
    }

    // 9. Apply Rounding
    const rm = this.config.roundingMode === 'HALF_EVEN' ? Decimal.ROUND_HALF_EVEN : Decimal.ROUND_HALF_UP;
    const finalGrandTotal = runningTotal.toDecimalPlaces(this.config.precision, rm);

    // 10. Produce Final Grand Total
    return {
      processedItems,
      subtotal: subtotalTaxable.toNumber(),
      totalTax: totalTaxAmount.toNumber(),
      totalDiscount: totalDiscount.toNumber(),
      tdsAmount: tdsAmount.toNumber(),
      grandTotal: finalGrandTotal.toNumber(),
      payable: finalGrandTotal.toNumber()
    };
  }
}

/**
 * 3. VALIDATION ENGINE
 */
export const InvoiceValidator = {
  validate: (invoice) => {
    const errors = [];
    if (!invoice.items || invoice.items.length === 0) errors.push("At least one line item is required.");
    invoice.items.forEach((item, i) => {
      if (item.qty < 0) errors.push(`Line ${i+1}: Quantity cannot be negative.`);
      if (item.discountValue > (item.qty * item.unitPrice)) errors.push(`Line ${i+1}: Discount exceeds base price.`);
    });
    return errors;
  }
};
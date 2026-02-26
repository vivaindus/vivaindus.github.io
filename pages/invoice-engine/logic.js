// pages/invoice-engine/logic.js
export const JURISDICTIONS = {
    AE: { name: 'United Arab Emirates', currency: 'AED', taxLabel: 'VAT', taxRate: 5, decimals: 2, major: 'Dirham', minor: 'Fils' },
    OM: { name: 'Oman', currency: 'OMR', taxLabel: 'VAT', taxRate: 5, decimals: 3, major: 'Rial', minor: 'Baisa' },
    SA: { name: 'Saudi Arabia', currency: 'SAR', taxLabel: 'VAT', taxRate: 15, decimals: 2, major: 'Riyal', minor: 'Halala' },
    IN: { name: 'India', currency: 'INR', taxLabel: 'GST', taxRate: 18, decimals: 2, major: 'Rupee', minor: 'Paise' }
};

export const parseFormula = (formula, values) => {
    try {
        let expr = formula;
        Object.keys(values).forEach(k => expr = expr.replace(new RegExp(`\\b${k}\\b`, 'g'), parseFloat(values[k]) || 0));
        // eslint-disable-next-line no-new-func
        return Function(`'use strict'; return (${expr})`)();
    } catch { return 0; }
};

export const toWords = (total, config) => {
    const n = Math.abs(parseFloat(total));
    if (isNaN(n) || n === 0) return `Zero ${config.currency} Only`;
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const convert = (num) => {
        if (num < 20) return ones[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
        if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convert(num % 100) : '');
        if (num < 1000000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convert(num % 1000) : '');
        return '';
    };
    const parts = n.toFixed(config.decimals).split('.');
    const majorVal = parseInt(parts[0]);
    const minorVal = parseInt(parts[1]);
    let res = majorVal > 0 ? `${convert(majorVal)} ${config.major}${majorVal > 1 ? 's' : ''}` : '';
    if (minorVal > 0) res += `${res ? ' and ' : ''}${convert(minorVal)} ${config.minor}`;
    return res + ' Only';
};
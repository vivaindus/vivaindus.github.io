export const JURISDICTIONS = {
    AE: { name: 'United Arab Emirates', currency: 'AED', taxLabel: 'VAT', taxRate: 5, decimals: 2, major: 'Dirham', minor: 'Fils' },
    OM: { name: 'Oman', currency: 'OMR', taxLabel: 'VAT', taxRate: 5, decimals: 3, major: 'Rial', minor: 'Baisa' },
    SA: { name: 'Saudi Arabia', currency: 'SAR', taxLabel: 'VAT', taxRate: 15, decimals: 2, major: 'Riyal', minor: 'Halala' },
    IN: { name: 'India', currency: 'INR', taxLabel: 'GST', taxRate: 18, decimals: 2, major: 'Rupee', minor: 'Paise' },
    US: { name: 'United States', currency: 'USD', taxLabel: 'Sales Tax', taxRate: 0, decimals: 2, major: 'Dollar', minor: 'Cents' }
};

export const parseFormula = (formula, values) => {
    try {
        let expression = formula;
        // Replace field IDs with numeric values
        Object.keys(values).forEach(id => {
            const val = parseFloat(values[id]) || 0;
            expression = expression.replace(new RegExp(`\\b${id}\\b`, 'g'), val);
        });
        // Sanitize: only allow numbers, operators, and parentheses
        if (/[^0-9\+\-\*\/\(\)\. ]/g.test(expression)) return 0;
        return Function(`'use strict'; return (${expression})`)() || 0;
    } catch { return 0; }
};

export const amountToWords = (total, config) => {
    const n = Math.abs(parseFloat(total));
    if (isNaN(n) || n === 0) return `Zero ${config.major} Only`;

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convert = (num) => {
        if (num === 0) return '';
        if (num < 20) return ones[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
        if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convert(num % 100) : '');
        if (num < 1000000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convert(num % 1000) : '');
        return 'Large Amount';
    };

    const parts = n.toFixed(config.decimals).split('.');
    const major = parseInt(parts[0]);
    const minor = parseInt(parts[1]);

    let res = major > 0 ? `${convert(major)} ${config.major}${major > 1 && config.major !== 'Rial' ? 's' : ''}` : '';
    if (minor > 0) {
        res += `${res ? ' and ' : ''}${convert(minor)} ${config.minor}`;
    }
    return res + ' Only';
};
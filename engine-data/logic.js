export const JURISDICTIONS = {
    AE: { name: 'UAE', currency: 'AED', taxLabel: 'VAT', taxRate: 5, decimals: 2, major: 'Dirham', minor: 'Fils' },
    IN: { name: 'India', currency: 'INR', taxLabel: 'GST', taxRate: 18, decimals: 2, major: 'Rupee', minor: 'Paise', hasSplitTax: true },
    OM: { name: 'Oman', currency: 'OMR', taxLabel: 'VAT', taxRate: 5, decimals: 3, major: 'Rial', minor: 'Baisa' },
    SA: { name: 'Saudi Arabia', currency: 'SAR', taxLabel: 'VAT', taxRate: 15, decimals: 2, major: 'Riyal', minor: 'Halala' },
    US: { name: 'USA', currency: 'USD', taxLabel: 'Sales Tax', taxRate: 0, decimals: 2, major: 'Dollar', minor: 'Cents' }
};

export const amountToWords = (total, config) => {
    const n = Math.abs(parseFloat(total));
    if (isNaN(n) || n === 0) return `Zero ${config.major} Only`;
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Million', 'Billion'];
    const convertChunk = (num) => {
        let str = '';
        if (num >= 100) { str += ones[Math.floor(num / 100)] + ' Hundred '; num %= 100; }
        if (num >= 20) { str += tens[Math.floor(num / 10)] + ' '; num %= 10; }
        if (num > 0) { str += ones[num] + ' '; }
        return str.trim();
    };
    const parts = n.toFixed(config.decimals).split('.');
    let majorNum = parseInt(parts[0]);
    const minorNum = parseInt(parts[1]);
    let majorWords = '';
    let scaleIdx = 0;
    while (majorNum > 0) {
        let chunk = majorNum % 1000;
        if (chunk > 0) majorWords = convertChunk(chunk) + (scales[scaleIdx] ? ' ' + scales[scaleIdx] : '') + ' ' + majorWords;
        majorNum = Math.floor(majorNum / 1000); scaleIdx++;
    }
    let res = `${majorWords.trim()} ${config.major}${parseInt(parts[0]) > 1 && config.major !== 'Rial' ? 's' : ''}`;
    if (minorNum > 0) res += ` and ${convertChunk(minorNum)} ${config.minor}`;
    return res.trim() + ' Only';
};
export const JURISDICTIONS = {
    AE: { name: 'UAE', currency: 'AED', taxLabel: 'VAT', taxRate: 5, decimals: 2, major: 'Dirham', minor: 'Fils' },
    IN: { name: 'India', currency: 'INR', taxLabel: 'GST', taxRate: 18, decimals: 2, major: 'Rupee', minor: 'Paise' },
    OM: { name: 'Oman', currency: 'OMR', taxLabel: 'VAT', taxRate: 5, decimals: 3, major: 'Rial', minor: 'Baisa' },
    US: { name: 'USA', currency: 'USD', taxLabel: 'Sales Tax', taxRate: 0, decimals: 2, major: 'Dollar', minor: 'Cents' }
};

// Refrens supports multiple templates. We define schemas here.
export const TEMPLATES = {
    modern: { borderRadius: '8px', headerBg: '#f8fafc', font: 'Inter' },
    classic: { borderRadius: '0px', headerBg: '#fff', font: 'serif' },
    shb_emerald: { borderRadius: '12px', headerBg: '#064e3b', font: 'Manrope' }
};

export const amountToWords = (total, config) => {
    // Advanced linguistic engine for international support
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Million', 'Billion'];

    const convert = (num) => {
        if (num === 0) return '';
        if (num < 20) return ones[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
        if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convert(num % 100) : '');
        return convert(Math.floor(num / 1000)) + ' Thousand ' + convert(num % 1000);
    };

    const n = Math.abs(parseFloat(total));
    const parts = n.toFixed(config.decimals).split('.');
    const major = parseInt(parts[0]);
    const minor = parseInt(parts[1]);

    let res = `${convert(major)} ${config.major}${major > 1 ? 's' : ''}`;
    if (minor > 0) res += ` and ${convert(minor)} ${config.minor}`;
    return res + ' Only';
};
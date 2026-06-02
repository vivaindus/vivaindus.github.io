import React, { useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import RelatedTools from '../../components/RelatedTools';

ChartJS.register(ArcElement, Tooltip, Legend);

const interestTypes = {
  regular: {
    label: 'Regular EMI / Reducing Balance',
    shortLabel: 'Regular EMI',
    description:
      'This is the common loan EMI method. Interest is calculated on the outstanding loan balance each month, and your fixed EMI includes both interest and principal repayment.',
    formula: 'EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)',
    bestFor:
      'Home loans, car loans, personal loans, and other loans where the balance reduces after each monthly payment.'
  },
  simple: {
    label: 'Simple Interest',
    shortLabel: 'Simple',
    description:
      'Simple interest is calculated only on the original principal amount. It does not add previous interest back into the loan balance.',
    formula: 'Simple Interest = P × R × T',
    bestFor:
      'Basic education, short-term loan examples, quick interest estimates, and comparing simple borrowing cost.'
  },
  compound: {
    label: 'Compound Interest',
    shortLabel: 'Compound',
    description:
      'Compound interest adds accumulated interest back to the amount, so future interest can be charged on both principal and previous interest.',
    formula: 'Amount = P × (1 + r/m)^(m × t)',
    bestFor:
      'Understanding compounding cost, savings growth, investment growth, and loans where unpaid interest compounds.'
  },
  apr: {
    label: 'APR / Fees Included',
    shortLabel: 'APR',
    description:
      'APR-style comparison includes interest plus selected loan fees to show a broader borrowing cost. This helps compare offers where one loan has a lower rate but higher fees.',
    formula: 'APR-style Cost = Interest + Fees',
    bestFor:
      'Comparing loan offers that include processing fees, arrangement charges, points, or other compulsory borrowing costs.'
  }
};

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(10);
  const [extraPayment, setExtraPayment] = useState(0);
  const [currency, setCurrency] = useState('AED');
  const [interestType, setInterestType] = useState('regular');
  const [compoundFrequency, setCompoundFrequency] = useState(12);
  const [upfrontFees, setUpfrontFees] = useState(0);
  const [notification, setNotification] = useState('');

  const selectedType = interestTypes[interestType];

  const result = useMemo(() => {
    return calculateLoan({
      principal: Number(loanAmount),
      annualRate: Number(interestRate),
      years: Number(tenureYears),
      months: Number(tenureYears) * 12,
      extraMonthly: Number(extraPayment),
      interestType,
      compoundFrequency: Number(compoundFrequency),
      upfrontFees: Number(upfrontFees)
    });
  }, [loanAmount, interestRate, tenureYears, extraPayment, interestType, compoundFrequency, upfrontFees]);

  const chartData = {
    labels: ['Principal Amount', 'Interest / Cost'],
    datasets: [
      {
        data: [result.principal, result.totalInterest],
        backgroundColor: ['#38bdf8', '#334155'],
        borderColor: ['#0f172a', '#0f172a'],
        borderWidth: 2
      }
    ]
  };

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const copySummary = async () => {
    const summary = [
      'SHB ToolBox Loan Calculation Summary',
      `Interest Type: ${selectedType.label}`,
      `Loan Amount: ${currency} ${formatNumber(result.principal)}`,
      `Annual Interest Rate: ${interestRate}%`,
      `Loan Tenure: ${tenureYears} years`,
      `Estimated Monthly Payment: ${currency} ${formatNumber(result.monthlyPayment)}`,
      `Total Interest / Cost: ${currency} ${formatNumber(result.totalInterest)}`,
      `Total Payable: ${currency} ${formatNumber(result.totalPayable)}`,
      `Upfront Fees Included: ${currency} ${formatNumber(result.upfrontFees)}`,
      `Extra Monthly Payment: ${currency} ${formatNumber(Number(extraPayment))}`,
      `Estimated Interest Saving: ${currency} ${formatNumber(result.interestSaved)}`,
      `Estimated Tenure Reduction: ${result.monthsSaved} months`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      showToast('Summary copied to clipboard 📋');
    } catch {
      showToast('Copy failed. Please copy manually.');
    }
  };

  const downloadSummary = () => {
    const lines = [
      'SHB ToolBox Loan Calculation Summary',
      '',
      `Interest Type: ${selectedType.label}`,
      `Formula: ${selectedType.formula}`,
      `Loan Amount: ${currency} ${formatNumber(result.principal)}`,
      `Annual Interest Rate: ${interestRate}%`,
      `Loan Tenure: ${tenureYears} years`,
      `Estimated Monthly Payment: ${currency} ${formatNumber(result.monthlyPayment)}`,
      `Total Interest / Cost: ${currency} ${formatNumber(result.totalInterest)}`,
      `Total Payable: ${currency} ${formatNumber(result.totalPayable)}`,
      `Upfront Fees Included: ${currency} ${formatNumber(result.upfrontFees)}`,
      '',
      `Extra Monthly Payment: ${currency} ${formatNumber(Number(extraPayment))}`,
      `Estimated Interest Saving: ${currency} ${formatNumber(result.interestSaved)}`,
      `Estimated Tenure Reduction: ${result.monthsSaved} months`,
      '',
      'Year-wise summary:',
      ...result.yearlySummary.map(row =>
        `Year ${row.year}: Principal ${currency} ${formatNumber(row.principalPaid)}, Interest/Cost ${currency} ${formatNumber(row.interestPaid)}, Balance ${currency} ${formatNumber(row.balance)}`
      ),
      '',
      'Note: This is an estimate for planning only. Confirm final figures, fees, APR, and repayment schedule with your lender.'
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'loan-calculation-summary.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showToast('Summary downloaded ✅');
  };

  return (
    <ToolboxLayout
      title="EMI Calculator - Loan EMI, Simple Interest, Compound Interest and APR Planner"
      description="Use the free SHB ToolBox EMI calculator to calculate regular EMI, simple interest, compound interest, APR-style fees, total interest, total repayment, prepayment savings, and year-wise loan balance."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free loan and interest calculator</p>
          <h1 style={heroTitle}>EMI Calculator with Interest Type Options</h1>
          <p style={heroText}>
            Calculate regular EMI, compare simple interest, understand compound interest, and include fees for an
            APR-style borrowing cost view. This calculator helps you test loan amount, interest rate, tenure,
            extra payments, and different interest methods in one place.
          </p>
        </section>

        <section style={interestTypeSection}>
          <h2 style={sectionTitle}>Choose interest calculation type</h2>
          <p style={sectionDesc}>
            Regular EMI is selected by default because it is the most common method for monthly loan repayment.
            You can switch to another method to understand how the calculation changes.
          </p>

          <div style={typeGrid}>
            {Object.entries(interestTypes).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setInterestType(key)}
                style={interestType === key ? typeCardActive : typeCard}
              >
                <span style={typeName}>{item.shortLabel}</span>
                <span style={typeDesc}>{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section style={toolGrid}>
          <div style={inputPanel}>
            <h2 style={panelTitle}>Loan details</h2>
            <p style={panelText}>
              Enter your loan values. The result updates automatically based on the selected interest type.
            </p>

            <div style={inputRow}>
              <label style={label}>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={inputStyle}>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="SAR">SAR</option>
                <option value="OMR">OMR</option>
                <option value="QAR">QAR</option>
              </select>
            </div>

            <div style={inputRow}>
              <div style={labelLine}>
                <label style={label}>Loan amount</label>
                <span style={valuePill}>{currency} {formatNumber(Number(loanAmount))}</span>
              </div>
              <input
                type="number"
                min="1"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                style={inputStyle}
              />
              <input
                type="range"
                min="10000"
                max="10000000"
                step="10000"
                value={Number(loanAmount) || 0}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                style={rangeStyle}
              />
            </div>

            <div style={inputRow}>
              <div style={labelLine}>
                <label style={label}>Annual interest rate</label>
                <span style={valuePill}>{interestRate}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="40"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                style={inputStyle}
              />
              <input
                type="range"
                min="0"
                max="25"
                step="0.1"
                value={Number(interestRate) || 0}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                style={rangeStyle}
              />
            </div>

            <div style={inputRow}>
              <div style={labelLine}>
                <label style={label}>Loan tenure</label>
                <span style={valuePill}>{tenureYears} years</span>
              </div>
              <input
                type="number"
                min="1"
                max="40"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                style={inputStyle}
              />
              <input
                type="range"
                min="1"
                max="40"
                step="1"
                value={Number(tenureYears) || 1}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                style={rangeStyle}
              />
            </div>

            {interestType === 'compound' && (
              <div style={inputRow}>
                <label style={label}>Compounding frequency</label>
                <select value={compoundFrequency} onChange={(e) => setCompoundFrequency(e.target.value)} style={inputStyle}>
                  <option value="1">Annually</option>
                  <option value="2">Half-yearly</option>
                  <option value="4">Quarterly</option>
                  <option value="12">Monthly</option>
                  <option value="365">Daily</option>
                </select>
              </div>
            )}

            {interestType === 'apr' && (
              <div style={inputRow}>
                <div style={labelLine}>
                  <label style={label}>Fees / charges included</label>
                  <span style={valuePill}>{currency} {formatNumber(Number(upfrontFees))}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={upfrontFees}
                  onChange={(e) => setUpfrontFees(e.target.value)}
                  placeholder="Example: processing fee"
                  style={inputStyle}
                />
                <p style={hint}>
                  APR-style comparison includes selected fees. This is an estimate, not an official lender APR disclosure.
                </p>
              </div>
            )}

            <div style={inputRow}>
              <div style={labelLine}>
                <label style={label}>Extra monthly prepayment</label>
                <span style={valuePill}>{currency} {formatNumber(Number(extraPayment))}</span>
              </div>
              <input
                type="number"
                min="0"
                value={extraPayment}
                onChange={(e) => setExtraPayment(e.target.value)}
                placeholder="Optional"
                style={inputStyle}
              />
              <p style={hint}>
                Optional. Prepayment impact is estimated best for regular EMI/reducing balance loans. Actual lender rules may differ.
              </p>
            </div>
          </div>

          <aside style={resultPanel}>
            <h2 style={panelTitle}>Result summary</h2>

            <div style={emiBox}>
              <span style={resultLabel}>{result.monthlyLabel}</span>
              <strong style={emiValue}>{currency} {formatNumber(result.monthlyPayment)}</strong>
            </div>

            <div style={summaryGrid}>
              <div style={summaryItem}>
                <span>Principal</span>
                <strong>{currency} {formatNumber(result.principal)}</strong>
              </div>
              <div style={summaryItem}>
                <span>Interest / Cost</span>
                <strong>{currency} {formatNumber(result.totalInterest)}</strong>
              </div>
              <div style={summaryItem}>
                <span>Total Payable</span>
                <strong>{currency} {formatNumber(result.totalPayable)}</strong>
              </div>
              <div style={summaryItem}>
                <span>Cost Share</span>
                <strong>{result.interestPercent.toFixed(1)}%</strong>
              </div>
            </div>

            <div style={chartWrap}>
              <Pie
                data={chartData}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#cbd5e1' }
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `${context.label}: ${currency} ${formatNumber(context.raw)}`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>

            <div style={methodBox}>
              <h3 style={methodTitle}>{selectedType.label}</h3>
              <p style={methodText}>{selectedType.description}</p>
              <div style={formulaBoxMini}>{selectedType.formula}</div>
              <p style={methodText}><strong>Best for:</strong> {selectedType.bestFor}</p>
            </div>

            <div style={savingBox}>
              <h3 style={savingTitle}>Prepayment impact</h3>
              <p style={savingText}>
                Estimated interest saving: <strong>{currency} {formatNumber(result.interestSaved)}</strong>
              </p>
              <p style={savingText}>
                Estimated tenure reduction: <strong>{result.monthsSaved} months</strong>
              </p>
            </div>

            <div style={buttonRow}>
              <button onClick={copySummary} style={primaryBtn}>Copy Summary</button>
              <button onClick={downloadSummary} style={secondaryBtn}>Download</button>
            </div>
          </aside>
        </section>

        <section style={tableSection}>
          <h2 style={contentTitle}>Year-wise repayment summary</h2>
          <p style={para}>
            This table summarizes estimated principal, interest/cost, and remaining balance by year. For simple,
            compound, and APR-style modes, the table is a planning estimate to help compare total cost over time.
          </p>

          <div style={tableWrap}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Year</th>
                  <th style={thStyle}>Principal Paid</th>
                  <th style={thStyle}>Interest / Cost</th>
                  <th style={thStyle}>Remaining Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.yearlySummary.map(row => (
                  <tr key={row.year}>
                    <td style={tdStyle}>{row.year}</td>
                    <td style={tdStyle}>{currency} {formatNumber(row.principalPaid)}</td>
                    <td style={tdStyle}>{currency} {formatNumber(row.interestPaid)}</td>
                    <td style={tdStyle}>{currency} {formatNumber(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        
        <RelatedTools currentPath="/emicalculator" />

<section style={contentSection}>
          <h2 style={contentTitle}>Understanding loan interest types</h2>
          <p style={para}>
            A powerful loan calculator should not only show a monthly payment. It should also explain how the cost is being
            calculated. Regular EMI, simple interest, compound interest, and APR-style comparison can produce different
            results because they treat interest and fees differently.
          </p>

          <div style={infoGrid}>
            <div style={infoCard}>
              <h3 style={infoTitle}>Regular EMI / reducing balance</h3>
              <p style={paraSmall}>
                This is the standard monthly repayment style used for many loans. The EMI stays fixed, but the interest
                portion is calculated on the remaining balance. As the balance reduces, more of the payment usually goes
                toward principal.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>Simple interest</h3>
              <p style={paraSmall}>
                Simple interest is calculated on the original principal only. The formula is usually written as P × R × T,
                where P is principal, R is annual rate, and T is time in years.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>Compound interest</h3>
              <p style={paraSmall}>
                Compound interest adds interest back to the balance at set intervals. This means future interest may be
                calculated on both the principal and earlier interest.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>APR / fees included</h3>
              <p style={paraSmall}>
                APR-style comparison considers interest plus selected fees to show a broader cost of borrowing. This is useful
                when comparing two loans with different processing fees or charges.
              </p>
            </div>
          </div>

          <h2 style={contentTitle}>What is EMI?</h2>
          <p style={para}>
            EMI stands for Equated Monthly Installment. It is the fixed amount a borrower pays every month to repay a loan.
            An EMI usually includes interest and principal. In the early months of many reducing-balance loans, a larger
            portion may go toward interest. Later, more of the EMI usually goes toward principal.
          </p>

          <h2 style={contentTitle}>How to use this calculator properly</h2>
          <p style={para}>
            Start with Regular EMI for most home, car, and personal loan planning. Then switch to Simple Interest or Compound
            Interest to compare how different interest methods affect total cost. Use APR / Fees Included when you want to add
            processing fees or charges and compare the broader cost of borrowing.
          </p>

          <h2 style={contentTitle}>Important note</h2>
          <p style={para}>
            This calculator is for planning and educational use only. Actual loan offers may include processing fees, insurance,
            early settlement charges, reducing balance rules, variable rates, taxes, APR disclosures, and bank-specific conditions.
            Always confirm final repayment details with your lender before making a financial decision.
          </p>

          <h2 style={contentTitle}>Privacy note</h2>
          <p style={para}>
            This loan calculator runs in your browser and does not require an account. The values you enter are used to calculate
            results on the page. Avoid sharing sensitive financial information publicly or entering personal details into tools
            unless they are required and clearly explained.
          </p>
        </section>

        <section style={faqSection}>
          <h2 style={contentTitle}>EMI and Interest Calculator FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3 style={faqQ}>Which interest type should I choose?</h3>
              <p style={paraSmall}>Use Regular EMI for most monthly loan repayment estimates. Use the other types for comparison and learning.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Is APR the same as interest rate?</h3>
              <p style={paraSmall}>No. APR can include interest plus certain fees or charges, so it may show a broader cost of borrowing.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Why is compound interest higher?</h3>
              <p style={paraSmall}>Compound interest can grow faster because interest may be calculated on previous accumulated interest.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Can prepayment reduce interest?</h3>
              <p style={paraSmall}>Prepayment may reduce interest in reducing-balance loans, but actual savings depend on lender rules and fees.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function calculateLoan({ principal, annualRate, years, months, extraMonthly, interestType, compoundFrequency, upfrontFees }) {
  const safePrincipal = Number.isFinite(principal) && principal > 0 ? principal : 0;
  const safeRate = Number.isFinite(annualRate) && annualRate >= 0 ? annualRate : 0;
  const safeYears = Number.isFinite(years) && years > 0 ? years : 1;
  const safeMonths = Number.isFinite(months) && months > 0 ? Math.round(months) : 1;
  const safeExtra = Number.isFinite(extraMonthly) && extraMonthly > 0 ? extraMonthly : 0;
  const safeFees = Number.isFinite(upfrontFees) && upfrontFees > 0 ? upfrontFees : 0;
  const safeFrequency = Number.isFinite(compoundFrequency) && compoundFrequency > 0 ? compoundFrequency : 12;

  if (interestType === 'simple') {
    const interest = safePrincipal * (safeRate / 100) * safeYears;
    const totalPayable = safePrincipal + interest;
    const monthlyPayment = totalPayable / safeMonths;

    return buildSimpleResult({
      principal: safePrincipal,
      totalInterest: interest,
      totalPayable,
      monthlyPayment,
      months: safeMonths,
      monthlyLabel: 'Estimated monthly payment'
    });
  }

  if (interestType === 'compound') {
    const amount = safePrincipal * Math.pow(1 + (safeRate / 100) / safeFrequency, safeFrequency * safeYears);
    const interest = Math.max(0, amount - safePrincipal);
    const monthlyPayment = amount / safeMonths;

    return buildSimpleResult({
      principal: safePrincipal,
      totalInterest: interest,
      totalPayable: amount,
      monthlyPayment,
      months: safeMonths,
      monthlyLabel: 'Estimated monthly payment'
    });
  }

  if (interestType === 'apr') {
    const regular = calculateRegularLoan({
      principal: safePrincipal,
      annualRate: safeRate,
      months: safeMonths,
      extraMonthly: safeExtra
    });

    const totalInterestWithFees = regular.totalInterest + safeFees;
    const totalPayableWithFees = safePrincipal + totalInterestWithFees;

    return {
      ...regular,
      totalInterest: totalInterestWithFees,
      totalPayable: totalPayableWithFees,
      upfrontFees: safeFees,
      interestPercent: totalPayableWithFees > 0 ? (totalInterestWithFees / totalPayableWithFees) * 100 : 0,
      monthlyLabel: 'Monthly EMI plus fee-adjusted cost view'
    };
  }

  return calculateRegularLoan({
    principal: safePrincipal,
    annualRate: safeRate,
    months: safeMonths,
    extraMonthly: safeExtra
  });
}

function calculateRegularLoan({ principal, annualRate, months, extraMonthly }) {
  const monthlyRate = annualRate / 12 / 100;
  const emi = monthlyRate === 0
    ? principal / months
    : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);

  const baseSchedule = buildAmortizedSchedule({
    principal,
    monthlyRate,
    emi,
    extraMonthly: 0,
    maxMonths: months
  });

  const extraSchedule = buildAmortizedSchedule({
    principal,
    monthlyRate,
    emi,
    extraMonthly,
    maxMonths: months
  });

  const totalInterest = baseSchedule.totalInterest;
  const totalPayable = principal + totalInterest;
  const interestPercent = totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0;
  const interestSaved = Math.max(0, totalInterest - extraSchedule.totalInterest);
  const monthsSaved = Math.max(0, baseSchedule.monthsTaken - extraSchedule.monthsTaken);

  return {
    principal,
    monthlyPayment: emi,
    emi,
    totalInterest,
    totalPayable,
    interestPercent,
    interestSaved,
    monthsSaved,
    upfrontFees: 0,
    monthlyLabel: 'Monthly EMI',
    yearlySummary: baseSchedule.yearlySummary
  };
}

function buildAmortizedSchedule({ principal, monthlyRate, emi, extraMonthly, maxMonths }) {
  let balance = principal;
  let totalInterest = 0;
  let month = 0;
  const yearlyMap = [];

  while (balance > 0.01 && month < maxMonths) {
    month += 1;

    const interest = balance * monthlyRate;
    const payment = Math.min(balance + interest, emi + extraMonthly);
    const principalPaid = Math.max(0, payment - interest);

    balance = Math.max(0, balance + interest - payment);
    totalInterest += interest;

    const yearIndex = Math.ceil(month / 12) - 1;

    if (!yearlyMap[yearIndex]) {
      yearlyMap[yearIndex] = {
        year: yearIndex + 1,
        principalPaid: 0,
        interestPaid: 0,
        balance: 0
      };
    }

    yearlyMap[yearIndex].principalPaid += principalPaid;
    yearlyMap[yearIndex].interestPaid += interest;
    yearlyMap[yearIndex].balance = balance;
  }

  return {
    totalInterest,
    monthsTaken: month,
    yearlySummary: yearlyMap.map(row => ({
      year: row.year,
      principalPaid: row.principalPaid,
      interestPaid: row.interestPaid,
      balance: row.balance
    }))
  };
}

function buildSimpleResult({ principal, totalInterest, totalPayable, monthlyPayment, months, monthlyLabel }) {
  const yearlySummary = [];
  const years = Math.ceil(months / 12);
  const principalPerMonth = principal / months;
  const interestPerMonth = totalInterest / months;

  for (let year = 1; year <= years; year++) {
    const monthsInYear = year === years ? months - (year - 1) * 12 : 12;
    const principalPaid = principalPerMonth * monthsInYear;
    const interestPaid = interestPerMonth * monthsInYear;
    const balance = Math.max(0, principal - principalPerMonth * Math.min(year * 12, months));

    yearlySummary.push({
      year,
      principalPaid,
      interestPaid,
      balance
    });
  }

  return {
    principal,
    monthlyPayment,
    emi: monthlyPayment,
    totalInterest,
    totalPayable,
    interestPercent: totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0,
    interestSaved: 0,
    monthsSaved: 0,
    upfrontFees: 0,
    monthlyLabel,
    yearlySummary
  };
}

function formatNumber(value) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return Math.round(safeValue).toLocaleString();
}

const pageWrap = { maxWidth: '1150px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '900px', margin: '0 auto', lineHeight: 1.75 };

const interestTypeSection = { background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '28px', marginBottom: '26px' };
const sectionTitle = { color: '#fff', fontSize: '1.45rem', margin: '0 0 10px' };
const sectionDesc = { color: '#94a3b8', lineHeight: 1.65, margin: '0 0 20px' };
const typeGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' };
const typeCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' };
const typeCardActive = { ...typeCard, border: '1px solid #38bdf8', background: 'rgba(56,189,248,0.12)' };
const typeName = { color: '#38bdf8', fontWeight: 950, fontSize: '1rem' };
const typeDesc = { color: '#cbd5e1', lineHeight: 1.45, fontSize: '0.86rem' };

const toolGrid = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 410px', gap: '24px', alignItems: 'start' };
const inputPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '30px', boxShadow: '0 14px 35px rgba(0,0,0,0.2)' };
const resultPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', position: 'sticky', top: '92px' };
const panelTitle = { color: '#fff', fontSize: '1.45rem', margin: '0 0 10px' };
const panelText = { color: '#94a3b8', lineHeight: 1.6, margin: '0 0 24px' };

const inputRow = { marginBottom: '24px' };
const labelLine = { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '10px' };
const label = { fontSize: '0.78rem', color: '#94a3b8', fontWeight: 900, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' };
const valuePill = { color: '#38bdf8', background: '#0f172a', border: '1px solid #334155', padding: '6px 10px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 850 };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '15px', borderRadius: '14px', color: '#fff', fontSize: '1rem', outline: 'none' };
const rangeStyle = { width: '100%', marginTop: '12px', accentColor: '#38bdf8' };
const hint = { color: '#64748b', lineHeight: 1.55, fontSize: '0.86rem', margin: '10px 0 0' };

const emiBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '22px', padding: '22px', marginBottom: '18px' };
const resultLabel = { color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900, fontSize: '0.78rem' };
const emiValue = { color: '#38bdf8', display: 'block', fontSize: '2rem', marginTop: '8px', lineHeight: 1.15 };
const summaryGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' };
const summaryItem = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#94a3b8' };
const chartWrap = { width: '260px', maxWidth: '100%', margin: '20px auto' };

const methodBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', marginTop: '16px' };
const methodTitle = { color: '#38bdf8', margin: '0 0 10px', fontSize: '1.05rem' };
const methodText = { color: '#cbd5e1', lineHeight: 1.65, fontSize: '0.9rem', margin: '0 0 12px' };
const formulaBoxMini = { background: 'rgba(56,189,248,0.08)', border: '1px solid #334155', color: '#38bdf8', borderRadius: '14px', padding: '12px', fontWeight: 900, fontSize: '0.86rem', marginBottom: '12px' };

const savingBox = { background: 'rgba(56,189,248,0.08)', border: '1px solid #334155', borderRadius: '18px', padding: '18px', marginTop: '16px' };
const savingTitle = { color: '#fff', margin: '0 0 10px', fontSize: '1.05rem' };
const savingText = { color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 8px' };
const buttonRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' };
const primaryBtn = { background: '#38bdf8', color: '#082f49', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 950, cursor: 'pointer' };
const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 850, cursor: 'pointer' };

const tableSection = { marginTop: '76px', background: '#1e293b', border: '1px solid #334155', borderRadius: '26px', padding: '30px' };
const tableWrap = { overflowX: 'auto', marginTop: '18px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: '650px' };
const thStyle = { textAlign: 'left', color: '#38bdf8', borderBottom: '1px solid #334155', padding: '14px', fontSize: '0.9rem' };
const tdStyle = { color: '#cbd5e1', borderBottom: '1px solid #0f172a', padding: '14px', fontSize: '0.92rem' };

const contentSection = { marginTop: '76px', borderTop: '1px solid #334155', paddingTop: '55px' };
const contentTitle = { color: '#fff', fontSize: '1.75rem', lineHeight: 1.25, margin: '0 0 18px' };
const para = { color: '#cbd5e1', lineHeight: 1.85, fontSize: '1rem', margin: '0 0 28px' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '28px 0 48px' };
const infoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '24px' };
const infoTitle = { color: '#38bdf8', margin: '0 0 12px', fontSize: '1.05rem' };
const paraSmall = { color: '#cbd5e1', lineHeight: 1.75, fontSize: '0.95rem', margin: 0 };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px' };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };
const faqQ = { color: '#fff', fontSize: '1rem', margin: '0 0 10px' };
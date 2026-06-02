import React, { useEffect, useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

export default function SIPCalculator() {
  const [mounted, setMounted] = useState(false);
  const [notification, setNotification] = useState('');
  const [mode, setMode] = useState('sip');
  const [currency, setCurrency] = useState('AED');

  const [sip, setSip] = useState({
    monthly: 5000,
    returnRate: 12,
    years: 10,
    stepUp: 10,
    lumpsum: 25000,
    inflation: 5,
    goalAmount: 1000000
  });

  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      ChartJS.register(
        ArcElement,
        LineElement,
        PointElement,
        LinearScale,
        CategoryScale,
        Tooltip,
        Legend,
        Filler
      );
    }
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const result = useMemo(() => {
    return calculateInvestment({
      mode,
      monthly: safeNumber(sip.monthly),
      returnRate: safeNumber(sip.returnRate),
      years: safeNumber(sip.years),
      stepUp: safeNumber(sip.stepUp),
      lumpsum: safeNumber(sip.lumpsum),
      inflation: safeNumber(sip.inflation),
      goalAmount: safeNumber(sip.goalAmount)
    });
  }, [mode, sip]);

  const doughnutData = useMemo(() => ({
    labels: ['Invested Amount', 'Estimated Returns'],
    datasets: [{
      data: [Math.max(result.invested, 0), Math.max(result.returns, 0)],
      backgroundColor: ['#1e293b', '#34d399'],
      borderColor: ['#334155', '#34d399'],
      borderWidth: 1
    }]
  }), [result]);

  const lineData = useMemo(() => ({
    labels: result.yearly.map(item => `Year ${item.year}`),
    datasets: [
      {
        label: 'Invested',
        data: result.yearly.map(item => Math.round(item.invested)),
        borderColor: '#64748b',
        backgroundColor: 'rgba(100,116,139,0.12)',
        tension: 0.35,
        fill: false
      },
      {
        label: 'Value',
        data: result.yearly.map(item => Math.round(item.value)),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52,211,153,0.12)',
        tension: 0.35,
        fill: true
      }
    ]
  }), [result]);

  const showToast = (message) => {
    setNotification(message);
  };

  const update = (field, value) => {
    setSip(prev => ({ ...prev, [field]: value }));
  };

  const copySummary = async () => {
    const summary = [
      'SHB ToolBox SIP Calculator Summary',
      `Mode: ${getModeLabel(mode)}`,
      `Currency: ${currency}`,
      `Monthly SIP: ${formatMoney(sip.monthly, currency)}`,
      `Lumpsum: ${formatMoney(sip.lumpsum, currency)}`,
      `Expected Return: ${sip.returnRate}%`,
      `Duration: ${sip.years} years`,
      `Invested Amount: ${formatMoney(result.invested, currency)}`,
      `Estimated Returns: ${formatMoney(result.returns, currency)}`,
      `Estimated Future Value: ${formatMoney(result.futureValue, currency)}`,
      `Inflation-adjusted Value: ${formatMoney(result.inflationAdjustedValue, currency)}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      showToast('Investment summary copied.');
    } catch {
      showToast('Copy failed. Please copy manually.');
    }
  };

  const resetExamples = () => {
    setMode('sip');
    setCurrency('AED');
    setSip({
      monthly: 5000,
      returnRate: 12,
      years: 10,
      stepUp: 10,
      lumpsum: 25000,
      inflation: 5,
      goalAmount: 1000000
    });
    showToast('Examples reset.');
  };

  if (!mounted) {
    return (
      <ToolboxLayout title="SIP Calculator" description="Loading SIP calculator.">
        <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
          Initializing investment calculator...
        </div>
      </ToolboxLayout>
    );
  }

  return (
    <ToolboxLayout
      title="SIP Calculator - Step-Up SIP, Lumpsum, Goal and Compound Return Planner"
      description="Calculate SIP returns, step-up SIP, lumpsum investment, SIP plus lumpsum, goal-based monthly SIP, inflation-adjusted value and year-wise investment growth."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free investment planning calculator</p>
          <h1 style={heroTitle}>SIP Calculator & Wealth Planner</h1>
          <p style={heroText}>
            Estimate future wealth from monthly SIP, step-up SIP, lumpsum investment, SIP plus lumpsum and goal-based investing.
            See invested amount, estimated returns, inflation-adjusted value and year-wise growth in one clear dashboard.
          </p>

          <div style={heroActions}>
            <button onClick={copySummary} style={secondaryBtn}>Copy Summary</button>
            <button onClick={resetExamples} style={ghostBtn}>Reset Examples</button>
          </div>
        </section>

        <section style={appGrid}>
          <main style={mainPanel}>
            <div style={modeGrid}>
              {Object.entries(INVESTMENT_MODES).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  style={mode === key ? activeModeBtn : modeBtn}
                >
                  <strong>{item.label}</strong>
                  <span>{item.desc}</span>
                </button>
              ))}
            </div>

            <section style={inputPanel}>
              <div style={sectionHeader}>
                <div>
                  <h2 style={sectionTitle}>{getModeLabel(mode)}</h2>
                  <p style={sectionText}>{INVESTMENT_MODES[mode].longDesc}</p>
                </div>

                <label style={currencyWrap}>
                  <span>Currency</span>
                  <select value={currency} onChange={event => setCurrency(event.target.value)} style={currencySelect}>
                    <option value="AED">AED</option>
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="SAR">SAR</option>
                  </select>
                </label>
              </div>

              <div style={controlsGrid}>
                {(mode === 'sip' || mode === 'stepup' || mode === 'combined') && (
                  <NumberField
                    label="Monthly SIP"
                    value={sip.monthly}
                    onChange={value => update('monthly', value)}
                    prefix={currency}
                  />
                )}

                {(mode === 'lumpsum' || mode === 'combined') && (
                  <NumberField
                    label="Lumpsum Investment"
                    value={sip.lumpsum}
                    onChange={value => update('lumpsum', value)}
                    prefix={currency}
                  />
                )}

                {mode === 'goal' && (
                  <NumberField
                    label="Target Goal Amount"
                    value={sip.goalAmount}
                    onChange={value => update('goalAmount', value)}
                    prefix={currency}
                  />
                )}

                <NumberField
                  label="Expected Annual Return"
                  value={sip.returnRate}
                  onChange={value => update('returnRate', value)}
                  suffix="%"
                />

                <NumberField
                  label="Investment Duration"
                  value={sip.years}
                  onChange={value => update('years', value)}
                  suffix="years"
                />

                {mode === 'stepup' && (
                  <NumberField
                    label="Annual SIP Step-Up"
                    value={sip.stepUp}
                    onChange={value => update('stepUp', value)}
                    suffix="%"
                  />
                )}

                <NumberField
                  label="Inflation Rate"
                  value={sip.inflation}
                  onChange={value => update('inflation', value)}
                  suffix="%"
                />
              </div>
            </section>

            <section style={summaryGrid}>
              <SummaryCard label="Invested Amount" value={formatMoney(result.invested, currency)} />
              <SummaryCard label="Estimated Returns" value={formatMoney(result.returns, currency)} tone="green" />
              <SummaryCard label="Future Value" value={formatMoney(result.futureValue, currency)} tone="blue" />
              <SummaryCard label="Inflation-Adjusted Value" value={formatMoney(result.inflationAdjustedValue, currency)} />
              {mode === 'goal' && (
                <SummaryCard label="Required Monthly SIP" value={formatMoney(result.requiredMonthlySip, currency)} tone="green" />
              )}
            </section>

            <section style={chartGrid}>
              <div style={chartCard}>
                <h2 style={sectionTitle}>Investment Breakdown</h2>
                <div style={doughnutWrap}>
                  <Doughnut
                    data={doughnutData}
                    options={{
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { color: '#94a3b8', padding: 20 }
                        }
                      },
                      cutout: '62%'
                    }}
                  />
                </div>
              </div>

              <div style={chartCard}>
                <h2 style={sectionTitle}>Year-wise Growth</h2>
                <Line
                  data={lineData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { labels: { color: '#94a3b8' } },
                      tooltip: {
                        callbacks: {
                          label: context => `${context.dataset.label}: ${formatMoney(context.raw, currency)}`
                        }
                      }
                    },
                    scales: {
                      x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                      y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
                    }
                  }}
                />
              </div>
            </section>

            <section style={tableCard}>
              <div style={sectionHeader}>
                <div>
                  <h2 style={sectionTitle}>Year-wise Projection Table</h2>
                  <p style={sectionText}>Review how your invested amount and estimated value may grow every year.</p>
                </div>
              </div>

              <div style={tableWrap}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Invested</th>
                      <th>Returns</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearly.map(row => (
                      <tr key={row.year}>
                        <td>{row.year}</td>
                        <td>{formatMoney(row.invested, currency)}</td>
                        <td>{formatMoney(row.value - row.invested, currency)}</td>
                        <td>{formatMoney(row.value, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </main>

          <aside style={sidePanel}>
            <h2 style={sideTitle}>Planner Insights</h2>

            <div style={insightBox}>
              <span>Return Multiplier</span>
              <strong>{result.invested > 0 ? `${(result.futureValue / result.invested).toFixed(2)}×` : '--'}</strong>
            </div>

            <div style={insightBox}>
              <span>Wealth Gain Ratio</span>
              <strong>{result.invested > 0 ? `${((result.returns / result.invested) * 100).toFixed(1)}%` : '--'}</strong>
            </div>

            <div style={insightBox}>
              <span>Monthly Goal SIP</span>
              <strong>{formatMoney(result.requiredMonthlySip, currency)}</strong>
            </div>

            <div style={tipBox}>
              <h3>Planning tip</h3>
              <p>
                Longer time horizons often have a larger effect than small changes in monthly amount because compounding becomes stronger over time.
              </p>
            </div>

            <div style={tipBox}>
              <h3>Important note</h3>
              <p>
                This calculator estimates future values based on fixed return assumptions. Actual investment returns can vary and may be negative.
              </p>
            </div>
          </aside>
        </section>

        <section style={contentSection}>
          <h2>Complete SIP calculator for monthly investment, step-up SIP, lumpsum and goal planning</h2>
          <p>
            This SIP calculator helps estimate future value from systematic investment plans, monthly investing, step-up SIP,
            lumpsum investing, SIP plus lumpsum, and goal-based investment planning. It is designed for common searches such as
            “SIP calculator”, “monthly SIP calculator”, “step up SIP calculator”, “lumpsum calculator”, “how much should I invest
            monthly to reach my goal”, and “compound return calculator”.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Monthly SIP calculator</h3>
              <p>
                A monthly SIP calculator estimates how much your fixed monthly investment may grow over a selected number of years.
                It uses a monthly compounding assumption based on your expected annual return.
              </p>
              <p style={miniFormula}>Formula: M = P × (((1 + i)^n − 1) ÷ i) × (1 + i)</p>
            </div>

            <div style={seoCard}>
              <h3>Step-up SIP calculator</h3>
              <p>
                A step-up SIP calculator increases the monthly SIP amount every year by a selected percentage. This is useful when
                you expect your income to rise and want your investment contribution to grow with your salary.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Lumpsum investment calculator</h3>
              <p>
                A lumpsum calculator estimates the future value of a one-time investment. It is useful when you invest bonus money,
                savings, business income, inheritance or a large one-time amount.
              </p>
              <p style={miniFormula}>Formula: Future value = principal × (1 + annual return)^years</p>
            </div>

            <div style={seoCard}>
              <h3>SIP plus lumpsum calculator</h3>
              <p>
                Combined investing lets you calculate a one-time investment and monthly SIP together. This is useful when you start
                with an initial investment and continue adding money every month.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Goal-based SIP calculator</h3>
              <p>
                If you know your target amount, use the goal mode to estimate the monthly SIP required to reach that amount within
                your selected duration and expected return.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Inflation-adjusted SIP value</h3>
              <p>
                Inflation reduces purchasing power. This calculator shows the estimated future value and the approximate inflation-adjusted
                value so you can understand what your money may be worth in today’s terms.
              </p>
            </div>
          </div>

          <h2>Popular SIP calculator examples</h2>
          <div style={exampleGrid}>
            <div style={exampleItem}><strong>5,000 monthly SIP for 10 years at 12%</strong><span>Shows invested amount, estimated returns and maturity value.</span></div>
            <div style={exampleItem}><strong>Step-up SIP by 10% every year</strong><span>Useful when your income grows annually.</span></div>
            <div style={exampleItem}><strong>Lumpsum plus monthly SIP</strong><span>Calculate starting capital and regular investment together.</span></div>
            <div style={exampleItem}><strong>Goal of 1,000,000 in 10 years</strong><span>Estimate the monthly SIP needed to reach a future target.</span></div>
          </div>

          <h2>How SIP returns are calculated</h2>
          <p>
            SIP maturity value is calculated by converting the expected annual return into a monthly rate and applying it across
            the number of monthly contributions. The calculator assumes investments are made regularly and returns compound over time.
            Actual market returns can change every year, so the result should be treated as an estimate, not a guarantee.
          </p>

          <h2>Private browser-based financial planning</h2>
          <p>
            SHB ToolBox runs these calculations in your browser. Your monthly investment amount, target amount, expected return,
            duration and personal financial assumptions are not stored in a server database by this tool.
          </p>
        </section>

        <section style={faqSection}>
          <h2>SIP Calculator FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>What is SIP?</h3>
              <p>SIP means Systematic Investment Plan. It is a method of investing a fixed amount regularly, usually every month.</p>
            </div>

            <div style={faqItem}>
              <h3>How is SIP maturity value calculated?</h3>
              <p>SIP value is estimated using monthly compounding based on monthly investment, expected return and total number of months.</p>
            </div>

            <div style={faqItem}>
              <h3>What is step-up SIP?</h3>
              <p>Step-up SIP means increasing your monthly investment every year by a fixed percentage.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I calculate lumpsum and SIP together?</h3>
              <p>Yes. Use the SIP + Lumpsum mode to estimate the combined future value of both investment types.</p>
            </div>

            <div style={faqItem}>
              <h3>How much should I invest monthly to reach a goal?</h3>
              <p>Use Goal mode. Enter the target amount, expected annual return and number of years to estimate the required monthly SIP.</p>
            </div>

            <div style={faqItem}>
              <h3>Does this SIP calculator guarantee returns?</h3>
              <p>No. The calculator shows an estimate based on your assumed return rate. Actual returns depend on market performance.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

const INVESTMENT_MODES = {
  sip: {
    label: 'Monthly SIP',
    desc: 'Fixed monthly investment',
    longDesc: 'Calculate future value from a fixed monthly investment over time.'
  },
  stepup: {
    label: 'Step-Up SIP',
    desc: 'Increase SIP yearly',
    longDesc: 'Calculate SIP value when your monthly contribution increases every year.'
  },
  lumpsum: {
    label: 'Lumpsum',
    desc: 'One-time investment',
    longDesc: 'Calculate future value from a one-time investment.'
  },
  combined: {
    label: 'SIP + Lumpsum',
    desc: 'Both together',
    longDesc: 'Calculate future value from a starting lumpsum plus regular monthly SIP.'
  },
  goal: {
    label: 'Goal Planner',
    desc: 'Required monthly SIP',
    longDesc: 'Estimate the monthly SIP required to reach a target future amount.'
  }
};

function calculateInvestment({ mode, monthly, returnRate, years, stepUp, lumpsum, inflation, goalAmount }) {
  const annualRate = returnRate / 100;
  const monthlyRate = annualRate / 12;
  const totalMonths = Math.max(0, Math.round(years * 12));
  const safeYears = Math.max(0, years);

  let invested = 0;
  let futureValue = 0;
  const yearly = [];

  if (mode === 'sip') {
    invested = monthly * totalMonths;
    futureValue = calculateSipFutureValue(monthly, monthlyRate, totalMonths);
    yearly.push(...buildSipYearly({ monthly, monthlyRate, years: safeYears, mode: 'sip', stepUp }));
  }

  if (mode === 'stepup') {
    const stepResult = calculateStepUpSip({ monthly, monthlyRate, years: safeYears, stepUp });
    invested = stepResult.invested;
    futureValue = stepResult.futureValue;
    yearly.push(...stepResult.yearly);
  }

  if (mode === 'lumpsum') {
    invested = lumpsum;
    futureValue = lumpsum * Math.pow(1 + annualRate, safeYears);
    yearly.push(...buildLumpsumYearly({ lumpsum, annualRate, years: safeYears }));
  }

  if (mode === 'combined') {
    const sipValue = calculateSipFutureValue(monthly, monthlyRate, totalMonths);
    const lumpsumValue = lumpsum * Math.pow(1 + annualRate, safeYears);
    invested = monthly * totalMonths + lumpsum;
    futureValue = sipValue + lumpsumValue;
    yearly.push(...buildCombinedYearly({ monthly, monthlyRate, lumpsum, annualRate, years: safeYears }));
  }

  if (mode === 'goal') {
    const requiredMonthlySip = calculateRequiredSip(goalAmount, monthlyRate, totalMonths);
    invested = requiredMonthlySip * totalMonths;
    futureValue = goalAmount;
    yearly.push(...buildSipYearly({ monthly: requiredMonthlySip, monthlyRate, years: safeYears, mode: 'sip', stepUp: 0 }));
  }

  const requiredMonthlySip = calculateRequiredSip(goalAmount, monthlyRate, totalMonths);
  const inflationAdjustedValue = futureValue / Math.pow(1 + inflation / 100, safeYears);
  const returns = futureValue - invested;

  return {
    invested,
    returns,
    futureValue,
    inflationAdjustedValue,
    requiredMonthlySip,
    yearly
  };
}

function calculateSipFutureValue(monthly, monthlyRate, months) {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return monthly * months;
  return monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
}

function calculateRequiredSip(goalAmount, monthlyRate, months) {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return goalAmount / months;
  const factor = ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  return factor === 0 ? 0 : goalAmount / factor;
}

function calculateStepUpSip({ monthly, monthlyRate, years, stepUp }) {
  let invested = 0;
  let futureValue = 0;
  const yearly = [];
  const annualStep = stepUp / 100;

  for (let year = 1; year <= years; year++) {
    const yearlyMonthly = monthly * Math.pow(1 + annualStep, year - 1);

    for (let month = 1; month <= 12; month++) {
      futureValue = (futureValue + yearlyMonthly) * (1 + monthlyRate);
      invested += yearlyMonthly;
    }

    yearly.push({
      year,
      invested,
      value: futureValue
    });
  }

  return { invested, futureValue, yearly };
}

function buildSipYearly({ monthly, monthlyRate, years }) {
  const rows = [];

  for (let year = 1; year <= years; year++) {
    const months = year * 12;
    const invested = monthly * months;
    const value = calculateSipFutureValue(monthly, monthlyRate, months);
    rows.push({ year, invested, value });
  }

  return rows;
}

function buildLumpsumYearly({ lumpsum, annualRate, years }) {
  const rows = [];

  for (let year = 1; year <= years; year++) {
    rows.push({
      year,
      invested: lumpsum,
      value: lumpsum * Math.pow(1 + annualRate, year)
    });
  }

  return rows;
}

function buildCombinedYearly({ monthly, monthlyRate, lumpsum, annualRate, years }) {
  const rows = [];

  for (let year = 1; year <= years; year++) {
    const months = year * 12;
    const sipValue = calculateSipFutureValue(monthly, monthlyRate, months);
    const lumpsumValue = lumpsum * Math.pow(1 + annualRate, year);

    rows.push({
      year,
      invested: monthly * months + lumpsum,
      value: sipValue + lumpsumValue
    });
  }

  return rows;
}

function NumberField({ label, value, onChange, prefix, suffix }) {
  return (
    <label style={fieldWrap}>
      <span style={fieldLabel}>{label}</span>
      <div style={inputGroup}>
        {prefix && <span style={inputAffix}>{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={event => onChange(event.target.value)}
          style={numberInput}
        />
        {suffix && <span style={inputAffix}>{suffix}</span>}
      </div>
    </label>
  );
}

function SummaryCard({ label, value, tone = 'default' }) {
  const color = tone === 'green' ? '#34d399' : tone === 'blue' ? '#38bdf8' : '#ffffff';

  return (
    <div style={summaryCard}>
      <span>{label}</span>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}

function getModeLabel(mode) {
  return INVESTMENT_MODES[mode]?.label || 'SIP Calculator';
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value, currency) {
  const number = safeNumber(value);

  return `${currency} ${number.toLocaleString(undefined, {
    maximumFractionDigits: 0
  })}`;
}

const pageWrap = { maxWidth: '1180px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#34d399', color: '#052e16', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '920px', margin: '0 auto', lineHeight: 1.75 };
const heroActions = { display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '24px' };

const appGrid = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', alignItems: 'start' };
const mainPanel = { display: 'grid', gap: '22px' };
const sidePanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '24px', position: 'sticky', top: '92px', display: 'grid', gap: '18px' };

const modeGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' };
const modeBtn = { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '18px', padding: '16px', display: 'grid', gap: '7px', textAlign: 'left', cursor: 'pointer' };
const activeModeBtn = { ...modeBtn, background: 'rgba(52,211,153,0.12)', border: '1px solid #34d399' };

const inputPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '20px' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' };
const sectionTitle = { color: '#fff', margin: 0, fontSize: '1.28rem' };
const sectionText = { color: '#94a3b8', lineHeight: 1.65, margin: '8px 0 0', fontSize: '0.92rem' };
const currencyWrap = { display: 'grid', gap: '7px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' };
const currencySelect = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', padding: '10px', outline: 'none' };

const controlsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' };
const fieldWrap = { display: 'grid', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputGroup = { display: 'flex', alignItems: 'center', background: '#0f172a', border: '1px solid #334155', borderRadius: '13px', overflow: 'hidden' };
const inputAffix = { color: '#94a3b8', padding: '0 12px', fontSize: '0.84rem', fontWeight: 850, whiteSpace: 'nowrap' };
const numberInput = { width: '100%', background: 'transparent', border: 'none', color: '#fff', padding: '13px', outline: 'none', fontSize: '1rem' };

const summaryGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' };
const summaryCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '18px', display: 'grid', gap: '8px', color: '#94a3b8' };

const chartGrid = { display: 'grid', gridTemplateColumns: 'minmax(280px, 0.75fr) minmax(320px, 1.25fr)', gap: '22px' };
const chartCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '24px' };
const doughnutWrap = { maxWidth: '310px', margin: '20px auto 0' };

const tableCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '24px' };
const tableWrap = { overflowX: 'auto', marginTop: '16px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', minWidth: '620px' };

const sideTitle = { color: '#fff', margin: 0, fontSize: '1.15rem' };
const insightBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#94a3b8' };
const tipBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', color: '#94a3b8', lineHeight: 1.65, fontSize: '0.9rem' };

const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', borderRadius: '14px', padding: '12px 16px', fontWeight: 850, cursor: 'pointer' };
const ghostBtn = { background: 'transparent', color: '#34d399', border: '1px solid #334155', borderRadius: '14px', padding: '12px 16px', fontWeight: 850, cursor: 'pointer' };

const contentSection = { marginTop: '78px', borderTop: '1px solid #334155', paddingTop: '55px', color: '#cbd5e1', lineHeight: 1.85 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '30px 0' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '22px' };
const miniFormula = { color: '#34d399', fontSize: '0.86rem', marginTop: '12px', fontWeight: 850 };
const exampleGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px', margin: '28px 0 38px' };
const exampleItem = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '16px', display: 'grid', gap: '8px', color: '#cbd5e1' };

const faqSection = { marginTop: '70px', background: 'rgba(52,211,153,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px', color: '#cbd5e1', lineHeight: 1.8 };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };

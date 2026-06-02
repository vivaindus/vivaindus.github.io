import React, { useEffect, useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function PercentageCalculator() {
  const [mounted, setMounted] = useState(false);
  const [notification, setNotification] = useState('');
  const [history, setHistory] = useState([]);

  const [basic, setBasic] = useState({ percent: 10, value: 500 });
  const [ratio, setRatio] = useState({ part: 50, total: 200 });
  const [change, setChange] = useState({ oldValue: 100, newValue: 150 });
  const [adjust, setAdjust] = useState({ value: 1000, percent: 15, type: 'add' });
  const [vat, setVat] = useState({ amount: 1000, rate: 5, mode: 'add' });
  const [discount, setDiscount] = useState({ original: 750, percent: 35 });
  const [margin, setMargin] = useState({ cost: 60, selling: 100 });
  const [tip, setTip] = useState({ bill: 250, tipPercent: 10, people: 2 });
  const [reverse, setReverse] = useState({ finalValue: 120, percent: 20, mode: 'afterIncrease' });
  const [points, setPoints] = useState({ from: 5, to: 8 });
  const [compound, setCompound] = useState({ start: 1000, rate: 8, years: 5 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const results = useMemo(() => {
    const basicResult = safeNumber(basic.value) * safeNumber(basic.percent) / 100;

    const ratioResult = safeNumber(ratio.total) === 0
      ? 0
      : safeNumber(ratio.part) / safeNumber(ratio.total) * 100;

    const oldValue = safeNumber(change.oldValue);
    const newValue = safeNumber(change.newValue);
    const changeAmount = newValue - oldValue;
    const changePercent = oldValue === 0 ? 0 : changeAmount / oldValue * 100;

    const adjustBase = safeNumber(adjust.value);
    const adjustAmount = adjustBase * safeNumber(adjust.percent) / 100;
    const adjustFinal = adjust.type === 'add' ? adjustBase + adjustAmount : adjustBase - adjustAmount;

    const vatAmount = safeNumber(vat.amount);
    const vatRate = safeNumber(vat.rate);
    const vatOnly = vat.mode === 'add'
      ? vatAmount * vatRate / 100
      : vatAmount - (vatAmount / (1 + vatRate / 100));
    const vatNet = vat.mode === 'add'
      ? vatAmount
      : vatAmount / (1 + vatRate / 100);
    const vatGross = vat.mode === 'add'
      ? vatAmount + vatOnly
      : vatAmount;

    const discountOriginal = safeNumber(discount.original);
    const discountAmount = discountOriginal * safeNumber(discount.percent) / 100;
    const discountFinal = discountOriginal - discountAmount;

    const cost = safeNumber(margin.cost);
    const selling = safeNumber(margin.selling);
    const profit = selling - cost;
    const markupPercent = cost === 0 ? 0 : profit / cost * 100;
    const marginPercent = selling === 0 ? 0 : profit / selling * 100;

    const bill = safeNumber(tip.bill);
    const tipAmount = bill * safeNumber(tip.tipPercent) / 100;
    const billTotal = bill + tipAmount;
    const people = Math.max(1, safeNumber(tip.people));
    const perPerson = billTotal / people;

    const reverseFinal = safeNumber(reverse.finalValue);
    const reversePercent = safeNumber(reverse.percent);
    const reverseOriginal = reverse.mode === 'afterIncrease'
      ? reverseFinal / (1 + reversePercent / 100)
      : reverseFinal / (1 - reversePercent / 100);

    const pointFrom = safeNumber(points.from);
    const pointTo = safeNumber(points.to);
    const pointDiff = pointTo - pointFrom;
    const relativeChange = pointFrom === 0 ? 0 : pointDiff / pointFrom * 100;

    const compoundStart = safeNumber(compound.start);
    const compoundRate = safeNumber(compound.rate);
    const compoundYears = safeNumber(compound.years);
    const compoundFinal = compoundStart * Math.pow(1 + compoundRate / 100, compoundYears);
    const compoundGain = compoundFinal - compoundStart;

    return {
      basicResult,
      ratioResult,
      changeAmount,
      changePercent,
      adjustAmount,
      adjustFinal,
      vatOnly,
      vatNet,
      vatGross,
      discountAmount,
      discountFinal,
      profit,
      markupPercent,
      marginPercent,
      tipAmount,
      billTotal,
      perPerson,
      reverseOriginal,
      pointDiff,
      relativeChange,
      compoundFinal,
      compoundGain
    };
  }, [basic, ratio, change, adjust, vat, discount, margin, tip, reverse, points, compound]);

  const showToast = (message) => {
    setNotification(message);
  };

  const copyResult = async (label, value) => {
    const text = `${label}: ${value}`;

    try {
      await navigator.clipboard.writeText(text);
      setHistory(prev => [{ label, value, id: Date.now() }, ...prev].slice(0, 10));
      showToast('Result copied to clipboard.');
    } catch {
      showToast('Copy failed. Please copy manually.');
    }
  };

  const clearHistory = () => {
    setHistory([]);
    showToast('History cleared.');
  };

  const resetExamples = () => {
    setBasic({ percent: 10, value: 500 });
    setRatio({ part: 50, total: 200 });
    setChange({ oldValue: 100, newValue: 150 });
    setAdjust({ value: 1000, percent: 15, type: 'add' });
    setVat({ amount: 1000, rate: 5, mode: 'add' });
    setDiscount({ original: 750, percent: 35 });
    setMargin({ cost: 60, selling: 100 });
    setTip({ bill: 250, tipPercent: 10, people: 2 });
    setReverse({ finalValue: 120, percent: 20, mode: 'afterIncrease' });
    setPoints({ from: 5, to: 8 });
    setCompound({ start: 1000, rate: 8, years: 5 });
    showToast('Examples reset.');
  };

  if (!mounted) {
    return (
      <ToolboxLayout title="Percentage Calculator" description="Loading percentage calculator.">
        <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
          Loading percentage calculator...
        </div>
      </ToolboxLayout>
    );
  }

  return (
    <ToolboxLayout
      title="Percentage Calculator - Business, VAT, Discount, Margin and Growth"
      description="All-in-one percentage calculator for percentages, percentage change, VAT, discounts, markup, margin, tips, reverse percentage, percentage points and compound growth."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free business math calculator</p>
          <h1 style={heroTitle}>Percentage Calculator Suite</h1>
          <p style={heroText}>
            Calculate percentages, VAT, discounts, markups, margins, percentage increase, reverse percentages,
            tips, bill splitting, percentage points and compound growth in one clean workspace.
          </p>

          <div style={heroActions}>
            <button onClick={resetExamples} style={secondaryBtn}>Reset Examples</button>
            <button onClick={clearHistory} style={ghostBtn}>Clear History</button>
          </div>
        </section>

        <section style={appGrid}>
          <main style={calculatorGrid}>
            <CalcCard title="What is X% of Y?" subtitle="Find the value of a percentage.">
              <div style={formulaRow}>
                <NumberInput value={basic.percent} onChange={value => setBasic({ ...basic, percent: value })} />
                <span style={operator}>% of</span>
                <NumberInput value={basic.value} onChange={value => setBasic({ ...basic, value })} />
              </div>

              <ResultBox
                label="Result"
                value={formatNumber(results.basicResult)}
                onCopy={() => copyResult('Percentage value', formatNumber(results.basicResult))}
              />

              <p style={miniFormula}>
                Formula: percentage ÷ 100 × value
              </p>
            </CalcCard>

            <CalcCard title="X is what % of Y?" subtitle="Find the percentage ratio between two values.">
              <div style={formulaRow}>
                <NumberInput value={ratio.part} onChange={value => setRatio({ ...ratio, part: value })} />
                <span style={operator}>is what % of</span>
                <NumberInput value={ratio.total} onChange={value => setRatio({ ...ratio, total: value })} />
              </div>

              <ResultBox
                label="Percentage"
                value={`${formatNumber(results.ratioResult)}%`}
                onCopy={() => copyResult('Percentage ratio', `${formatNumber(results.ratioResult)}%`)}
              />

              <p style={miniFormula}>
                Formula: part ÷ total × 100
              </p>
            </CalcCard>

            <CalcCard title="Percentage Increase / Decrease" subtitle="Compare old and new values.">
              <div style={formulaRow}>
                <NumberInput value={change.oldValue} onChange={value => setChange({ ...change, oldValue: value })} />
                <span style={operator}>to</span>
                <NumberInput value={change.newValue} onChange={value => setChange({ ...change, newValue: value })} />
              </div>

              <div style={twoResults}>
                <ResultBox
                  label="Change"
                  value={formatNumber(results.changeAmount)}
                  onCopy={() => copyResult('Value change', formatNumber(results.changeAmount))}
                />
                <ResultBox
                  label={results.changePercent >= 0 ? 'Increase' : 'Decrease'}
                  value={`${formatNumber(results.changePercent)}%`}
                  tone={results.changePercent >= 0 ? 'success' : 'danger'}
                  onCopy={() => copyResult('Percentage change', `${formatNumber(results.changePercent)}%`)}
                />
              </div>

              <p style={miniFormula}>
                Formula: (new − old) ÷ old × 100
              </p>
            </CalcCard>

            <CalcCard title="Add or Subtract Percentage" subtitle="Increase or reduce a number by a percentage.">
              <div style={formulaRow}>
                <NumberInput value={adjust.value} onChange={value => setAdjust({ ...adjust, value })} />
                <select value={adjust.type} onChange={event => setAdjust({ ...adjust, type: event.target.value })} style={selectStyle}>
                  <option value="add">add</option>
                  <option value="subtract">subtract</option>
                </select>
                <NumberInput value={adjust.percent} onChange={value => setAdjust({ ...adjust, percent: value })} />
                <span style={operator}>%</span>
              </div>

              <div style={twoResults}>
                <ResultBox
                  label="Difference"
                  value={formatNumber(results.adjustAmount)}
                  onCopy={() => copyResult('Percentage amount', formatNumber(results.adjustAmount))}
                />
                <ResultBox
                  label="Final Value"
                  value={formatNumber(results.adjustFinal)}
                  onCopy={() => copyResult('Adjusted value', formatNumber(results.adjustFinal))}
                />
              </div>
            </CalcCard>

            <CalcCard title="VAT / Sales Tax Calculator" subtitle="Add VAT or remove VAT from an inclusive amount.">
              <div style={formulaRow}>
                <NumberInput value={vat.amount} onChange={value => setVat({ ...vat, amount: value })} />
                <select value={vat.mode} onChange={event => setVat({ ...vat, mode: event.target.value })} style={selectStyle}>
                  <option value="add">add VAT</option>
                  <option value="remove">remove VAT</option>
                </select>
                <NumberInput value={vat.rate} onChange={value => setVat({ ...vat, rate: value })} />
                <span style={operator}>%</span>
              </div>

              <div style={threeResults}>
                <ResultBox label="Net" value={formatNumber(results.vatNet)} onCopy={() => copyResult('VAT net', formatNumber(results.vatNet))} />
                <ResultBox label="VAT" value={formatNumber(results.vatOnly)} onCopy={() => copyResult('VAT amount', formatNumber(results.vatOnly))} />
                <ResultBox label="Gross" value={formatNumber(results.vatGross)} onCopy={() => copyResult('VAT gross', formatNumber(results.vatGross))} />
              </div>
            </CalcCard>

            <CalcCard title="Discount Calculator" subtitle="Calculate sale price and savings.">
              <div style={formulaRow}>
                <NumberInput value={discount.original} onChange={value => setDiscount({ ...discount, original: value })} />
                <span style={operator}>with</span>
                <NumberInput value={discount.percent} onChange={value => setDiscount({ ...discount, percent: value })} />
                <span style={operator}>% off</span>
              </div>

              <div style={twoResults}>
                <ResultBox label="You Save" value={formatNumber(results.discountAmount)} tone="success" onCopy={() => copyResult('Discount saving', formatNumber(results.discountAmount))} />
                <ResultBox label="Final Price" value={formatNumber(results.discountFinal)} onCopy={() => copyResult('Discount final price', formatNumber(results.discountFinal))} />
              </div>
            </CalcCard>

            <CalcCard title="Markup and Profit Margin" subtitle="Important for pricing products and services.">
              <div style={formulaRow}>
                <span style={operator}>Cost</span>
                <NumberInput value={margin.cost} onChange={value => setMargin({ ...margin, cost: value })} />
                <span style={operator}>Sell</span>
                <NumberInput value={margin.selling} onChange={value => setMargin({ ...margin, selling: value })} />
              </div>

              <div style={threeResults}>
                <ResultBox label="Profit" value={formatNumber(results.profit)} onCopy={() => copyResult('Profit', formatNumber(results.profit))} />
                <ResultBox label="Markup" value={`${formatNumber(results.markupPercent)}%`} onCopy={() => copyResult('Markup', `${formatNumber(results.markupPercent)}%`)} />
                <ResultBox label="Margin" value={`${formatNumber(results.marginPercent)}%`} onCopy={() => copyResult('Margin', `${formatNumber(results.marginPercent)}%`)} />
              </div>
            </CalcCard>

            <CalcCard title="Tip and Bill Split" subtitle="Calculate tip, total bill and per-person share.">
              <div style={formulaRow}>
                <span style={operator}>Bill</span>
                <NumberInput value={tip.bill} onChange={value => setTip({ ...tip, bill: value })} />
                <span style={operator}>Tip %</span>
                <NumberInput value={tip.tipPercent} onChange={value => setTip({ ...tip, tipPercent: value })} />
                <span style={operator}>People</span>
                <NumberInput value={tip.people} onChange={value => setTip({ ...tip, people: value })} />
              </div>

              <div style={threeResults}>
                <ResultBox label="Tip" value={formatNumber(results.tipAmount)} onCopy={() => copyResult('Tip amount', formatNumber(results.tipAmount))} />
                <ResultBox label="Total" value={formatNumber(results.billTotal)} onCopy={() => copyResult('Bill total', formatNumber(results.billTotal))} />
                <ResultBox label="Each Pays" value={formatNumber(results.perPerson)} onCopy={() => copyResult('Per person', formatNumber(results.perPerson))} />
              </div>
            </CalcCard>

            <CalcCard title="Reverse Percentage" subtitle="Find the original value before increase or discount.">
              <div style={formulaRow}>
                <NumberInput value={reverse.finalValue} onChange={value => setReverse({ ...reverse, finalValue: value })} />
                <span style={operator}>is after</span>
                <NumberInput value={reverse.percent} onChange={value => setReverse({ ...reverse, percent: value })} />
                <select value={reverse.mode} onChange={event => setReverse({ ...reverse, mode: event.target.value })} style={selectStyle}>
                  <option value="afterIncrease">% increase</option>
                  <option value="afterDecrease">% decrease</option>
                </select>
              </div>

              <ResultBox
                label="Original Value"
                value={Number.isFinite(results.reverseOriginal) ? formatNumber(results.reverseOriginal) : 'Invalid'}
                onCopy={() => copyResult('Original value', formatNumber(results.reverseOriginal))}
              />
            </CalcCard>

            <CalcCard title="Percentage Points" subtitle="Compare rates like VAT, interest, conversion rates or inflation.">
              <div style={formulaRow}>
                <NumberInput value={points.from} onChange={value => setPoints({ ...points, from: value })} />
                <span style={operator}>% to</span>
                <NumberInput value={points.to} onChange={value => setPoints({ ...points, to: value })} />
                <span style={operator}>%</span>
              </div>

              <div style={twoResults}>
                <ResultBox label="Point Change" value={`${formatNumber(results.pointDiff)} points`} onCopy={() => copyResult('Percentage point change', `${formatNumber(results.pointDiff)} points`)} />
                <ResultBox label="Relative Change" value={`${formatNumber(results.relativeChange)}%`} onCopy={() => copyResult('Relative change', `${formatNumber(results.relativeChange)}%`)} />
              </div>
            </CalcCard>

            <CalcCard title="Compound Percentage Growth" subtitle="Calculate repeated yearly growth.">
              <div style={formulaRow}>
                <span style={operator}>Start</span>
                <NumberInput value={compound.start} onChange={value => setCompound({ ...compound, start: value })} />
                <span style={operator}>Rate</span>
                <NumberInput value={compound.rate} onChange={value => setCompound({ ...compound, rate: value })} />
                <span style={operator}>Years</span>
                <NumberInput value={compound.years} onChange={value => setCompound({ ...compound, years: value })} />
              </div>

              <div style={twoResults}>
                <ResultBox label="Final Value" value={formatNumber(results.compoundFinal)} onCopy={() => copyResult('Compound final value', formatNumber(results.compoundFinal))} />
                <ResultBox label="Total Gain" value={formatNumber(results.compoundGain)} tone="success" onCopy={() => copyResult('Compound gain', formatNumber(results.compoundGain))} />
              </div>
            </CalcCard>
          </main>

          <aside style={sidePanel}>
            <h2 style={sideTitle}>Copied Results</h2>
            <p style={sideText}>Click any result to copy it and keep a short session history here.</p>

            <div style={historyList}>
              {history.length === 0 ? (
                <p style={emptyHistory}>No copied results yet.</p>
              ) : (
                history.map(item => (
                  <div key={item.id} style={historyItem}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))
              )}
            </div>

            <div style={tipBox}>
              <h3>Business tip</h3>
              <p>
                Markup and margin are not the same. Markup is profit compared to cost. Margin is profit compared to selling price.
              </p>
            </div>
          </aside>
        </section>

        <section style={contentSection}>
          <h2>Complete percentage calculator for every common percentage question</h2>
          <p>
            This all-in-one percentage calculator is designed for the exact questions people search every day, such as
            “what is 10% of 500”, “8 is what percentage of 9”, “what is the percentage increase from 100 to 150”,
            “how to add 5% VAT”, “how to remove VAT from a total”, “how much is 35% off”, and
            “what is my profit margin”. Instead of opening many different tools, you can calculate all major percentage
            types on one page.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>What is X% of Y?</h3>
              <p>
                Use this calculator when you want to find a percentage amount from a total. Example: 10% of 500 is 50.
                This is useful for discounts, commission, tax estimates, savings, exam marks, business targets and
                partial payments.
              </p>
              <p style={miniSeoFormula}>Formula: X ÷ 100 × Y</p>
            </div>

            <div style={seoCard}>
              <h3>X is what percentage of Y?</h3>
              <p>
                Use this when you want to compare two numbers as a percentage. Example: 8 is what percentage of 9?
                The answer is 88.89%. This is useful for scores, ratios, completion rates, sales targets, attendance,
                conversion rates and performance comparisons.
              </p>
              <p style={miniSeoFormula}>Formula: X ÷ Y × 100</p>
            </div>

            <div style={seoCard}>
              <h3>Percentage increase and decrease calculator</h3>
              <p>
                Calculate how much a value increased or decreased from an old value to a new value. Example: going from
                100 to 150 is a 50% increase. This is useful for revenue growth, price changes, salary changes,
                stock movement, traffic growth and cost reduction.
              </p>
              <p style={miniSeoFormula}>Formula: (new − old) ÷ old × 100</p>
            </div>

            <div style={seoCard}>
              <h3>Add or subtract a percentage</h3>
              <p>
                Quickly increase or reduce a number by a percentage. For example, add 15% to 1000 or subtract 20%
                from 750. This is useful for markups, service charges, discounts, inflation adjustment and estimating
                final prices.
              </p>
              <p style={miniSeoFormula}>Formula: value ± (value × percent ÷ 100)</p>
            </div>

            <div style={seoCard}>
              <h3>VAT and sales tax calculator</h3>
              <p>
                Add VAT to a net amount or remove VAT from a VAT-inclusive gross amount. This is useful for UAE VAT,
                GCC tax calculations, invoices, quotations, product pricing and accounting checks.
              </p>
              <p style={miniSeoFormula}>VAT remove formula: gross ÷ (1 + VAT% ÷ 100)</p>
            </div>

            <div style={seoCard}>
              <h3>Discount calculator</h3>
              <p>
                Calculate the sale price after a percentage discount and see exactly how much you save. Example:
                35% off AED 750 shows both the discount amount and the final price. This is useful for shopping,
                ecommerce offers, retail promotions and seasonal sales.
              </p>
              <p style={miniSeoFormula}>Formula: original price − discount amount</p>
            </div>

            <div style={seoCard}>
              <h3>Markup and profit margin calculator</h3>
              <p>
                Calculate profit, markup percentage and margin percentage from cost price and selling price. This is
                useful for online sellers, shops, wholesalers, service providers and small businesses that need accurate
                product pricing.
              </p>
              <p style={miniSeoFormula}>Markup = profit ÷ cost. Margin = profit ÷ selling price.</p>
            </div>

            <div style={seoCard}>
              <h3>Tip and bill split calculator</h3>
              <p>
                Calculate tip amount, total bill and per-person share. This is useful at restaurants, cafes, group
                dinners, travel expenses and shared payments.
              </p>
              <p style={miniSeoFormula}>Total = bill + tip. Each pays = total ÷ people.</p>
            </div>

            <div style={seoCard}>
              <h3>Reverse percentage calculator</h3>
              <p>
                Find the original amount before a percentage increase or percentage decrease. Example: if 120 is the
                value after a 20% increase, the original value was 100. This is useful for reverse discounts, tax-inclusive
                totals and original price calculations.
              </p>
              <p style={miniSeoFormula}>Original after increase = final ÷ (1 + percent ÷ 100)</p>
            </div>

            <div style={seoCard}>
              <h3>Percentage points calculator</h3>
              <p>
                Compare two percentage rates correctly. For example, moving from 5% to 8% is a 3 percentage point
                increase, not simply a 3% increase. This is useful for interest rates, inflation, VAT rates, conversion
                rates and survey results.
              </p>
              <p style={miniSeoFormula}>Percentage points = new percentage − old percentage</p>
            </div>

            <div style={seoCard}>
              <h3>Compound percentage growth calculator</h3>
              <p>
                Calculate repeated percentage growth over time. This is useful for investment growth, savings projections,
                business growth, yearly revenue growth and compound interest-style estimates.
              </p>
              <p style={miniSeoFormula}>Formula: start × (1 + rate ÷ 100)^years</p>
            </div>

            <div style={seoCard}>
              <h3>Private browser-based calculation</h3>
              <p>
                Your numbers are calculated in your browser. SHB ToolBox does not need to store your prices, tax amounts,
                costs, sales data, margins, tips, salary figures or financial values.
              </p>
            </div>
          </div>

          <h2>Popular percentage examples</h2>
          <div style={exampleGrid}>
            <div style={exampleItem}><strong>8 is what percentage of 9?</strong><span>8 ÷ 9 × 100 = 88.89%</span></div>
            <div style={exampleItem}><strong>What is 15% of 200?</strong><span>15 ÷ 100 × 200 = 30</span></div>
            <div style={exampleItem}><strong>What is 35% off 750?</strong><span>Discount = 262.50, final price = 487.50</span></div>
            <div style={exampleItem}><strong>Increase from 100 to 150?</strong><span>50% increase</span></div>
            <div style={exampleItem}><strong>Remove 5% VAT from 1050?</strong><span>Net = 1000, VAT = 50</span></div>
            <div style={exampleItem}><strong>Cost 60, selling 100?</strong><span>Markup = 66.67%, margin = 40%</span></div>
          </div>

          <h2>Common percentage formulas</h2>
          <ul style={formulaList}>
            <li><strong>X% of Y:</strong> X ÷ 100 × Y</li>
            <li><strong>X is what % of Y:</strong> X ÷ Y × 100</li>
            <li><strong>Percentage change:</strong> (new − old) ÷ old × 100</li>
            <li><strong>Add percentage:</strong> value + (value × percentage ÷ 100)</li>
            <li><strong>Subtract percentage:</strong> value − (value × percentage ÷ 100)</li>
            <li><strong>VAT amount:</strong> net × VAT rate ÷ 100</li>
            <li><strong>Remove VAT:</strong> gross ÷ (1 + VAT rate ÷ 100)</li>
            <li><strong>Discount amount:</strong> original price × discount percentage ÷ 100</li>
            <li><strong>Markup:</strong> profit ÷ cost × 100</li>
            <li><strong>Margin:</strong> profit ÷ selling price × 100</li>
            <li><strong>Percentage points:</strong> new percentage − old percentage</li>
            <li><strong>Compound growth:</strong> start × (1 + rate ÷ 100)^years</li>
          </ul>
        </section>

        <section style={faqSection}>
          <h2>Percentage Calculator FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>How do I calculate 8 is what percentage of 9?</h3>
              <p>Use the “X is what % of Y?” calculator. Enter 8 as the part and 9 as the total. The answer is 88.89%.</p>
            </div>

            <div style={faqItem}>
              <h3>How do I calculate what is 10% of 500?</h3>
              <p>Use the “What is X% of Y?” calculator. Enter 10 and 500. The result is 50.</p>
            </div>

            <div style={faqItem}>
              <h3>How do I calculate percentage increase?</h3>
              <p>Enter the old value and new value in the percentage increase/decrease calculator. It uses (new − old) ÷ old × 100.</p>
            </div>

            <div style={faqItem}>
              <h3>How do I calculate percentage decrease?</h3>
              <p>Enter the original value and reduced value. If a value falls from 200 to 150, the result is a 25% decrease.</p>
            </div>

            <div style={faqItem}>
              <h3>How do I add 5% VAT?</h3>
              <p>Use the VAT calculator, choose add VAT, enter the net amount and set VAT rate to 5%.</p>
            </div>

            <div style={faqItem}>
              <h3>How do I remove 5% VAT from a total?</h3>
              <p>Use the VAT calculator, choose remove VAT, enter the VAT-inclusive gross amount and set VAT rate to 5%.</p>
            </div>

            <div style={faqItem}>
              <h3>How do I calculate a discount percentage?</h3>
              <p>Use the discount calculator. Enter the original price and discount percentage to see the saving and final sale price.</p>
            </div>

            <div style={faqItem}>
              <h3>What is the difference between markup and margin?</h3>
              <p>Markup compares profit to cost. Margin compares profit to selling price. The same product can have different markup and margin percentages.</p>
            </div>

            <div style={faqItem}>
              <h3>What is a reverse percentage calculation?</h3>
              <p>Reverse percentage finds the original value before a percentage increase or decrease. It is useful for original price and tax-inclusive calculations.</p>
            </div>

            <div style={faqItem}>
              <h3>What are percentage points?</h3>
              <p>Percentage points measure the direct difference between two percentages. Moving from 5% to 8% is a 3 percentage point increase.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I calculate compound percentage growth?</h3>
              <p>Yes. Use the compound growth calculator to estimate repeated percentage growth over several years.</p>
            </div>

            <div style={faqItem}>
              <h3>Does this percentage calculator store my numbers?</h3>
              <p>No. Calculations run in your browser and the tool does not need to store your financial or business values.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function CalcCard({ title, subtitle, children }) {
  return (
    <section style={cardStyle}>
      <div style={cardTop}>
        <h2 style={cardTitle}>{title}</h2>
        <p style={cardSubtitle}>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function NumberInput({ value, onChange }) {
  return (
    <input
      type="number"
      value={value}
      onChange={event => onChange(event.target.value)}
      style={inputStyle}
    />
  );
}

function ResultBox({ label, value, onCopy, tone = 'default' }) {
  const bg = tone === 'success' ? '#34d399' : tone === 'danger' ? '#f87171' : '#38bdf8';

  return (
    <button onClick={onCopy} style={{ ...resultBox, background: bg }}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>Click to copy</small>
    </button>
  );
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value) {
  const number = safeNumber(value);

  return number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const pageWrap = { maxWidth: '1180px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '900px', margin: '0 auto', lineHeight: 1.75 };
const heroActions = { display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '24px' };

const appGrid = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: '24px', alignItems: 'start' };
const calculatorGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '20px' };

const cardStyle = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '24px', boxShadow: '0 12px 30px rgba(0,0,0,0.16)', display: 'grid', gap: '18px' };
const cardTop = { display: 'grid', gap: '6px' };
const cardTitle = { color: '#38bdf8', fontSize: '1.05rem', margin: 0 };
const cardSubtitle = { color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 };
const formulaRow = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' };
const inputStyle = { width: '100px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '12px', padding: '12px', outline: 'none', fontSize: '1rem', textAlign: 'center' };
const selectStyle = { background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '12px', padding: '12px', outline: 'none' };
const operator = { color: '#94a3b8', fontSize: '0.88rem', fontWeight: 850 };

const resultBox = { width: '100%', border: 'none', color: '#082f49', borderRadius: '16px', padding: '16px', display: 'grid', gap: '4px', textAlign: 'left', cursor: 'pointer', fontWeight: 850 };
const twoResults = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
const threeResults = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' };
const miniFormula = { color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 };

const sidePanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '22px', position: 'sticky', top: '92px', display: 'grid', gap: '16px' };
const sideTitle = { color: '#fff', fontSize: '1.15rem', margin: 0 };
const sideText = { color: '#94a3b8', lineHeight: 1.65, margin: 0, fontSize: '0.9rem' };
const historyList = { display: 'grid', gap: '10px', maxHeight: '360px', overflow: 'auto' };
const historyItem = { background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '12px', display: 'grid', gap: '5px', color: '#cbd5e1' };
const emptyHistory = { color: '#64748b', fontStyle: 'italic', lineHeight: 1.6 };
const tipBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', color: '#94a3b8', lineHeight: 1.65, fontSize: '0.9rem' };

const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', borderRadius: '14px', padding: '12px 16px', fontWeight: 850, cursor: 'pointer' };
const ghostBtn = { background: 'transparent', color: '#38bdf8', border: '1px solid #334155', borderRadius: '14px', padding: '12px 16px', fontWeight: 850, cursor: 'pointer' };

const contentSection = { marginTop: '78px', borderTop: '1px solid #334155', paddingTop: '55px', color: '#cbd5e1', lineHeight: 1.85 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '30px 0' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '22px' };
const exampleGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', margin: '28px 0 38px' };
const exampleItem = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '16px', display: 'grid', gap: '8px', color: '#cbd5e1' };
const miniSeoFormula = { color: '#38bdf8', fontSize: '0.86rem', marginTop: '12px', fontWeight: 850 };
const formulaList = { paddingLeft: '20px', lineHeight: 1.9 };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px', color: '#cbd5e1', lineHeight: 1.8 };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };

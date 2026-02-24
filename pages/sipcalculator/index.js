import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Fix for Vercel/SSR with Chart.js
if (typeof window !== 'undefined') {
    ChartJS.register(ArcElement, Tooltip, Legend);
}

export default function SIPCalculator() {
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [timePeriod, setTimePeriod] = useState(10);
    const [investedAmount, setInvestedAmount] = useState(0);
    const [estimatedReturns, setEstimatedReturns] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [currency, setCurrency] = useState('AED'); // Fixed local currency state

    useEffect(() => {
        const P = monthlyInvestment;
        const i = expectedReturn / 12 / 100;
        const n = timePeriod * 12;
        
        if (i === 0) {
            setInvestedAmount(P * n);
            setTotalValue(P * n);
            setEstimatedReturns(0);
        } else {
            const totalValueCalc = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
            const invested = P * n;
            setInvestedAmount(invested);
            setTotalValue(totalValueCalc);
            setEstimatedReturns(totalValueCalc - invested);
        }
    }, [monthlyInvestment, expectedReturn, timePeriod]);

    const chartData = {
        labels: ['Invested Amount', 'Estimated Returns'],
        datasets: [{
            data: [investedAmount, estimatedReturns],
            backgroundColor: ['#1e293b', '#34d399'],
            borderColor: ['#334155', '#34d399'],
            borderWidth: 1,
        }],
    };

    return (
        <ToolboxLayout 
            title="SIP Calculator - Systematic Investment Planner" 
            description="Calculate your future wealth with our SIP calculator. Learn how compounding works and plan your financial goals with UAE-friendly tools."
        >
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* --- TOP INTERESTING INTRO --- */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ color: '#34d399', fontSize: '2.5rem' }}>Systematic Investment Plan (SIP) Calculator</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', margin: '15px auto' }}>
                        Did you know that investing just {currency} 1,000 monthly for 20 years at 12% return can grow into nearly 1 Million? 
                        Use our tool below to visualize your path to financial freedom.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    {/* INPUTS */}
                    <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Monthly Investment ({currency})</label>
                            <input type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Expected Return Rate (% P.A.)</label>
                            <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Time Period (Years)</label>
                            <input type="number" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} style={inputStyle} />
                        </div>

                        <div style={{ marginTop: '30px', padding: '20px', background: '#0f172a', borderRadius: '15px', borderLeft: '5px solid #34d399' }}>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Estimated Wealth at Maturity</p>
                            <h2 style={{ color: '#34d399', margin: '5px 0' }}>{currency} {Math.round(totalValue).toLocaleString()}</h2>
                        </div>
                    </div>

                    {/* CHART & STATS */}
                    <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155', textAlign: 'center' }}>
                        <div style={{ width: '250px', margin: '0 auto 20px' }}>
                            {typeof window !== 'undefined' && <Pie data={chartData} options={{ plugins: { legend: { labels: { color: '#94a3b8' } } } }} />}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={statItem}>
                                <small style={{color:'#94a3b8'}}>Invested Amount</small>
                                <br/>
                                <strong style={{color: '#fff'}}>{currency} {Math.round(investedAmount).toLocaleString()}</strong>
                            </div>
                            <div style={statItem}>
                                <small style={{color:'#94a3b8'}}>Wealth Gained</small>
                                <br/>
                                <strong style={{color: '#34d399'}}>{currency} {Math.round(estimatedReturns).toLocaleString()}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MASSIVE KNOWLEDGE SECTION (BOTTOM) --- */}
                <div style={{ marginTop: '80px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#34d399', fontSize: '1.8rem' }}>Understanding SIP: The Power of Compounding</h2>
                    <p>
                        A Systematic Investment Plan (SIP) is a disciplined way of investing where a fixed amount is 
                        invested at regular intervals. At SHB ToolBox, we built this SIP Calculator to help you understand that wealth creation 
                        is not about timing the market, but about <strong>time in the market</strong>.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '40px' }}>How Does Our SIP Calculator Work?</h3>
                    <p>
                        This tool uses a compound interest formula specifically designed for recurring investments. 
                        The calculation follows the formula: <strong>M = P × ([(1 + i)^n – 1] / i) × (1 + i)</strong>. 
                        Where 'M' is the maturity value, 'P' is the monthly investment, 'i' is the rate, and 'n' is the number of months.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '40px' }}>
                        <div>
                            <h4 style={{ color: '#34d399' }}>1. The Habit of Discipline</h4>
                            <p style={{ fontSize: '0.9rem' }}>
                                The biggest advantage of a SIP is automation. By investing AED 500 or AED 1,000 every month, 
                                you build a long-term habit that generates significant wealth without requiring constant market monitoring.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#34d399' }}>2. Rupee/Dirham Cost Averaging</h4>
                            <p style={{ fontSize: '0.9rem' }}>
                                SIPs protect you from market volatility. You buy more units when prices are low and fewer units 
                                when prices are high. Over several years, this reduces the average cost of your investment.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#34d399' }}>3. The Snowball Effect</h4>
                            <p style={{ fontSize: '0.9rem' }}>
                                Compounding is the "8th wonder of the world." Small, consistent contributions start earning returns, 
                                and those returns earn more returns, causing your wealth to accelerate rapidly in the later years.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#38bdf8', marginTop: '40px' }}>Secure & Private Financial Planning</h3>
                    <p>
                        Our SIP planner provides a complete visual breakdown. pie charts allow you to see the balance between 
                        Invested Amount and Estimated Returns. All logic is executed <strong>locally in your browser</strong>. 
                        Your financial goals are never saved to any database, ensuring your privacy remains 100% intact.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

const inputGroup = { marginBottom: '20px' };
const labelStyle = { color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '8px' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '10px', color: '#fff', outline: 'none' };
const statItem = { background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #334155' };
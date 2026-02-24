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

    useEffect(() => {
        const P = monthlyInvestment;
        const i = expectedReturn / 12 / 100;
        const n = timePeriod * 12;
        const totalValueCalc = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        const invested = P * n;
        setInvestedAmount(invested);
        setTotalValue(totalValueCalc);
        setEstimatedReturns(totalValueCalc - invested);
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
        <ToolboxLayout title="SIP Calculator - Systematic Investment Planner" description="Calculate your future wealth with our SIP calculator. Learn how compounding works and plan your financial goals.">
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* --- TOP INTERESTING INTRO --- */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ color: '#34d399', fontSize: '2.5rem' }}>Systematic Investment Plan (SIP) Calculator</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', margin: '15px auto' }}>
                        Did you know that investing just AED 1,000 monthly for 20 years at 12% return can grow into nearly 1 Million? 
                        Use our tool below to visualize your path to financial freedom.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    {/* INPUTS */}
                    <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                        <div style={inputGroup}><label style={labelStyle}>Monthly Investment ({meta.currency || 'AED'})</label><input type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(e.target.value)} style={inputStyle} /></div>
                        <div style={inputGroup}><label style={labelStyle}>Expected Return Rate (% P.A.)</label><input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} style={inputStyle} /></div>
                        <div style={inputGroup}><label style={labelStyle}>Time Period (Years)</label><input type="number" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} style={inputStyle} /></div>

                        <div style={{ marginTop: '30px', padding: '20px', background: '#0f172a', borderRadius: '15px', borderLeft: '5px solid #34d399' }}>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Estimated Wealth at Maturity</p>
                            <h2 style={{ color: '#34d399', margin: '5px 0' }}>{Math.round(totalValue).toLocaleString()}</h2>
                        </div>
                    </div>

                    {/* CHART & STATS */}
                    <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155', textAlign: 'center' }}>
                        <div style={{ width: '250px', margin: '0 auto 20px' }}>
                            {typeof window !== 'undefined' && <Pie data={chartData} />}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={statItem}><small style={{color:'#94a3b8'}}>Invested Amount</small><br/><strong>{Math.round(investedAmount).toLocaleString()}</strong></div>
                            <div style={statItem}><small style={{color:'#94a3b8'}}>Wealth Gained</small><br/><strong>{Math.round(estimatedReturns).toLocaleString()}</strong></div>
                        </div>
                    </div>
                </div>

                {/* --- MASSIVE KNOWLEDGE SECTION (BOTTOM) --- */}
                <div style={{ marginTop: '80px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#34d399', fontSize: '1.8rem' }}>Understanding SIP: The Power of Compounding</h2>
                    <p>
                        A Systematic Investment Plan (SIP) is a disciplined way of investing in mutual funds or stocks where a fixed amount is 
                        invested at regular intervals. At SHB ToolBox, we built this SIP Calculator to help you understand that wealth creation 
                        is not about timing the market, but about <strong>time in the market</strong>.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '40px' }}>How Does Our SIP Calculator Work?</h3>
                    <p>
                        This tool uses a compound interest formula specifically designed for recurring investments. 
                        The calculation follows the formula: <strong>M = P × ([(1 + i)^n – 1] / i) × (1 + i)</strong>. 
                        In this equation, 'M' is the amount you receive upon maturity, 'P' is the amount you invest every month, 
                        'i' is the periodic rate of interest, and 'n' is the total number of payments you have made.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '40px' }}>
                        <div>
                            <h4 style={{ color: '#34d399' }}>1. The Habit of Discipline</h4>
                            <p style={{ fontSize: '0.9rem' }}>
                                The biggest advantage of a SIP is that it automates your savings. Instead of trying to save what is left 
                                after spending, you invest first and spend the rest. This creates a cycle of long-term wealth building 
                                that is hands-free and stress-free.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#34d399' }}>2. Rupee Cost Averaging</h4>
                            <p style={{ fontSize: '0.9rem' }}>
                                When the market is high, your monthly investment buys fewer units. When the market is low, you buy more units. 
                                Over 5-10 years, this "averages out" the cost of your investment, protecting you from market volatility.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#34d399' }}>3. The Magic of Compounding</h4>
                            <p style={{ fontSize: '0.9rem' }}>
                                Compounding is what happens when your returns start earning their own returns. By starting a SIP early, 
                                even with a small amount like AED 500, the "Snowball Effect" ensures that your wealth grows exponentially 
                                in the final years of your tenure.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#38bdf8', marginTop: '40px' }}>Why plan your SIP with SHB ToolBox?</h3>
                    <p>
                        Our SIP planner provides an instant visual breakdown. The pie chart allows you to see the ratio between 
                        your hard-earned money (Invested Amount) and the money the market made for you (Estimated Returns). 
                        We believe in complete transparency, which is why all calculations are performed <strong>locally in your browser</strong>. 
                        Your financial goals, investment amounts, and personal strategy are never saved to our database, keeping 
                        your financial journey 100% private.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '40px' }}>FAQ for Investors</h3>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li><strong>Is SIP better than Lumpsum?</strong> For most people, yes. It reduces the risk of investing all your money at a market peak.</li>
                        <li><strong>What is a realistic return rate?</strong> Historically, equity markets range between 10% and 15% over long periods (10+ years).</li>
                        <li><strong>Can I stop a SIP?</strong> Yes, one of the best features of a SIP is its flexibility. You can stop or increase the amount at any time.</li>
                    </ul>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling (Keep or adapt as needed)
const inputGroup = { marginBottom: '20px' };
const labelStyle = { color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '8px' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '10px', color: '#fff' };
const statItem = { background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #334155' };
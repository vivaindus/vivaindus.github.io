import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

export default function SIPCalculator() {
    const [mounted, setMounted] = useState(false);
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [timePeriod, setTimePeriod] = useState(10);
    const [investedAmount, setInvestedAmount] = useState(0);
    const [estimatedReturns, setEstimatedReturns] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const currency = 'AED';

    // Hydration Guard & Chart Registration
    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            ChartJS.register(ArcElement, Tooltip, Legend);
        }
    }, []);

    // SIP Calculation Logic
    useEffect(() => {
        const P = parseFloat(monthlyInvestment) || 0;
        const i = (parseFloat(expectedReturn) || 0) / 12 / 100;
        const n = (parseFloat(timePeriod) || 0) * 12;
        
        if (i === 0) {
            const total = P * n;
            setInvestedAmount(total);
            setTotalValue(total);
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

    if (!mounted) return <ToolboxLayout title="SIP Calculator" description="Loading Planner..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Initializing Financial Engine...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="SIP Calculator - Systematic Investment Plan & Wealth Planner" 
            description="Calculate your mutual fund returns with our professional SIP calculator. Visualize compounding and plan your financial freedom with precision."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#34d399', fontSize: '2.5rem' }}>Systematic Investment Plan (SIP) Calculator</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '850px', margin: '15px auto', lineHeight: '1.6' }}>
                        Consistent investing is the key to creating multi-generational wealth. Even a small monthly contribution of 
                        <strong> {currency} 500</strong> can transform into a significant corpus over time through the 
                        unrivaled power of compound interest. Use our pro-grade tool below to simulate your future.
                    </p>
                </div>

                {/* --- MAIN CALCULATOR INTERFACE --- */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    {/* INPUTS PANEL */}
                    <div style={{ background: '#1e293b', padding: '35px', borderRadius: '24px', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Monthly Investment ({currency})</label>
                            <input type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Expected Annual Return (%)</label>
                            <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Investment Duration (Years)</label>
                            <input type="number" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} style={inputStyle} />
                        </div>

                        <div style={{ marginTop: '35px', padding: '25px', background: '#0f172a', borderRadius: '20px', borderLeft: '6px solid #34d399' }}>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>TOTAL ESTIMATED VALUE</p>
                            <h2 style={{ color: '#34d399', fontSize: '2.8rem', margin: '10px 0' }}>
                                {currency} {Math.round(totalValue).toLocaleString()}
                            </h2>
                        </div>
                    </div>

                    {/* VISUALS PANEL */}
                    <div style={{ background: '#1e293b', padding: '35px', borderRadius: '24px', border: '1px solid #334155', textAlign: 'center' }}>
                        <h4 style={{ color: '#94a3b8', marginBottom: '25px' }}>Wealth Breakdown</h4>
                        <div style={{ width: '250px', margin: '0 auto 30px' }}>
                            <Pie data={chartData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20 } } } }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={statItem}>
                                <small style={{ color: '#64748b' }}>Invested Principal</small>
                                <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '5px' }}>{Math.round(investedAmount).toLocaleString()}</div>
                            </div>
                            <div style={statItem}>
                                <small style={{ color: '#64748b' }}>Wealth Gained</small>
                                <div style={{ color: '#34d399', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '5px' }}>{Math.round(estimatedReturns).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (ADSENSE BOOSTER) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9', textAlign: 'left' }}>
                    <h2 style={{ color: '#34d399', fontSize: '2.2rem', marginBottom: '30px' }}>The Definitive Guide to SIP: Building Wealth Systematically</h2>
                    <p>
                        A Systematic Investment Plan (SIP) is a financial strategy that allows individuals to invest a fixed amount of money 
                        regularly in a mutual fund or equity scheme. Unlike a lumpsum investment where you deploy a large amount of capital 
                        all at once, SIP encourages the habit of monthly saving. At <strong>SHB ToolBox</strong>, our SIP Calculator 
                        is designed to show you that wealth isn't just for those with large initial capital—it is for anyone with 
                        patience and discipline.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '50px', fontSize: '1.6rem' }}>The Mathematics of Your Investment</h3>
                    <p>
                        Our calculator uses the industry-standard compound interest formula to determine the maturity value of your 
                        regular payments. The formula used is: <br/>
                        <code style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', display: 'block', margin: '20px 0', textAlign: 'center', color: '#34d399', fontSize: '1.2rem' }}>
                            M = P × ([(1 + i)^n – 1] / i) × (1 + i)
                        </code>
                        In this mathematical model: <br/>
                        • <strong>M</strong> represents the final amount you receive at maturity. <br/>
                        • <strong>P</strong> is the fixed amount you invest at regular intervals (monthly). <br/>
                        • <strong>i</strong> is the periodic rate of interest (Annual rate divided by 12 months). <br/>
                        • <strong>n</strong> is the total number of periodic payments (Total years multiplied by 12).
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '60px' }}>
                        <div>
                            <h4 style={{ color: '#34d399' }}>1. Compounding: The 8th Wonder</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Compounding occurs when the returns on your investment start earning their own returns. Over 10-15 years, 
                                the "Wealth Gained" portion of our chart will eventually exceed your "Invested Principal." This exponential 
                                growth is the secret behind the success of the world's most famous investors.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#34d399' }}>2. Rupee/Dirham Cost Averaging</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Market volatility is often scary for new investors. SIP removes this fear. By investing a fixed amount 
                                every month, you automatically buy more units when the market is low and fewer units when it is high. 
                                Over time, this "averages out" the cost, often providing better returns than trying to time the market.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#34d399' }}>3. Professional Discipline</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                SIP automates your financial goals. Whether you are planning for a new home in the UAE, a child's 
                                education, or a stress-free retirement, setting a recurring payment ensures your future is funded 
                                before you spend your monthly salary on lifestyle expenses.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '60px', fontSize: '1.5rem' }}>Strategies to Maximize Your Portfolio</h3>
                    <p>To get the most out of your SIP, consider these three professional strategies:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '20px' }}>
                        <li style={{ marginBottom: '20px' }}>
                            <strong>The "Top-Up" Strategy:</strong> As your income increases, increase your SIP amount. Even a 
                            10% annual increase in your SIP can double your final corpus.
                        </li>
                        <li style={{ marginBottom: '20px' }}>
                            <strong>Longer Horizons:</strong> Doubling your investment duration from 10 to 20 years doesn't 
                            just double your money—due to compounding, it can quadruple or quintuple the final result.
                        </li>
                        <li style={{ marginBottom: '20px' }}>
                            <strong>Start Early:</strong> A person starting a SIP at age 25 will have significantly more wealth 
                            by age 50 than someone starting at age 35, even if the second person invests double the amount.
                        </li>
                    </ul>

                    <h3 style={{ color: '#fff', marginTop: '60px', fontSize: '1.5rem' }}>Privacy & Security Guarantee</h3>
                    <p>
                        At <strong>SHB ToolBox</strong>, we value your financial privacy. Unlike many apps that require 
                        registration to see your results, our calculator works <strong>100% locally in your browser</strong>. 
                        Your monthly investment amounts, interest rates, and wealth data are never transmitted to our servers 
                        or saved in a database. You can plan your entire financial future in complete anonymity.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling Constants
const inputGroup = { marginBottom: '25px' };
const labelStyle = { color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '10px', fontWeight: 'bold' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '15px', borderRadius: '12px', color: '#fff', fontSize: '1.1rem', outline: 'none' };
const statItem = { background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' };
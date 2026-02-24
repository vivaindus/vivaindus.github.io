import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Fix for Vercel/SSR with Chart.js
if (typeof window !== 'undefined') {
    ChartJS.register(ArcElement, Tooltip, Legend);
}

export default function EMICalculator() {
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenure, setTenure] = useState(10);
    const [emi, setEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);

    useEffect(() => {
        const r = interestRate / 12 / 100;
        const n = tenure * 12;
        if (r === 0) {
            setEmi(loanAmount / n);
            setTotalInterest(0);
        } else {
            const emiValue = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            setEmi(emiValue);
            setTotalInterest((emiValue * n) - loanAmount);
        }
    }, [loanAmount, interestRate, tenure]);

    const chartData = {
        labels: ['Principal Loan Amount', 'Total Interest'],
        datasets: [{
            data: [loanAmount, totalInterest],
            backgroundColor: ['#38bdf8', '#1e293b'],
            borderColor: ['#38bdf8', '#334155'],
            borderWidth: 1,
        }],
    };

    return (
        <ToolboxLayout 
            title="Loan EMI Calculator - Home, Car & Personal Loan Planner" 
            description="Calculate your monthly installments with our professional EMI tool. View interest breakdowns, principal analysis, and plan your debt repayment strategy."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* --- TOP INTERESTING INTRO (HOOK) --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Professional Loan EMI Calculator</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '800px', margin: '15px auto', lineHeight: '1.6' }}>
                        Taking a loan is a big decision. Even a <strong>0.5% difference</strong> in your interest rate can save you 
                        thousands in the long run. Use our interactive tool below to simulate different scenarios for your 
                        Home, Car, or Personal Loan.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    {/* INPUTS PANEL */}
                    <div style={{ background: '#1e293b', padding: '35px', borderRadius: '24px', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Loan Amount (Principal)</label>
                            <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Annual Interest Rate (%)</label>
                            <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Loan Tenure (Years)</label>
                            <input type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} style={inputStyle} />
                        </div>

                        <div style={{ marginTop: '35px', padding: '25px', background: '#0f172a', borderRadius: '20px', borderLeft: '6px solid #38bdf8' }}>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Your Monthly EMI</p>
                            <h2 style={{ color: '#38bdf8', fontSize: '2.8rem', margin: '10px 0' }}>
                                {Math.round(emi).toLocaleString()} <span style={{fontSize:'1rem', color:'#475569'}}>per month</span>
                            </h2>
                        </div>
                    </div>

                    {/* CHART & STATS PANEL */}
                    <div style={{ background: '#1e293b', padding: '35px', borderRadius: '24px', border: '1px solid #334155', textAlign: 'center' }}>
                        <h4 style={{ color: '#94a3b8', marginBottom: '25px' }}>Breakdown of Total Payment</h4>
                        <div style={{ width: '260px', margin: '0 auto 30px' }}>
                            {typeof window !== 'undefined' && <Pie data={chartData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={statItem}>
                                <small style={{ color: '#64748b' }}>Total Interest</small>
                                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '5px' }}>{Math.round(totalInterest).toLocaleString()}</div>
                            </div>
                            <div style={statItem}>
                                <small style={{ color: '#64748b' }}>Total Amount</small>
                                <div style={{ color: '#38bdf8', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '5px' }}>{Math.round(parseFloat(loanAmount) + totalInterest).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2rem', marginBottom: '30px' }}>Mastering Your Debt: A Guide to Loan EMI Management</h2>
                    <p>
                        EMI stands for <strong>Equated Monthly Installment</strong>. It is the fixed amount you pay back to a lender every month until 
                        the loan is fully repaid. While it sounds simple, the way banks calculate interest can significantly impact your 
                        financial health over 10 or 20 years.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginTop: '50px' }}>
                        <div>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem' }}>How is EMI Calculated?</h3>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Our calculator uses the standard mathematical formula used by global banks: <br/>
                                <strong>E = P x r x (1+r)^n / ((1+r)^n - 1)</strong> <br/>
                                Where: <br/>
                                • <strong>P</strong> is the Principal Amount <br/>
                                • <strong>r</strong> is the Monthly Interest Rate <br/>
                                • <strong>n</strong> is the Tenure in months.
                            </p>
                        </div>
                        <div>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem' }}>The Principal-Interest Dynamic</h3>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                In the early years of a long-term loan (like a home loan), most of your EMI goes toward paying the <strong>interest</strong>, 
                                and very little toward the principal. As time progresses, the ratio flips. Using our Pie Chart, you can 
                                see the "Cost of Borrowing"—the total interest you pay on top of your loan.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>3 Tips to Reduce Your Total Interest</h3>
                    <ol style={{ paddingLeft: '20px', marginTop: '20px' }}>
                        <li style={{ marginBottom: '15px' }}>
                            <strong>Make Part-Prepayments:</strong> Paying even a small extra amount toward your principal in the early years 
                            can reduce your tenure by months or even years.
                        </li>
                        <li style={{ marginBottom: '15px' }}>
                            <strong>Choose Shorter Tenures:</strong> While long tenures result in lower EMIs, they lead to much higher 
                            total interest payments. Always choose the shortest tenure you can comfortably afford.
                        </li>
                        <li style={{ marginBottom: '15px' }}>
                            <strong>Monitor Interest Rates:</strong> If market rates drop, consider "Refinancing" or shifting your loan 
                            to a bank offering a lower percentage.
                        </li>
                    </ol>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>Secure & Private Financial Planning</h3>
                    <p>
                        At <strong>SHB ToolBox</strong>, we believe your financial plans should remain private. Unlike many bank websites 
                        that ask for your phone number to "Get a Quote," our calculator works <strong>100% locally in your browser</strong>. 
                        We do not collect your loan data, interest rates, or personal information. You can plan your financial future 
                        with total peace of mind.
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
import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function EMICalculator() {
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenure, setTenure] = useState(10);
    const [emi, setEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);

    useEffect(() => {
        const r = interestRate / 12 / 100;
        const n = tenure * 12;
        const emiValue = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        setEmi(emiValue);
        setTotalInterest((emiValue * n) - loanAmount);
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
        <ToolboxLayout title="Loan EMI Calculator" description="Calculate your monthly home, car, or personal loan EMI with a detailed interest breakdown.">
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '10px' }}>Loan EMI Calculator</h1>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '40px' }}>Plan your finances with precision and visual clarity.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    {/* INPUTS */}
                    <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Loan Amount ($)</label>
                            <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Interest Rate (% P.A.)</label>
                            <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Tenure (Years)</label>
                            <input type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} style={inputStyle} />
                        </div>

                        <div style={{ marginTop: '30px', padding: '20px', background: '#0f172a', borderRadius: '15px', borderLeft: '5px solid #38bdf8' }}>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Monthly EMI</p>
                            <h2 style={{ color: '#38bdf8', margin: '5px 0' }}>${Math.round(emi).toLocaleString()}</h2>
                        </div>
                    </div>

                    {/* CHART & STATS */}
                    <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155', textAlign: 'center' }}>
                        <div style={{ width: '250px', margin: '0 auto 20px' }}>
                            <Pie data={chartData} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={statItem}><small>Total Interest</small><br/><strong>${Math.round(totalInterest).toLocaleString()}</strong></div>
                            <div style={statItem}><small>Total Amount</small><br/><strong>${Math.round(parseFloat(loanAmount) + totalInterest).toLocaleString()}</strong></div>
                        </div>
                    </div>
                </div>

                {/* --- SEO SECTION --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>Professional Loan EMI Planning</h2>
                    <p>
                        The SHB Loan EMI Calculator is a professional financial tool designed to help you calculate your Equated Monthly Installments (EMI) 
                        for home loans, car loans, or personal loans. Understanding your debt obligations before committing to a loan is 
                        the first step toward responsible financial management.
                    </p>
                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>How EMI is Calculated?</h3>
                    <p>
                        Our calculator uses the standard mathematical formula: <strong>EMI = [P x R x (1+R)^N]/[(1+R)^N-1]</strong>. 
                        Where P is the principal amount, R is the monthly interest rate, and N is the loan tenure in months. 
                        This precise logic ensures you see exactly how much of your payment goes toward the principal versus the interest.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

const inputGroup = { marginBottom: '20px' };
const labelStyle = { color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '8px' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '10px', color: '#fff' };
const statItem = { background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #334155' };
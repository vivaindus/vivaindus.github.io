import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

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
        <ToolboxLayout title="SIP Calculator" description="Calculate the future value of your Systematic Investment Plan (SIP) with compound interest.">
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#34d399', marginBottom: '10px' }}>SIP Calculator</h1>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '40px' }}>Visualize your wealth growth through disciplined investing.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                        <div style={inputGroup}><label style={labelStyle}>Monthly Investment ($)</label><input type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(e.target.value)} style={inputStyle} /></div>
                        <div style={inputGroup}><label style={labelStyle}>Expected Return Rate (% P.A.)</label><input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} style={inputStyle} /></div>
                        <div style={inputGroup}><label style={labelStyle}>Time Period (Years)</label><input type="number" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} style={inputStyle} /></div>

                        <div style={{ marginTop: '30px', padding: '20px', background: '#0f172a', borderRadius: '15px', borderLeft: '5px solid #34d399' }}>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Total Wealth</p>
                            <h2 style={{ color: '#34d399', margin: '5px 0' }}>${Math.round(totalValue).toLocaleString()}</h2>
                        </div>
                    </div>

                    <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155', textAlign: 'center' }}>
                        <div style={{ width: '250px', margin: '0 auto 20px' }}><Pie data={chartData} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={statItem}><small>Invested Amount</small><br/><strong>${Math.round(investedAmount).toLocaleString()}</strong></div>
                            <div style={statItem}><small>Wealth Gained</small><br/><strong>${Math.round(estimatedReturns).toLocaleString()}</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        </ToolboxLayout>
    );
}

const inputGroup = { marginBottom: '20px' };
const labelStyle = { color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '8px' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '10px', color: '#fff' };
const statItem = { background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #334155' };
import React, { useState } from 'react';
import Head from 'next/head';

export default function AgeCalculator() {
    const [birthDate, setBirthDate] = useState('');
    const [ageResult, setAgeResult] = useState(null);

    const calculateAge = (e) => {
        e.preventDefault();
        if (!birthDate) return;

        const birth = new Date(birthDate);
        const now = new Date();

        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();

        if (days < 0) {
            months--;
            days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
        setAgeResult({ years, months, days, totalDays });
    };

    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <Head>
                <title>Age Calculator - Exact Age in Years, Months, Days | SHB ToolBox</title>
                <meta name="description" content="Calculate your exact age in years, months, and days. Find out how many days you've been alive with our free tool." />
            </Head>

            <nav style={{ background: '#1e293b', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#38bdf8' }}>SHB ToolBox</span>
                <div style={{ display: 'flex', gap: '15px', overflowX: 'auto' }}>
                    <a href="/cpstest" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.8rem' }}>CPS TEST</a>
                    <a href="/bmicalculator" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.8rem' }}>BMI CALC</a>
                    <a href="/agecalculator" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}>AGE CALC</a>
                </div>
            </nav>

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', color: '#fff' }}>Age Calculator</h1>
                    <p style={{ color: '#94a3b8' }}>Discover exactly how long you've been on Earth</p>
                </header>

                <form onSubmit={calculateAge} style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155', textAlign: 'center' }}>
                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '15px' }}>Select Your Date of Birth</label>
                    <input 
                        type="date" 
                        value={birthDate} 
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '15px', borderRadius: '12px', color: '#fff', fontSize: '1.1rem', marginBottom: '20px', cursor: 'pointer' }}
                    />
                    <button type="submit" style={{ width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
                        CALCULATE AGE
                    </button>
                </form>

                {ageResult && (
                    <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
                            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #334155' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', display: 'block' }}>{ageResult.years}</span>
                                <small style={{ color: '#94a3b8' }}>YEARS</small>
                            </div>
                            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #334155' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', display: 'block' }}>{ageResult.months}</span>
                                <small style={{ color: '#94a3b8' }}>MONTHS</small>
                            </div>
                            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #334155' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', display: 'block' }}>{ageResult.days}</span>
                                <small style={{ color: '#94a3b8' }}>DAYS</small>
                            </div>
                        </div>
                        <div style={{ background: '#38bdf8', color: '#0f172a', padding: '20px', borderRadius: '16px', textAlign: 'center', fontWeight: 'bold' }}>
                            Total days lived: {ageResult.totalDays.toLocaleString()} days
                        </div>
                    </div>
                )}
            </div>

            <footer style={{ textAlign: 'center', padding: '40px', color: '#475569', fontSize: '0.8rem' }}>
                <div style={{ marginBottom: '15px' }}>
                    <a href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', margin: '0 10px' }}>Privacy Policy</a>
                    <a href="/contact" style={{ color: '#94a3b8', textDecoration: 'none', margin: '0 10px' }}>Contact Us</a>
                </div>
                &copy; 2024 SHB ToolBox
            </footer>

            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
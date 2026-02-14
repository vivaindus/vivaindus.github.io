import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function AgeCalculator() {
    const [birthDate, setBirthDate] = useState('');
    const [ageResult, setAgeResult] = useState(null);

    const calculateAge = (e) => {
        e.preventDefault();
        const birth = new Date(birthDate);
        const now = new Date();
        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();

        if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }
        const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
        setAgeResult({ years, months, days, totalDays });
    };

    return (
        <ToolboxLayout title="Age Calculator" description="Find your exact age in years, months, and days.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '30px' }}>Age Calculator</h1>
                <form onSubmit={calculateAge} style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '15px' }}>Date of Birth</label>
                    <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '15px', borderRadius: '12px', color: '#fff', fontSize: '1.1rem', marginBottom: '20px' }} />
                    <button type="submit" style={{ width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>CALCULATE AGE</button>
                </form>

                {ageResult && (
                    <div style={{ marginTop: '30px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
                            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', display: 'block' }}>{ageResult.years}</span>
                                <small style={{ color: '#94a3b8' }}>YEARS</small>
                            </div>
                            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', display: 'block' }}>{ageResult.months}</span>
                                <small style={{ color: '#94a3b8' }}>MONTHS</small>
                            </div>
                            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', display: 'block' }}>{ageResult.days}</span>
                                <small style={{ color: '#94a3b8' }}>DAYS</small>
                            </div>
                        </div>
                        <div style={{ background: '#38bdf8', color: '#0f172a', padding: '20px', borderRadius: '16px', fontWeight: 'bold' }}>
                            You have been alive for {ageResult.totalDays.toLocaleString()} days!
                        </div>
                    </div>
                )}
            </div>
        </ToolboxLayout>
    );
}
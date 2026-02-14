import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function AgeCalculator() {
    const [birthDate, setBirthDate] = useState('');
    const [ageResult, setAgeResult] = useState(null);

    const calculateAge = (e) => {
        e.preventDefault();
        const birth = new Date(birthDate);
        if (isNaN(birth.getTime())) return alert("Please enter a valid date (YYYY-MM-DD)");
        
        const now = new Date();
        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();

        if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }
        
        const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
        
        // Next Birthday logic
        let nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
        if (nextBday < now) nextBday.setFullYear(now.getFullYear() + 1);
        const daysToBday = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));

        setAgeResult({ years, months, days, totalDays, daysToBday });
    };

    return (
        <ToolboxLayout title="Age Calculator" description="Exact age calculator with manual date entry support.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <h1>Age Calculator</h1>
                <form onSubmit={calculateAge} style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '10px' }}>Enter Birth Date (YYYY-MM-DD)</label>
                    <input 
                        type="date" 
                        value={birthDate} 
                        onChange={(e) => setBirthDate(e.target.value)} 
                        required 
                        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '15px', borderRadius: '12px', color: '#fff', fontSize: '1.1rem', marginBottom: '20px' }} 
                    />
                    <p style={{fontSize: '0.8rem', color: '#64748b', marginBottom: '15px'}}>Tip: You can type the date directly or use the calendar icon.</p>
                    <button type="submit" style={{ width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>CALCULATE</button>
                </form>

                {ageResult && (
                    <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px' }}><h2>{ageResult.years}</h2><small>YEARS</small></div>
                            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px' }}><h2>{ageResult.months}</h2><small>MONTHS</small></div>
                            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px' }}><h2>{ageResult.days}</h2><small>DAYS</small></div>
                        </div>
                        <div style={{ marginTop: '20px', padding: '20px', background: '#38bdf8', color: '#0f172a', borderRadius: '16px', fontWeight: 'bold' }}>
                            🎂 {ageResult.daysToBday} days left until your next birthday!
                        </div>
                    </div>
                )}
            </div>
        </ToolboxLayout>
    );
}
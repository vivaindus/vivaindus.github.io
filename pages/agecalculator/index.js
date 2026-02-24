import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function AgeCalculator() {
    const [mounted, setMounted] = useState(false);
    const [birthDate, setBirthDate] = useState('');
    const [ageResult, setAgeResult] = useState(null);
    const [notification, setNotification] = useState('');

    // Hydration Guard
    useEffect(() => {
        setMounted(true);
    }, []);

    // Toast Logic
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const calculateAge = (e) => {
        e.preventDefault();
        const birth = new Date(birthDate);
        if (isNaN(birth.getTime())) {
            setNotification('⚠️ Please enter a valid date.');
            return;
        }
        
        const now = new Date();
        if (birth > now) {
            setNotification('⚠️ Birth date cannot be in the future!');
            return;
        }

        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();

        if (days < 0) { 
            months--; 
            const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += lastMonth.getDate(); 
        }
        if (months < 0) { 
            years--; 
            months += 12; 
        }
        
        const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
        const totalHours = Math.floor((now - birth) / (1000 * 60 * 60));
        
        // Next Birthday logic
        let nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
        if (nextBday < now) nextBday.setFullYear(now.getFullYear() + 1);
        const daysToBday = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));

        setAgeResult({ years, months, days, totalDays, totalHours, daysToBday });
        setNotification('Chronological Age Calculated! 📅');
    };

    if (!mounted) return <ToolboxLayout title="Age Calculator" description="Loading..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Synchronizing Calendar Engine...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="Professional Age Calculator - Precise Chronological Age Finder" 
            description="Calculate your exact age in years, months, days, and hours. Track your next birthday and learn about the mathematics of time and calendars 100% privately."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* NOTIFICATION */}
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Precision Age Calculator</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '850px', margin: '15px auto', lineHeight: '1.6' }}>
                        Time is our most valuable asset. While most know their age in years, our <strong>Chronological Delta Engine</strong> 
                        provides a high-precision breakdown of your time footprint on Earth, down to the exact hour.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    
                    {/* INPUT SECTION */}
                    <form onSubmit={calculateAge} style={{ background: '#1e293b', padding: '35px', borderRadius: '30px', border: '1px solid #334155', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={lCap}>ENTER DATE OF BIRTH</label>
                            <input 
                                type="date" 
                                value={birthDate} 
                                onChange={(e) => setBirthDate(e.target.value)} 
                                required 
                                style={inputStyle} 
                            />
                        </div>
                        <button type="submit" style={btnPrimary}>CALCULATE EXACT AGE</button>
                    </form>

                    {/* RESULTS SECTION */}
                    <div style={{ background: '#1e293b', padding: '35px', borderRadius: '30px', border: '1px solid #334155', textAlign: 'center' }}>
                        {!ageResult ? (
                            <div style={{ color: '#475569', marginTop: '100px' }}>Enter your DOB to see your timeline</div>
                        ) : (
                            <div style={{ animation: 'fadeIn 0.5s' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                    <div style={statItem}><h2 style={resH2}>{ageResult.years}</h2><small style={lCap}>Years</small></div>
                                    <div style={statItem}><h2 style={resH2}>{ageResult.months}</h2><small style={lCap}>Months</small></div>
                                    <div style={statItem}><h2 style={resH2}>{ageResult.days}</h2><small style={lCap}>Days</small></div>
                                </div>
                                <div style={{ marginTop: '20px', padding: '20px', background: '#0f172a', borderRadius: '15px', border: '1px solid #334155' }}>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.8rem' }}>Next Birthday In:</p>
                                    <h3 style={{ color: '#38bdf8', margin: '5px 0' }}>🎂 {ageResult.daysToBday} Days</h3>
                                </div>
                                <div style={{ marginTop: '15px', fontSize: '0.75rem', color: '#475569' }}>
                                    Total Hours Lived: {ageResult.totalHours.toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '30px' }}>Chronological Intelligence: More Than Just a Number</h2>
                    <p>
                        Calculating age seems straightforward, but it involves complex mathematics due to the irregularities of the 
                        <strong> Gregorian Calendar</strong>. With months varying from 28 to 31 days and the inclusion of Leap Years 
                        every four years, determining an exact age requires a dynamic algorithm. Our tool handles these nuances to 
                        provide a legally and medically accurate reading.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '60px' }}>
                        <div>
                            <h4 style={{ color: '#fff' }}>The Leap Year Factor</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                A standard year has 365 days, but the Earth actually takes 365.24219 days to orbit the Sun. 
                                Our calculator adjusts for the "intercalary day" added to February, ensuring that individuals 
                                born on <strong>February 29th</strong> or during leap cycles receive an mathematically precise 
                                total-day count.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#fff' }}>Medical & Legal Utility</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Precision age is vital for pediatric developmental milestones, insurance underwriting, 
                                and legal eligibility. Whether you are calculating <strong>retirement readiness</strong> 
                                in the UAE or verifying school admission windows, knowing the months and days is as critical 
                                as knowing the years.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>How Our Algorithm Works</h3>
                    <p>
                        The SHB Age Engine performs a three-tier subtraction process:
                    </p>
                    <ol style={{ paddingLeft: '20px', marginTop: '20px' }}>
                        <li style={{ marginBottom: '15px' }}><strong>Year Delta:</strong> Calculates the base difference between the current year and the birth year.</li>
                        <li style={{ marginBottom: '15px' }}><strong>Month Normalization:</strong> Adjusts for the current date relative to the birth month, handling "rollover" where the current day is less than the birth day.</li>
                        <li style={{ marginBottom: '15px' }}><strong>Hourly Conversion:</strong> Utilizes Unix timestamps (milliseconds since Jan 1, 1970) to derive the absolute total of hours and days spent.</li>
                    </ol>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>100% Privacy & Data Confidentiality</h3>
                    <p>
                        Your date of birth is sensitive personal information. At <strong>SHB ToolBox</strong>, we follow a 
                        strict <strong>No-Cloud Policy</strong>. Your date of birth is processed 100% locally in your 
                        browser. We do not store your DOB in a database, and we do not use your age for targeted advertising 
                        profiles. You can calculate your most private milestones with complete security.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling Constants
const lCap = { fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '10px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '18px', borderRadius: '15px', color: '#fff', fontSize: '1.2rem', outline: 'none' };
const btnPrimary = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '20px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' };
const statItem = { background: '#0f172a', padding: '15px', borderRadius: '15px', border: '1px solid #334155' };
const resH2 = { color: '#fff', margin: '0 0 5px 0', fontSize: '1.8rem' };
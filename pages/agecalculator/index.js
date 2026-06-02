import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

export default function AgeCalculator() {
    const [mounted, setMounted] = useState(false);
    const [birthDate, setBirthDate] = useState('');
    const [ageResult, setAgeResult] = useState(null);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const calculateAge = (e) => {
        e.preventDefault();

        const birth = new Date(birthDate);
        if (!birthDate || isNaN(birth.getTime())) {
            setNotification('⚠️ Please enter a valid date.');
            return;
        }

        const now = new Date();
        if (birth > now) {
            setNotification('⚠️ Birth date cannot be in the future.');
            return;
        }

        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();

        if (days < 0) {
            months--;
            const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += previousMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
        const totalHours = Math.floor((now - birth) / (1000 * 60 * 60));

        let nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
        if (nextBirthday < now) {
            nextBirthday.setFullYear(now.getFullYear() + 1);
        }

        const daysToBirthday = Math.ceil((nextBirthday - now) / (1000 * 60 * 60 * 24));

        setAgeResult({
            years,
            months,
            days,
            totalDays,
            totalHours,
            daysToBirthday
        });

        setNotification('Age calculated successfully 📅');
    };

    if (!mounted) {
        return (
            <ToolboxLayout title="Age Calculator" description="Calculate age in years, months, and days.">
                <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    Loading age calculator...
                </div>
            </ToolboxLayout>
        );
    }

    return (
        <ToolboxLayout
            title="Age Calculator - Calculate Exact Age in Years, Months and Days"
            description="Use the free SHB ToolBox age calculator to calculate age from date of birth in years, months, days, total days, total hours, and next birthday countdown."
        >
            <div style={pageWrap}>
                {notification && (
                    <div style={toast}>
                        {notification}
                    </div>
                )}

                <section style={hero}>
                    <p style={eyebrow}>Free date of birth calculator</p>
                    <h1 style={heroTitle}>Age Calculator</h1>
                    <p style={heroText}>
                        Calculate your age from date of birth in years, months, and days. This free tool also shows
                        total days lived, estimated total hours, and the number of days remaining until your next birthday.
                    </p>
                </section>

                <section style={toolGrid}>
                    <form onSubmit={calculateAge} style={panel}>
                        <h2 style={panelTitle}>Enter your date of birth</h2>
                        <p style={panelText}>
                            Select a date below and the calculator will compare it with today&apos;s date.
                        </p>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={label}>Date of birth</label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>

                        <button type="submit" style={btnPrimary}>Calculate Age</button>

                        <p style={privacyNote}>
                            Your date is processed in your browser for this calculation. SHB ToolBox does not require an account to use this tool.
                        </p>
                    </form>

                    <div style={panel}>
                        <h2 style={panelTitle}>Age result</h2>

                        {!ageResult ? (
                            <div style={emptyState}>
                                Enter your date of birth to see your exact age breakdown.
                            </div>
                        ) : (
                            <div>
                                <div style={mainResult}>
                                    <div style={statItem}>
                                        <strong style={statNumber}>{ageResult.years}</strong>
                                        <span style={statLabel}>Years</span>
                                    </div>
                                    <div style={statItem}>
                                        <strong style={statNumber}>{ageResult.months}</strong>
                                        <span style={statLabel}>Months</span>
                                    </div>
                                    <div style={statItem}>
                                        <strong style={statNumber}>{ageResult.days}</strong>
                                        <span style={statLabel}>Days</span>
                                    </div>
                                </div>

                                <div style={summaryBox}>
                                    <div>
                                        <span style={summaryLabel}>Total days</span>
                                        <strong style={summaryValue}>{ageResult.totalDays.toLocaleString()}</strong>
                                    </div>
                                    <div>
                                        <span style={summaryLabel}>Estimated total hours</span>
                                        <strong style={summaryValue}>{ageResult.totalHours.toLocaleString()}</strong>
                                    </div>
                                    <div>
                                        <span style={summaryLabel}>Next birthday in</span>
                                        <strong style={summaryValue}>🎂 {ageResult.daysToBirthday} days</strong>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>


                <RelatedTools currentPath="/agecalculator" />

                <section style={contentSection}>
                    <h2 style={contentTitle}>How the age calculator works</h2>
                    <p style={para}>
                        Age calculation is more detailed than subtracting one year from another. Months have different
                        lengths, leap years add an extra day to February, and the current day of the month affects whether
                        a full month has passed. This calculator checks the year, month, and day difference separately to
                        produce a clear age breakdown.
                    </p>

                    <div style={infoGrid}>
                        <div style={infoCard}>
                            <h3 style={infoTitle}>Years, months, and days</h3>
                            <p style={paraSmall}>
                                The calculator first compares the birth year with the current year. It then adjusts the
                                result depending on whether the birthday has already occurred in the current month and year.
                            </p>
                        </div>

                        <div style={infoCard}>
                            <h3 style={infoTitle}>Total days and hours</h3>
                            <p style={paraSmall}>
                                Total days and hours are estimated from the time difference between the selected date and
                                the current time. These values are useful for timelines, milestones, and general curiosity.
                            </p>
                        </div>

                        <div style={infoCard}>
                            <h3 style={infoTitle}>Next birthday countdown</h3>
                            <p style={paraSmall}>
                                The tool checks your birthday date in the current year. If it has already passed, it calculates
                                the countdown to the same date in the next year.
                            </p>
                        </div>
                    </div>

                    <h2 style={contentTitle}>Common uses of an age calculator</h2>
                    <p style={para}>
                        A date of birth calculator can be helpful for school forms, application forms, personal records,
                        birthday planning, age-based eligibility checks, event registration, and general date calculations.
                        For official legal, medical, immigration, insurance, or compliance decisions, always verify the
                        required date rules with the relevant authority or professional.
                    </p>

                    <h2 style={contentTitle}>Privacy note</h2>
                    <p style={para}>
                        Date of birth can be sensitive personal information. This tool is designed for simple browser-based
                        calculation and does not require a login. Avoid sharing your date of birth publicly or entering it
                        into websites unless you understand why it is needed.
                    </p>
                </section>

                <section style={faqSection}>
                    <h2 style={contentTitle}>Age Calculator FAQ</h2>

                    <div style={faqGrid}>
                        <div style={faqItem}>
                            <h3 style={faqQ}>Can I calculate age without signing in?</h3>
                            <p style={paraSmall}>Yes. This age calculator is free to use and does not require an account.</p>
                        </div>

                        <div style={faqItem}>
                            <h3 style={faqQ}>Does the calculator handle leap years?</h3>
                            <p style={paraSmall}>Yes. The calculation uses JavaScript date handling and adjusts month and day differences.</p>
                        </div>

                        <div style={faqItem}>
                            <h3 style={faqQ}>Can I use this result for official documents?</h3>
                            <p style={paraSmall}>You can use it for reference, but official forms should be checked against the rules of the relevant organization.</p>
                        </div>

                        <div style={faqItem}>
                            <h3 style={faqQ}>Why do months and days matter?</h3>
                            <p style={paraSmall}>Some applications, school admissions, milestones, and eligibility checks require a more precise age than years alone.</p>
                        </div>
                    </div>
                </section>
            </div>
        </ToolboxLayout>
    );
}

const pageWrap = { maxWidth: '1100px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '44px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '820px', margin: '0 auto', lineHeight: 1.75 };

const toolGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '26px', alignItems: 'stretch' };
const panel = { background: '#1e293b', padding: '34px', borderRadius: '28px', border: '1px solid #334155', boxShadow: '0 14px 35px rgba(0,0,0,0.2)' };
const panelTitle = { color: '#fff', fontSize: '1.45rem', margin: '0 0 10px' };
const panelText = { color: '#94a3b8', lineHeight: 1.6, margin: '0 0 24px' };
const label = { fontSize: '0.75rem', color: '#94a3b8', fontWeight: 900, display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '17px', borderRadius: '14px', color: '#fff', fontSize: '1.05rem', outline: 'none', colorScheme: 'dark' };
const btnPrimary = { width: '100%', background: '#38bdf8', color: '#082f49', border: 'none', padding: '17px', borderRadius: '14px', fontWeight: 950, cursor: 'pointer', fontSize: '1rem' };
const privacyNote = { color: '#64748b', lineHeight: 1.6, fontSize: '0.86rem', margin: '18px 0 0' };

const emptyState = { color: '#64748b', minHeight: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: '1px dashed #334155', borderRadius: '20px', padding: '20px' };
const mainResult = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '20px' };
const statItem = { background: '#0f172a', padding: '18px 10px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center' };
const statNumber = { color: '#fff', fontSize: '2rem', display: 'block', lineHeight: 1 };
const statLabel = { color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800 };
const summaryBox = { marginTop: '18px', background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '20px', display: 'grid', gap: '14px' };
const summaryLabel = { color: '#94a3b8', display: 'block', fontSize: '0.8rem', marginBottom: '4px' };
const summaryValue = { color: '#38bdf8', fontSize: '1.05rem' };

const contentSection = { marginTop: '80px', borderTop: '1px solid #334155', paddingTop: '55px' };
const contentTitle = { color: '#fff', fontSize: '1.75rem', lineHeight: 1.25, margin: '0 0 18px' };
const para = { color: '#cbd5e1', lineHeight: 1.85, fontSize: '1rem', margin: '0 0 28px' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '28px 0 48px' };
const infoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '24px' };
const infoTitle = { color: '#38bdf8', margin: '0 0 12px', fontSize: '1.05rem' };
const paraSmall = { color: '#cbd5e1', lineHeight: 1.75, fontSize: '0.95rem', margin: 0 };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px' };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };
const faqQ = { color: '#fff', fontSize: '1rem', margin: '0 0 10px' };
import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

export default function BMICalculator() {
    const [mounted, setMounted] = useState(false);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [result, setResult] = useState(null);
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

    const getCategory = (bmiValue) => {
        if (bmiValue < 18.5) {
            return {
                name: 'Underweight',
                color: '#fbbf24',
                range: 'Below 18.5',
                note: 'This range may suggest low body weight for height. Consider reviewing nutrition and health context with a qualified professional if needed.',
                tips: [
                    'Focus on balanced meals with enough calories and protein.',
                    'Track weight changes over time instead of relying on one result.',
                    'Speak with a healthcare professional if weight loss is unplanned.'
                ]
            };
        }

        if (bmiValue < 25) {
            return {
                name: 'Healthy Weight',
                color: '#34d399',
                range: '18.5 to less than 25',
                note: 'This range is commonly used as a general healthy-weight reference for adults.',
                tips: [
                    'Maintain a balanced diet and regular physical activity.',
                    'Continue monitoring lifestyle habits, sleep, hydration, and energy levels.',
                    'Remember that BMI is only one simple measurement.'
                ]
            };
        }

        if (bmiValue < 30) {
            return {
                name: 'Overweight',
                color: '#fb923c',
                range: '25 to less than 30',
                note: 'This range may indicate higher body weight for height, but BMI does not show body composition or fat distribution.',
                tips: [
                    'Review activity, food habits, sleep, and stress patterns together.',
                    'Small sustainable lifestyle changes are usually more useful than quick fixes.',
                    'Consider waist measurement or professional guidance for a fuller picture.'
                ]
            };
        }

        return {
            name: 'Obesity',
            color: '#f87171',
            range: '30 or greater',
            note: 'This range is commonly used as a general screening category. A professional assessment can provide more personal context.',
            tips: [
                'Consider discussing your result with a qualified healthcare professional.',
                'Focus on realistic, long-term health habits rather than extreme dieting.',
                'Low-impact movement, nutrition review, and regular checkups may be helpful.'
            ]
        };
    };

    const calculateBMI = (e) => {
        e.preventDefault();

        const weightValue = Number(weight);
        const heightValue = Number(height);

        if (!weightValue || !heightValue || weightValue <= 0 || heightValue <= 0) {
            setNotification('⚠️ Please enter valid height and weight values.');
            return;
        }

        if (heightValue < 50 || heightValue > 260 || weightValue < 10 || weightValue > 500) {
            setNotification('⚠️ Please check that your height and weight values are realistic.');
            return;
        }

        const heightInMeters = heightValue / 100;
        const bmiValue = weightValue / (heightInMeters * heightInMeters);
        const rounded = Number(bmiValue.toFixed(1));
        const category = getCategory(rounded);

        setResult({
            bmi: rounded,
            category,
            heightInMeters: heightInMeters.toFixed(2),
            weight: weightValue
        });

        setNotification('BMI calculated successfully ⚖️');
    };

    if (!mounted) {
        return (
            <ToolboxLayout title="BMI Calculator" description="Calculate body mass index.">
                <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    Loading BMI calculator...
                </div>
            </ToolboxLayout>
        );
    }

    return (
        <ToolboxLayout
            title="BMI Calculator - Calculate Body Mass Index Online"
            description="Use the free SHB ToolBox BMI calculator to calculate adult body mass index from height and weight, review BMI categories, limitations, and general wellness notes."
        >
            <div style={pageWrap}>
                {notification && (
                    <div style={toast}>
                        {notification}
                    </div>
                )}

                <section style={hero}>
                    <p style={eyebrow}>Free adult BMI calculator</p>
                    <h1 style={heroTitle}>BMI Calculator</h1>
                    <p style={heroText}>
                        Calculate your Body Mass Index using weight in kilograms and height in centimeters.
                        BMI is a simple screening number that compares body weight with height. It can be useful
                        for general awareness, but it should not be treated as a diagnosis or complete health assessment.
                    </p>
                </section>

                <section style={toolGrid}>
                    <form onSubmit={calculateBMI} style={panel}>
                        <h2 style={panelTitle}>Enter your details</h2>
                        <p style={panelText}>
                            This calculator uses the metric BMI formula: weight in kilograms divided by height in meters squared.
                        </p>

                        <div style={{ marginBottom: '22px' }}>
                            <label style={label}>Weight in kilograms</label>
                            <input
                                type="number"
                                step="any"
                                min="1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="Example: 70"
                                required
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ marginBottom: '28px' }}>
                            <label style={label}>Height in centimeters</label>
                            <input
                                type="number"
                                step="any"
                                min="1"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder="Example: 170"
                                required
                                style={inputStyle}
                            />
                        </div>

                        <button type="submit" style={btnPrimary}>Calculate BMI</button>

                        <p style={privacyNote}>
                            Your height and weight are processed in your browser for this calculation. No account is required.
                        </p>
                    </form>

                    <div style={panel}>
                        <h2 style={panelTitle}>BMI result</h2>

                        {!result ? (
                            <div style={emptyState}>
                                Enter your height and weight to see your BMI result and category.
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <p style={resultLabel}>Your calculated BMI</p>
                                <strong style={{ ...bmiNumber, color: result.category.color }}>{result.bmi}</strong>

                                <div style={{ ...categoryBadge, background: result.category.color }}>
                                    {result.category.name}
                                </div>

                                <div style={resultBox}>
                                    <p style={rangeLine}>
                                        <strong>Category range:</strong> {result.category.range}
                                    </p>
                                    <p style={resultNote}>{result.category.note}</p>
                                </div>

                                <div style={{ ...tipsBox, borderColor: result.category.color }}>
                                    <h3 style={{ ...tipsTitle, color: result.category.color }}>General wellness notes</h3>
                                    <ul style={tipList}>
                                        {result.category.tips.map((tip, index) => (
                                            <li key={index} style={tipItem}>{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section style={categorySection}>
                    <h2 style={contentTitle}>Adult BMI categories</h2>
                    <p style={para}>
                        BMI categories are commonly used for adults as a quick screening reference. The standard adult
                        ranges are underweight below 18.5, healthy weight from 18.5 to less than 25, overweight from 25
                        to less than 30, and obesity at 30 or greater.
                    </p>

                    <div style={categoryGrid}>
                        <div style={categoryCard}>
                            <span style={{ ...dot, background: '#fbbf24' }} />
                            <h3 style={categoryTitle}>Underweight</h3>
                            <p style={categoryText}>BMI below 18.5</p>
                        </div>
                        <div style={categoryCard}>
                            <span style={{ ...dot, background: '#34d399' }} />
                            <h3 style={categoryTitle}>Healthy Weight</h3>
                            <p style={categoryText}>BMI 18.5 to less than 25</p>
                        </div>
                        <div style={categoryCard}>
                            <span style={{ ...dot, background: '#fb923c' }} />
                            <h3 style={categoryTitle}>Overweight</h3>
                            <p style={categoryText}>BMI 25 to less than 30</p>
                        </div>
                        <div style={categoryCard}>
                            <span style={{ ...dot, background: '#f87171' }} />
                            <h3 style={categoryTitle}>Obesity</h3>
                            <p style={categoryText}>BMI 30 or greater</p>
                        </div>
                    </div>
                </section>


                <RelatedTools currentPath="/bmicalculator" />

                <section style={contentSection}>
                    <h2 style={contentTitle}>How BMI is calculated</h2>
                    <p style={para}>
                        BMI stands for Body Mass Index. The metric formula is:
                    </p>

                    <div style={formulaBox}>
                        BMI = weight (kg) ÷ height² (m²)
                    </div>

                    <p style={para}>
                        For example, a person who weighs 70 kg and has a height of 1.70 m would have a BMI of
                        70 ÷ (1.70 × 1.70), which is approximately 24.2. This gives a quick way to compare body
                        weight with height, but it does not explain everything about a person&apos;s health.
                    </p>

                    <h2 style={contentTitle}>Important limitations of BMI</h2>
                    <p style={para}>
                        BMI is useful because it is simple, but it has limitations. It does not directly measure body fat,
                        muscle mass, bone density, waist size, fitness level, or fat distribution. Athletes and people with
                        high muscle mass may have a higher BMI without having the same health risk as someone with a similar
                        BMI but different body composition.
                    </p>
                    <p style={para}>
                        BMI may also need extra context for children, older adults, pregnant people, and some population groups.
                        For a complete health picture, BMI is often considered alongside other information such as waist
                        measurement, blood pressure, lab results, medical history, lifestyle, and professional assessment.
                    </p>

                    <h2 style={contentTitle}>When to use this BMI calculator</h2>
                    <p style={para}>
                        Use this calculator for general personal awareness, fitness tracking, form filling, health discussions,
                        or understanding how BMI categories work. Do not use BMI alone to make major medical, diet, or treatment
                        decisions. If you are concerned about your weight, nutrition, or health risks, speak with a qualified
                        healthcare professional.
                    </p>

                    <h2 style={contentTitle}>Privacy note</h2>
                    <p style={para}>
                        Height and weight are personal information. This BMI calculator is designed for simple browser-based
                        calculation and does not require a login. Avoid sharing personal health details publicly or entering
                        them into websites unless you understand how they are used.
                    </p>
                </section>

                <section style={faqSection}>
                    <h2 style={contentTitle}>BMI Calculator FAQ</h2>

                    <div style={faqGrid}>
                        <div style={faqItem}>
                            <h3 style={faqQ}>Is BMI a medical diagnosis?</h3>
                            <p style={paraSmall}>No. BMI is a general screening number. It should not replace medical advice or a professional health assessment.</p>
                        </div>

                        <div style={faqItem}>
                            <h3 style={faqQ}>Does BMI work for athletes?</h3>
                            <p style={paraSmall}>BMI can be less useful for athletes because it does not separate muscle mass from body fat.</p>
                        </div>

                        <div style={faqItem}>
                            <h3 style={faqQ}>What units does this calculator use?</h3>
                            <p style={paraSmall}>This version uses kilograms for weight and centimeters for height, then converts height to meters for the BMI formula.</p>
                        </div>

                        <div style={faqItem}>
                            <h3 style={faqQ}>Can children use adult BMI categories?</h3>
                            <p style={paraSmall}>Children and teens usually require age- and sex-specific growth charts, so adult BMI categories are not enough for them.</p>
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
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '850px', margin: '0 auto', lineHeight: 1.75 };

const toolGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '26px', alignItems: 'stretch' };
const panel = { background: '#1e293b', padding: '34px', borderRadius: '28px', border: '1px solid #334155', boxShadow: '0 14px 35px rgba(0,0,0,0.2)' };
const panelTitle = { color: '#fff', fontSize: '1.45rem', margin: '0 0 10px' };
const panelText = { color: '#94a3b8', lineHeight: 1.6, margin: '0 0 24px' };
const label = { fontSize: '0.75rem', color: '#94a3b8', fontWeight: 900, display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '17px', borderRadius: '14px', color: '#fff', fontSize: '1.05rem', outline: 'none' };
const btnPrimary = { width: '100%', background: '#38bdf8', color: '#082f49', border: 'none', padding: '17px', borderRadius: '14px', fontWeight: 950, cursor: 'pointer', fontSize: '1rem' };
const privacyNote = { color: '#64748b', lineHeight: 1.6, fontSize: '0.86rem', margin: '18px 0 0' };

const emptyState = { color: '#64748b', minHeight: '270px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: '1px dashed #334155', borderRadius: '20px', padding: '20px' };
const resultLabel = { color: '#94a3b8', fontSize: '0.82rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '10px 0' };
const bmiNumber = { fontSize: '4.7rem', lineHeight: 1, display: 'block', margin: '6px 0 16px' };
const categoryBadge = { color: '#0f172a', display: 'inline-block', padding: '9px 24px', borderRadius: '999px', fontWeight: 950, fontSize: '1rem', marginBottom: '20px' };
const resultBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', textAlign: 'left', marginBottom: '16px' };
const rangeLine = { color: '#cbd5e1', margin: '0 0 10px', lineHeight: 1.6 };
const resultNote = { color: '#94a3b8', margin: 0, lineHeight: 1.7 };
const tipsBox = { textAlign: 'left', background: '#0f172a', padding: '20px', borderRadius: '18px', border: '1px solid #334155' };
const tipsTitle = { margin: '0 0 12px', fontSize: '1rem' };
const tipList = { paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.92rem', margin: 0 };
const tipItem = { marginBottom: '9px', lineHeight: 1.55 };

const categorySection = { marginTop: '76px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px' };
const categoryGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginTop: '20px' };
const categoryCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '20px' };
const dot = { width: '12px', height: '12px', display: 'inline-block', borderRadius: '999px', marginBottom: '14px' };
const categoryTitle = { color: '#fff', margin: '0 0 8px', fontSize: '1rem' };
const categoryText = { color: '#94a3b8', margin: 0, lineHeight: 1.6 };

const contentSection = { marginTop: '76px', borderTop: '1px solid #334155', paddingTop: '55px' };
const contentTitle = { color: '#fff', fontSize: '1.75rem', lineHeight: 1.25, margin: '0 0 18px' };
const para = { color: '#cbd5e1', lineHeight: 1.85, fontSize: '1rem', margin: '0 0 28px' };
const formulaBox = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px', color: '#38bdf8', fontWeight: 900, fontSize: '1.25rem', margin: '0 0 28px', textAlign: 'center' };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px' };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };
const faqQ = { color: '#fff', fontSize: '1rem', margin: '0 0 10px' };
const paraSmall = { color: '#cbd5e1', lineHeight: 1.75, fontSize: '0.95rem', margin: 0 };
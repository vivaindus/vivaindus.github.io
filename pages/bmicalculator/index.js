import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function BMICalculator() {
    const [mounted, setMounted] = useState(false);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bmi, setBmi] = useState(null);
    const [category, setCategory] = useState('');
    const [catColor, setCatColor] = useState('#38bdf8');
    const [tips, setTips] = useState([]);
    const [notification, setNotification] = useState('');

    // Hydration Guard
    useEffect(() => {
        setMounted(true);
    }, []);

    // Toast logic
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const calculateBMI = (e) => {
        e.preventDefault();
        if (weight > 0 && height > 0) {
            const heightInMeters = height / 100;
            const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
            setBmi(bmiValue);

            if (bmiValue < 18.5) {
                setCategory('Underweight'); setCatColor('#fbbf24');
                setTips(['Increase caloric intake with nutrient-dense foods.', 'Focus on protein-rich snacks.', 'Consider strength training to build muscle mass.']);
            } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
                setCategory('Healthy Weight'); setCatColor('#34d399');
                setTips(['Maintain your current balanced diet.', 'Stay consistent with physical activity.', 'Monitor hydration levels daily.']);
            } else if (bmiValue >= 25 && bmiValue <= 29.9) {
                setCategory('Overweight'); setCatColor('#fb923c');
                setTips(['Introduce more high-fiber vegetables.', 'Aim for 30 minutes of daily cardio.', 'Reduce intake of processed sugars.']);
            } else {
                setCategory('Obese'); setCatColor('#f87171');
                setTips(['Consult a healthcare professional for a tailored plan.', 'Start with low-impact walking.', 'Focus on long-term lifestyle changes over quick diets.']);
            }
            setNotification('Health Metrics Processed! ⚖️');
        }
    };

    if (!mounted) return <ToolboxLayout title="BMI Calculator" description="Loading..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Booting Health Suite...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="Professional BMI Calculator - Accurately Check Your Body Mass Index" 
            description="Calculate your BMI instantly using our WHO-compliant health tool. Get personalized tips, category breakdowns, and professional health advice 100% privately."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* NOTIFICATION */}
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: catColor, color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Body Mass Index (BMI) Professional Suite</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '850px', margin: '15px auto', lineHeight: '1.6' }}>
                        Understanding your body weight relative to your height is the first step in <strong>Chronic Disease Prevention</strong>. 
                        Our tool follows World Health Organization standards to help you track your fitness journey with medical precision.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    
                    {/* INPUT SECTION */}
                    <form onSubmit={calculateBMI} style={{ background: '#1e293b', padding: '35px', borderRadius: '30px', border: '1px solid #334155', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                        <div style={{ marginBottom: '25px' }}>
                            <label style={lCap}>Your Weight (kg)</label>
                            <input type="number" step="any" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 75" required style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '35px' }}>
                            <label style={lCap}>Your Height (cm)</label>
                            <input type="number" step="any" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 175" required style={inputStyle} />
                        </div>
                        <button type="submit" style={btnPrimary}>CALCULATE HEALTH METRICS</button>
                    </form>

                    {/* RESULTS & DIAL */}
                    <div style={{ background: '#1e293b', padding: '35px', borderRadius: '30px', border: '1px solid #334155', textAlign: 'center' }}>
                        {!bmi ? (
                            <div style={{ color: '#475569', marginTop: '100px' }}>Enter details to see your analysis</div>
                        ) : (
                            <div style={{ animation: 'fadeIn 0.5s' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight:'bold' }}>YOUR CALCULATED BMI</p>
                                <h2 style={{ fontSize: '4.5rem', color: catColor, margin: '10px 0' }}>{bmi}</h2>
                                <div style={{ background: catColor, color: '#0f172a', display: 'inline-block', padding: '8px 25px', borderRadius: '50px', fontWeight: '900', fontSize: '1.2rem', marginBottom: '30px' }}>
                                    {category.toUpperCase()}
                                </div>
                                <div style={{ textAlign: 'left', background: '#0f172a', padding: '20px', borderRadius: '20px', border: `1px solid ${catColor}` }}>
                                    <h4 style={{ color: catColor, marginTop: 0 }}>Personalized Tips:</h4>
                                    <ul style={{ paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                                        {tips.map((tip, i) => <li key={i} style={{ marginBottom: '8px' }}>{tip}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '30px' }}>The Clinical Importance of BMI Monitoring</h2>
                    <p>
                        Body Mass Index (BMI) is a value derived from the mass (weight) and height of an individual. It is defined as 
                        the body mass divided by the square of the body height, and is universally expressed in units of <strong>kg/m²</strong>. 
                        While BMI does not directly measure body fat, it is a highly accurate screening tool for weight categories 
                        that may lead to health problems.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '60px' }}>
                        <div>
                            <h4 style={{ color: '#fff' }}>The WHO Global Standards</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                The <strong>World Health Organization</strong> defines a "Healthy Range" as a BMI between 18.5 and 24.9. 
                                Scoring outside of this range correlates with higher risks of cardiovascular disease, type 2 diabetes, 
                                and high blood pressure. Monitoring your index allows you to take proactive steps toward longevity.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#fff' }}>Limitations for Athletes</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                BMI is a general guide. For bodybuilders or high-performance athletes, the score may be misleadingly high. 
                                This is because muscle is significantly denser than fat. If you have a high muscle percentage, 
                                your BMI may indicate you are "Overweight" despite having very low body fat.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>Understanding the Results</h3>
                    <ul style={{ paddingLeft: '20px', marginTop: '20px' }}>
                        <li style={{ marginBottom: '15px' }}><strong>Underweight (&lt; 18.5):</strong> May indicate malnutrition, vitamin deficiencies, or anemia. It is important to focus on caloric density and protein intake.</li>
                        <li style={{ marginBottom: '15px' }}><strong>Healthy (18.5 - 24.9):</strong> The ideal range associated with the lowest risk of weight-related health issues. Focus on maintenance through balance.</li>
                        <li style={{ marginBottom: '15px' }}><strong>Overweight (25 - 29.9):</strong> An increased risk for heart-related stress. Modest weight loss of even 5% can significantly improve metabolic health.</li>
                        <li style={{ marginBottom: '15px' }}><strong>Obese (&gt; 30):</strong> A medical classification indicating a higher risk for chronic conditions. We recommend regular check-ups and a structured weight management program.</li>
                    </ul>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>100% Secure & Private Health Tracking</h3>
                    <p>
                        At <strong>SHB ToolBox</strong>, we treat your health data with absolute confidentiality. Unlike medical apps 
                        that save your personal metrics to a cloud database, our BMI Calculator works <strong>100% locally 
                        in your browser memory</strong>. Your weight and height details are never transmitted to our servers 
                        or used for third-party tracking. Your health journey remains your business alone.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling Constants
const lCap = { fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '10px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '18px', borderRadius: '15px', color: '#fff', fontSize: '1.2rem', outline: 'none' };
const btnPrimary = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '20px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' };
const statItem = { background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' };
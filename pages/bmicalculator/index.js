import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function BMICalculator() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bmi, setBmi] = useState(null);
    const [category, setCategory] = useState('');
    const [catColor, setCatColor] = useState('#38bdf8');
    const [tips, setTips] = useState([]);

    const calculateBMI = (e) => {
        e.preventDefault();
        if (weight > 0 && height > 0) {
            const heightInMeters = height / 100;
            const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
            setBmi(bmiValue);

            if (bmiValue < 18.5) {
                setCategory('Underweight'); setCatColor('#fbbf24');
                setTips(['Focus on nutrient-dense foods.', 'Include protein in every meal.', 'Try strength training to build muscle.']);
            } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
                setCategory('Normal Weight'); setCatColor('#34d399');
                setTips(['Maintain your current balanced diet.', 'Stay hydrated (2-3 liters/day).', 'Consistency is key to long-term health.']);
            } else if (bmiValue >= 25 && bmiValue <= 29.9) {
                setCategory('Overweight'); setCatColor('#fb923c');
                setTips(['Monitor portion sizes.', 'Increase daily steps (aim for 10k).', 'Reduce processed sugar intake.']);
            } else {
                setCategory('Obese'); setCatColor('#f87171');
                setTips(['Consult a healthcare provider.', 'Start with low-impact cardio like walking.', 'Track your daily calorie intake.']);
            }
        }
    };

    return (
        <ToolboxLayout title="BMI Calculator" description="Calculate your BMI and get personalized health tips.">
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>BMI Calculator</h1>
                
                <form onSubmit={calculateBMI} style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155', marginBottom: '30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px' }}>Weight (kg)</label>
                            <input type="number" step="any" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" required style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '12px', color: '#fff' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px' }}>Height (cm)</label>
                            <input type="number" step="any" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" required style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '12px', color: '#fff' }} />
                        </div>
                    </div>
                    <button type="submit" style={{ width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>CALCULATE BMI</button>
                </form>

                {bmi && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: `2px solid ${catColor}`, textAlign: 'center' }}>
                            <p style={{ color: '#94a3b8', margin: 0 }}>SCORE</p>
                            <h2 style={{ fontSize: '3.5rem', margin: '5px 0', color: catColor }}>{bmi}</h2>
                            <span style={{ padding: '5px 15px', background: catColor, color: '#0f172a', borderRadius: '20px', fontWeight: 'bold' }}>{category}</span>
                        </div>
                        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                            <h3 style={{ color: '#38bdf8', marginTop: 0 }}>Health Tips:</h3>
                            <ul style={{ paddingLeft: '20px', color: '#cbd5e1' }}>
                                {tips.map((tip, i) => <li key={i} style={{ marginBottom: '8px' }}>{tip}</li>)}
                            </ul>
                        </div>
                    </div>
                )}

                <div style={{ background: '#1e293b', padding: '25px', borderRadius: '24px', border: '1px solid #334155' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>BMI Reference Chart</h3>
                    <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}><span>Underweight</span><span style={{ color: '#fbbf24' }}>&lt; 18.5</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}><span>Normal</span><span style={{ color: '#34d399' }}>18.5 – 24.9</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}><span>Overweight</span><span style={{ color: '#fb923c' }}>25.0 – 29.9</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}><span>Obese</span><span style={{ color: '#f87171' }}>&gt; 30.0</span></div>
                    </div>
                </div>
                {/* --- SEO CONTENT SECTION START --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>Understanding Your Body Mass Index (BMI)</h2>
                    <p>
                        The SHB BMI Calculator is a free health utility designed to help you understand your body composition based on your height and weight. 
                        BMI is a widely used screening tool by healthcare professionals to determine if an individual is within a healthy weight range 
                        for their height.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>What does your BMI score mean?</h3>
                    <p>
                        Your BMI score is categorized into four main groups. Understanding these can help you make informed decisions about your fitness and nutrition:
                    </p>
                    <ul>
                        <li><strong>Underweight (Below 18.5):</strong> This may indicate that you are not consuming enough calories or may have an underlying health concern. We recommend focusing on nutrient-dense meals.</li>
                        <li><strong>Normal Weight (18.5 – 24.9):</strong> This range is associated with the lowest risk of heart disease and other weight-related health issues.</li>
                        <li><strong>Overweight (25.0 – 29.9):</strong> Being in this category may increase the strain on your cardiovascular system. Small lifestyle changes like increasing daily steps can be very effective.</li>
                        <li><strong>Obese (30.0 or Higher):</strong> This category suggests a higher risk of health conditions such as Type 2 diabetes and hypertension.</li>
                    </ul>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Is BMI a perfect measurement?</h3>
                    <p>
                        While BMI is an excellent general guide, it is important to note that it does not directly measure body fat percentage. 
                        Athletes with high muscle mass may receive an "Overweight" score even if they have low body fat. This tool should be used 
                        as a starting point for health discussions with your doctor.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Why use SHB ToolBox for health calculations?</h3>
                    <p>
                        Our BMI Calculator provides personalized tips based on your specific score, giving you actionable advice immediately. 
                        Most importantly, your weight and height data is never stored on our servers—it is processed locally for your privacy.
                    </p>
                </div>
                {/* --- SEO CONTENT SECTION END --- */}
            </div>
        </ToolboxLayout>
    );
}
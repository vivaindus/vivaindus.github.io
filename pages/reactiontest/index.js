import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function ReactionTest() {
    const [mounted, setMounted] = useState(false);
    const [gameState, setGameState] = useState('waiting'); 
    const [startTime, setStartTime] = useState(0);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [highScore, setHighScore] = useState(null);
    const [goColor, setGoColor] = useState('#22c55e');
    const [notification, setNotification] = useState('');
    const timerRef = useRef(null);

    // Hydration Guard & Load Best
    useEffect(() => {
        setMounted(true);
        const savedHistory = JSON.parse(localStorage.getItem('shb_react_history')) || [];
        const savedBest = localStorage.getItem('shb_react_best');
        setHistory(savedHistory);
        if (savedBest) setHighScore(parseInt(savedBest));
    }, []);

    // Toast Logic
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const startTest = () => {
        setGameState('ready');
        setResult(null);
        const delay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
        timerRef.current = setTimeout(() => {
            setGameState('click');
            setStartTime(Date.now());
        }, delay);
    };

    const handleAreaClick = () => {
        if (gameState === 'waiting' || gameState === 'result') {
            startTest();
        } else if (gameState === 'ready') {
            clearTimeout(timerRef.current);
            setGameState('result');
            setResult('Too Soon!');
            setNotification('⚠️ Slow down! Wait for the color change.');
        } else if (gameState === 'click') {
            const time = Date.now() - startTime;
            setResult(`${time} ms`);
            setGameState('result');
            
            let newBest = highScore;
            if (highScore === null || time < highScore) {
                newBest = time;
                setHighScore(time);
                localStorage.setItem('shb_react_best', time);
                setNotification('NEW PERSONAL BEST! ⚡');
            } else {
                setNotification('Great response! ✅');
            }

            const newHistory = [{time, id: Date.now()}, ...history].slice(0, 5);
            setHistory(newHistory);
            localStorage.setItem('shb_react_history', JSON.stringify(newHistory));
        }
    };

    if (!mounted) return <ToolboxLayout title="Reaction Test" description="Loading..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Calibrating Neurological Timer...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="Professional Reaction Time Test - Benchmarking Cognitive Speed" 
            description="Test your visual reaction speed in milliseconds. Compare your score with professional gamers and learn the neuroscience behind human response times."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Visual Reaction Speed Test</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '850px', margin: '15px auto', lineHeight: '1.6' }}>
                        The average human reaction time is approximately <strong>250 milliseconds</strong>. Professional 
                        Formula 1 drivers and eSports athletes often react in under 180ms. How fast is your brain 
                        processing visual stimuli today?
                    </p>
                    <div style={{ display: 'inline-flex', gap: '15px', background: 'rgba(56, 189, 248, 0.1)', padding: '10px 25px', borderRadius: '50px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <span>⚡ Millisecond Precision</span>
                        <span>🧠 Cognitive Benchmarking</span>
                        <span>🎨 Customizable Stimulus</span>
                    </div>
                </div>

                {/* --- APP AREA --- */}
                <div style={{ background: '#1e293b', padding: '35px', borderRadius: '30px', border: '1px solid #334155', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', textAlign: 'center' }}>
                    
                    <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center' }}>
                        <span style={lCap}>SELECT "GO" COLOR:</span>
                        <input type="color" value={goColor} onChange={(e)=>setGoColor(e.target.value)} style={{border:'none', width:'50px', height:'35px', cursor:'pointer', background:'transparent', outline:'none'}} title="Change target color" />
                    </div>

                    <div 
                        onMouseDown={handleAreaClick} 
                        style={{ 
                            height: '350px', borderRadius: '25px', display: 'flex', flexDirection: 'column', 
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                            userSelect: 'none', transition: '0.1s background-color', 
                            backgroundColor: gameState === 'ready' ? '#ef4444' : gameState === 'click' ? goColor : '#0f172a', 
                            border: gameState === 'waiting' ? '3px dashed #334155' : 'none', 
                            color: '#fff', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                        }}
                    >
                        {gameState === 'waiting' && <span style={{fontSize:'1.8rem'}}>TAP TO START</span>}
                        {gameState === 'ready' && <span style={{fontSize:'1.8rem'}}>WAIT FOR COLOR CHANGE...</span>}
                        {gameState === 'click' && <span style={{fontSize:'4rem', fontWeight:'900'}}>CLICK!</span>}
                        {gameState === 'result' && <div style={{fontSize:'4rem', fontWeight:'900', color: result === 'Too Soon!' ? '#ef4444' : '#fff'}}>{result}</div>}
                        {gameState === 'result' && <span style={{fontSize:'1rem', color:'#94a3b8', marginTop:'10px'}}>Click anywhere to restart</span>}
                    </div>

                    <div style={{ marginTop: '35px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div style={statItem}>
                            <small style={lCap}>PERSONAL BEST</small>
                            <div style={{ color: '#38bdf8', fontSize: '1.5rem', fontWeight: 'bold' }}>{highScore ? `${highScore} ms` : '--'}</div>
                        </div>
                        <div style={statItem}>
                            <small style={lCap}>SESSION TRIALS</small>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '5px' }}>
                                {history.length === 0 ? <span style={{color:'#475569'}}>None</span> : history.map((h, i) => (
                                    <div key={i} title={`${h.time}ms`} style={{ width: '10px', height: '10px', borderRadius: '50%', background: h.time === highScore ? '#38bdf8' : '#334155' }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '30px' }}>The Neuroscience of Human Response Time</h2>
                    <p>
                        Reaction time is the measure of how quickly an organism responds to a stimulus. It is a fundamental 
                        indicator of <strong>Central Nervous System (CNS)</strong> efficiency. When the screen changes color, your eyes 
                        send a signal to the primary visual cortex, which then processes the information and triggers a motor 
                        response from your finger. This entire journey happens in fractions of a second.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.6rem' }}>Factors Affecting Your Speed</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '40px' }}>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>1. Physical Readiness</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Dehydration, fatigue, and even room temperature can slow your signals. Studies show that a 
                                <strong>1% drop in hydration</strong> can result in a 5-10ms delay in neurological processing. 
                                Lack of sleep has a similar effect, often mirroring the response times of alcohol impairment.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>2. Technical Input Lag</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Your hardware acts as a bottleneck. High-refresh-rate monitors (144Hz or 240Hz) update the screen 
                                faster than standard office monitors, effectively "showing" you the stimulus sooner. Mechanical 
                                mouse switches further reduce the physical travel time required to register a click.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>3. Cognitive State</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                "Attention Blink" and "Choice Reaction" are cognitive phenomena where distractions or 
                                multiple stimuli slow your brain's processing. Professional players use <strong>Neural 
                                Priming</strong> to stay in a high-alert state for hours.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>Benchmarking Results: Where Do You Stand?</h3>
                    <p>Use these data benchmarks to understand your performance:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '20px' }}>
                        <li style={{ marginBottom: '15px' }}><strong>Under 150ms:</strong> Top 0.1% of humans. Likely utilizing "pre-emptive" clicking or elite gaming hardware.</li>
                        <li style={{ marginBottom: '15px' }}><strong>150ms - 200ms:</strong> Elite Athlete / Professional Gamer. Very high neurological alertness.</li>
                        <li style={{ marginBottom: '15px' }}><strong>200ms - 250ms:</strong> Average healthy young adult.</li>
                        <li style={{ marginBottom: '15px' }}><strong>250ms - 350ms:</strong> Standard baseline. Common for office environments and daily multitasking.</li>
                        <li style={{ marginBottom: '15px' }}><strong>350ms+:</strong> May indicate high fatigue, heavy input lag, or significant distraction.</li>
                    </ul>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>100% Client-Side Integrity</h3>
                    <p>
                        At <strong>SHB ToolBox</strong>, we ensure our tests are unbiased. Our Reaction Test executes its timing 
                        loop using the <code>Date.now()</code> high-resolution timestamp directly in your browser. This 
                        removes any "Network Ping" or server-side delay from your result. Your scores are stored only in your 
                        browser's <strong>LocalStorage</strong>, ensuring that your cognitive data stays private and secure.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling Constants
const lCap = { fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' };
const statItem = { background: '#0f172a', padding: '20px', borderRadius: '15px', border: '1px solid #334155' };
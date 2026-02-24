import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function CPSTest() {
    const [mounted, setMounted] = useState(false);
    const [clicks, setClicks] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [rank, setRank] = useState('');
    const [history, setHistory] = useState([]);
    const [highScore, setHighScore] = useState(0);
    const [notification, setNotification] = useState('');
    const timerRef = useRef(null);

    // Hydration Guard & Load History
    useEffect(() => {
        setMounted(true);
        const savedHistory = JSON.parse(localStorage.getItem('shb_cps_history')) || [];
        const savedBest = localStorage.getItem('shb_cps_best') || 0;
        setHistory(savedHistory);
        setHighScore(parseFloat(savedBest));
    }, []);

    // Toast Logic
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const startTest = () => {
        setClicks(0);
        setTimeLeft(10);
        setIsActive(true);
        setIsFinished(false);
        setNotification('GO! Keep clicking! 🚀');
    };

    const handleClick = () => {
        if (isFinished) return;
        if (!isActive) startTest();
        setClicks(prev => prev + 1);
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 0.1) {
                        clearInterval(timerRef.current);
                        finishGame();
                        return 0;
                    }
                    return prev - 0.1;
                });
            }, 100);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft]);

    const finishGame = () => {
        setIsActive(false);
        setIsFinished(true);
        const finalCps = clicks / 10;
        
        // Ranking Logic
        let r = '';
        if (finalCps > 10) r = '⚡ GODLY'; 
        else if (finalCps > 8) r = '🐆 CHEETAH'; 
        else if (finalCps > 5) r = '🐇 RABBIT'; 
        else r = '🐢 TURTLE';
        setRank(r);

        if (finalCps > highScore) {
            setHighScore(finalCps);
            localStorage.setItem('shb_cps_best', finalCps);
            setNotification('NEW PERSONAL RECORD! 🏆');
        } else {
            setNotification('Test Complete! Check your rank. ✅');
        }

        const newHistory = [finalCps, ...history].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('shb_cps_history', JSON.stringify(newHistory));
    };

    if (!mounted) return <ToolboxLayout title="CPS Test" description="Loading..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Loading Reflex Engine...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="CPS Test - Clicks Per Second Counter & Jitter Clicking Guide" 
            description="Measure your clicking speed with our 10-second CPS test. Benchmark your performance, track high scores, and learn advanced jitter clicking techniques."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Clicks Per Second (CPS) Test</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '800px', margin: '15px auto', lineHeight: '1.6' }}>
                        In competitive gaming, every millisecond counts. Is your finger speed holding you back? 
                        Use our <strong>10-Second Precision Counter</strong> to measure your raw mechanical speed and benchmark your skill.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    
                    {/* APP AREA */}
                    <div style={{ background: '#1e293b', padding: '35px', borderRadius: '30px', border: '1px solid #334155', textAlign: 'center' }}>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            <span>BEST: {highScore} CPS</span>
                            <span>TIMER: {timeLeft.toFixed(1)}s</span>
                        </div>
                        
                        <div style={{ width: '100%', height: '8px', background: '#0f172a', borderRadius: '10px', marginBottom: '30px', overflow: 'hidden' }}>
                            <div style={{ width: `${(timeLeft / 10) * 100}%`, height: '100%', background: '#38bdf8', transition: '0.1s linear' }}></div>
                        </div>

                        <div 
                            onMouseDown={handleClick}
                            style={{ 
                                height: '300px', background: isActive ? '#0f172a' : 'rgba(56, 189, 248, 0.05)', 
                                border: '3px dashed #334155', borderRadius: '25px', 
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                                cursor: 'pointer', userSelect: 'none', transition: '0.2s',
                                transform: isActive ? 'scale(0.98)' : 'scale(1)'
                            }}
                        >
                            <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.4rem', marginBottom: '10px' }}>
                                {isActive ? 'CLICK AS FAST AS YOU CAN!' : isFinished ? 'TIME UP!' : 'START CLICKING HERE'}
                            </span>
                            <span style={{ fontSize: '5rem', fontWeight: '900', color: '#fff' }}>{clicks}</span>
                        </div>

                        {isFinished && (
                            <div style={{ marginTop: '30px', padding: '20px', background: '#38bdf8', color: '#0f172a', borderRadius: '15px', animation: 'fadeIn 0.5s' }}>
                                <h2 style={{ margin: 0 }}>{clicks / 10} CPS</h2>
                                <p style={{ fontWeight: 'bold', margin: '5px 0' }}>RANK: {rank}</p>
                                <button onClick={() => { setIsFinished(false); setClicks(0); setTimeLeft(10); }} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', marginTop: '10px', cursor: 'pointer', fontWeight: 'bold' }}>TRY AGAIN</button>
                            </div>
                        )}
                    </div>

                    {/* HISTORY & STATS */}
                    <div style={{ background: '#1e293b', padding: '35px', borderRadius: '30px', border: '1px solid #334155' }}>
                        <h4 style={{ color: '#38bdf8', marginTop: 0 }}>Recent Session Performance</h4>
                        <div style={{ marginTop: '20px' }}>
                            {history.length === 0 ? (
                                <p style={{ color: '#475569', fontSize: '0.9rem' }}>No data yet. Complete a test to see your progress.</p>
                            ) : (
                                history.map((h, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #0f172a' }}>
                                        <span style={{ color: '#94a3b8' }}>Trial {history.length - i}</span>
                                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{h} CPS</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '30px' }}>Mastering CPS: How Finger Speed Influences Competitive Edge</h2>
                    <p>
                        In games like <strong>Minecraft, League of Legends, and OSU!</strong>, Clicks Per Second (CPS) is a vital 
                        combat metric. Whether you're engaging in PvP or managing high-speed inventory tasks, the number of clicks 
                        you can register in a 10-second window determines your potential DPS (Damage Per Second).
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.6rem' }}>Human Speed Benchmarks</h3>
                    <p>
                        The average person achieves a CPS between <strong>5 and 7</strong>. However, professional gamers 
                        utilizing specialized techniques can consistently reach 10-14 CPS. Our ranking system is designed to 
                        help you identify your tier:
                    </p>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li style={{ marginBottom: '15px' }}><strong>Turtle (0-5 CPS):</strong> Standard browsing speed. This level is adequate for office work and casual gaming.</li>
                        <li style={{ marginBottom: '15px' }}><strong>Rabbit (5-8 CPS):</strong> Competitive tier. You are faster than the average user and have a solid base for PvP combat.</li>
                        <li style={{ marginBottom: '15px' }}><strong>Cheetah (8-10 CPS):</strong> High-performance tier. At this speed, you are reaching the limit of standard "Finger-Tapping."</li>
                        <li style={{ marginBottom: '15px' }}><strong>Godly (10+ CPS):</strong> Elite tier. To maintain this speed, you are likely using advanced clicking methods like Jitter or Butterfly.</li>
                    </ul>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '60px' }}>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>The Jitter Click Method</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Jitter clicking involves straining your arm and hand muscles to produce a vibration. 
                                This vibration causes your finger to "jitter" over the mouse button, creating rapid-fire clicks. 
                                It requires significant practice to maintain accuracy while jittering.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>The Butterfly Click Method</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                This technique uses two fingers (index and middle) to alternate clicking on a single mouse button. 
                                This effectively doubles your potential speed. Note: Some mice are better for this than others 
                                based on the "Double-Click" firmware settings.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>The Drag Click Method</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                By dragging your finger across the mouse surface, the friction creates a series of dozens of clicks 
                                in a single motion. This is the fastest method, though often restricted in some competitive leagues.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>Hardware & Latency Factors</h3>
                    <p>
                        It’s not just about your hand—your equipment matters. High-performance gaming mice feature 
                        <strong>High Polling Rates</strong> (1000Hz+) and mechanical or optical switches with low 
                        "debounce" delay. If your CPS score feels low, ensure your mouse is plugged into a high-speed 
                        USB port and your browser is not lagging.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>100% Secure & Performance Focused</h3>
                    <p>
                        At <strong>SHB ToolBox</strong>, we prioritize the speed of our testing engine. Our CPS counter 
                        runs entirely <strong>client-side</strong> using optimized JavaScript event listeners. This 
                        ensures there is zero network latency affecting your score. We never store your clicking 
                        patterns or IP data—your progress is saved only in your local browser storage.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling Constants (Same as others for consistency)
const lCap = { fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' };
const statItem = { background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #334155' };
const btnPrimary = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' };
const sectionTitle = { color: '#38bdf8', fontSize: '0.9rem', marginBottom: '15px', marginTop: '20px', fontWeight: 'bold' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '10px' };
const btnCase = { background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', transition: '0.3s' };
const activeBtn = { ...btnCase, background: '#38bdf8', color: '#0f172a', borderColor: '#38bdf8' };
const btnUtil = { background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.75rem' };
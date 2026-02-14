import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function CPSTest() {
    const [clicks, setClicks] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [rank, setRank] = useState('');
    const timerRef = useRef(null);

    const startTest = () => {
        setClicks(0);
        setTimeLeft(10);
        setIsActive(true);
        setIsFinished(false);
    };

    const handleClick = () => {
        if (!isActive && !isFinished) startTest();
        if (isActive) setClicks(prev => prev + 1);
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => Math.max(prev - 0.1, 0));
            }, 100);
        } else if (timeLeft <= 0) {
            clearInterval(timerRef.current);
            setIsActive(false);
            setIsFinished(true);
            
            const cps = clicks / 10;
            if (cps > 10) setRank('🏅 Godly');
            else if (cps > 8) setRank('🐆 Cheetah');
            else if (cps > 6) setRank('🐎 Stallion');
            else if (cps > 4) setRank('🐇 Rabbit');
            else setRank('🐢 Turtle');
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft, clicks]);

    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <Head>
                <title>CPS Test - Measure Clicks Per Second | SHB ToolBox</title>
                <meta name="description" content="Free Clicks Per Second (CPS) tester. Check your mouse clicking speed for gaming." />
            </Head>

            {/* APP HUB NAVIGATION */}
            <nav style={{ background: '#1e293b', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#38bdf8' }}>SHB ToolBox</span>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <a href="/cpstest" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>CPS TEST</a>
                    <a href="/bmicalculator" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>BMI CALC</a>
                </div>
            </nav>

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <header style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Click Speed Test</h1>
                    <p style={{ color: '#94a3b8' }}>Test your speed in 10 seconds</p>
                </header>

                {/* CLICK AREA */}
                <div 
                    onClick={handleClick}
                    style={{
                        height: '280px',
                        background: isActive ? '#1e293b' : '#1e293b80',
                        border: isActive ? '3px solid #38bdf8' : '3px dashed #334155',
                        borderRadius: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: '0.1s transform active',
                        marginBottom: '30px'
                    }}
                >
                    <span style={{ fontSize: '1.2rem', color: '#38bdf8', fontWeight: 'bold' }}>
                        {isActive ? 'CLICK FAST!' : isFinished ? 'TIME IS UP' : 'START CLICKING'}
                    </span>
                    {isActive && <span style={{ fontSize: '4.5rem', fontWeight: '800' }}>{clicks}</span>}
                </div>

                {/* STATS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={{ padding: '20px', background: '#1e293b', borderRadius: '16px' }}>
                        <small style={{ color: '#94a3b8' }}>TIMER</small>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{timeLeft.toFixed(1)}s</div>
                    </div>
                    <div style={{ padding: '20px', background: '#1e293b', borderRadius: '16px' }}>
                        <small style={{ color: '#94a3b8' }}>CLICKS</small>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{clicks}</div>
                    </div>
                </div>

                {/* RESULTS */}
                {isFinished && (
                    <div style={{ marginTop: '30px', padding: '30px', background: '#38bdf8', color: '#0f172a', borderRadius: '24px', animation: 'pop 0.3s ease' }}>
                        <h2 style={{ margin: 0 }}>Result: {(clicks/10).toFixed(1)} CPS</h2>
                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Rank: {rank}</p>
                        <button 
                            onClick={startTest} 
                            style={{ marginTop: '15px', background: '#0f172a', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            TRY AGAIN
                        </button>
                    </div>
                )}
            </div>

            <footer style={{ textAlign: 'center', padding: '40px', color: '#475569', fontSize: '0.8rem' }}>
                &copy; 2024 SHB ToolBox - Free Web Utilities
            </footer>

            <style jsx>{`
                @keyframes pop {
                    0% { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
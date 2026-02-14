import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function CPSTest() {
    const [clicks, setClicks] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [rank, setRank] = useState('');
    const timerRef = useRef(null);

    // This ONLY resets the numbers, it doesn't start the clock
    const resetTest = () => {
        setClicks(0);
        setTimeLeft(10);
        setIsActive(false);
        setIsFinished(false);
        setRank('');
    };

    const handleClick = () => {
        // If the game hasn't started yet and isn't finished, start the clock on first click
        if (!isActive && !isFinished) {
            setIsActive(true);
        }
        
        // Count the click only if the timer is running
        if (isActive) {
            setClicks(prev => prev + 1);
        }
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 0.1) {
                        clearInterval(timerRef.current);
                        setIsActive(false);
                        setIsFinished(true);
                        return 0;
                    }
                    return prev - 0.1;
                });
            }, 100);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive]);

    // Calculate rank only when isFinished changes to true
    useEffect(() => {
        if (isFinished) {
            const cps = clicks / 10;
            if (cps > 10) setRank('🏅 Godly');
            else if (cps > 8) setRank('🐆 Cheetah');
            else if (cps > 6) setRank('🐎 Stallion');
            else if (cps > 4) setRank('🐇 Rabbit');
            else setRank('🐢 Turtle');
        }
    }, [isFinished, clicks]);

    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <Head>
                <title>CPS Test - Measure Clicks Per Second | SHB ToolBox</title>
                <meta name="description" content="Free Clicks Per Second (CPS) tester. Check your mouse clicking speed for gaming." />
            </Head>

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
                    <p style={{ color: '#94a3b8' }}>{isActive ? 'GO! GO! GO!' : 'Test your speed in 10 seconds'}</p>
                </header>

                <div 
                    onMouseDown={handleClick} // onMouseDown is slightly faster than onClick for gaming tools
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
                        marginBottom: '30px',
                        transform: isActive ? 'scale(0.98)' : 'scale(1)',
                        transition: '0.1s transform'
                    }}
                >
                    <span style={{ fontSize: '1.2rem', color: '#38bdf8', fontWeight: 'bold' }}>
                        {isActive ? 'CLICKING...' : isFinished ? 'DONE!' : 'CLICK TO START'}
                    </span>
                    {(isActive || isFinished) && <span style={{ fontSize: '4.5rem', fontWeight: '800' }}>{clicks}</span>}
                </div>

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

                {isFinished && (
                    <div style={{ marginTop: '30px', padding: '30px', background: '#38bdf8', color: '#0f172a', borderRadius: '24px' }}>
                        <h2 style={{ margin: 0 }}>Score: {(clicks/10).toFixed(1)} CPS</h2>
                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Rank: {rank}</p>
                        <button 
                            onClick={resetTest} 
                            style={{ marginTop: '15px', background: '#0f172a', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            RESET BOARD
                        </button>
                    </div>
                )}
            </div>

            <footer style={{ textAlign: 'center', padding: '40px', color: '#475569', fontSize: '0.8rem' }}>
                &copy; 2024 SHB ToolBox - Free Web Utilities
            </footer>
        </div>
    );
}
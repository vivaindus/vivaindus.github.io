import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function CPSTest() {
    // ... all your logic (clicks, timeLeft, etc.) remains exactly the same ...
    const [clicks, setClicks] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [rank, setRank] = useState('');
    const timerRef = useRef(null);

    const resetTest = () => { setClicks(0); setTimeLeft(10); setIsActive(false); setIsFinished(false); setRank(''); };
    const handleClick = () => { if (!isActive && !isFinished) setIsActive(true); if (isActive) setClicks(prev => prev + 1); };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev <= 0.1 ? (clearInterval(timerRef.current) || 0) : prev - 0.1);
            }, 100);
        }
        if (timeLeft === 0) { setIsActive(false); setIsFinished(true); }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft]);

    useEffect(() => {
        if (isFinished) {
            const cps = clicks / 10;
            if (cps > 10) setRank('🏅 Godly'); else if (cps > 8) setRank('🐆 Cheetah'); else setRank('🐢 Turtle');
        }
    }, [isFinished, clicks]);

    return (
        <ToolboxLayout title="CPS Test" description="Measure your clicks per second.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <h1>Click Speed Test</h1>
                <div onMouseDown={handleClick} style={{ height: '280px', background: '#1e293b', border: '3px dashed #334155', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none', margin: '30px 0' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{isActive ? 'CLICKING...' : 'START CLICKING'}</span>
                    {(isActive || isFinished) && <span style={{ fontSize: '4.5rem', fontWeight: '800' }}>{clicks}</span>}
                </div>
                {isFinished && (
                    <div style={{ background: '#38bdf8', color: '#0f172a', padding: '30px', borderRadius: '24px' }}>
                        <h2>Score: {(clicks/10).toFixed(1)} CPS</h2>
                        <p>Rank: {rank}</p>
                        <button onClick={resetTest} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}>RESET</button>
                    </div>
                )}
            </div>
        </ToolboxLayout>
    );
}
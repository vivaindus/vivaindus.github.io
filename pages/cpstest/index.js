import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function CPSTest() {
    const [clicks, setClicks] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [rank, setRank] = useState('');
    const timerRef = useRef(null);

    const resetTest = () => { setClicks(0); setTimeLeft(10); setIsActive(false); setIsFinished(false); setRank(''); };
    
    const handleClick = () => {
        if (isFinished) return;
        if (!isActive) setIsActive(true);
        setClicks(prev => prev + 1);
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev <= 0.1 ? (clearInterval(timerRef.current) || 0) : prev - 0.1);
            }, 100);
        } else if (timeLeft === 0) {
            setIsActive(false);
            setIsFinished(true);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft]);

    useEffect(() => {
        if (isFinished) {
            const cps = clicks / 10;
            if (cps > 10) setRank('⚡ GODLY'); else if (cps > 8) setRank('🐆 CHEETAH'); else if (cps > 5) setRank('🐇 RABBIT'); else setRank('🐢 TURTLE');
        }
    }, [isFinished, clicks]);

    return (
        <ToolboxLayout title="CPS Test" description="Challenge your clicking speed.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <h1 style={{ color: '#38bdf8' }}>Click Speed Test</h1>
                <p style={{ color: '#94a3b8' }}>How fast can you click in 10 seconds?</p>

                {/* VISUAL TIMER BAR */}
                <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '10px', margin: '30px 0', overflow: 'hidden' }}>
                    <div style={{ width: `${(timeLeft / 10) * 100}%`, height: '100%', background: '#38bdf8', transition: '0.1s linear' }}></div>
                </div>

                <div 
                    onMouseDown={handleClick} 
                    style={{ 
                        height: '250px', background: isActive ? '#1e293b' : '#1e293b80', 
                        border: '3px dashed #334155', borderRadius: '30px', 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                        cursor: 'pointer', userSelect: 'none', transition: '0.1s transform',
                        transform: isActive ? 'scale(0.97)' : 'scale(1)'
                    }}
                >
                    <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {isActive ? 'CLICK!!!' : isFinished ? 'TIME UP' : 'START CLICKING'}
                    </span>
                    {(isActive || isFinished) && <span style={{ fontSize: '5rem', fontWeight: '900' }}>{clicks}</span>}
                </div>

                {isFinished && (
                    <div style={{ marginTop: '30px', padding: '30px', background: '#38bdf8', color: '#0f172a', borderRadius: '24px' }}>
                        <h2 style={{ margin: 0 }}>{clicks / 10} CPS</h2>
                        <p style={{ fontWeight: 'bold' }}>Rank: {rank}</p>
                        <button onClick={resetTest} style={{ marginTop: '15px', background: '#0f172a', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '12px', cursor: 'pointer' }}>TRY AGAIN</button>
                    </div>
                )}
            </div>
        </ToolboxLayout>
    );
}
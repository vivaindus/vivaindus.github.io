import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function CPSTest() {
    const [clicks, setClicks] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [rank, setRank] = useState('');
    const [history, setHistory] = useState([]);
    const [highScore, setHighScore] = useState(0);
    const [isNewRecord, setIsNewRecord] = useState(false);
    const timerRef = useRef(null);

    // Load History and High Score on Start
    useEffect(() => {
        const savedHistory = JSON.parse(localStorage.getItem('cps_history')) || [];
        const savedHighScore = localStorage.getItem('cps_high_score') || 0;
        setHistory(savedHistory);
        setHighScore(parseFloat(savedHighScore));
    }, []);

    const resetTest = () => {
        setClicks(0);
        setTimeLeft(10);
        setIsActive(false);
        setIsFinished(false);
        setRank('');
        setIsNewRecord(false);
    };
    
    const handleClick = () => {
        if (isFinished) return;
        if (!isActive) setIsActive(true);
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
    }, [isActive]);

    const finishGame = () => {
        setIsActive(false);
        setIsFinished(true);
    };

    // Process results when finished
    useEffect(() => {
        if (isFinished) {
            const currentCps = clicks / 10;
            
            // Calculate Rank
            if (currentCps > 10) setRank('⚡ GODLY'); 
            else if (currentCps > 8) setRank('🐆 CHEETAH'); 
            else if (currentCps > 5) setRank('🐇 RABBIT'); 
            else setRank('🐢 TURTLE');

            // Handle Record
            if (currentCps > highScore) {
                setHighScore(currentCps);
                localStorage.setItem('cps_high_score', currentCps);
                setIsNewRecord(true);
            }

            // Update History (Keep last 5)
            const newHistory = [currentCps, ...history].slice(0, 5);
            setHistory(newHistory);
            localStorage.setItem('cps_history', JSON.stringify(newHistory));
        }
    }, [isFinished]);

    return (
        <ToolboxLayout title="CPS Test" description="Measure your clicks per second and track your progress.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <h1 style={{ color: '#38bdf8' }}>Click Speed Test</h1>
                <p style={{ color: '#94a3b8' }}>Beat your High Score of <span style={{color: '#38bdf8'}}>{highScore} CPS</span></p>

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
                        transform: isActive ? 'scale(0.97)' : 'scale(1)',
                        position: 'relative'
                    }}
                >
                    <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {isActive ? 'CLICK!!!' : isFinished ? 'TIME UP' : 'START CLICKING'}
                    </span>
                    {(isActive || isFinished) && <span style={{ fontSize: '5rem', fontWeight: '900' }}>{clicks}</span>}
                </div>

                {isFinished && (
                    <div style={{ marginTop: '30px', padding: '30px', background: isNewRecord ? '#34d399' : '#38bdf8', color: '#0f172a', borderRadius: '24px', animation: isNewRecord ? 'pulse 1s infinite' : 'none' }}>
                        {isNewRecord && <h3 style={{margin: 0}}>🏆 NEW RECORD! 🏆</h3>}
                        <h2 style={{ margin: '5px 0' }}>{clicks / 10} CPS</h2>
                        <p style={{ fontWeight: 'bold' }}>Rank: {rank}</p>
                        <button onClick={resetTest} style={{ marginTop: '15px', background: '#0f172a', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>TRY AGAIN</button>
                    </div>
                )}

                {/* TRIAL HISTORY */}
                <div style={{ marginTop: '40px', textAlign: 'left', background: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155' }}>
                    <h4 style={{ color: '#38bdf8', marginBottom: '15px' }}>Last 5 Trials</h4>
                    {history.length === 0 ? <p style={{color: '#64748b'}}>No trials yet. Start clicking!</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {history.map((score, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#0f172a', borderRadius: '8px' }}>
                                    <span style={{color: '#94a3b8'}}>Trial {history.length - i}</span>
                                    <span style={{fontWeight: 'bold'}}>{score} CPS</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </ToolboxLayout>
    );
}
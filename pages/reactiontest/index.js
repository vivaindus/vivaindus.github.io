import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

const facts = [
    "The average human reaction time is 250ms.",
    "Professional gamers react in less than 200ms!",
    "Flash of lightning is faster than human thought.",
    "Reaction time slows down as we get older.",
    "Caffeine can temporarily improve your reaction speed."
];

export default function ReactionTest() {
    const [gameState, setGameState] = useState('waiting'); 
    const [startTime, setStartTime] = useState(0);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [highScore, setHighScore] = useState(9999);
    const [goColor, setGoColor] = useState('#22c55e'); // Default Green
    const [factIndex, setFactIndex] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('react_history')) || [];
        const savedBest = localStorage.getItem('react_best') || 9999;
        setHistory(saved);
        setHighScore(parseInt(savedBest));
    }, []);

    const startTest = () => {
        setGameState('ready');
        setResult(null);
        setFactIndex(Math.floor(Math.random() * facts.length));
        const delay = Math.floor(Math.random() * 3000) + 2000;
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
        } else if (gameState === 'click') {
            const time = Date.now() - startTime;
            setResult(`${time} ms`);
            setGameState('result');
            
            // Handle Score
            if (time < highScore) {
                setHighScore(time);
                localStorage.setItem('react_best', time);
            }
            const newHistory = [time, ...history].slice(0, 5);
            setHistory(newHistory);
            localStorage.setItem('react_history', JSON.stringify(newHistory));
        }
    };

    return (
        <ToolboxLayout title="Reaction Test" description="Test your reflex speed.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <h1>Reaction Test</h1>
                
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
                    <span>Choose "Go" Color:</span>
                    <input type="color" value={goColor} onChange={(e)=>setGoColor(e.target.value)} style={{border:'none', width:'30px', height:'30px', cursor:'pointer'}} />
                </div>

                <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
                    Wait for Red, click as soon as it turns <span style={{color: goColor, fontWeight:'bold'}}>this color</span>.
                </p>

                <div 
                    onMouseDown={handleAreaClick}
                    style={{
                        height: '300px', borderRadius: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none', fontSize: '1.8rem', fontWeight: 'bold', transition: '0.1s',
                        backgroundColor: gameState === 'ready' ? '#ef4444' : gameState === 'click' ? goColor : '#1e293b',
                        border: gameState === 'waiting' ? '3px dashed #334155' : 'none',
                        color: gameState === 'click' ? '#000' : '#fff'
                    }}
                >
                    {gameState === 'waiting' && "Tap to Start"}
                    {gameState === 'ready' && "Wait..."}
                    {gameState === 'click' && "CLICK!"}
                    {gameState === 'result' && <div>{result}</div>}
                </div>

                <div style={{ marginTop: '30px', background: '#1e293b', padding: '20px', borderRadius: '16px', textAlign: 'left' }}>
                    <h4 style={{ color: '#38bdf8' }}>Did you know?</h4>
                    <p style={{ color: '#94a3b8' }}>{facts[factIndex]}</p>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <h4 style={{marginBottom:'10px'}}>Last 5 Trials</h4>
                    {history.map((s, i) => <div key={i} style={{color: s === highScore ? '#38bdf8' : '#fff'}}>{s} ms {s === highScore && '🏆'}</div>)}
                </div>
            </div>
        </ToolboxLayout>
    );
}
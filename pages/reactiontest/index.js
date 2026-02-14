import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function ReactionTest() {
    const [gameState, setGameState] = useState('waiting'); 
    const [startTime, setStartTime] = useState(0);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [highScore, setHighScore] = useState(null);
    const [goColor, setGoColor] = useState('#22c55e');
    const timerRef = useRef(null);

    useEffect(() => {
        const savedHistory = JSON.parse(localStorage.getItem('react_history')) || [];
        const savedBest = localStorage.getItem('react_best');
        setHistory(savedHistory);
        if (savedBest) setHighScore(parseInt(savedBest));
    }, []);

    const startTest = () => {
        setGameState('ready');
        setResult(null);
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
            const time = Date.now() - startTime; // Calculated on mouse down
            setResult(`${time} ms`);
            setGameState('result');
            
            let newBest = highScore;
            if (highScore === null || time < highScore) {
                newBest = time;
                setHighScore(time);
                localStorage.setItem('react_best', time);
            }

            const newHistory = [{time, id: Date.now()}, ...history].slice(0, 5);
            setHistory(newHistory);
            localStorage.setItem('react_history', JSON.stringify(newHistory));
        }
    };

    return (
        <ToolboxLayout title="Reaction Test" description="Test your reflexes.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <h1 style={{color:'#38bdf8'}}>Reaction Test</h1>
                
                <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
                    <span>Set "GO" Color:</span>
                    <input type="color" value={goColor} onChange={(e)=>setGoColor(e.target.value)} style={{border:'none', width:'40px', height:'40px', cursor:'pointer', background:'transparent'}} />
                </div>

                <div onMouseDown={handleAreaClick} style={{ height: '300px', borderRadius: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none', fontSize: '1.8rem', fontWeight: 'bold', transition: '0.1s', backgroundColor: gameState === 'ready' ? '#ef4444' : gameState === 'click' ? goColor : '#1e293b', border: gameState === 'waiting' ? '3px dashed #334155' : 'none', color: '#fff' }}>
                    {gameState === 'waiting' && "Tap to Start"}
                    {gameState === 'ready' && "Wait for Color Change..."}
                    {gameState === 'click' && "CLICK!"}
                    {gameState === 'result' && <div>{result}</div>}
                </div>

                <div style={{ marginTop: '30px', textAlign: 'left' }}>
                    <div style={{background:'#38bdf8', color:'#0f172a', padding:'15px', borderRadius:'12px', marginBottom:'20px', fontWeight:'bold'}}>
                        🏆 Personal Best: {highScore ? `${highScore} ms` : 'No record yet'}
                    </div>
                    <h4>Recent Attempts</h4>
                    {history.map((h) => (
                        <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #334155', color: h.time === highScore ? '#38bdf8' : '#fff' }}>
                            <span>{h.time} ms</span>
                            {h.time === highScore && <span>🏆 BEST</span>}
                        </div>
                    ))}
                </div>
            </div>
        </ToolboxLayout>
    );
}
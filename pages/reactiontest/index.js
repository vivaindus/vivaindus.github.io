import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function ReactionTest() {
    const [gameState, setGameState] = useState('waiting'); // waiting, ready, click, result
    const [startTime, setStartTime] = useState(0);
    const [result, setResult] = useState(null);
    const timerRef = useRef(null);

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
            const endTime = Date.now();
            setResult(`${endTime - startTime} ms`);
            setGameState('result');
        }
    };

    return (
        <ToolboxLayout title="Reaction Test" description="How fast are your reflexes? Test your reaction time.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '10px' }}>Reaction Time Test</h1>
                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Click as soon as the red box turns green.</p>

                <div 
                    onClick={handleAreaClick}
                    style={{
                        height: '350px',
                        borderRadius: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        transition: '0.1s',
                        backgroundColor: 
                            gameState === 'ready' ? '#ef4444' : 
                            gameState === 'click' ? '#22c55e' : 
                            '#1e293b',
                        border: gameState === 'waiting' ? '3px dashed #334155' : 'none'
                    }}
                >
                    {gameState === 'waiting' && "Tap to Start"}
                    {gameState === 'ready' && "Wait for Green..."}
                    {gameState === 'click' && "CLICK NOW!"}
                    {gameState === 'result' && (
                        <div>
                            <div style={{fontSize: '3.5rem'}}>{result}</div>
                            <div style={{fontSize: '1rem', marginTop: '15px', opacity: 0.7}}>Tap to Try Again</div>
                        </div>
                    )}
                </div>
                
                <div style={{ marginTop: '40px', background: '#1e293b', padding: '20px', borderRadius: '16px', textAlign: 'left', border: '1px solid #334155' }}>
                    <h4 style={{ color: '#38bdf8' }}>Did you know?</h4>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '5px' }}>The average human reaction time is 250ms. Formula 1 drivers are usually under 200ms!</p>
                </div>
            </div>
        </ToolboxLayout>
    );
}
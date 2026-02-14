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
                {/* --- SEO CONTENT SECTION START --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8', textAlign: 'left' }}>
                    <h2 style={{ color: '#38bdf8' }}>Professional Human Reaction Time Test</h2>
                    <p>
                        The SHB Reaction Test is a high-precision utility designed to measure your neurological response time in milliseconds (ms). 
                        Reaction time is the interval between the presentation of a stimulus (the color change) and the beginning of the 
                        response (your mouse click). This tool is widely used by gamers, athletes, and individuals looking to track 
                        their cognitive alertness.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>What is an Average Reaction Time?</h3>
                    <p>
                        According to various data studies, the average human reaction time to a visual stimulus is approximately 
                        <strong>200ms to 250ms</strong>. However, professional eSports players often achieve scores below 180ms. 
                        Your score can be influenced by several factors:
                    </p>
                    <ul>
                        <li><strong>Hydration and Fatigue:</strong> A tired brain processes visual signals significantly slower.</li>
                        <li><strong>Hardware Latency:</strong> Your monitor's refresh rate and your mouse's polling rate can add a few milliseconds to your final score.</li>
                        <li><strong>Age:</strong> Research shows that reaction times peak in the early 20s and gradually increase over time.</li>
                    </ul>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Customizable Visual Testing</h3>
                    <p>
                        Unique to the SHB ToolBox, we allow you to set your own "GO" color. This is not just for aesthetics; different 
                        wavelengths of light can affect how quickly the human eye perceives a change. Some individuals respond faster to 
                        Green (high visibility), while others prefer Neon Blue or Red. Use the color picker above to find the stimulus 
                        that works best for your eyes.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Scientific Accuracy and Privacy</h3>
                    <p>
                        Our tool uses the high-resolution `Date.now()` timestamp method to ensure accuracy down to a single millisecond. 
                        To ensure zero network latency during your test, the logic is executed entirely within your browser. 
                        This also means your reaction time records are private—stored only in your local browser history—ensuring 
                        that SHB ToolBox remains a secure environment for self-improvement.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>How to Use the Test</h3>
                    <ol>
                        <li>Click the testing area to begin.</li>
                        <li>Wait for the screen to turn from red to your selected "GO" color.</li>
                        <li>Click as fast as you can once the color changes.</li>
                        <li>Try to beat your Personal Best recorded at the bottom of the page!</li>
                    </ol>
                </div>
                {/* --- SEO CONTENT SECTION END --- */}
            </div>
        </ToolboxLayout>
    );
}
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const MODES = {
  single: { label: 'Single Test', rounds: 1, desc: 'Quick one-round reaction check.' },
  challenge5: { label: '5-Round Challenge', rounds: 5, desc: 'Better average with fewer lucky clicks.' },
  pro10: { label: '10-Round Pro Test', rounds: 10, desc: 'More reliable benchmark for serious testing.' }
};

export default function ReactionTest() {
  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState('idle');
  const [mode, setMode] = useState('challenge5');
  const [roundIndex, setRoundIndex] = useState(0);
  const [currentResult, setCurrentResult] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [falseStarts, setFalseStarts] = useState(0);
  const [personalBest, setPersonalBest] = useState(null);
  const [history, setHistory] = useState([]);
  const [goColor, setGoColor] = useState('#22c55e');
  const [notification, setNotification] = useState('');

  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const activeRef = useRef(false);

  const targetRounds = MODES[mode].rounds;

  const stats = useMemo(() => calculateStats(rounds), [rounds]);
  const tier = useMemo(() => getPerformanceTier(stats.average), [stats.average]);

  useEffect(() => {
    setMounted(true);

    try {
      const savedBest = localStorage.getItem('shb_reaction_best');
      const savedHistory = JSON.parse(localStorage.getItem('shb_reaction_history') || '[]');

      if (savedBest) setPersonalBest(Number(savedBest));
      if (Array.isArray(savedHistory)) setHistory(savedHistory.slice(0, 20));
    } catch {
      // Ignore local storage issues.
    }

    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        handleAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const showToast = (message) => {
    setNotification(message);
  };

  const resetCurrentTest = () => {
    clearTimeout(timerRef.current);
    activeRef.current = false;
    setGameState('idle');
    setRoundIndex(0);
    setRounds([]);
    setCurrentResult(null);
    setFalseStarts(0);
  };

  const startTest = () => {
    clearTimeout(timerRef.current);
    activeRef.current = true;
    setRounds([]);
    setFalseStarts(0);
    setRoundIndex(1);
    setCurrentResult(null);
    startWaitingRound(1);
  };

  const startWaitingRound = (nextRound) => {
    clearTimeout(timerRef.current);

    setGameState('waiting');
    setCurrentResult(null);
    setRoundIndex(nextRound);

    const delay = secureRandomDelay(1800, 5200);

    timerRef.current = setTimeout(() => {
      if (!activeRef.current) return;
      startTimeRef.current = performance.now();
      setGameState('go');
    }, delay);
  };

  const handleAction = () => {
    if (gameState === 'idle' || gameState === 'finished' || gameState === 'early') {
      startTest();
      return;
    }

    if (gameState === 'waiting') {
      clearTimeout(timerRef.current);
      activeRef.current = false;
      setFalseStarts(prev => prev + 1);
      setCurrentResult({ type: 'early', label: 'Too Soon' });
      setGameState('early');
      showToast('Too soon. Wait for the screen to turn green.');
      return;
    }

    if (gameState === 'go') {
      const reaction = Math.round(performance.now() - startTimeRef.current);
      const nextRounds = [...rounds, reaction];

      setRounds(nextRounds);
      setCurrentResult({ type: 'success', value: reaction, label: `${reaction} ms` });

      if (personalBest === null || reaction < personalBest) {
        setPersonalBest(reaction);
        try {
          localStorage.setItem('shb_reaction_best', String(reaction));
        } catch {
          // Ignore local storage issues.
        }
        showToast('New personal best.');
      } else {
        showToast('Reaction recorded.');
      }

      if (nextRounds.length >= targetRounds) {
        finishTest(nextRounds);
      } else {
        setGameState('between');
      }
    }

    if (gameState === 'between') {
      startWaitingRound(rounds.length + 1);
    }
  };

  const finishTest = (finalRounds) => {
    activeRef.current = false;
    const finalStats = calculateStats(finalRounds);
    const record = {
      id: Date.now(),
      mode,
      average: finalStats.average,
      best: finalStats.best,
      rounds: finalRounds,
      falseStarts
    };

    setGameState('finished');

    setHistory(prev => {
      const next = [record, ...prev].slice(0, 20);
      try {
        localStorage.setItem('shb_reaction_history', JSON.stringify(next));
      } catch {
        // Ignore local storage issues.
      }
      return next;
    });
  };

  const clearSavedData = () => {
    setHistory([]);
    setPersonalBest(null);
    resetCurrentTest();

    try {
      localStorage.removeItem('shb_reaction_best');
      localStorage.removeItem('shb_reaction_history');
    } catch {
      // Ignore local storage issues.
    }

    showToast('Saved reaction data cleared.');
  };
  return (
    <ToolboxLayout
      title="Reaction Time Test - Visual Speed Benchmark in Milliseconds"
      description="Test your visual reaction time in milliseconds with single, 5-round and 10-round modes. Track average, best, median, consistency, false starts and personal best locally."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free visual reaction speed benchmark</p>
          <h1 style={heroTitle}>Reaction Time Test</h1>
          <p style={heroText}>
            Measure how quickly you respond to a visual signal. Use single test mode for a quick check or multi-round
            challenge mode for a more reliable average. Results are calculated in milliseconds using browser timing.
          </p>
        </section>

        <section style={appGrid}>
          <main style={testPanel}>
            <div style={modeGrid}>
              {Object.entries(MODES).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => {
                    setMode(key);
                    resetCurrentTest();
                  }}
                  style={mode === key ? activeModeBtn : modeBtn}
                >
                  <strong>{item.label}</strong>
                  <span>{item.desc}</span>
                </button>
              ))}
            </div>

            <button
              onPointerDown={handleAction}
              style={{
                ...testArea,
                background: getAreaBackground(gameState, goColor),
                borderColor: gameState === 'idle' || gameState === 'finished' ? '#334155' : getAreaBackground(gameState, goColor)
              }}
            >
              <div style={roundPill}>
                {gameState === 'idle' || gameState === 'finished' || gameState === 'early'
                  ? `${MODES[mode].label}`
                  : `Round ${roundIndex} of ${targetRounds}`}
              </div>

              {gameState === 'idle' && (
                <>
                  <span style={mainPrompt}>Tap to Start</span>
                  <span style={subPrompt}>Wait for green, then click as fast as possible.</span>
                </>
              )}

              {gameState === 'waiting' && (
                <>
                  <span style={mainPrompt}>Wait...</span>
                  <span style={subPrompt}>Do not click yet. Green means GO.</span>
                </>
              )}

              {gameState === 'go' && (
                <>
                  <span style={goPrompt}>CLICK!</span>
                  <span style={subPrompt}>React now.</span>
                </>
              )}

              {gameState === 'between' && (
                <>
                  <span style={resultPrompt}>{currentResult?.label}</span>
                  <span style={subPrompt}>Tap to continue to the next round.</span>
                </>
              )}

              {gameState === 'early' && (
                <>
                  <span style={{ ...resultPrompt, color: '#fecaca' }}>Too Soon</span>
                  <span style={subPrompt}>Tap to restart the test.</span>
                </>
              )}

              {gameState === 'finished' && (
                <>
                  <span style={resultPrompt}>{stats.average ? `${stats.average} ms avg` : 'Finished'}</span>
                  <span style={subPrompt}>Tap to start again.</span>
                </>
              )}
            </button>

            <div style={quickActions}>
              <button onClick={startTest} style={primaryBtn}>Start New Test</button>
              <button onClick={resetCurrentTest} style={secondaryBtn}>Reset Current Test</button>
            </div>

            <section style={statsGrid}>
              <Stat label="Average" value={stats.average ? `${stats.average} ms` : '--'} />
              <Stat label="Best Round" value={stats.best ? `${stats.best} ms` : '--'} />
              <Stat label="Median" value={stats.median ? `${stats.median} ms` : '--'} />
              <Stat label="Worst Round" value={stats.worst ? `${stats.worst} ms` : '--'} />
              <Stat label="Consistency" value={stats.consistency ? `${stats.consistency}%` : '--'} />
              <Stat label="False Starts" value={falseStarts} />
            </section>

            <section style={scoreCard}>
              <div>
                <h2 style={sectionTitle}>Performance Tier</h2>
                <p style={tierText}>{tier.label}</p>
                <p style={sectionText}>{tier.desc}</p>
              </div>
              <div style={{ ...tierBadge, color: tier.color, borderColor: tier.color }}>
                {stats.average ? `${stats.average} ms` : 'No score'}
              </div>
            </section>

            {rounds.length > 0 && (
              <section style={roundsCard}>
                <h2 style={sectionTitle}>Current Round Results</h2>
                <div style={roundList}>
                  {rounds.map((time, index) => (
                    <div key={`${time}-${index}`} style={roundItem}>
                      <span>Round {index + 1}</span>
                      <strong>{time} ms</strong>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside style={sidePanel}>
            <h2 style={sideTitle}>Settings & Records</h2>

            <label style={fieldWrap}>
              <span style={fieldLabel}>GO color</span>
              <input
                type="color"
                value={goColor}
                onChange={event => setGoColor(event.target.value)}
                style={colorInput}
              />
            </label>

            <div style={recordBox}>
              <span>Personal Best</span>
              <strong>{personalBest ? `${personalBest} ms` : '--'}</strong>
            </div>

            <div style={recordBox}>
              <span>Completed Tests</span>
              <strong>{history.length}</strong>
            </div>

            <button onClick={clearSavedData} style={dangerBtn}>Clear Saved Data</button>

            <div style={tipBox}>
              <h3>How to test properly</h3>
              <p>
                Keep your finger or mouse ready, look at the center, and avoid guessing. Multi-round mode gives a better
                benchmark than one lucky attempt.
              </p>
            </div>

            <div style={historyBox}>
              <h3>Recent Tests</h3>
              {history.length === 0 ? (
                <p style={emptyText}>No completed tests yet.</p>
              ) : (
                history.slice(0, 8).map(item => (
                  <div key={item.id} style={historyItem}>
                    <span>{MODES[item.mode]?.label || 'Test'}</span>
                    <strong>{item.average} ms avg</strong>
                    <small>Best {item.best} ms</small>
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>

        
        <RelatedTools currentPath="/reactiontest" />

<section style={contentSection}>
          <h2>What is a reaction time test?</h2>
          <p>
            A reaction time test measures how quickly you respond after seeing a stimulus. In this test, the screen changes
            color after a random delay. Your result is the time between the visual change and your click or tap, measured in
            milliseconds. Lower scores mean faster visual reaction speed.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Visual reaction time test</h3>
              <p>
                This tool focuses on visual reaction time, which means you respond to a visual signal. It is useful for gamers,
                athletes, drivers, students and anyone who wants to check alertness or response speed.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Single vs multi-round testing</h3>
              <p>
                A single score can be affected by luck, distraction or early clicking. A 5-round or 10-round average gives a
                more reliable reaction benchmark.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Average, best and median</h3>
              <p>
                The average shows overall performance, the best round shows peak speed, and the median helps reduce the effect
                of one unusually slow or fast click.
              </p>
            </div>

            <div style={seoCard}>
              <h3>False-start tracking</h3>
              <p>
                Clicking before the green screen is counted as a false start. This helps separate real reaction speed from
                guessing.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Hardware affects results</h3>
              <p>
                Display refresh rate, mouse latency, touchscreen delay, browser performance and device speed can all influence
                measured reaction time.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Private local history</h3>
              <p>
                Your personal best and recent test history are saved in your browser only. The tool does not need an account or
                server-side profile.
              </p>
            </div>
          </div>

          <h2>Reaction time benchmark guide</h2>
          <ul style={tipList}>
            <li><strong>Under 150 ms:</strong> extremely fast and often influenced by high-end hardware or anticipation.</li>
            <li><strong>150–200 ms:</strong> excellent visual reaction speed.</li>
            <li><strong>200–250 ms:</strong> strong to average range for many users.</li>
            <li><strong>250–350 ms:</strong> normal range, often affected by fatigue, device latency or distraction.</li>
            <li><strong>350 ms and above:</strong> may indicate distraction, slow hardware, tiredness or delayed input.</li>
          </ul>

          <h2>Tips to improve reaction test accuracy</h2>
          <p>
            Use the same device when comparing results, close heavy background apps, avoid testing while tired, keep your hand
            in the same position and complete multiple rounds. Multi-round averages are more useful than a single best score.
          </p>
        </section>

        <section style={faqSection}>
          <h2>Reaction Time Test FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>What is a good reaction time?</h3>
              <p>Many users fall around 200–300 ms depending on device, age, alertness and hardware. Lower is faster.</p>
            </div>

            <div style={faqItem}>
              <h3>Why did I get “Too Soon”?</h3>
              <p>You clicked before the screen turned green. That is counted as a false start because it is guessing, not reacting.</p>
            </div>

            <div style={faqItem}>
              <h3>Is a 10-round test better?</h3>
              <p>Yes. More rounds reduce the effect of lucky clicks and give a more reliable average.</p>
            </div>

            <div style={faqItem}>
              <h3>Does hardware affect reaction time?</h3>
              <p>Yes. Monitor refresh rate, mouse or touchscreen latency, browser speed and device performance can affect your score.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function Stat({ label, value }) {
  return (
    <div style={statItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function calculateStats(values) {
  if (!values || values.length === 0) {
    return {
      average: null,
      best: null,
      worst: null,
      median: null,
      consistency: null
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((acc, value) => acc + value, 0);
  const average = Math.round(sum / values.length);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];

  const variance = values.reduce((acc, value) => acc + Math.pow(value - average, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  const consistency = Math.max(0, Math.round(100 - (standardDeviation / average) * 100));

  return { average, best, worst, median, consistency };
}

function getPerformanceTier(average) {
  if (!average) {
    return {
      label: 'Complete a test to see your tier',
      desc: 'Your tier will appear after your first completed test.',
      color: '#64748b'
    };
  }

  if (average < 150) {
    return {
      label: 'Elite Reflex',
      desc: 'Extremely fast. Repeat the test to make sure it was not anticipation.',
      color: '#38bdf8'
    };
  }

  if (average < 200) {
    return {
      label: 'Excellent',
      desc: 'Very fast visual response speed.',
      color: '#34d399'
    };
  }

  if (average < 250) {
    return {
      label: 'Strong',
      desc: 'A strong reaction speed range for many users.',
      color: '#a3e635'
    };
  }

  if (average < 350) {
    return {
      label: 'Normal',
      desc: 'A common range that may improve with focus, rest and lower input lag.',
      color: '#fbbf24'
    };
  }

  return {
    label: 'Slow / Distracted',
    desc: 'Try again when focused, rested, and using a responsive device.',
    color: '#f87171'
  };
}

function getAreaBackground(state, goColor) {
  if (state === 'waiting') return '#ef4444';
  if (state === 'go') return goColor;
  if (state === 'early') return '#7f1d1d';
  if (state === 'between') return '#0f172a';
  if (state === 'finished') return '#0f172a';
  return '#0f172a';
}

function secureRandomDelay(min, max) {
  const range = max - min;
  let random = Math.random();

  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const buffer = new Uint32Array(1);
    window.crypto.getRandomValues(buffer);
    random = buffer[0] / 4294967295;
  }

  return Math.floor(min + random * range);
}

const pageWrap = { maxWidth: '1180px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '920px', margin: '0 auto', lineHeight: 1.75 };

const appGrid = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', alignItems: 'start' };
const testPanel = { display: 'grid', gap: '20px' };
const sidePanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '24px', position: 'sticky', top: '92px', display: 'grid', gap: '18px' };

const modeGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' };
const modeBtn = { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '18px', padding: '16px', display: 'grid', gap: '7px', textAlign: 'left', cursor: 'pointer' };
const activeModeBtn = { ...modeBtn, background: 'rgba(56,189,248,0.12)', border: '1px solid #38bdf8' };

const testArea = {
  minHeight: '390px',
  borderRadius: '30px',
  borderWidth: '3px',
  borderStyle: 'dashed',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '14px',
  cursor: 'pointer',
  userSelect: 'none',
  textAlign: 'center',
  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.45), 0 16px 40px rgba(0,0,0,0.18)',
  transition: 'background 0.08s ease, border-color 0.08s ease',
  touchAction: 'manipulation',
  padding: '24px'
};

const roundPill = { background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.16)', color: '#cbd5e1', borderRadius: '999px', padding: '8px 13px', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' };
const mainPrompt = { fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 950, lineHeight: 1 };
const goPrompt = { fontSize: 'clamp(3rem, 9vw, 6rem)', fontWeight: 950, lineHeight: 1 };
const resultPrompt = { fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 950, lineHeight: 1, color: '#fff' };
const subPrompt = { color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.5 };

const quickActions = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
const primaryBtn = { background: '#38bdf8', color: '#082f49', border: 'none', borderRadius: '14px', padding: '15px', fontWeight: 950, cursor: 'pointer' };
const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', borderRadius: '14px', padding: '15px', fontWeight: 850, cursor: 'pointer' };
const dangerBtn = { background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '14px', padding: '13px 15px', fontWeight: 850, cursor: 'pointer' };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' };
const statItem = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '16px', display: 'grid', gap: '8px', color: '#94a3b8' };

const scoreCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '22px', display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'center' };
const sectionTitle = { color: '#fff', margin: '0 0 8px', fontSize: '1.25rem' };
const sectionText = { color: '#94a3b8', lineHeight: 1.65, margin: 0 };
const tierText = { color: '#38bdf8', fontWeight: 950, fontSize: '1.2rem', margin: '0 0 8px' };
const tierBadge = { border: '1px solid #334155', borderRadius: '999px', padding: '12px 16px', fontWeight: 950, whiteSpace: 'nowrap' };

const roundsCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '22px' };
const roundList = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' };
const roundItem = { background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '12px', display: 'grid', gap: '5px', color: '#94a3b8' };

const sideTitle = { color: '#fff', margin: 0, fontSize: '1.15rem' };
const fieldWrap = { display: 'grid', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' };
const colorInput = { width: '100%', height: '46px', background: '#0f172a', border: '1px solid #334155', borderRadius: '13px', padding: '6px', cursor: 'pointer' };
const recordBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#94a3b8' };
const tipBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', color: '#94a3b8', lineHeight: 1.65, fontSize: '0.9rem' };
const historyBox = { display: 'grid', gap: '10px', color: '#cbd5e1' };
const historyItem = { background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '12px', display: 'grid', gap: '4px' };
const emptyText = { color: '#64748b', fontStyle: 'italic', lineHeight: 1.6 };

const contentSection = { marginTop: '78px', borderTop: '1px solid #334155', paddingTop: '55px', color: '#cbd5e1', lineHeight: 1.85 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '30px 0' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '22px' };
const tipList = { paddingLeft: '20px', lineHeight: 1.9 };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px', color: '#cbd5e1', lineHeight: 1.8 };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

const durationOptions = [5, 10, 15, 30];

export default function CPSTest() {
  const [mounted, setMounted] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [duration, setDuration] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [history, setHistory] = useState([]);
  const [highScore, setHighScore] = useState(0);
  const [notification, setNotification] = useState('');
  const intervalRef = useRef(null);

  const cps = useMemo(() => {
    if (isFinished && duration > 0) return Number((clicks / duration).toFixed(2));
    if (isActive && duration - timeLeft > 0) return Number((clicks / (duration - timeLeft)).toFixed(2));
    return 0;
  }, [clicks, duration, timeLeft, isActive, isFinished]);

  const rank = getRank(isFinished ? cps : 0);

  useEffect(() => {
    setMounted(true);

    try {
      const savedHistory = JSON.parse(localStorage.getItem('shb_cps_history') || '[]');
      const savedBest = Number(localStorage.getItem('shb_cps_best') || 0);
      setHistory(Array.isArray(savedHistory) ? savedHistory : []);
      setHighScore(savedBest);
    } catch {
      setHistory([]);
      setHighScore(0);
    }
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = Number((prev - 0.1).toFixed(1));

        if (next <= 0) {
          clearInterval(intervalRef.current);
          finishTest();
          return 0;
        }

        return next;
      });
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const startTest = () => {
    clearInterval(intervalRef.current);
    setClicks(0);
    setTimeLeft(duration);
    setIsActive(true);
    setIsFinished(false);
    setNotification('Test started. Click as fast as you can 🚀');
  };

  const resetTest = () => {
    clearInterval(intervalRef.current);
    setClicks(0);
    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);
    setNotification('Test reset');
  };

  const finishTest = () => {
    setIsActive(false);
    setIsFinished(true);

    setClicks(currentClicks => {
      const finalCps = Number((currentClicks / duration).toFixed(2));
      const record = {
        cps: finalCps,
        clicks: currentClicks,
        duration,
        date: new Date().toISOString()
      };

      setHighScore(prevBest => {
        if (finalCps > prevBest) {
          localStorage.setItem('shb_cps_best', String(finalCps));
          setNotification('New personal best 🏆');
          return finalCps;
        }

        setNotification('Test complete ✅');
        return prevBest;
      });

      setHistory(prev => {
        const updated = [record, ...prev].slice(0, 6);
        localStorage.setItem('shb_cps_history', JSON.stringify(updated));
        return updated;
      });

      return currentClicks;
    });
  };

  const handleClickArea = (e) => {
    e.preventDefault();

    if (isFinished) return;

    if (!isActive) {
      startTest();
      setClicks(1);
      return;
    }

    setClicks(prev => prev + 1);
  };

  const handleDurationChange = (nextDuration) => {
    if (isActive) return;
    setDuration(nextDuration);
    setTimeLeft(nextDuration);
    setIsFinished(false);
    setClicks(0);
  };

  const clearHistory = () => {
    localStorage.removeItem('shb_cps_history');
    localStorage.removeItem('shb_cps_best');
    setHistory([]);
    setHighScore(0);
    setNotification('Local CPS history cleared');
  };

  if (!mounted) {
    return (
      <ToolboxLayout title="CPS Test" description="Measure clicks per second online.">
        <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
          Loading CPS test...
        </div>
      </ToolboxLayout>
    );
  }

  return (
    <ToolboxLayout
      title="CPS Test - Clicks Per Second Counter Online"
      description="Use the free SHB ToolBox CPS test to measure clicks per second with 5, 10, 15, or 30 second timers, total clicks, CPS score, rank, personal best, and local history."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free click speed test</p>
          <h1 style={heroTitle}>CPS Test - Clicks Per Second Counter</h1>
          <p style={heroText}>
            Measure how many times you can click per second. Choose a test duration, click inside the test area,
            and get your total clicks, CPS score, rank, personal best, and recent local history. This tool is useful
            for gaming practice, mouse testing, reaction practice, and simple speed challenges.
          </p>
        </section>

        <section style={toolGrid}>
          <div style={testPanel}>
            <div style={topStats}>
              <div style={topStat}>
                <span>Best CPS</span>
                <strong>{highScore.toFixed(2)}</strong>
              </div>
              <div style={topStat}>
                <span>Time Left</span>
                <strong>{timeLeft.toFixed(1)}s</strong>
              </div>
              <div style={topStat}>
                <span>Live CPS</span>
                <strong>{cps.toFixed(2)}</strong>
              </div>
            </div>

            <div style={durationRow}>
              {durationOptions.map(option => (
                <button
                  key={option}
                  onClick={() => handleDurationChange(option)}
                  disabled={isActive}
                  style={duration === option ? durationActive : durationBtn}
                >
                  {option}s
                </button>
              ))}
            </div>

            <div style={progressWrap}>
              <div style={{ ...progressBar, width: `${(timeLeft / duration) * 100}%` }} />
            </div>

            <button
              type="button"
              onMouseDown={handleClickArea}
              onTouchStart={handleClickArea}
              style={clickArea}
              aria-label="Click area for CPS test"
            >
              <span style={clickStatus}>
                {isActive ? 'Click as fast as you can' : isFinished ? 'Test finished' : 'Click here to start'}
              </span>
              <strong style={clickNumber}>{clicks}</strong>
              <span style={clickHint}>
                {isFinished ? `${cps.toFixed(2)} CPS • ${rank.label}` : 'Total clicks'}
              </span>
            </button>

            <div style={controlRow}>
              <button onClick={startTest} disabled={isActive} style={isActive ? disabledBtn : primaryBtn}>
                Start Test
              </button>
              <button onClick={resetTest} style={secondaryBtn}>
                Reset
              </button>
            </div>
          </div>

          <aside style={resultPanel}>
            <h2 style={panelTitle}>Result summary</h2>

            {!isFinished ? (
              <div style={emptyState}>
                Complete a test to see your final CPS score, rank, and recent attempts.
              </div>
            ) : (
              <div>
                <div style={{ ...rankBox, border: `1px solid ${rank.color}` }}>
                  <span style={rankLabel}>Your rank</span>
                  <strong style={{ ...rankName, color: rank.color }}>{rank.label}</strong>
                  <p style={rankText}>{rank.description}</p>
                </div>

                <div style={summaryGrid}>
                  <div style={summaryItem}><span>CPS</span><strong>{cps.toFixed(2)}</strong></div>
                  <div style={summaryItem}><span>Clicks</span><strong>{clicks}</strong></div>
                  <div style={summaryItem}><span>Duration</span><strong>{duration}s</strong></div>
                </div>
              </div>
            )}

            <div style={historyBox}>
              <div style={historyHead}>
                <h3 style={historyTitle}>Recent attempts</h3>
                <button onClick={clearHistory} style={clearBtn}>Clear</button>
              </div>

              {history.length === 0 ? (
                <p style={mutedSmall}>No saved attempts yet. History is stored only in this browser.</p>
              ) : (
                history.map((item, index) => (
                  <div key={`${item.date}-${index}`} style={historyItem}>
                    <span>{item.duration}s test</span>
                    <strong>{Number(item.cps).toFixed(2)} CPS</strong>
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>

        <section style={contentSection}>
          <h2 style={contentTitle}>What is CPS?</h2>
          <p style={para}>
            CPS means clicks per second. It measures how many clicks you can make in one second during a timed test.
            For example, if you click 75 times in a 10-second test, your score is 7.5 CPS. This makes it easy to compare
            performance across different test durations.
          </p>

          <div style={infoGrid}>
            <div style={infoCard}>
              <h3 style={infoTitle}>For gaming practice</h3>
              <p style={paraSmall}>
                CPS tests are popular with players who want to practice clicking rhythm, mouse control, and speed for games
                that involve repeated clicking. A higher CPS can be useful in some games, but accuracy and control still matter.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>For mouse testing</h3>
              <p style={paraSmall}>
                A click speed test can help compare different mice, check button feel, and notice whether a device has input
                delay, double-click behavior, or comfort issues during repeated clicking.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>For quick challenges</h3>
              <p style={paraSmall}>
                CPS tests are also simple reaction and speed challenges. You can use 5 seconds for a short burst or 30 seconds
                to test consistency and endurance.
              </p>
            </div>
          </div>

          <h2 style={contentTitle}>CPS rank guide</h2>
          <p style={para}>
            CPS rankings are only for fun and quick comparison. A score below 4 CPS is a beginner or relaxed pace. Around
            4 to 6 CPS is a normal clicking range for many users. Around 6 to 8 CPS is fast for regular clicking. Scores
            above 8 CPS are very fast and may depend on technique, mouse type, browser performance, and hand comfort.
          </p>

          <h2 style={contentTitle}>Tips to improve your CPS score</h2>
          <p style={para}>
            Use a comfortable mouse, keep your wrist relaxed, test on a stable surface, and avoid tensing your hand for too long.
            Short practice sessions are better than forcing long repeated tests. If your hand, wrist, or fingers feel painful,
            stop and rest. Click speed should not come at the cost of comfort or safety.
          </p>

          <h2 style={contentTitle}>Privacy note</h2>
          <p style={para}>
            This CPS test runs in your browser and stores recent attempts only in local browser storage so you can see your
            personal best and recent scores. It does not require an account. Clearing browser storage or using another browser
            may remove your saved history.
          </p>
        </section>

        <section style={faqSection}>
          <h2 style={contentTitle}>CPS Test FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3 style={faqQ}>How is CPS calculated?</h3>
              <p style={paraSmall}>CPS is calculated by dividing total clicks by the number of seconds in the test.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Which test duration should I use?</h3>
              <p style={paraSmall}>Use 5 seconds for quick bursts, 10 seconds for a standard test, and 30 seconds for consistency.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Why does my CPS change between tests?</h3>
              <p style={paraSmall}>CPS can change because of hand position, mouse type, browser performance, fatigue, and test duration.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Is high CPS always better?</h3>
              <p style={paraSmall}>Not always. In games and real tasks, accuracy, timing, comfort, and control can matter as much as speed.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function getRank(cps) {
  if (cps >= 10) {
    return {
      label: 'Elite',
      color: '#fbbf24',
      description: 'Extremely fast clicking speed. This score is difficult to maintain without practice or special technique.'
    };
  }

  if (cps >= 8) {
    return {
      label: 'Very Fast',
      color: '#38bdf8',
      description: 'A strong clicking score that is faster than many casual users.'
    };
  }

  if (cps >= 6) {
    return {
      label: 'Fast',
      color: '#34d399',
      description: 'A good CPS result for regular clicking and general gaming practice.'
    };
  }

  if (cps >= 4) {
    return {
      label: 'Average',
      color: '#94a3b8',
      description: 'A normal clicking speed range for many users.'
    };
  }

  return {
    label: 'Beginner',
    color: '#fb923c',
    description: 'A relaxed pace. You can improve with comfort, practice, and better clicking rhythm.'
  };
}

const pageWrap = { maxWidth: '1120px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '860px', margin: '0 auto', lineHeight: 1.75 };

const toolGrid = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 330px', gap: '24px', alignItems: 'start' };
const testPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '30px', boxShadow: '0 14px 35px rgba(0,0,0,0.2)' };
const resultPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', position: 'sticky', top: '92px' };

const topStats = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' };
const topStat = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '14px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px', color: '#94a3b8' };

const durationRow = { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' };
const durationBtn = { background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', padding: '10px 16px', borderRadius: '999px', cursor: 'pointer', fontWeight: 850 };
const durationActive = { ...durationBtn, background: '#38bdf8', color: '#082f49', border: '1px solid #38bdf8' };

const progressWrap = { width: '100%', height: '10px', background: '#0f172a', borderRadius: '999px', marginBottom: '22px', overflow: 'hidden', border: '1px solid #334155' };
const progressBar = { height: '100%', background: '#38bdf8', transition: 'width 0.1s linear' };

const clickArea = { width: '100%', minHeight: '320px', background: 'rgba(15,23,42,0.88)', border: '3px dashed #334155', borderRadius: '26px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none', touchAction: 'manipulation', color: '#fff' };
const clickStatus = { color: '#38bdf8', fontWeight: 900, fontSize: '1.2rem', marginBottom: '12px', textAlign: 'center' };
const clickNumber = { fontSize: '5.4rem', lineHeight: 1, color: '#fff' };
const clickHint = { color: '#94a3b8', marginTop: '12px', fontWeight: 800 };

const controlRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '18px' };
const primaryBtn = { background: '#38bdf8', color: '#082f49', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: 950, cursor: 'pointer', fontSize: '0.95rem' };
const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: 850, cursor: 'pointer' };
const disabledBtn = { ...primaryBtn, opacity: 0.45, cursor: 'not-allowed' };

const panelTitle = { color: '#fff', margin: '0 0 16px', fontSize: '1.35rem' };
const emptyState = { color: '#64748b', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: '1px dashed #334155', borderRadius: '18px', padding: '18px', lineHeight: 1.6 };
const rankBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '20px', marginBottom: '18px' };
const rankLabel = { color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 900 };
const rankName = { display: 'block', fontSize: '1.9rem', margin: '8px 0' };
const rankText = { color: '#cbd5e1', lineHeight: 1.65, margin: 0 };
const summaryGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '22px' };
const summaryItem = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '13px', display: 'flex', flexDirection: 'column', gap: '5px', color: '#94a3b8', textAlign: 'center' };

const historyBox = { marginTop: '22px', borderTop: '1px solid #334155', paddingTop: '18px' };
const historyHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' };
const historyTitle = { color: '#38bdf8', margin: 0, fontSize: '1rem' };
const clearBtn = { background: 'none', border: '1px solid #334155', color: '#94a3b8', borderRadius: '10px', padding: '7px 10px', cursor: 'pointer' };
const mutedSmall = { color: '#64748b', lineHeight: 1.6, fontSize: '0.9rem' };
const historyItem = { display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '12px 0', borderBottom: '1px solid #0f172a', color: '#94a3b8' };

const contentSection = { marginTop: '76px', borderTop: '1px solid #334155', paddingTop: '55px' };
const contentTitle = { color: '#fff', fontSize: '1.75rem', lineHeight: 1.25, margin: '0 0 18px' };
const para = { color: '#cbd5e1', lineHeight: 1.85, fontSize: '1rem', margin: '0 0 28px' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '28px 0 48px' };
const infoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '24px' };
const infoTitle = { color: '#38bdf8', margin: '0 0 12px', fontSize: '1.05rem' };
const paraSmall = { color: '#cbd5e1', lineHeight: 1.75, fontSize: '0.95rem', margin: 0 };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px' };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };
const faqQ = { color: '#fff', fontSize: '1rem', margin: '0 0 10px' };

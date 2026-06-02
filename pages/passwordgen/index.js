import React, { useEffect, useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~'
};

const SIMILAR_CHARS = 'Il1O0o';
const AMBIGUOUS_SYMBOLS = '{}[]()/\\\'"`~,;:.<>';
const PIN_DIGITS = '0123456789';

const WORDS = [
  'amber', 'atlas', 'breeze', 'bridge', 'bright', 'canyon', 'cedar', 'cloud', 'coral', 'cosmic',
  'delta', 'desert', 'ember', 'falcon', 'forest', 'galaxy', 'garden', 'globe', 'golden', 'harbor',
  'horizon', 'island', 'jasmine', 'jungle', 'kitten', 'lagoon', 'lantern', 'lotus', 'marble', 'meadow',
  'meteor', 'midnight', 'monsoon', 'mountain', 'nectar', 'oasis', 'ocean', 'orchid', 'palace', 'pearl',
  'phoenix', 'planet', 'prairie', 'quantum', 'river', 'rocket', 'saffron', 'sapphire', 'shadow', 'silver',
  'skyline', 'spring', 'storm', 'sunrise', 'sunset', 'thunder', 'tiger', 'timber', 'velvet', 'violet',
  'voyage', 'wander', 'willow', 'winter', 'zephyr', 'zenith', 'aurora', 'binary', 'copper', 'diamond',
  'eagle', 'flame', 'granite', 'hazel', 'indigo', 'jupiter', 'kingdom', 'liberty', 'magnet', 'nebula',
  'onyx', 'pixel', 'quartz', 'raven', 'summit', 'temple', 'unity', 'vector', 'whisper', 'xenon',
  'yellow', 'zebra', 'bamboo', 'crystal', 'dragon', 'energy', 'frozen', 'gentle', 'honest', 'ivory'
];

export default function PasswordGenerator() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState('password');
  const [password, setPassword] = useState('Click Generate');
  const [showPassword, setShowPassword] = useState(true);
  const [length, setLength] = useState(20);
  const [wordCount, setWordCount] = useState(4);
  const [pinLength, setPinLength] = useState(6);
  const [separator, setSeparator] = useState('-');
  const [batchCount, setBatchCount] = useState(5);
  const [customChars, setCustomChars] = useState('');
  const [excludeChars, setExcludeChars] = useState('');
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState('');

  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: true,
    excludeAmbiguous: false,
    requireEachType: true
  });

  const strength = useMemo(() => calculateStrength(password, mode), [password, mode]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const showToast = (message) => {
    setNotification(message);
  };

  const toggleOption = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const buildAllowedChars = () => {
    let allowed = '';

    if (options.uppercase) allowed += CHAR_SETS.uppercase;
    if (options.lowercase) allowed += CHAR_SETS.lowercase;
    if (options.numbers) allowed += CHAR_SETS.numbers;
    if (options.symbols) allowed += CHAR_SETS.symbols;
    if (customChars.trim()) allowed += customChars;

    allowed = uniqueChars(allowed);

    if (options.excludeSimilar) {
      allowed = removeChars(allowed, SIMILAR_CHARS);
    }

    if (options.excludeAmbiguous) {
      allowed = removeChars(allowed, AMBIGUOUS_SYMBOLS);
    }

    if (excludeChars) {
      allowed = removeChars(allowed, excludeChars);
    }

    return allowed;
  };

  const getRequiredChars = () => {
    const groups = [];

    if (options.uppercase) groups.push(filterSet(CHAR_SETS.uppercase));
    if (options.lowercase) groups.push(filterSet(CHAR_SETS.lowercase));
    if (options.numbers) groups.push(filterSet(CHAR_SETS.numbers));
    if (options.symbols) groups.push(filterSet(CHAR_SETS.symbols));

    return groups.filter(group => group.length > 0).map(group => group[secureRandomInt(group.length)]);
  };

  const filterSet = (chars) => {
    let output = chars;

    if (options.excludeSimilar) output = removeChars(output, SIMILAR_CHARS);
    if (options.excludeAmbiguous) output = removeChars(output, AMBIGUOUS_SYMBOLS);
    if (excludeChars) output = removeChars(output, excludeChars);

    return uniqueChars(output);
  };

  const generateSecurePassword = () => {
    const allowed = buildAllowedChars();

    if (!allowed) {
      showToast('Select at least one character set or add custom characters.');
      return '';
    }

    const required = options.requireEachType ? getRequiredChars() : [];

    if (Number(length) < required.length) {
      showToast(`Length must be at least ${required.length} for the selected character types.`);
      return '';
    }

    const chars = [...required];

    while (chars.length < Number(length)) {
      chars.push(allowed[secureRandomInt(allowed.length)]);
    }

    return secureShuffle(chars).join('');
  };

  const generatePassphrase = () => {
    const count = Math.max(2, Number(wordCount) || 4);
    const chosen = [];

    for (let i = 0; i < count; i++) {
      let word = WORDS[secureRandomInt(WORDS.length)];

      if (options.uppercase) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }

      chosen.push(word);
    }

    let phrase = chosen.join(separator);

    if (options.numbers) {
      phrase += `${separator}${secureRandomInt(90) + 10}`;
    }

    if (options.symbols) {
      const safeSymbols = filterSet('!@#$%&*+-?');
      phrase += safeSymbols ? safeSymbols[secureRandomInt(safeSymbols.length)] : '!';
    }

    return phrase;
  };

  const generatePin = () => {
    let pin = '';

    for (let i = 0; i < Number(pinLength); i++) {
      pin += PIN_DIGITS[secureRandomInt(PIN_DIGITS.length)];
    }

    return pin;
  };

  const generateOne = () => {
    if (mode === 'passphrase') return generatePassphrase();
    if (mode === 'pin') return generatePin();
    return generateSecurePassword();
  };

  const generatePassword = () => {
    const newPassword = generateOne();

    if (!newPassword) return;

    setPassword(newPassword);
    setHistory(prev => [newPassword, ...prev].slice(0, 10));
    showToast('Secure password generated.');
  };

  const generateBatch = () => {
    const count = Math.min(Math.max(Number(batchCount) || 1, 1), 25);
    const generated = [];

    for (let i = 0; i < count; i++) {
      const item = generateOne();
      if (item) generated.push(item);
    }

    if (generated.length === 0) return;

    setPassword(generated[0]);
    setHistory(prev => [...generated, ...prev].slice(0, 25));
    showToast(`${generated.length} passwords generated.`);
  };

  const copyText = async (value, message = 'Copied to clipboard.') => {
    try {
      await navigator.clipboard.writeText(value);
      showToast(message);
    } catch {
      showToast('Copy failed. Please copy manually.');
    }
  };

  const copyAll = () => {
    if (history.length === 0) {
      showToast('No generated passwords to copy.');
      return;
    }

    copyText(history.join('\n'), 'All generated passwords copied.');
  };

  const clearHistory = () => {
    setHistory([]);
    showToast('Session history cleared.');
  };

  if (!mounted) {
    return (
      <ToolboxLayout title="Password Generator" description="Loading secure password generator.">
        <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
          Loading secure generator...
        </div>
      </ToolboxLayout>
    );
  }

  return (
    <ToolboxLayout
      title="Secure Password Generator - Create Strong Random Passwords"
      description="Generate strong passwords, passphrases and PINs with browser cryptographic randomness. Customize length, character sets, symbols, exclusions, strength score and batch generation privately."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based security tool</p>
          <h1 style={heroTitle}>Secure Password Generator</h1>
          <p style={heroText}>
            Create strong random passwords, memorable passphrases, or numeric PINs using browser cryptographic randomness.
            Customize the rules, check entropy strength, generate batches, and copy results without uploading anything.
          </p>
        </section>

        <section style={toolGrid}>
          <main style={generatorPanel}>
            <div style={passwordBox}>
              <div style={passwordTop}>
                <span style={modePill}>{mode.toUpperCase()}</span>
                <button onClick={() => setShowPassword(!showPassword)} style={ghostSmallBtn}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div style={passwordDisplay}>
                {showPassword ? password : '•'.repeat(Math.min(password.length, 42))}
              </div>

              <div style={passwordActions}>
                <button onClick={() => copyText(password, 'Password copied.')} style={secondaryBtn}>Copy</button>
                <button onClick={generatePassword} style={primaryBtn}>Generate</button>
              </div>
            </div>

            <div style={strengthBox}>
              <div style={strengthHeader}>
                <span>Strength</span>
                <strong style={{ color: strength.color }}>{strength.label}</strong>
              </div>

              <div style={meterTrack}>
                <div style={{ ...meterFill, width: `${strength.percent}%`, background: strength.color }} />
              </div>

              <div style={strengthStats}>
                <div>
                  <span>Entropy</span>
                  <strong>{strength.entropy} bits</strong>
                </div>
                <div>
                  <span>Estimate</span>
                  <strong>{strength.crackTime}</strong>
                </div>
              </div>
            </div>

            <div style={controlGrid}>
              <Panel title="Generator Mode">
                <div style={modeGrid}>
                  <button onClick={() => setMode('password')} style={mode === 'password' ? activeModeBtn : modeBtn}>Password</button>
                  <button onClick={() => setMode('passphrase')} style={mode === 'passphrase' ? activeModeBtn : modeBtn}>Passphrase</button>
                  <button onClick={() => setMode('pin')} style={mode === 'pin' ? activeModeBtn : modeBtn}>PIN</button>
                </div>
              </Panel>

              {mode === 'password' && (
                <Panel title="Password Rules">
                  <Slider
                    label="Length"
                    value={length}
                    min={8}
                    max={80}
                    onChange={setLength}
                  />

                  <div style={checkGrid}>
                    <Check label="Uppercase A-Z" checked={options.uppercase} onChange={() => toggleOption('uppercase')} />
                    <Check label="Lowercase a-z" checked={options.lowercase} onChange={() => toggleOption('lowercase')} />
                    <Check label="Numbers 0-9" checked={options.numbers} onChange={() => toggleOption('numbers')} />
                    <Check label="Symbols" checked={options.symbols} onChange={() => toggleOption('symbols')} />
                    <Check label="Require each selected type" checked={options.requireEachType} onChange={() => toggleOption('requireEachType')} />
                    <Check label="Exclude similar Il1O0o" checked={options.excludeSimilar} onChange={() => toggleOption('excludeSimilar')} />
                    <Check label="Exclude ambiguous symbols" checked={options.excludeAmbiguous} onChange={() => toggleOption('excludeAmbiguous')} />
                  </div>
                </Panel>
              )}

              {mode === 'passphrase' && (
                <Panel title="Passphrase Rules">
                  <Slider
                    label="Word count"
                    value={wordCount}
                    min={2}
                    max={10}
                    onChange={setWordCount}
                  />

                  <label style={fieldWrap}>
                    <span style={fieldLabel}>Separator</span>
                    <select value={separator} onChange={e => setSeparator(e.target.value)} style={inputStyle}>
                      <option value="-">Hyphen -</option>
                      <option value="_">Underscore _</option>
                      <option value=".">Dot .</option>
                      <option value=" ">Space</option>
                      <option value="">No separator</option>
                    </select>
                  </label>

                  <div style={checkGrid}>
                    <Check label="Capitalize words" checked={options.uppercase} onChange={() => toggleOption('uppercase')} />
                    <Check label="Add number" checked={options.numbers} onChange={() => toggleOption('numbers')} />
                    <Check label="Add symbol" checked={options.symbols} onChange={() => toggleOption('symbols')} />
                  </div>
                </Panel>
              )}

              {mode === 'pin' && (
                <Panel title="PIN Rules">
                  <Slider
                    label="PIN length"
                    value={pinLength}
                    min={4}
                    max={20}
                    onChange={setPinLength}
                  />
                  <p style={hint}>
                    PINs are easier to type but weaker than long passwords. Use long PINs only where numeric codes are required.
                  </p>
                </Panel>
              )}

              <Panel title="Advanced Options">
                <label style={fieldWrap}>
                  <span style={fieldLabel}>Custom allowed characters</span>
                  <input
                    value={customChars}
                    onChange={e => setCustomChars(e.target.value)}
                    placeholder="Optional"
                    style={inputStyle}
                  />
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Characters to exclude</span>
                  <input
                    value={excludeChars}
                    onChange={e => setExcludeChars(e.target.value)}
                    placeholder="Example: @#$"
                    style={inputStyle}
                  />
                </label>
              </Panel>

              <Panel title="Batch Generator">
                <Slider
                  label="Batch count"
                  value={batchCount}
                  min={1}
                  max={25}
                  onChange={setBatchCount}
                />

                <button onClick={generateBatch} style={primaryBtn}>Generate Batch</button>
              </Panel>
            </div>
          </main>

          <aside style={historyPanel}>
            <h2 style={sideTitle}>Session History</h2>
            <p style={sideText}>
              Generated passwords are kept only in this page session. They are not saved to local storage.
            </p>

            <div style={historyActions}>
              <button onClick={copyAll} style={secondaryBtn}>Copy All</button>
              <button onClick={clearHistory} style={dangerBtn}>Clear</button>
            </div>

            <div style={historyList}>
              {history.length === 0 ? (
                <p style={emptyHistory}>No passwords generated yet.</p>
              ) : (
                history.map((item, index) => (
                  <div key={`${item}-${index}`} style={historyItem}>
                    <code style={historyCode}>{item}</code>
                    <button onClick={() => copyText(item, 'Copied.')} style={copyMiniBtn}>Copy</button>
                  </div>
                ))
              )}
            </div>

            <div style={privacyCard}>
              <h3>Privacy note</h3>
              <p>
                This tool uses your browser to generate passwords. Avoid sending passwords through chat, email, or screenshots.
                Save them only in a trusted password manager.
              </p>
            </div>
          </aside>
        </section>

        
        <RelatedTools currentPath="/passwordgen" />

<section style={contentSection}>
          <h2>How this secure password generator works</h2>
          <p>
            A strong password must be difficult to guess and difficult to brute-force. This password generator creates random
            strings from selected character groups, calculates an estimated entropy score, and helps you choose a safer length.
            Longer passwords with mixed character sets are usually stronger than short passwords with predictable substitutions.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Cryptographic randomness</h3>
              <p>
                The generator uses browser cryptographic randomness where available instead of simple predictable randomization.
                This produces stronger random choices for security-sensitive strings.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Password vs passphrase</h3>
              <p>
                Random passwords are compact and strong. Passphrases are easier to read and type, especially when used with
                multiple words, separators, numbers and symbols.
              </p>
            </div>

            <div style={seoCard}>
              <h3>No cloud upload</h3>
              <p>
                Passwords are generated in the browser. This page does not need an account, and session history is not saved
                permanently by the tool.
              </p>
            </div>
          </div>

          <h2>Password safety tips</h2>
          <ul style={tipList}>
            <li>Use a different password for every important account.</li>
            <li>Use at least 16 characters for important accounts when possible.</li>
            <li>Use a trusted password manager instead of memorizing many passwords.</li>
            <li>Turn on two-factor authentication for email, banking, cloud storage and social accounts.</li>
            <li>Do not reuse old passwords or passwords leaked in previous breaches.</li>
          </ul>
        </section>

        <section style={faqSection}>
          <h2>Password Generator FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>What is a strong password?</h3>
              <p>A strong password is long, random, unique and not based on personal information or dictionary words.</p>
            </div>

            <div style={faqItem}>
              <h3>Is a passphrase safe?</h3>
              <p>A long random passphrase can be safe and easier to type than a random character password.</p>
            </div>

            <div style={faqItem}>
              <h3>Should I save generated passwords here?</h3>
              <p>No. Copy the password into a trusted password manager. This page is for generation, not long-term storage.</p>
            </div>

            <div style={faqItem}>
              <h3>Why exclude similar characters?</h3>
              <p>Excluding characters like I, l, 1, O and 0 makes passwords easier to read and reduces typing mistakes.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function Panel({ title, children }) {
  return (
    <section style={panelCard}>
      <h2 style={panelTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label style={checkLabel}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <div style={sliderWrap}>
      <div style={sliderHeader}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={rangeStyle}
      />
    </div>
  );
}

function secureRandomInt(max) {
  if (!max || max <= 0) return 0;

  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const range = 0x100000000;
    const limit = range - (range % max);
    const buffer = new Uint32Array(1);

    do {
      window.crypto.getRandomValues(buffer);
    } while (buffer[0] >= limit);

    return buffer[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function secureShuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function uniqueChars(chars) {
  return Array.from(new Set(String(chars).split(''))).join('');
}

function removeChars(source, charsToRemove) {
  const blocked = new Set(String(charsToRemove).split(''));
  return String(source).split('').filter(char => !blocked.has(char)).join('');
}

function calculateStrength(value, mode) {
  if (!value || value === 'Click Generate') {
    return {
      label: 'Not generated',
      color: '#64748b',
      percent: 10,
      entropy: 0,
      crackTime: 'Generate first'
    };
  }

  let pool = 0;

  if (mode === 'pin') {
    pool = 10;
  } else if (mode === 'passphrase') {
    const wordParts = String(value).split(/[-_.\s]+/).filter(Boolean).length || 1;
    const entropy = Math.round(wordParts * Math.log2(WORDS.length));
    return strengthFromEntropy(entropy);
  } else {
    if (/[A-Z]/.test(value)) pool += 26;
    if (/[a-z]/.test(value)) pool += 26;
    if (/[0-9]/.test(value)) pool += 10;
    if (/[^A-Za-z0-9]/.test(value)) pool += 32;
  }

  const entropy = Math.round(String(value).length * Math.log2(Math.max(pool, 1)));
  return strengthFromEntropy(entropy);
}

function strengthFromEntropy(entropy) {
  let label = 'Weak';
  let color = '#f87171';
  let percent = 25;

  if (entropy >= 90) {
    label = 'Excellent';
    color = '#34d399';
    percent = 100;
  } else if (entropy >= 70) {
    label = 'Strong';
    color = '#22c55e';
    percent = 82;
  } else if (entropy >= 50) {
    label = 'Good';
    color = '#fbbf24';
    percent = 62;
  } else if (entropy >= 35) {
    label = 'Fair';
    color = '#fb923c';
    percent = 42;
  }

  return {
    label,
    color,
    percent,
    entropy,
    crackTime: estimateCrackTime(entropy)
  };
}

function estimateCrackTime(entropy) {
  if (!entropy) return 'Generate first';

  const guessesPerSecond = 100000000000;
  const seconds = Math.pow(2, entropy) / guessesPerSecond;

  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;

  const years = seconds / 31536000;
  if (years < 1000) return `${Math.round(years)} years`;
  if (years < 1000000) return `${Math.round(years / 1000)}k years`;
  if (years < 1000000000) return `${Math.round(years / 1000000)}M years`;
  return 'Billions+ years';
}

const pageWrap = { maxWidth: '1150px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '900px', margin: '0 auto', lineHeight: 1.75 };

const toolGrid = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 330px', gap: '24px', alignItems: 'start' };
const generatorPanel = { display: 'grid', gap: '22px' };
const passwordBox = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '28px', boxShadow: '0 14px 35px rgba(0,0,0,0.2)' };
const passwordTop = { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '16px' };
const modePill = { background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid #334155', borderRadius: '999px', padding: '7px 11px', fontSize: '0.75rem', fontWeight: 900 };
const passwordDisplay = { background: '#0f172a', border: '1px solid #38bdf8', borderRadius: '20px', padding: '24px', color: '#fff', fontFamily: 'monospace', fontSize: 'clamp(1rem, 2.8vw, 1.55rem)', lineHeight: 1.5, wordBreak: 'break-all', minHeight: '92px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' };
const passwordActions = { display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '12px', marginTop: '16px' };

const strengthBox = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '22px' };
const strengthHeader = { display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginBottom: '12px', fontWeight: 850 };
const meterTrack = { height: '10px', background: '#0f172a', borderRadius: '999px', overflow: 'hidden' };
const meterFill = { height: '100%', borderRadius: '999px', transition: 'width 0.3s ease' };
const strengthStats = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', color: '#94a3b8', fontSize: '0.85rem' };

const controlGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' };
const panelCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '22px', display: 'grid', gap: '15px' };
const panelTitle = { color: '#fff', margin: 0, fontSize: '1.05rem' };
const modeGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' };
const modeBtn = { background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', padding: '12px', borderRadius: '13px', cursor: 'pointer', fontWeight: 850 };
const activeModeBtn = { ...modeBtn, background: '#38bdf8', color: '#082f49', border: '1px solid #38bdf8' };

const checkGrid = { display: 'grid', gridTemplateColumns: '1fr', gap: '10px' };
const checkLabel = { color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', cursor: 'pointer' };
const sliderWrap = { display: 'grid', gap: '10px' };
const sliderHeader = { display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontWeight: 850 };
const rangeStyle = { width: '100%', accentColor: '#38bdf8' };
const fieldWrap = { display: 'grid', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '13px', padding: '12px', outline: 'none' };
const hint = { color: '#94a3b8', lineHeight: 1.65, fontSize: '0.9rem', margin: 0 };

const primaryBtn = { background: '#38bdf8', color: '#082f49', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 950, cursor: 'pointer' };
const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 850, cursor: 'pointer' };
const dangerBtn = { background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 850, cursor: 'pointer' };
const ghostSmallBtn = { background: '#0f172a', color: '#38bdf8', border: '1px solid #334155', borderRadius: '999px', padding: '7px 12px', fontWeight: 850, cursor: 'pointer' };

const historyPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '24px', position: 'sticky', top: '92px' };
const sideTitle = { color: '#fff', margin: '0 0 10px', fontSize: '1.2rem' };
const sideText = { color: '#94a3b8', lineHeight: 1.65, margin: '0 0 16px', fontSize: '0.9rem' };
const historyActions = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' };
const historyList = { display: 'grid', gap: '10px', maxHeight: '430px', overflow: 'auto' };
const historyItem = { background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '12px', display: 'grid', gap: '10px' };
const historyCode = { color: '#fff', fontSize: '0.8rem', wordBreak: 'break-all' };
const copyMiniBtn = { background: 'transparent', color: '#38bdf8', border: '1px solid #334155', borderRadius: '10px', padding: '8px', cursor: 'pointer', fontWeight: 850 };
const emptyHistory = { color: '#64748b', fontStyle: 'italic', lineHeight: 1.6 };
const privacyCard = { marginTop: '18px', background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', color: '#94a3b8', lineHeight: 1.65, fontSize: '0.9rem' };

const contentSection = { marginTop: '78px', borderTop: '1px solid #334155', paddingTop: '55px', color: '#cbd5e1', lineHeight: 1.85 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '30px 0' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '22px' };
const tipList = { paddingLeft: '20px', color: '#cbd5e1', lineHeight: 1.9 };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px', color: '#cbd5e1', lineHeight: 1.8 };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };
import React, { useEffect, useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

const SAMPLE_TEXT = `SHB ToolBox helps writers, students, bloggers and marketers analyze text quickly. Paste your article, essay, caption or website content to count words, characters, sentences, paragraphs and reading time. You can also check keyword density, SEO title length and meta description limits before publishing.`;

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','if','then','with','without','to','of','in','on','for','from','by','as','at','is','are','was','were','be','been','being','it','its','this','that','these','those','you','your','we','our','they','their','he','she','his','her','them','i','me','my','mine','not','no','do','does','did','can','could','should','would','will','just','so','than','too','very','into','about','over','under','after','before'
]);

export default function WordCounter() {
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState('');
  const [notification, setNotification] = useState('');
  const [readingSpeed, setReadingSpeed] = useState(200);
  const [speakingSpeed, setSpeakingSpeed] = useState(130);
  const [caseSensitive, setCaseSensitive] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const analysis = useMemo(() => analyzeText(text, readingSpeed, speakingSpeed, caseSensitive), [text, readingSpeed, speakingSpeed, caseSensitive]);

  const showToast = (message) => {
    setNotification(message);
  };

  const copyStats = async () => {
    const summary = [
      'SHB Word Counter Summary',
      `Words: ${analysis.words}`,
      `Characters: ${analysis.characters}`,
      `Characters without spaces: ${analysis.charactersNoSpaces}`,
      `Sentences: ${analysis.sentences}`,
      `Paragraphs: ${analysis.paragraphs}`,
      `Lines: ${analysis.lines}`,
      `Reading time: ${analysis.readingTimeLabel}`,
      `Speaking time: ${analysis.speakingTimeLabel}`,
      `Readability: ${analysis.readability.label}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      showToast('Stats copied.');
    } catch {
      showToast('Copy failed. Please copy manually.');
    }
  };

  const copyText = async () => {
    if (!text.trim()) {
      showToast('No text to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      showToast('Text copied.');
    } catch {
      showToast('Copy failed. Please copy manually.');
    }
  };

  const downloadText = () => {
    if (!text.trim()) {
      showToast('No text to download.');
      return;
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `shb-word-counter-text-${Date.now()}.txt`;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast('Text file downloaded.');
  };

  const clearText = () => {
    setText('');
    showToast('Workspace cleared.');
  };

  const loadSample = () => {
    setText(SAMPLE_TEXT);
    showToast('Sample text loaded.');
  };

  if (!mounted) {
    return (
      <ToolboxLayout title="Word Counter" description="Loading word counter.">
        <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
          Loading text analyzer...
        </div>
      </ToolboxLayout>
    );
  }

  return (
    <ToolboxLayout
      title="Word Counter - Character Counter, Reading Time and Keyword Density Tool"
      description="Count words, characters, sentences, paragraphs, lines, reading time, speaking time, keyword density and SEO limits for articles, essays, captions and website content."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free writing and SEO text analyzer</p>
          <h1 style={heroTitle}>Word Counter & Text Analyzer</h1>
          <p style={heroText}>
            Paste your article, essay, caption, product description or website copy to count words, characters,
            sentences, paragraphs, reading time, speaking time, keyword density and SEO length limits instantly.
          </p>

          <div style={heroActions}>
            <button onClick={loadSample} style={secondaryBtn}>Load Sample</button>
            <button onClick={copyStats} style={secondaryBtn}>Copy Stats</button>
            <button onClick={downloadText} style={ghostBtn}>Download TXT</button>
            <button onClick={clearText} style={dangerBtn}>Clear</button>
          </div>
        </section>

        <section style={appGrid}>
          <main style={mainPanel}>
            <section style={editorPanel}>
              <div style={sectionHeader}>
                <div>
                  <h2 style={sectionTitle}>Text Workspace</h2>
                  <p style={sectionText}>Write or paste text below for real-time analysis.</p>
                </div>

                <button onClick={copyText} style={secondaryBtn}>Copy Text</button>
              </div>

              <textarea
                value={text}
                onChange={event => setText(event.target.value)}
                placeholder="Start typing or paste your text here..."
                style={textareaStyle}
                spellCheck="true"
              />

              <div style={settingsGrid}>
                <label style={fieldWrap}>
                  <span style={fieldLabel}>Reading speed</span>
                  <select value={readingSpeed} onChange={event => setReadingSpeed(Number(event.target.value))} style={inputStyle}>
                    <option value={150}>Slow - 150 WPM</option>
                    <option value={200}>Average - 200 WPM</option>
                    <option value={250}>Fast - 250 WPM</option>
                    <option value={300}>Very Fast - 300 WPM</option>
                  </select>
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Speaking speed</span>
                  <select value={speakingSpeed} onChange={event => setSpeakingSpeed(Number(event.target.value))} style={inputStyle}>
                    <option value={110}>Slow speech - 110 WPM</option>
                    <option value={130}>Normal speech - 130 WPM</option>
                    <option value={150}>Fast speech - 150 WPM</option>
                  </select>
                </label>

                <label style={checkWrap}>
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={event => setCaseSensitive(event.target.checked)}
                    style={checkboxStyle}
                  />
                  Case-sensitive keyword density
                </label>
              </div>
            </section>

            <section style={statsGrid}>
              <StatCard label="Words" value={analysis.words} />
              <StatCard label="Characters" value={analysis.characters} />
              <StatCard label="No Spaces" value={analysis.charactersNoSpaces} />
              <StatCard label="Sentences" value={analysis.sentences} />
              <StatCard label="Paragraphs" value={analysis.paragraphs} />
              <StatCard label="Lines" value={analysis.lines} />
              <StatCard label="Unique Words" value={analysis.uniqueWords} />
              <StatCard label="Reading Time" value={analysis.readingTimeLabel} tone="green" />
              <StatCard label="Speaking Time" value={analysis.speakingTimeLabel} tone="blue" />
            </section>

            <section style={insightGrid}>
              <div style={insightCard}>
                <h2 style={sectionTitle}>Readability</h2>
                <div style={{ ...readabilityBadge, color: analysis.readability.color, borderColor: analysis.readability.color }}>
                  {analysis.readability.label}
                </div>
                <p style={sectionText}>{analysis.readability.desc}</p>
              </div>

              <div style={insightCard}>
                <h2 style={sectionTitle}>Sentence Quality</h2>
                <p style={bigNumber}>{analysis.averageSentenceLength}</p>
                <p style={sectionText}>Average words per sentence. Shorter sentences are usually easier to read online.</p>
              </div>

              <div style={insightCard}>
                <h2 style={sectionTitle}>Average Word Length</h2>
                <p style={bigNumber}>{analysis.averageWordLength}</p>
                <p style={sectionText}>Average characters per word. Long averages may indicate technical or complex writing.</p>
              </div>
            </section>

            <section style={seoPanel}>
              <h2 style={sectionTitle}>SEO & Social Length Checks</h2>

              <div style={seoCheckGrid}>
                <LimitCheck label="SEO Title" value={analysis.characters} min={30} max={60} unit="characters" />
                <LimitCheck label="Meta Description" value={analysis.characters} min={120} max={160} unit="characters" />
                <LimitCheck label="Instagram Caption Preview" value={analysis.characters} min={1} max={125} unit="characters before truncation" />
                <LimitCheck label="X / Twitter Post" value={analysis.characters} min={1} max={280} unit="characters" />
                <LimitCheck label="LinkedIn Hook" value={analysis.characters} min={1} max={140} unit="characters" />
                <LimitCheck label="Short Blog Intro" value={analysis.words} min={40} max={120} unit="words" />
              </div>
            </section>

            <section style={analysisGrid}>
              <div style={listPanel}>
                <h2 style={sectionTitle}>Top Keywords</h2>
                {analysis.keywords.length === 0 ? (
                  <p style={emptyText}>Add more text to see keyword density.</p>
                ) : (
                  <div style={keywordList}>
                    {analysis.keywords.map(item => (
                      <div key={item.word} style={keywordItem}>
                        <span>{item.word}</span>
                        <strong>{item.count}</strong>
                        <small>{item.density}%</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={listPanel}>
                <h2 style={sectionTitle}>Long Sentences</h2>
                {analysis.longSentences.length === 0 ? (
                  <p style={emptyText}>No long sentences found. Good readability.</p>
                ) : (
                  <div style={sentenceList}>
                    {analysis.longSentences.map((sentence, index) => (
                      <div key={`${sentence.text.slice(0, 15)}-${index}`} style={sentenceItem}>
                        <strong>{sentence.wordCount} words</strong>
                        <span>{sentence.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </main>

          <aside style={sidePanel}>
            <h2 style={sideTitle}>Writing Targets</h2>

            <div style={targetBox}>
              <span>Blog post</span>
              <strong>1,000–2,500 words</strong>
            </div>

            <div style={targetBox}>
              <span>SEO title</span>
              <strong>30–60 chars</strong>
            </div>

            <div style={targetBox}>
              <span>Meta description</span>
              <strong>120–160 chars</strong>
            </div>

            <div style={targetBox}>
              <span>Instagram preview</span>
              <strong>125 chars</strong>
            </div>

            <div style={targetBox}>
              <span>X / Twitter</span>
              <strong>280 chars</strong>
            </div>

            <div style={tipBox}>
              <h3>Quick tip</h3>
              <p>
                For web writing, keep sentences short, paragraphs scannable and the first line strong enough to make people continue reading.
              </p>
            </div>

            <div style={tipBox}>
              <h3>Privacy note</h3>
              <p>
                Text analysis runs in your browser. Your drafts are not uploaded to a server by this tool.
              </p>
            </div>
          </aside>
        </section>

        <section style={contentSection}>
          <h2>Free word counter, character counter and text analyzer</h2>
          <p>
            This word counter helps writers, students, bloggers, marketers and business owners count words, characters,
            sentences, paragraphs, lines, reading time, speaking time and keyword density. It is useful for essays, articles,
            website pages, SEO titles, meta descriptions, social media captions, product descriptions, scripts and email drafts.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Word counter</h3>
              <p>
                Count the number of words in essays, articles, blogs, assignments, reports, product descriptions and website content.
                Word count is important when you need to meet academic, editorial or SEO content length requirements.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Character counter</h3>
              <p>
                Count characters with spaces and without spaces. This is useful for SEO titles, meta descriptions, ads, SMS text,
                social media posts and form limits.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Sentence and paragraph counter</h3>
              <p>
                Count sentences, paragraphs and lines to understand the structure of your writing. Short paragraphs and clear
                sentences improve online readability.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Reading time calculator</h3>
              <p>
                Estimate how long it takes to read your text based on words per minute. Reading time is useful for blog posts,
                articles, newsletters and landing pages.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Speaking time calculator</h3>
              <p>
                Estimate how long a script may take to speak. This helps with video scripts, voice-over scripts, speeches,
                presentations and podcast planning.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Keyword density checker</h3>
              <p>
                See the most repeated words and their density. This helps identify important topics, repeated terms and possible
                overuse in SEO content.
              </p>
            </div>

            <div style={seoCard}>
              <h3>SEO title and meta description checker</h3>
              <p>
                Check if your text fits common SEO title and meta description character ranges before publishing a page or blog post.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Private browser-based text analysis</h3>
              <p>
                Your text is analyzed locally in your browser. This makes the tool useful for drafts, private notes, business copy
                and unpublished content.
              </p>
            </div>
          </div>

          <h2>Popular use cases</h2>
          <ul style={tipList}>
            <li><strong>Students:</strong> check essay word count and paragraph count before submission.</li>
            <li><strong>Bloggers:</strong> estimate reading time and improve content structure.</li>
            <li><strong>SEO writers:</strong> check character limits for titles and meta descriptions.</li>
            <li><strong>Social media managers:</strong> plan captions and hooks that fit platform limits.</li>
            <li><strong>Video creators:</strong> estimate speaking time for scripts and voice-overs.</li>
            <li><strong>Editors:</strong> find long sentences and repeated keywords.</li>
          </ul>

          <h2>How word count and reading time are calculated</h2>
          <p>
            Word count is calculated by splitting text into readable word tokens. Character count includes every character, while
            character count without spaces removes whitespace. Reading time is estimated using your selected words-per-minute speed.
            Speaking time is estimated separately because most people speak slower than they read.
          </p>
        </section>

        <section style={faqSection}>
          <h2>Word Counter FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>Can I count characters with and without spaces?</h3>
              <p>Yes. The tool shows total characters and characters without spaces separately.</p>
            </div>

            <div style={faqItem}>
              <h3>How is reading time calculated?</h3>
              <p>Reading time is calculated by dividing the word count by your selected reading speed in words per minute.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I check keyword density?</h3>
              <p>Yes. The tool lists repeated keywords, count and percentage density while ignoring common stop words.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I use this for SEO titles?</h3>
              <p>Yes. The SEO section checks common title and meta description character ranges.</p>
            </div>

            <div style={faqItem}>
              <h3>Does this upload my text?</h3>
              <p>No. The analysis runs inside your browser. Your text is not uploaded by this tool.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I download my text?</h3>
              <p>Yes. Use Download TXT to save your current text as a plain text file.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function analyzeText(text, readingSpeed, speakingSpeed, caseSensitive) {
  const raw = String(text || '');
  const wordsArray = raw.match(/\b[\p{L}\p{N}'-]+\b/gu) || [];
  const words = wordsArray.length;
  const characters = raw.length;
  const charactersNoSpaces = raw.replace(/\s/g, '').length;
  const sentencesArray = raw.split(/[.!?]+/).map(item => item.trim()).filter(Boolean);
  const sentences = sentencesArray.length;
  const paragraphs = raw.split(/\n\s*\n/).map(item => item.trim()).filter(Boolean).length;
  const lines = raw ? raw.split(/\n/).length : 0;
  const uniqueWords = new Set(wordsArray.map(word => caseSensitive ? word : word.toLowerCase())).size;
  const averageWordLength = words ? (wordsArray.join('').length / words).toFixed(1) : '0';
  const averageSentenceLength = sentences ? Math.round(words / sentences) : 0;
  const readingMinutes = words / Math.max(1, readingSpeed);
  const speakingMinutes = words / Math.max(1, speakingSpeed);
  const keywords = getKeywordDensity(wordsArray, words, caseSensitive);
  const longSentences = getLongSentences(sentencesArray);
  const readability = getReadability(averageSentenceLength, Number(averageWordLength));

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    uniqueWords,
    averageWordLength,
    averageSentenceLength,
    readingTimeLabel: formatTime(readingMinutes),
    speakingTimeLabel: formatTime(speakingMinutes),
    keywords,
    longSentences,
    readability
  };
}

function getKeywordDensity(wordsArray, totalWords, caseSensitive) {
  if (!totalWords) return [];

  const counts = {};

  wordsArray.forEach(word => {
    const clean = caseSensitive ? word : word.toLowerCase();

    if (clean.length < 3 || STOP_WORDS.has(clean)) return;
    counts[clean] = (counts[clean] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([word, count]) => ({
      word,
      count,
      density: ((count / totalWords) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function getLongSentences(sentencesArray) {
  return sentencesArray
    .map(sentence => ({
      text: sentence.length > 150 ? `${sentence.slice(0, 150)}...` : sentence,
      wordCount: (sentence.match(/\b[\p{L}\p{N}'-]+\b/gu) || []).length
    }))
    .filter(item => item.wordCount >= 25)
    .slice(0, 8);
}

function getReadability(avgSentenceLength, avgWordLength) {
  if (!avgSentenceLength) {
    return {
      label: 'No text yet',
      desc: 'Add text to see readability feedback.',
      color: '#64748b'
    };
  }

  if (avgSentenceLength <= 14 && avgWordLength <= 5.2) {
    return {
      label: 'Easy to read',
      desc: 'Your text uses short sentences and clear word length.',
      color: '#34d399'
    };
  }

  if (avgSentenceLength <= 22 && avgWordLength <= 6) {
    return {
      label: 'Moderate',
      desc: 'Your text is readable, but some sentences may be improved.',
      color: '#fbbf24'
    };
  }

  return {
    label: 'Complex',
    desc: 'Try shortening long sentences and replacing difficult words where possible.',
    color: '#f87171'
  };
}

function formatTime(minutes) {
  if (!minutes || minutes <= 0) return '0 sec';

  const totalSeconds = Math.max(1, Math.round(minutes * 60));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  if (mins === 0) return `${secs} sec`;
  if (secs === 0) return `${mins} min`;

  return `${mins}m ${secs}s`;
}

function StatCard({ label, value, tone = 'default' }) {
  const color = tone === 'green' ? '#34d399' : tone === 'blue' ? '#38bdf8' : '#fff';

  return (
    <div style={statCard}>
      <span>{label}</span>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}

function LimitCheck({ label, value, min, max, unit }) {
  const status = getLimitStatus(value, min, max);

  return (
    <div style={limitCard}>
      <div style={limitTop}>
        <strong>{label}</strong>
        <span style={{ color: status.color }}>{status.label}</span>
      </div>

      <div style={limitBar}>
        <div style={{ ...limitFill, width: `${Math.min(100, (value / max) * 100)}%`, background: status.color }} />
      </div>

      <p style={limitText}>
        {value} / {max} {unit}
      </p>
    </div>
  );
}

function getLimitStatus(value, min, max) {
  if (value === 0) return { label: 'Empty', color: '#64748b' };
  if (value < min) return { label: 'Short', color: '#fbbf24' };
  if (value > max) return { label: 'Too Long', color: '#f87171' };
  return { label: 'Good', color: '#34d399' };
}

const pageWrap = { maxWidth: '1180px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '920px', margin: '0 auto', lineHeight: 1.75 };
const heroActions = { display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '24px' };

const appGrid = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', alignItems: 'start' };
const mainPanel = { display: 'grid', gap: '22px' };
const sidePanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '24px', position: 'sticky', top: '92px', display: 'grid', gap: '18px' };

const editorPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '18px' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' };
const sectionTitle = { color: '#fff', margin: 0, fontSize: '1.28rem' };
const sectionText = { color: '#94a3b8', lineHeight: 1.65, margin: '8px 0 0', fontSize: '0.92rem' };
const textareaStyle = { width: '100%', minHeight: '360px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '20px', padding: '22px', outline: 'none', resize: 'vertical', fontSize: '1rem', lineHeight: 1.7 };
const settingsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' };
const fieldWrap = { display: 'grid', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '13px', padding: '12px', outline: 'none' };
const checkWrap = { display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.9rem' };
const checkboxStyle = { width: '18px', height: '18px', accentColor: '#38bdf8' };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '12px' };
const statCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '16px', display: 'grid', gap: '8px', color: '#94a3b8' };

const insightGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' };
const insightCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '20px' };
const readabilityBadge = { display: 'inline-block', border: '1px solid #334155', borderRadius: '999px', padding: '9px 12px', fontWeight: 900, margin: '12px 0' };
const bigNumber = { color: '#38bdf8', fontSize: '2.2rem', fontWeight: 950, margin: '12px 0' };

const seoPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px' };
const seoCheckGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px', marginTop: '18px' };
const limitCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '15px' };
const limitTop = { display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#cbd5e1', marginBottom: '10px' };
const limitBar = { height: '9px', background: '#1e293b', borderRadius: '999px', overflow: 'hidden' };
const limitFill = { height: '100%', borderRadius: '999px', transition: 'width 0.3s ease' };
const limitText = { color: '#94a3b8', fontSize: '0.82rem', margin: '10px 0 0' };

const analysisGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' };
const listPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '22px' };
const keywordList = { display: 'grid', gap: '10px', marginTop: '14px' };
const keywordItem = { background: '#0f172a', border: '1px solid #334155', borderRadius: '13px', padding: '12px', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', color: '#cbd5e1' };
const sentenceList = { display: 'grid', gap: '10px', marginTop: '14px' };
const sentenceItem = { background: '#0f172a', border: '1px solid #334155', borderRadius: '13px', padding: '12px', display: 'grid', gap: '7px', color: '#cbd5e1', lineHeight: 1.55 };
const emptyText = { color: '#64748b', lineHeight: 1.6, margin: '14px 0 0' };

const sideTitle = { color: '#fff', margin: 0, fontSize: '1.15rem' };
const targetBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#94a3b8' };
const tipBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', color: '#94a3b8', lineHeight: 1.65, fontSize: '0.9rem' };

const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', borderRadius: '14px', padding: '12px 16px', fontWeight: 850, cursor: 'pointer' };
const ghostBtn = { background: 'transparent', color: '#38bdf8', border: '1px solid #334155', borderRadius: '14px', padding: '12px 16px', fontWeight: 850, cursor: 'pointer' };
const dangerBtn = { background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '14px', padding: '12px 16px', fontWeight: 850, cursor: 'pointer' };

const contentSection = { marginTop: '78px', borderTop: '1px solid #334155', paddingTop: '55px', color: '#cbd5e1', lineHeight: 1.85 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '30px 0' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '22px' };
const tipList = { paddingLeft: '20px', lineHeight: 1.9 };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px', color: '#cbd5e1', lineHeight: 1.8 };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };

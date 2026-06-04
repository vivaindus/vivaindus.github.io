import React, { useEffect, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

export default function UUIDGenerator() {
  const [count, setCount] = useState(10);
  const [uppercase, setUppercase] = useState(false);
  const [removeHyphens, setRemoveHyphens] = useState(false);
  const [notification, setNotification] = useState('');
  const [uuids, setUuids] = useState([]);

  const generateList = () => {
    const total = Math.min(1000, Math.max(1, Number(count) || 1));
    setUuids(Array.from({ length: total }, () => formatUuid(generateUuid(), uppercase, removeHyphens)));
  };

  useEffect(() => {
    generateList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (uuids.length) {
      setUuids(prev => prev.map(id => formatUuid(id.replace(/-/g, '').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5'), uppercase, removeHyphens)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uppercase, removeHyphens]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setNotification('UUIDs copied.');
    } catch {
      setNotification('Copy failed. Please select and copy manually.');
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'uuid-list.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotification('UUID list downloaded.');
  };

  return (
    <ToolboxLayout
      title="UUID Generator - Generate Random UUIDs and GUIDs Online"
      description="Generate UUID v4 and GUID values online. Create single or bulk random UUIDs, copy UUID lists, remove hyphens, uppercase output, download as text and learn how UUIDs are used."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based developer tool</p>
          <h1 style={heroTitle}>UUID Generator</h1>
          <p style={heroText}>
            Generate random UUID v4 values for databases, APIs, testing, sample data, software development,
            logs, configuration files, and unique identifiers.
          </p>
        </section>

        <section style={appGrid}>
          <div style={panel}>
            <h2 style={panelTitle}>Generator settings</h2>

            <div style={optionGrid}>
              <label style={fieldWrap}>
                <span style={fieldLabel}>How many UUIDs?</span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={count}
                  onChange={(e) => setCount(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))}
                  style={inputStyle}
                />
              </label>
            </div>

            <div style={checks}>
              <label><input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} /> Uppercase UUIDs</label>
              <label><input type="checkbox" checked={removeHyphens} onChange={(e) => setRemoveHyphens(e.target.checked)} /> Remove hyphens</label>
            </div>

            <div style={buttonRow}>
              <button onClick={generateList} style={primaryBtn}>Generate new UUIDs</button>
              <button onClick={copyAll} style={secondaryBtn}>Copy all</button>
              <button onClick={downloadTxt} style={secondaryBtn}>Download TXT</button>
            </div>
          </div>

          <div style={panel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>Generated UUIDs</h2>
              <span style={validBadge}>{uuids.length} created</span>
            </div>

            <pre style={outputBox}>{uuids.join('\n')}</pre>
          </div>
        </section>

        <section style={contentSection}>
          <h2>Generate UUIDs and GUIDs online</h2>
          <p>
            A UUID, also known as a universally unique identifier, is a 128-bit identifier commonly used in databases,
            APIs, distributed systems, logs, test data, file names, application records, and software development.
            UUIDs help identify records without relying on sequential numbers.
          </p>
          <p>
            This UUID generator creates random UUID v4 values in your browser. You can generate one UUID or create a
            bulk list, copy the result, download it as a text file, convert the output to uppercase, or remove hyphens
            when your system requires a compact identifier format.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}><h3>UUID v4 generator</h3><p>Create random UUID version 4 identifiers for development, testing, and data records.</p></div>
            <div style={seoCard}><h3>Bulk UUID generator</h3><p>Generate up to 1000 UUIDs at once and copy or download the list.</p></div>
            <div style={seoCard}><h3>GUID format</h3><p>UUID and GUID are often used interchangeably in many software and database systems.</p></div>
            <div style={seoCard}><h3>Private workflow</h3><p>The UUIDs are generated in your browser without requiring account creation.</p></div>
          </div>

          <h2>Common uses for UUIDs</h2>
          <ul style={listStyle}>
            <li>Database primary keys or external public IDs.</li>
            <li>API request IDs, correlation IDs, and tracking IDs.</li>
            <li>Test data generation for software projects.</li>
            <li>Unique file names, upload IDs, and session references.</li>
            <li>Distributed systems where many services create IDs independently.</li>
          </ul>

          <h2>UUID v4 format</h2>
          <p>
            A standard UUID is usually shown as five groups of hexadecimal characters separated by hyphens, such as
            550e8400-e29b-41d4-a716-446655440000. UUID v4 values are random-based identifiers. They are not designed
            to be human readable, but they are useful when a unique-looking identifier is needed across systems.
          </p>

          <h2>UUID safety notes</h2>
          <p>
            UUIDs are useful identifiers, but they should not be treated as passwords, secret tokens, or security keys.
            For authentication, password reset links, payment flows, and private access tokens, use proper cryptographic
            security practices and server-side validation.
          </p>

          <h2>FAQ</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Is this UUID generator free?</h3><p>Yes. You can generate UUIDs for free without creating an account.</p></div>
            <div style={seoCard}><h3>Can I generate multiple UUIDs?</h3><p>Yes. You can generate up to 1000 UUIDs at once.</p></div>
            <div style={seoCard}><h3>What is the difference between UUID and GUID?</h3><p>In many practical cases, UUID and GUID refer to the same type of unique identifier.</p></div>
            <div style={seoCard}><h3>Are UUIDs secret?</h3><p>No. UUIDs are identifiers, not secrets. Do not use them alone as passwords or secure tokens.</p></div>
          </div>
        </section>

        <RelatedTools currentPath="/uuidgenerator" />
      </div>
    </ToolboxLayout>
  );
}

function generateUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function formatUuid(uuid, uppercase, removeHyphens) {
  let out = String(uuid);
  if (removeHyphens) out = out.replace(/-/g, '');
  if (uppercase) out = out.toUpperCase();
  return out;
}

const pageWrap = { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 90px' };
const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900, fontSize: '0.78rem' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)', margin: '10px 0 16px' };
const heroText = { color: '#cbd5e1', maxWidth: '820px', margin: '0 auto', lineHeight: 1.7, fontSize: '1.08rem' };
const appGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '24px' };
const panel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '28px', marginBottom: '24px' };
const panelHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' };
const panelTitle = { color: '#fff', margin: 0, fontSize: '1.15rem' };
const optionGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '20px' };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.78rem', fontWeight: 900 };
const inputStyle = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', padding: '13px' };
const checks = { display: 'grid', gap: '10px', marginTop: '20px', color: '#cbd5e1', fontSize: '0.94rem' };
const buttonRow = { display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' };
const primaryBtn = { background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '14px', padding: '13px 18px', fontWeight: 900, cursor: 'pointer' };
const secondaryBtn = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '14px', padding: '13px 18px', fontWeight: 900, cursor: 'pointer' };
const validBadge = { color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const outputBox = { minHeight: '420px', maxHeight: '620px', overflow: 'auto', background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '16px', padding: '16px', lineHeight: 1.6, fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', boxSizing: 'border-box' };
const contentSection = { marginTop: '70px', color: '#cbd5e1', lineHeight: 1.8 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '24px' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const listStyle = { color: '#cbd5e1', lineHeight: 1.8, paddingLeft: '22px' };
const toast = { position: 'fixed', top: '86px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, zIndex: 1000 };

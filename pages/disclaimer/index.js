import React from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function Disclaimer() {
  return (
    <ToolboxLayout
      title="Disclaimer"
      description="Read the SHB ToolBox disclaimer about calculator results, financial tools, health tools, image tools, and general informational content."
    >
      <section style={pageWrap}>
        <div style={card}>
          <p style={eyebrow}>Important Notice</p>
          <h1 style={title}>Disclaimer</h1>
          <p style={muted}>Last updated: June 1, 2026</p>

          <p style={para}>
            SHB ToolBox provides free online utilities for general productivity, calculation, file formatting, image processing, and educational use. The information and results provided by our tools are intended to support everyday workflows, but they should not be treated as professional advice.
          </p>

          <h2 style={h2}>1. General Information Only</h2>
          <p style={para}>
            Content on this website is provided for general information. While we aim to keep tools reliable and easy to use, we cannot guarantee that every result will be complete, current, or suitable for every individual situation.
          </p>

          <h2 style={h2}>2. Financial and Business Calculators</h2>
          <p style={para}>
            EMI, SIP, percentage, invoice, tax, and other business-related tools may involve assumptions, rounding, or user-entered values. Always verify important financial, tax, accounting, or compliance outputs with official guidance or a qualified professional before relying on them.
          </p>

          <h2 style={h2}>3. Health and Personal Tools</h2>
          <p style={para}>
            Tools such as BMI calculators, age calculators, reaction tests, and similar utilities are not medical tools. They do not diagnose, treat, or replace advice from a healthcare professional.
          </p>

          <h2 style={h2}>4. File, Image, and Text Tools</h2>
          <p style={para}>
            Image converters, PDF tools, QR tools, text tools, and file utilities are provided for convenience. You are responsible for checking output quality, file compatibility, copyright permissions, and correct usage before publishing or sharing generated files.
          </p>

          <h2 style={h2}>5. No Warranty</h2>
          <p style={para}>
            SHB ToolBox is provided on an “as available” basis. We do not make warranties that the website will always be uninterrupted, error-free, or free from technical limitations.
          </p>

          <h2 style={h2}>6. Contact</h2>
          <p style={para}>
            For questions about this disclaimer, contact us at <strong>support@shbstores.com</strong>.
          </p>
        </div>
      </section>
    </ToolboxLayout>
  );
}

const pageWrap = { maxWidth: '950px', margin: '0 auto', padding: '60px 20px' };
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '40px', lineHeight: 1.8 };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em' };
const title = { fontSize: '2.6rem', margin: '10px 0', color: '#fff' };
const muted = { color: '#94a3b8', marginBottom: '30px' };
const h2 = { color: '#fff', fontSize: '1.35rem', marginTop: '30px', marginBottom: '10px' };
const para = { color: '#cbd5e1', fontSize: '1rem', marginBottom: '16px' };

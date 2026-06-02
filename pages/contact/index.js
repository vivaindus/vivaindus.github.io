import React from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function Contact() {
  return (
    <ToolboxLayout
      title="Contact Us"
      description="Contact SHB ToolBox for support, tool feedback, correction requests, business inquiries, and general questions."
    >
      <section style={pageWrap}>
        <div style={heroCard}>
          <p style={eyebrow}>Support and feedback</p>
          <h1 style={title}>Contact SHB ToolBox</h1>
          <p style={intro}>
            We welcome questions, bug reports, correction requests, and suggestions for improving our free online tools.
            If a calculator, converter, image tool, or productivity utility is not working as expected, please contact us
            with the page name and a short description of the issue.
          </p>
        </div>

        <div style={grid}>
          <div style={card}>
            <h2 style={cardTitle}>Email Support</h2>
            <p style={para}>
              For tool issues, content corrections, privacy questions, advertising inquiries, or general support,
              email us at:
            </p>
            <p style={emailText}>support@shbstores.com</p>
            <p style={note}>
              Helpful details include the tool page URL, the device or browser you used, and what result you expected.
            </p>
          </div>

          <div style={card}>
            <h2 style={cardTitle}>WhatsApp Support</h2>
            <p style={para}>
              For quick communication, you can also contact us through WhatsApp. Please keep your message clear and include
              the name of the tool or page you are asking about.
            </p>
            <a
              href="https://wa.me/971543768200"
              target="_blank"
              rel="noopener noreferrer"
              style={whatsappBtn}
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div style={infoBox}>
          <h2 style={sectionTitle}>What we can help with</h2>
          <ul style={list}>
            <li>Reporting a broken tool, calculation issue, download problem, or display error.</li>
            <li>Suggesting improvements to invoice, finance, image, PDF, QR, text, and productivity tools.</li>
            <li>Requesting correction of outdated information, unclear wording, or missing guidance.</li>
            <li>Asking questions about privacy, local browser processing, advertising, or website policies.</li>
          </ul>
        </div>
      </section>
    </ToolboxLayout>
  );
}

const pageWrap = { maxWidth: '1050px', margin: '0 auto', padding: '60px 20px 90px' };
const heroCard = { background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(15,23,42,0.9))', border: '1px solid #334155', borderRadius: '28px', padding: '42px', marginBottom: '24px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, fontSize: '0.78rem', marginBottom: '12px' };
const title = { color: '#fff', fontSize: '2.8rem', lineHeight: 1.1, margin: '0 0 18px' };
const intro = { color: '#cbd5e1', lineHeight: 1.8, fontSize: '1.05rem', maxWidth: '820px' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' };
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '30px' };
const cardTitle = { color: '#38bdf8', margin: '0 0 14px', fontSize: '1.35rem' };
const para = { color: '#cbd5e1', lineHeight: 1.75, margin: '0 0 16px' };
const emailText = { color: '#fff', fontWeight: 900, fontSize: '1.25rem', wordBreak: 'break-word' };
const note = { color: '#94a3b8', lineHeight: 1.6, fontSize: '0.92rem', marginTop: '16px' };
const whatsappBtn = { display: 'inline-block', marginTop: '8px', background: '#25D366', color: '#052e16', padding: '13px 22px', borderRadius: '999px', textDecoration: 'none', fontWeight: 900 };
const infoBox = { marginTop: '24px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '24px', padding: '30px' };
const sectionTitle = { color: '#fff', margin: '0 0 14px', fontSize: '1.45rem' };
const list = { color: '#cbd5e1', lineHeight: 1.9, paddingLeft: '22px', margin: 0 };

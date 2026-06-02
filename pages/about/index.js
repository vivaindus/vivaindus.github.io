import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function About() {
  return (
    <ToolboxLayout
      title="About Us"
      description="Learn about SHB ToolBox, a free online utility website by SHB Stores offering browser-based tools for business, images, text, finance, productivity, and daily calculations."
    >
      <section style={pageWrap}>
        <div style={heroCard}>
          <p style={eyebrow}>About the platform</p>
          <h1 style={title}>About SHB ToolBox</h1>
          <p style={intro}>
            SHB ToolBox is a free online utility platform by SHB Stores. We provide practical browser-based tools
            for business documents, finance calculations, image processing, PDF workflows, QR generation, text formatting,
            passwords, productivity, and everyday digital tasks.
          </p>
        </div>

        <div style={grid}>
          <div style={card}>
            <h2 style={cardTitle}>Our mission</h2>
            <p style={para}>
              Our mission is to make useful digital tools simple, accessible, and easy to understand. Instead of installing
              multiple apps or searching different websites for small tasks, users can open SHB ToolBox and find organized
              tools in one place.
            </p>
            <p style={para}>
              We focus on practical workflows: creating invoices, compressing images, converting documents, checking
              calculations, preparing text, generating QR codes, and completing daily tasks faster.
            </p>
          </div>

          <div style={card}>
            <h2 style={cardTitle}>Privacy-first approach</h2>
            <p style={para}>
              Many tools on SHB ToolBox are designed with a client-side-first approach. This means calculations and file
              processing are handled directly in your browser where possible, reducing unnecessary data transfer and helping
              users stay in control of their content.
            </p>
            <p style={para}>
              This approach is especially helpful for people working with private notes, business values, product images,
              invoice details, and other sensitive day-to-day information.
            </p>
          </div>

          <div style={card}>
            <h2 style={cardTitle}>Who can use it?</h2>
            <p style={para}>
              SHB ToolBox is built for small business owners, students, freelancers, office workers, content creators,
              developers, and general users who need quick tools without complicated setup.
            </p>
            <p style={para}>
              The website is designed to be usable without creating an account, so visitors can open a tool and complete
              a task quickly.
            </p>
          </div>

          <div style={card}>
            <h2 style={cardTitle}>Accuracy and improvement</h2>
            <p style={para}>
              We aim to keep tools clear, reliable, and useful. However, outputs from calculators, invoice tools, health
              tools, and financial utilities should always be reviewed before being used for important decisions.
            </p>
            <p style={para}>
              We continue to improve tool pages, fix errors, update explanations, and expand useful features based on real
              user needs and feedback.
            </p>
          </div>
        </div>

        <div style={commitmentBox}>
          <h2 style={sectionTitle}>Our commitment to useful content</h2>
          <p style={para}>
            SHB ToolBox is not only a collection of buttons and forms. Each major tool page includes explanations, use cases,
            limitations, and practical guidance so users understand what the tool does and how to use the result responsibly.
          </p>
          <p style={para}>
            We believe free tools should still provide real value: clear layouts, understandable instructions, privacy notes,
            and helpful context for business, education, content creation, and personal productivity.
          </p>
          <Link href="/contact" style={primaryLink}>Contact us with feedback</Link>
        </div>
      </section>
    </ToolboxLayout>
  );
}

const pageWrap = { maxWidth: '1100px', margin: '0 auto', padding: '60px 20px 90px' };
const heroCard = { background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(15,23,42,0.9))', border: '1px solid #334155', borderRadius: '28px', padding: '42px', marginBottom: '24px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, fontSize: '0.78rem', marginBottom: '12px' };
const title = { color: '#fff', fontSize: '2.8rem', lineHeight: 1.1, margin: '0 0 18px' };
const intro = { color: '#cbd5e1', lineHeight: 1.8, fontSize: '1.05rem', maxWidth: '850px' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' };
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '30px' };
const cardTitle = { color: '#38bdf8', margin: '0 0 14px', fontSize: '1.35rem' };
const para = { color: '#cbd5e1', lineHeight: 1.8, fontSize: '0.98rem', margin: '0 0 14px' };
const commitmentBox = { marginTop: '24px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '24px', padding: '32px' };
const sectionTitle = { color: '#fff', margin: '0 0 14px', fontSize: '1.55rem' };
const primaryLink = { display: 'inline-block', marginTop: '8px', background: '#38bdf8', color: '#082f49', textDecoration: 'none', padding: '12px 20px', borderRadius: '999px', fontWeight: 900 };

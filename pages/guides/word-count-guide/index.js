import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../../components/ToolboxLayout';
import RelatedTools from '../../../components/RelatedTools';

export default function WordCountGuide() {
  return (
    <ToolboxLayout
      title="Word Count Guide for Articles, Essays and Social Media"
      description="Learn how word count, character count, reading time, paragraphs and sentence length affect writing for SEO, essays, social media and business content."
    >
      <main style={pageWrap}>
        <article style={articleCard}>
          <p style={eyebrow}>Writing Guide</p>
          <h1 style={title}>Word Count Guide for Articles, Essays and Social Media</h1>

          <p style={intro}>
            Word count is more than just a number. It helps writers, students, marketers, bloggers, job seekers,
            and business owners keep content clear, structured, and suitable for the platform where it will be used.
            Character count, reading time, sentence length, and paragraph structure can all affect how easy your text is to read.
          </p>

          <div style={ctaBox}>
            <div>
              <h2 style={ctaTitle}>Need to check text now?</h2>
              <p style={ctaText}>
                Use SHB ToolBox Word Counter to count words, characters, sentences, paragraphs, reading time, and content length
                directly in your browser.
              </p>
            </div>
            <Link href="/wordcounter" style={primaryBtn}>Open Word Counter</Link>
          </div>

          <section style={section}>
            <h2 style={h2}>Why word count matters</h2>
            <p style={para}>
              Different types of writing have different length expectations. A short social media caption needs to be direct.
              A blog article needs enough detail to answer the reader’s question. An essay may need to meet a required word limit.
              A meta description or title needs to stay short enough to display properly in search results.
            </p>
            <p style={para}>
              Checking word count while writing helps you avoid text that is too short, too long, repetitive, or difficult to read.
              It also helps you plan sections, summaries, introductions, and calls to action more clearly.
            </p>
          </section>

          <section style={section}>
            <h2 style={h2}>Common word count use cases</h2>
            <div style={checkGrid}>
              <div style={checkCard}>
                <h3 style={h3}>Blog articles</h3>
                <p style={paraSmall}>Check total length, paragraph structure, reading time, and section balance.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Essays and assignments</h3>
                <p style={paraSmall}>Stay within required word limits and avoid submitting text that is too short.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Social captions</h3>
                <p style={paraSmall}>Keep hooks short, readable, and suitable for fast scrolling users.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>SEO content</h3>
                <p style={paraSmall}>Review title length, description length, article structure, and keyword usage naturally.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Emails and proposals</h3>
                <p style={paraSmall}>Make business writing concise while still including important details.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Product descriptions</h3>
                <p style={paraSmall}>Write clear product copy without making descriptions too thin or too long.</p>
              </div>
            </div>
          </section>

          <section style={section}>
            <h2 style={h2}>Step-by-step: improve writing using a word counter</h2>
            <ol style={steps}>
              <li>
                <strong>Paste your draft.</strong>
                <span>Start by checking your full text without editing anything.</span>
              </li>
              <li>
                <strong>Check total word count.</strong>
                <span>Compare the length with your target, assignment requirement, or content goal.</span>
              </li>
              <li>
                <strong>Review character count.</strong>
                <span>This is useful for titles, descriptions, captions, bios, and short-form content.</span>
              </li>
              <li>
                <strong>Check sentence and paragraph count.</strong>
                <span>Very long paragraphs can make content harder to read on mobile screens.</span>
              </li>
              <li>
                <strong>Look at reading time.</strong>
                <span>Reading time helps you understand how much effort the reader needs to finish the content.</span>
              </li>
              <li>
                <strong>Edit for clarity.</strong>
                <span>Remove repeated words, split long paragraphs, and make the main point easier to understand.</span>
              </li>
            </ol>
          </section>

          <section style={section}>
            <h2 style={h2}>Word count vs character count</h2>
            <div style={exampleBox}>
              <p><strong>Word count:</strong> useful for essays, articles, reports, blog posts, and assignments.</p>
              <p><strong>Character count:</strong> useful for meta titles, meta descriptions, usernames, bios, captions, and SMS-style limits.</p>
              <p><strong>Reading time:</strong> useful for blogs, newsletters, learning content, and long business messages.</p>
              <p><strong>Paragraph count:</strong> useful for readability, especially on mobile screens.</p>
            </div>
          </section>

          <section style={section}>
            <h2 style={h2}>Writing mistakes a word counter can help you find</h2>
            <ul style={list}>
              <li>Text that is much shorter than the required limit.</li>
              <li>Very long paragraphs that are difficult to read.</li>
              <li>Overly long introductions before the main point.</li>
              <li>Social captions that lose the hook before the important message.</li>
              <li>Product descriptions that are too thin to explain the value.</li>
              <li>Blog drafts with no structure or uneven section lengths.</li>
            </ul>
          </section>

          <section style={section}>
            <h2 style={h2}>FAQ: Word count and character count</h2>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I count words online for free?</h3>
              <p style={paraSmall}>
                Yes. SHB ToolBox Word Counter lets you count words, characters, sentences, paragraphs, and reading time for free.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Is reading time exact?</h3>
              <p style={paraSmall}>
                Reading time is an estimate. Actual reading speed depends on the reader, language, topic difficulty, and formatting.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Should I write more words for SEO?</h3>
              <p style={paraSmall}>
                More words do not automatically mean better SEO. The content should answer the user’s question clearly and use useful structure.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I use a word counter for social media captions?</h3>
              <p style={paraSmall}>
                Yes. Character and word counts are useful for hooks, captions, short bios, and promotional posts.
              </p>
            </div>
          </section>

          <div style={buttonRow}>
            <Link href="/wordcounter" style={primaryBtn}>Open Word Counter</Link>
            <Link href="/caseconverter" style={secondaryBtn}>Open Case Converter</Link>
          </div>

          <RelatedTools currentPath="/wordcounter" />
        </article>
      </main>
    </ToolboxLayout>
  );
}

const pageWrap = { maxWidth: '1050px', margin: '0 auto', padding: '60px 20px 90px' };
const articleCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '42px', lineHeight: 1.85 };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.08em' };
const title = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.05, margin: '10px 0 20px' };
const intro = { color: '#cbd5e1', fontSize: '1.12rem', maxWidth: '850px' };
const section = { marginTop: '52px' };
const h2 = { color: '#fff', fontSize: '1.75rem', marginBottom: '14px' };
const h3 = { color: '#38bdf8', fontSize: '1.05rem', margin: '0 0 8px' };
const para = { color: '#cbd5e1', fontSize: '1rem', marginBottom: '16px' };
const paraSmall = { color: '#94a3b8', fontSize: '0.95rem', margin: 0 };
const ctaBox = { marginTop: '30px', display: 'flex', gap: '22px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', background: '#0f172a', border: '1px solid #334155', borderRadius: '22px', padding: '24px' };
const ctaTitle = { color: '#fff', margin: '0 0 8px', fontSize: '1.25rem' };
const ctaText = { color: '#94a3b8', margin: 0, maxWidth: '650px' };
const primaryBtn = { background: '#38bdf8', color: '#0f172a', textDecoration: 'none', padding: '14px 20px', borderRadius: '14px', fontWeight: 900, display: 'inline-block' };
const secondaryBtn = { background: '#0f172a', color: '#fff', textDecoration: 'none', padding: '14px 20px', borderRadius: '14px', fontWeight: 900, display: 'inline-block', border: '1px solid #334155' };
const checkGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '22px' };
const checkCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const steps = { color: '#cbd5e1', display: 'grid', gap: '16px', paddingLeft: '22px' };
const exampleBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '22px', color: '#cbd5e1' };
const list = { color: '#cbd5e1', paddingLeft: '22px' };
const buttonRow = { display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '40px' };
const faqItem = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', marginBottom: '14px' };
const faqQ = { color: '#fff', fontSize: '1rem', margin: '0 0 8px' };

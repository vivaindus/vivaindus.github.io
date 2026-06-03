import React, { useState } from 'react';
import Link from 'next/link';
import ToolboxLayout, { toolGroups } from '../components/ToolboxLayout';

const toolDetails = {
  '/invoicegenerator': 'Create clean UAE-ready invoices with item lines, totals, tax details, discounts, signatures, printable PDF output, and browser draft saving.',
  '/emicalculator': 'Estimate monthly loan payments, total interest, repayment schedules, interest types, and practical repayment strategies.',
  '/sipcalculator': 'Plan monthly investments with compounding projections, long-term growth estimates, step-up SIP options, and easy-to-read summaries.',
  '/percentagecalculator': 'Calculate percentage change, discount, markup, margin, VAT-style additions, reverse percentages, and commercial math faster.',
  '/tasklist': 'Organize priorities, track tasks, manage due dates, add notes, filter work, and export clean visual task lists without creating an account.',

  '/imagecompressor': 'Compress images directly in your browser to reduce file size while keeping useful visual quality for websites, forms, and sharing.',
  '/imageresizer': 'Resize photos for websites, forms, social media, thumbnails, passport-style dimensions, and custom pixel sizes.',
  '/pdftoimage': 'Convert PDF pages into high-resolution PNG or JPG image files for sharing, previews, document workflows, and page extraction.',
  '/imagetopdf': 'Combine multiple JPG, PNG, WebP, and photo scans into a clean PDF document with page size, margin, fit, crop, and numbering options.',
  '/pdfmerge': 'Merge multiple PDF files into one organized document with first-page thumbnails, drag-and-drop ordering, and downloadable output.',
  '/pdfsplit': 'Split PDF files by page range, extract selected pages, or separate every page into smaller PDF documents directly in the browser.',
  '/pdfcompressor': 'Reduce PDF file size for email, WhatsApp, online forms, visa portals, job applications, school uploads, and document sharing.',
  '/pdfeditor': 'Edit and annotate PDF files by adding text, signatures, stamps, images, highlights, boxes, headers, footers, page numbers, and metadata.',
  '/signaturemaker': 'Create transparent digital signatures by drawing, typing, or cleaning uploaded signature images for invoices, forms, PDFs, and documents.',
  '/passportphoto': 'Create passport, visa, ID, and application photos with crop controls, background options, common presets, and printable photo sheets.',

  '/favicongen': 'Generate favicon and app icon files for websites, browser tabs, mobile shortcuts, PWA icons, and branding packages.',
  '/thumbnaildownloader': 'Preview and download available public YouTube video thumbnails in multiple resolutions for research, blogs, and content planning.',
  '/qrcode': 'Generate QR codes for links, WiFi, contact details, WhatsApp, email, phone, SMS, locations, events, and bulk business use.',
  '/caseconverter': 'Convert text into uppercase, lowercase, title case, sentence case, camelCase, snake_case, kebab-case, and more.',
  '/wordcounter': 'Count words, characters, sentences, paragraphs, reading time, keyword density, and content limits for articles and documents.',
  '/passwordgen': 'Generate strong random passwords locally with practical strength indicators, passphrase options, history controls, and copy-friendly output.',
  '/unitconverter': 'Convert common measurement units, technical units, digital storage, cooking units, and regional land units with simple input controls.',
  '/cpstest': 'Measure clicks per second with focused speed tests, timer modes, rank-based results, and performance tracking.',
  '/reactiontest': 'Check reaction speed in milliseconds with single-round and multi-round modes, averages, best score, consistency, and false-start tracking.',
  '/bmicalculator': 'Calculate BMI and review general body mass index categories with privacy-first local calculation and simple health guidance.',
  '/agecalculator': 'Calculate exact age, time lived, next birthday countdown, date differences, and useful life milestone details.'
};

export default function Home() {
  const [expandedTool, setExpandedTool] = useState(null);

  return (
    <ToolboxLayout
      title="Free Online Tools for Business, Images, Text, Finance and Daily Calculations"
      description="SHB ToolBox offers free browser-based utilities for invoices, calculators, image conversion, PDF tools, QR codes, text formatting, passwords, health checks, and productivity."
    >
      <section style={hero}>
        <div style={heroInner}>
          <p style={eyebrow}>Free browser-based utility suite</p>
          <h1 style={heroTitle}>
            Practical online tools for business, images, text, finance, and everyday work.
          </h1>
          <p style={heroText}>
            SHB ToolBox brings together fast, privacy-first utilities that work directly in your browser.
            Use calculators, invoice tools, image tools, PDF converters, QR generators, text tools,
            and productivity helpers without installing software or creating an account.
          </p>

          <div style={heroActions}>
            <a href="#tools" style={primaryBtn}>Browse All Tools</a>
            <Link href="/about" style={secondaryBtn}>About SHB ToolBox</Link>
          </div>

          <div style={trustGrid}>
            <div style={trustItem}><strong>20+ Tools</strong><span>Organized by workflow</span></div>
            <div style={trustItem}><strong>Client-Side First</strong><span>Designed for privacy</span></div>
            <div style={trustItem}><strong>No Login Required</strong><span>Open and use instantly</span></div>
          </div>
        </div>
      </section>

      <main style={wrap}>
        <section style={introGrid}>
          <div style={infoCard}>
            <h2 style={sectionTitle}>Why use SHB ToolBox?</h2>
            <p style={para}>
              Many people use different websites for small daily tasks: resizing an image, preparing an invoice,
              calculating loan payments, counting words, generating QR codes, or converting files. SHB ToolBox
              keeps these useful utilities in one place with a clean interface and clear categories.
            </p>
            <p style={para}>
              The goal is simple: reduce time wasted on repetitive digital work while keeping tools easy to understand.
              Each tool page includes practical explanations, usage guidance, and privacy notes so visitors can make
              informed decisions before using the utility.
            </p>
          </div>

          <div style={infoCard}>
            <h2 style={sectionTitle}>Privacy-first utility design</h2>
            <p style={para}>
              SHB ToolBox is built with a client-side-first approach. Tools such as image compression, text conversion,
              password generation, and many calculators are designed to process data in your browser instead of requiring
              unnecessary uploads.
            </p>
            <p style={para}>
              This is especially useful for users handling business documents, personal photos, draft content, invoice
              details, or private calculations. You stay in control of what you enter and what you download.
            </p>
          </div>
        </section>

        <section id="tools" style={{ marginTop: '70px' }}>
          <div style={sectionHead}>
            <p style={eyebrow}>Tool directory</p>
            <h2 style={sectionTitle}>Choose a tool by category</h2>
            <p style={sectionDesc}>
              Browse our main utility categories below. Each card links to a dedicated tool page with its own interface,
              explanation, and practical use cases.
            </p>
          </div>

          {Object.keys(toolGroups).map(groupKey => (
            <section key={groupKey} style={groupSection}>
              <div style={groupHeader}>
                <span style={groupIcon}>{toolGroups[groupKey].icon}</span>
                <div>
                  <h2 style={groupTitle}>{toolGroups[groupKey].label}</h2>
                  <p style={groupSub}>{getGroupDescription(groupKey)}</p>
                </div>
              </div>

              <div style={toolGrid}>
                {toolGroups[groupKey].tools.map(tool => (
                  <article key={tool.href} style={toolCard}>
                    <h3 style={toolTitle}>{tool.name}</h3>
                    <p style={toolDesc}>{toolDetails[tool.href] || tool.desc}</p>

                    {expandedTool === tool.name ? (
                      <div style={expandBox}>
                        <p style={expandText}>
                          This tool is designed for quick practical use with a simple interface, helpful explanations,
                          and privacy-conscious processing where possible. Review the tool page for specific features,
                          examples, and output options.
                        </p>
                        <button onClick={() => setExpandedTool(null)} style={btnLink}>Show Less</button>
                      </div>
                    ) : (
                      <button onClick={() => setExpandedTool(tool.name)} style={btnLink}>Learn More</button>
                    )}

                    <Link href={tool.href} style={btnOpen}>Open Tool</Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>

        <section style={audienceSection}>
          <div style={sectionHead}>
            <p style={eyebrow}>Who it helps</p>
            <h2 style={sectionTitle}>Built for common daily workflows</h2>
          </div>

          <div style={audienceGrid}>
            <div style={smallCard}>
              <h3 style={smallTitle}>Small businesses</h3>
              <p style={para}>Prepare invoices, calculate percentages, create QR codes, resize product images, and handle document tasks faster.</p>
            </div>
            <div style={smallCard}>
              <h3 style={smallTitle}>Students and professionals</h3>
              <p style={para}>Count words, convert text cases, calculate dates, generate passwords, and manage quick productivity tasks.</p>
            </div>
            <div style={smallCard}>
              <h3 style={smallTitle}>Design and content users</h3>
              <p style={para}>Compress images, resize visuals, convert images to PDFs, extract PDF pages, and prepare web icons.</p>
            </div>
          </div>
        </section>

                <section style={faqSection}>
          <div style={sectionHead}>
            <p style={eyebrow}>Questions</p>
            <h2 style={sectionTitle}>Frequently asked questions</h2>
          </div>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3 style={faqQ}>Is SHB ToolBox free?</h3>
              <p style={para}>Yes. The tools are available for free and can be used without creating an account.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Do I need to install anything?</h3>
              <p style={para}>No. SHB ToolBox runs in your web browser, so you can open a tool page and start using it directly.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Are my files uploaded to a server?</h3>
              <p style={para}>Many tools are designed to work locally in your browser. Always check the notes on each tool page for feature-specific details.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I use these tools for business work?</h3>
              <p style={para}>Yes, but important financial, legal, tax, medical, or compliance outputs should be reviewed with a qualified professional.</p>
            </div>
          </div>
        </section>

        <section style={guidesSection}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <p style={eyebrow}>Learn with SHB ToolBox</p>
            <h2 style={sectionTitle}>Helpful Guides</h2>
            <p style={sectionText}>
              Practical guides that explain how to use online tools for business documents, PDF work, image editing,
              content writing, and everyday calculations.
            </p>
          </div>

          <div style={guideGrid}>
            <Link href="/guides/how-to-create-uae-tax-invoice" style={guideCard}>
              <span style={guideTag}>Business & VAT</span>
              <h3 style={guideTitle}>How to Create a UAE Tax Invoice Online</h3>
              <p style={guideDesc}>
                Learn what to include in a UAE invoice, how VAT and TRN details work, common invoice mistakes,
                and how to create a printable tax invoice online.
              </p>
              <span style={guideCta}>Read guide →</span>
            </Link>

            <Link href="/guides/how-to-compress-pdf-without-losing-quality" style={guideCard}>
              <span style={guideTag}>PDF Tools</span>
              <h3 style={guideTitle}>How to Compress PDF Without Losing Quality</h3>
              <p style={guideDesc}>
                Learn why PDFs become large, how to choose the right compression level, and how to keep scanned
                pages, signatures, stamps, tables, and small text readable.
              </p>
              <span style={guideCta}>Read guide →</span>
            </Link>

            <Link href="/guides/how-to-edit-and-sign-pdf-online" style={guideCard}>
              <span style={guideTag}>PDF Editing</span>
              <h3 style={guideTitle}>How to Edit and Sign a PDF Online</h3>
              <p style={guideDesc}>
                Learn how to add text, signatures, stamps, images, highlights, boxes, page numbers, headers, footers,
                and metadata to PDF files safely.
              </p>
              <span style={guideCta}>Read guide →</span>
            </Link>

            <Link href="/guides/how-to-resize-image-for-online-forms" style={guideCard}>
              <span style={guideTag}>Image Tools</span>
              <h3 style={guideTitle}>How to Resize Images for Online Forms</h3>
              <p style={guideDesc}>
                Learn how to resize, crop, compress, and convert images for applications, portals, websites,
                passport photos, product photos, and document uploads.
              </p>
              <span style={guideCta}>Read guide →</span>
            </Link>

            <Link href="/guides/word-count-guide" style={guideCard}>
              <span style={guideTag}>Writing Tools</span>
              <h3 style={guideTitle}>Word Count Guide for Articles, Essays and Social Media</h3>
              <p style={guideDesc}>
                Learn how word count, character count, reading time, paragraph structure, and sentence length affect
                essays, articles, captions, SEO content, and business writing.
              </p>
              <span style={guideCta}>Read guide →</span>
            </Link>
          </div>
        </section>
      </main>
    </ToolboxLayout>
  );
}

function getGroupDescription(groupKey) {
  const descriptions = {
    business: 'Finance, invoice, percentage, investment, repayment, and productivity tools for practical work.',
    images: 'Image, PDF, favicon, thumbnail, and QR utilities for websites, documents, and content creation.',
    text: 'Writing, formatting, password, counting, and conversion tools for daily digital tasks.',
    health: 'Simple calculators and speed tests for general awareness, timing, and personal reference.'
  };

  return descriptions[groupKey] || 'Useful browser-based tools for common tasks.';
}

const hero = {
  background: 'radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 35%), linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
  padding: '105px 20px',
  textAlign: 'center',
  borderBottom: '1px solid #334155'
};

const heroInner = { maxWidth: '980px', margin: '0 auto' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, fontSize: '0.78rem', marginBottom: '14px' };
const heroTitle = { fontSize: 'clamp(2.25rem, 5vw, 4.7rem)', lineHeight: 1.04, fontWeight: 950, margin: '0 0 22px', color: '#fff' };
const heroText = { color: '#cbd5e1', fontSize: '1.18rem', lineHeight: 1.75, maxWidth: '820px', margin: '0 auto' };
const heroActions = { display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '34px' };
const primaryBtn = { background: '#38bdf8', color: '#082f49', textDecoration: 'none', padding: '14px 22px', borderRadius: '999px', fontWeight: 900 };
const secondaryBtn = { background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', textDecoration: 'none', padding: '14px 22px', borderRadius: '999px', border: '1px solid #334155', fontWeight: 800 };
const trustGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', margin: '44px auto 0', maxWidth: '760px' };
const trustItem = { background: 'rgba(15,23,42,0.72)', border: '1px solid #334155', borderRadius: '18px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#94a3b8' };

const wrap = { maxWidth: '1200px', margin: '0 auto', padding: '70px 20px 90px' };
const introGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' };
const infoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '32px' };
const sectionHead = { maxWidth: '780px', marginBottom: '34px' };
const sectionTitle = { color: '#fff', fontSize: '2rem', lineHeight: 1.2, margin: '0 0 14px' };
const sectionDesc = { color: '#94a3b8', lineHeight: 1.75, fontSize: '1rem' };
const para = { color: '#cbd5e1', lineHeight: 1.8, fontSize: '0.98rem', margin: '0 0 14px' };

const groupSection = { marginTop: '60px' };
const groupHeader = { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' };
const groupIcon = { fontSize: '2.1rem' };
const groupTitle = { color: '#fff', fontSize: '1.65rem', margin: '0 0 8px' };
const groupSub = { color: '#94a3b8', margin: 0, lineHeight: 1.6 };
const toolGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: '20px' };
const toolCard = { background: '#1e293b', borderRadius: '22px', padding: '26px', border: '1px solid #334155', position: 'relative', minHeight: '245px', paddingBottom: '76px', boxShadow: '0 12px 28px rgba(0,0,0,0.18)' };
const toolTitle = { color: '#38bdf8', margin: '0 0 12px', fontSize: '1.15rem' };
const toolDesc = { color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '16px' };
const expandBox = { borderTop: '1px solid #334155', paddingTop: '14px', marginTop: '12px' };
const expandText = { fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 10px' };
const btnLink = { background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0, fontSize: '0.82rem', fontWeight: 900 };
const btnOpen = { position: 'absolute', bottom: '22px', right: '22px', background: '#38bdf8', color: '#0f172a', textDecoration: 'none', padding: '11px 18px', borderRadius: '12px', fontSize: '0.76rem', fontWeight: 900 };

const audienceSection = { marginTop: '80px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid #334155', borderRadius: '28px', padding: '42px' };
const audienceGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' };
const smallCard = { background: 'rgba(15,23,42,0.65)', border: '1px solid #334155', borderRadius: '20px', padding: '24px' };
const smallTitle = { color: '#fff', margin: '0 0 12px', fontSize: '1.1rem' };

const faqSection = { marginTop: '80px' };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' };
const faqItem = { background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '24px' };
const faqQ = { color: '#fff', fontSize: '1rem', margin: '0 0 10px' };
const guidesSection = {
  marginTop: '80px',
  padding: '50px 30px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '28px'
};

const sectionText = {
  color: '#94a3b8',
  maxWidth: '780px',
  margin: '0 auto',
  lineHeight: 1.7
};

const guideGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px'
};

const guideCard = {
  display: 'block',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '20px',
  padding: '24px',
  textDecoration: 'none',
  transition: '0.2s'
};

const guideTag = {
  display: 'inline-block',
  color: '#0f172a',
  background: '#38bdf8',
  padding: '5px 10px',
  borderRadius: '999px',
  fontSize: '0.72rem',
  fontWeight: 900,
  marginBottom: '14px'
};

const guideTitle = {
  color: '#fff',
  fontSize: '1.25rem',
  margin: '0 0 10px'
};

const guideDesc = {
  color: '#94a3b8',
  lineHeight: 1.7,
  fontSize: '0.95rem'
};

const guideCta = {
  color: '#38bdf8',
  fontWeight: 900,
  fontSize: '0.9rem'
};

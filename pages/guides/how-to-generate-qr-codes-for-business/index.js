import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../../components/ToolboxLayout';

export default function QRBusinessGuide() {
  return (
    <ToolboxLayout
      title="How to Generate QR Codes for Business"
      description="A complete guide to creating QR codes for business. Learn QR code types, website QR codes, WhatsApp QR codes, WiFi QR codes, contact QR codes, print tips and common mistakes."
    >
      <article style={wrap}>
        <p style={eyebrow}>QR code guide</p>
        <h1 style={title}>How to Generate QR Codes for Business</h1>

        <p style={intro}>
          QR codes are one of the easiest ways to connect offline materials with online actions. A customer can scan a QR
          code on a flyer, product package, invoice, menu, poster, business card or shop counter and instantly open a
          website, WhatsApp chat, WiFi login, contact card, payment page, product catalog or document.
        </p>

        <p>
          This guide explains how to create QR codes for business, what type of QR code to choose, how to prepare the
          information, how to test QR codes before printing and how to avoid common mistakes that make QR codes difficult
          to scan.
        </p>

        <div style={ctaBox}>
          <div>
            <strong>Create a QR code now</strong>
            <p style={ctaText}>Use the QR Code Generator for links, contact details, WiFi, WhatsApp, email, phone, SMS and business use.</p>
          </div>
          <Link href="/qrcode" style={cta}>Open QR Code Generator →</Link>
        </div>

        <h2>What is a QR code?</h2>
        <p>
          A QR code is a two-dimensional code that can store text, links or structured data. Unlike a normal one-dimensional
          barcode, a QR code can hold more information and can be scanned easily by most modern smartphone cameras.
        </p>

        <p>
          Businesses use QR codes because they reduce typing. Instead of asking customers to type a long website address,
          phone number or WiFi password, you can let them scan and open the correct action quickly.
        </p>

        <h2>Common business uses for QR codes</h2>

        <div style={grid}>
          <div style={card}>
            <h3>Website QR codes</h3>
            <p>Send users to your homepage, product page, offer page, booking page, menu, catalog or support page.</p>
          </div>
          <div style={card}>
            <h3>WhatsApp QR codes</h3>
            <p>Let customers start a WhatsApp chat without saving your number or typing a message manually.</p>
          </div>
          <div style={card}>
            <h3>WiFi QR codes</h3>
            <p>Allow visitors to connect to WiFi by scanning instead of entering a network name and password.</p>
          </div>
          <div style={card}>
            <h3>Contact QR codes</h3>
            <p>Share business name, phone, email, website and address as a digital contact card.</p>
          </div>
          <div style={card}>
            <h3>Email and phone QR codes</h3>
            <p>Let users start an email or call a business number directly from the scan action.</p>
          </div>
          <div style={card}>
            <h3>Document QR codes</h3>
            <p>Link to PDF catalogs, invoices, instruction manuals, menus, forms or downloadable files.</p>
          </div>
        </div>

        <h2>Step 1: Decide what the QR code should do</h2>
        <p>
          Before generating a QR code, decide the exact action you want users to take. A QR code should have one clear
          purpose. If the goal is to open a website, use a website QR code. If the goal is to start a WhatsApp chat, use a
          WhatsApp link. If the goal is to connect to WiFi, use a WiFi QR code.
        </p>

        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Goal</th>
                <th style={th}>Best QR type</th>
                <th style={th}>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>Open a website</td>
                <td style={td}>URL QR code</td>
                <td style={td}>Product page, landing page, online store</td>
              </tr>
              <tr>
                <td style={td}>Start customer chat</td>
                <td style={td}>WhatsApp QR code</td>
                <td style={td}>Scan to ask about availability</td>
              </tr>
              <tr>
                <td style={td}>Connect to WiFi</td>
                <td style={td}>WiFi QR code</td>
                <td style={td}>Guest WiFi in shop or office</td>
              </tr>
              <tr>
                <td style={td}>Share contact details</td>
                <td style={td}>vCard/contact QR code</td>
                <td style={td}>Business card or counter display</td>
              </tr>
              <tr>
                <td style={td}>Send email</td>
                <td style={td}>Email QR code</td>
                <td style={td}>Customer support email</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Step 2: Prepare the content carefully</h2>
        <p>
          A QR code is only useful if the content behind it is correct. If the link is broken, the phone number is wrong or
          the landing page is not mobile-friendly, the QR code will create a poor user experience. Always prepare and check
          the destination before printing.
        </p>

        <h3>For website QR codes</h3>
        <ul style={list}>
          <li>Use the full correct URL.</li>
          <li>Open the URL on a mobile phone before generating the QR code.</li>
          <li>Make sure the page loads quickly.</li>
          <li>Use a landing page that matches the printed message.</li>
          <li>Avoid sending users to a desktop-only page.</li>
        </ul>

        <h3>For WhatsApp QR codes</h3>
        <ul style={list}>
          <li>Use the correct country code with the phone number.</li>
          <li>Prepare a short default message if needed.</li>
          <li>Test the link on mobile before printing.</li>
          <li>Make the call-to-action clear, such as “Scan to chat on WhatsApp”.</li>
        </ul>

        <h3>For WiFi QR codes</h3>
        <ul style={list}>
          <li>Check the network name exactly.</li>
          <li>Enter the password carefully.</li>
          <li>Choose the correct encryption type if required.</li>
          <li>Test with a phone that is not already connected to the WiFi.</li>
        </ul>

        <h2>Step 3: Generate the QR code</h2>
        <ol style={list}>
          <li>Open the <Link href="/qrcode" style={inlineLink}>QR Code Generator</Link>.</li>
          <li>Choose the QR code type based on your goal.</li>
          <li>Enter the required information.</li>
          <li>Generate the QR code and check the preview.</li>
          <li>Download the QR code image.</li>
          <li>Test the downloaded QR code before printing or publishing.</li>
        </ol>

        <h2>Step 4: Add a clear call-to-action</h2>
        <p>
          A QR code alone is not always enough. People should know what will happen when they scan it. Add a short label
          near the QR code to explain the action.
        </p>

        <div style={grid}>
          <div style={card}>
            <h3>Good CTA examples</h3>
            <ul style={listTight}>
              <li>Scan to order online</li>
              <li>Scan for product catalog</li>
              <li>Scan to chat on WhatsApp</li>
              <li>Scan to connect to WiFi</li>
              <li>Scan to download invoice</li>
            </ul>
          </div>
          <div style={card}>
            <h3>Weak CTA examples</h3>
            <ul style={listTight}>
              <li>Scan me</li>
              <li>QR code</li>
              <li>Click here</li>
              <li>More info</li>
              <li>No text at all</li>
            </ul>
          </div>
        </div>

        <h2>Step 5: Print QR codes correctly</h2>
        <p>
          Printed QR codes must be clear, large enough and high contrast. A QR code printed too small, placed on a busy
          background or distorted by resizing may fail to scan. Always test printed QR codes in real conditions.
        </p>

        <h3>QR code printing tips</h3>
        <ul style={list}>
          <li>Use dark QR code color on a light background.</li>
          <li>Keep enough empty space around the QR code.</li>
          <li>Do not stretch the QR code unevenly.</li>
          <li>Do not place it too close to edges or folds.</li>
          <li>Print a sample and scan it before bulk printing.</li>
          <li>Use a size suitable for the scanning distance.</li>
        </ul>

        <h2>Recommended QR code sizes</h2>
        <p>
          The best size depends on where the QR code is used. Small business cards can use smaller QR codes, but posters
          and banners need larger QR codes because people scan from farther away.
        </p>

        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Use case</th>
                <th style={th}>Suggested approach</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>Business card</td>
                <td style={td}>Use a clean QR code with a short CTA and enough white space.</td>
              </tr>
              <tr>
                <td style={td}>Product packaging</td>
                <td style={td}>Make sure it is not placed on folds or curved areas where scanning becomes difficult.</td>
              </tr>
              <tr>
                <td style={td}>Shop counter display</td>
                <td style={td}>Use a larger code and clear text such as “Scan to chat with us”.</td>
              </tr>
              <tr>
                <td style={td}>Poster or banner</td>
                <td style={td}>Use a much larger QR code because people scan from a distance.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Static vs dynamic QR codes</h2>
        <p>
          A static QR code stores the final data directly. If the QR code points to a URL and the URL changes later, you
          usually need to create and print a new QR code. A dynamic QR code uses a redirect link that can be changed later.
          Dynamic QR codes are useful for campaigns, but may require a service account or subscription.
        </p>

        <p>
          For many simple business uses, static QR codes are enough. For printed marketing campaigns where the destination
          may change later, dynamic QR codes can be useful.
        </p>

        <h2>QR code ideas for small businesses</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Retail shops</h3>
            <p>Use QR codes for product pages, offer pages, loyalty signup, WhatsApp orders and customer reviews.</p>
          </div>
          <div style={card}>
            <h3>Restaurants and cafes</h3>
            <p>Use QR codes for menus, WiFi, ordering, Google reviews and contactless feedback forms.</p>
          </div>
          <div style={card}>
            <h3>Ecommerce stores</h3>
            <p>Use QR codes on packaging to link customers to reorder pages, support forms or care instructions.</p>
          </div>
          <div style={card}>
            <h3>Service businesses</h3>
            <p>Use QR codes on invoices, brochures and business cards to link booking pages or WhatsApp support.</p>
          </div>
          <div style={card}>
            <h3>Events</h3>
            <p>Use QR codes for registration, schedules, tickets, location maps and feedback forms.</p>
          </div>
          <div style={card}>
            <h3>Offices</h3>
            <p>Use QR codes for WiFi access, visitor forms, internal documents and support request forms.</p>
          </div>
        </div>

        <h2>Common QR code mistakes</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Broken destination</h3>
            <p>The QR code works, but the page it opens is broken, expired or not mobile-friendly.</p>
          </div>
          <div style={card}>
            <h3>No instruction</h3>
            <p>Users see the QR code but do not know why they should scan it.</p>
          </div>
          <div style={card}>
            <h3>Low contrast</h3>
            <p>The QR code color is too close to the background color, making scanning difficult.</p>
          </div>
          <div style={card}>
            <h3>Too small</h3>
            <p>The QR code is printed too small for the scanning distance.</p>
          </div>
          <div style={card}>
            <h3>Distorted shape</h3>
            <p>The QR code is stretched sideways or vertically, which may affect scanning.</p>
          </div>
          <div style={card}>
            <h3>Not tested</h3>
            <p>The code is printed in bulk without first scanning a test copy.</p>
          </div>
        </div>

        <h2>Final checklist before using a QR code</h2>
        <ul style={list}>
          <li>Confirm the QR code has one clear purpose.</li>
          <li>Check that the destination link or details are correct.</li>
          <li>Add a clear call-to-action beside the QR code.</li>
          <li>Use high contrast and enough white space.</li>
          <li>Download a clear image file.</li>
          <li>Test it on multiple phones.</li>
          <li>Print one sample before bulk printing.</li>
          <li>Make sure the destination page is mobile-friendly.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Can I make a QR code for WhatsApp?</h3>
            <p>Yes. Use a WhatsApp link with your phone number and optional message, then generate a QR code from it.</p>
          </div>
          <div style={card}>
            <h3>Can I make a QR code for WiFi?</h3>
            <p>Yes. A WiFi QR code can store network name, password and security type for easier connection.</p>
          </div>
          <div style={card}>
            <h3>Can QR codes be used on product packaging?</h3>
            <p>Yes. They can link to product information, reorder pages, manuals, support forms or care instructions.</p>
          </div>
          <div style={card}>
            <h3>Why is my QR code not scanning?</h3>
            <p>Common reasons include low contrast, small print size, distortion, poor lighting or a broken code image.</p>
          </div>
        </div>
      </article>
    </ToolboxLayout>
  );
}

const wrap = { maxWidth: '940px', margin: '0 auto', padding: '50px 20px 90px', color: '#cbd5e1', lineHeight: 1.8 };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.08em' };
const title = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.1 };
const intro = { fontSize: '1.12rem', color: '#e2e8f0' };
const ctaBox = { display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '22px', margin: '30px 0' };
const ctaText = { margin: '6px 0 0', color: '#94a3b8' };
const cta = { color: '#0f172a', background: '#38bdf8', padding: '12px 16px', borderRadius: '12px', fontWeight: 900, textDecoration: 'none' };
const inlineLink = { color: '#38bdf8', fontWeight: 900 };
const list = { paddingLeft: '24px' };
const listTight = { paddingLeft: '18px', margin: 0 };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', margin: '20px 0' };
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const tableWrap = { overflowX: 'auto', margin: '20px 0', border: '1px solid #334155', borderRadius: '16px' };
const table = { width: '100%', borderCollapse: 'collapse', minWidth: '680px', background: '#1e293b' };
const th = { textAlign: 'left', padding: '14px', color: '#fff', borderBottom: '1px solid #334155', background: '#0f172a' };
const td = { padding: '14px', borderBottom: '1px solid #334155', verticalAlign: 'top' };

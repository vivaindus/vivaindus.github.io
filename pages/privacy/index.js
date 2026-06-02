import React from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function PrivacyPolicy() {
  return (
    <ToolboxLayout
      title="Privacy Policy"
      description="Read the SHB ToolBox privacy policy explaining local browser processing, cookies, advertising, analytics, external links, and user data handling."
    >
      <section style={pageWrap}>
        <div style={card}>
          <p style={eyebrow}>Website Policy</p>
          <h1 style={title}>Privacy Policy</h1>
          <p style={muted}>Last updated: June 1, 2026</p>

          <p style={para}>
            SHB ToolBox is a free online utility website by SHB Stores. Our goal is to provide useful browser-based tools
            while keeping privacy clear and easy to understand. This policy explains how we handle information when you
            visit shbstores.com and use our tools.
          </p>

          <h2 style={h2}>1. Information you enter into tools</h2>
          <p style={para}>
            Many SHB ToolBox utilities are designed to process inputs directly in your browser. This includes tools such as
            calculators, text converters, password generators, image tools, QR tools, PDF tools, invoice tools, and productivity
            utilities. In these cases, the information you enter is used to generate the result on your device and is not
            intentionally stored by SHB ToolBox.
          </p>

          <h2 style={h2}>2. Files and browser-based processing</h2>
          <p style={para}>
            Several file tools, including image and PDF-related utilities, are designed with a client-side-first approach.
            Where possible, processing happens inside your browser memory. You are still responsible for checking output
            quality, file compatibility, and whether a file is appropriate to upload, convert, download, edit, or share.
          </p>

          <h2 style={h2}>3. Contact information</h2>
          <p style={para}>
            If you contact us by email or WhatsApp, we may receive the information you choose to send, such as your name,
            contact details, message content, screenshots, page URLs, or support details. We use this information only to
            respond to your request, improve the website, or address reported issues.
          </p>

          <h2 style={h2}>4. Cookies, analytics, and advertising</h2>
          <p style={para}>
            SHB ToolBox may use cookies, analytics, and advertising services to understand website usage, maintain the site,
            improve content, and support free access to the tools. Third-party advertising services, including Google
            services, may use cookies or similar technologies to serve and measure ads according to their own policies.
          </p>

          <h2 style={h2}>5. Google AdSense and third-party vendors</h2>
          <p style={para}>
            This website may use Google AdSense and other third-party advertising services to display advertisements.
            Third-party vendors, including Google, may use cookies to serve ads based on a user&apos;s prior visits to this
            website or other websites.
          </p>
          <p style={para}>
            Google&apos;s use of advertising cookies enables Google and its partners to serve ads to users based on their visit
            to this website and/or other websites on the Internet. Users may opt out of personalized advertising by visiting
            Google Ads Settings. Users can also manage or disable cookies through their browser settings.
          </p>

          <h2 style={h2}>6. External links</h2>
          <p style={para}>
            Our website may link to third-party websites or services, such as WhatsApp, YouTube, Google services, or other
            external resources. We are not responsible for the privacy practices, content, or security of third-party sites.
            Please review their policies before sharing personal information.
          </p>

          <h2 style={h2}>7. Data security</h2>
          <p style={para}>
            We take reasonable steps to maintain a safe website experience. However, no website or internet transmission can
            be guaranteed to be completely secure. Users should avoid entering highly sensitive information into tools unless
            they are comfortable with the purpose and behavior of the specific utility.
          </p>

          <h2 style={h2}>8. Children&apos;s privacy</h2>
          <p style={para}>
            SHB ToolBox is intended for general users and is not designed to collect personal information from children.
            If you believe a child has provided personal information through a contact channel, please contact us so we can
            review and delete it where appropriate.
          </p>

          <h2 style={h2}>9. Updates to this policy</h2>
          <p style={para}>
            We may update this Privacy Policy from time to time to reflect changes in tools, advertising requirements,
            legal expectations, or website features. The updated date at the top of this page will show the latest version.
          </p>

          <h2 style={h2}>10. Contact us</h2>
          <p style={para}>
            For privacy questions or correction requests, contact us at <strong>support@shbstores.com</strong>.
          </p>
        </div>
      </section>
    </ToolboxLayout>
  );
}

const pageWrap = { maxWidth: '950px', margin: '0 auto', padding: '60px 20px 90px' };
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '40px', lineHeight: 1.8 };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em' };
const title = { fontSize: '2.6rem', margin: '10px 0', color: '#fff' };
const muted = { color: '#94a3b8', marginBottom: '30px' };
const h2 = { color: '#fff', fontSize: '1.35rem', marginTop: '30px', marginBottom: '10px' };
const para = { color: '#cbd5e1', fontSize: '1rem', marginBottom: '16px' };
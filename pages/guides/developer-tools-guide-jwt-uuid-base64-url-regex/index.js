import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../../components/ToolboxLayout';

export default function DeveloperToolsGuide() {
  return (
    <ToolboxLayout
      title="Developer Tools Guide: JWT, UUID, Base64, URL Encoding and Regex"
      description="A complete guide to developer utilities including JWT decoder, UUID generator, Base64 encoder and decoder, URL encoder and decoder, and regex tester for API debugging and automation."
    >
      <article style={wrap}>
        <p style={eyebrow}>Developer tools guide</p>
        <h1 style={title}>Developer Tools Guide: JWT, UUID, Base64, URL Encoding and Regex</h1>

        <p style={intro}>
          Developers, support teams, data users, students and automation users often need small utilities for debugging,
          testing and converting data. You may need to decode a JWT token, generate a UUID, encode text to Base64, decode
          a URL parameter or test a regular expression before using it in a script. These tasks are small, but they happen
          frequently in real development and business workflows.
        </p>

        <p>
          This guide explains five common developer tools: JWT Decoder, UUID Generator, Base64 Encoder/Decoder, URL
          Encoder/Decoder and Regex Tester. You will learn what each tool does, when to use it, what mistakes to avoid and
          how the SHB ToolBox apps fit into practical API, web, data and automation work.
        </p>

        <div style={ctaBox}>
          <div>
            <strong>Open developer tools</strong>
            <p style={ctaText}>Use these browser-based tools for quick testing, decoding, encoding and debugging.</p>
          </div>
          <div style={ctaLinks}>
            <Link href="/jwtdecoder" style={cta}>JWT Decoder →</Link>
            <Link href="/uuidgenerator" style={cta}>UUID Generator →</Link>
            <Link href="/base64" style={cta}>Base64 Tool →</Link>
            <Link href="/urlencoder" style={cta}>URL Encoder →</Link>
            <Link href="/regextester" style={cta}>Regex Tester →</Link>
          </div>
        </div>

        <h2>1. JWT Decoder</h2>
        <p>
          JWT means JSON Web Token. It is commonly used in web applications and APIs for authentication and authorization.
          A JWT usually has three parts separated by dots: header, payload and signature. A JWT decoder helps you inspect
          the header and payload in readable JSON format.
        </p>

        <pre style={code}>{`header.payload.signature`}</pre>

        <p>
          The <Link href="/jwtdecoder" style={inlineLink}>JWT Decoder</Link> is useful when you want to check what claims
          exist inside a token, such as expiry time, issuer, audience, user ID, role or permissions. It helps you debug
          login issues, expired sessions and API authorization problems.
        </p>

        <h3>Common JWT fields</h3>
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Claim</th>
                <th style={th}>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={td}>exp</td><td style={td}>Expiration time. After this time, the token should no longer be accepted.</td></tr>
              <tr><td style={td}>iat</td><td style={td}>Issued at time. Shows when the token was created.</td></tr>
              <tr><td style={td}>iss</td><td style={td}>Issuer. The system or service that issued the token.</td></tr>
              <tr><td style={td}>aud</td><td style={td}>Audience. The intended receiver or system for the token.</td></tr>
              <tr><td style={td}>sub</td><td style={td}>Subject. Often a user ID or account ID.</td></tr>
              <tr><td style={td}>role</td><td style={td}>A custom claim often used to describe user role or access level.</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Important JWT safety note</h3>
        <p>
          Decoding a JWT is not the same as verifying it. A decoder can show the header and payload, but it does not prove
          that the token is trusted. Real verification requires checking the signature using the correct secret or public
          key. Never rely on decoded token data alone for security decisions.
        </p>

        <h2>2. UUID Generator</h2>
        <p>
          UUID means Universally Unique Identifier. It is used to create unique-looking values for records, test data,
          request IDs, database rows, logs and sample objects. UUIDs are common in APIs, databases, distributed systems and
          development workflows.
        </p>

        <pre style={code}>{`550e8400-e29b-41d4-a716-446655440000`}</pre>

        <p>
          The <Link href="/uuidgenerator" style={inlineLink}>UUID Generator</Link> can create single or bulk UUID values.
          This is useful when you need placeholder IDs, test records, sample JSON objects or random identifiers for
          development work.
        </p>

        <h3>When to use UUIDs</h3>
        <ul style={list}>
          <li>Creating test data for apps or APIs.</li>
          <li>Generating request IDs for debugging logs.</li>
          <li>Creating unique row IDs in sample datasets.</li>
          <li>Using random identifiers in prototypes.</li>
          <li>Preparing mock data for JSON, CSV or database examples.</li>
        </ul>

        <h3>When not to use UUIDs</h3>
        <p>
          UUIDs are identifiers, not passwords. Do not treat a normal UUID as a secure secret, login token or private
          access key. If you need a password, use a strong password generator. If you need a secure token, use a proper
          cryptographic token process.
        </p>

        <h2>3. Base64 Encoder and Decoder</h2>
        <p>
          Base64 is an encoding method that converts text or binary-looking data into characters that are safe to store or
          transfer in text-based systems. It is often seen in API examples, basic auth headers, tokens, configuration
          values, small embedded data and debugging tasks.
        </p>

        <pre style={code}>{`Hello World → SGVsbG8gV29ybGQ=`}</pre>

        <p>
          The <Link href="/base64" style={inlineLink}>Base64 Tool</Link> helps encode plain text into Base64 and decode
          Base64 back into readable text. It is useful when testing APIs, checking encoded values or preparing examples
          for documentation.
        </p>

        <h3>Base64 is not encryption</h3>
        <p>
          This is very important: Base64 does not protect your data. Anyone can decode Base64. It is only an encoding
          format. Do not use Base64 to hide passwords, private keys or sensitive information.
        </p>

        <h3>Common Base64 uses</h3>
        <ul style={list}>
          <li>Encoding small text values for testing.</li>
          <li>Inspecting encoded API examples.</li>
          <li>Understanding basic authorization header structure.</li>
          <li>Debugging tokens or encoded strings.</li>
          <li>Preparing safe text values for systems that expect Base64.</li>
        </ul>

        <h2>4. URL Encoder and Decoder</h2>
        <p>
          URLs cannot safely contain every character directly. Spaces, symbols, non-English characters and special
          characters may need encoding. URL encoding converts those characters into safe sequences.
        </p>

        <pre style={code}>{`hello world → hello%20world
price=50 AED → price%3D50%20AED`}</pre>

        <p>
          The <Link href="/urlencoder" style={inlineLink}>URL Encoder</Link> helps encode and decode URL components.
          This is useful for API requests, query parameters, redirect URLs, search links and form-generated URLs.
        </p>

        <h3>When URL encoding is needed</h3>
        <ul style={list}>
          <li>When a search query contains spaces.</li>
          <li>When a query parameter contains symbols like &, = or ?.</li>
          <li>When a redirect URL is passed inside another URL.</li>
          <li>When text contains special or non-English characters.</li>
          <li>When building links for APIs or automation tools.</li>
        </ul>

        <h3>Encode the correct part</h3>
        <p>
          A common mistake is encoding the entire URL when only one query parameter value should be encoded. For example,
          if you are building a URL with a search term, usually the search term should be encoded, not necessarily the
          whole URL structure.
        </p>

        <h2>5. Regex Tester</h2>
        <p>
          Regex means regular expression. It is a pattern used to find, match, extract or replace text. Regex is used in
          programming, spreadsheets, data cleanup, log analysis, validation, search tools and automation scripts.
        </p>

        <p>
          The <Link href="/regextester" style={inlineLink}>Regex Tester</Link> helps you test a pattern against sample
          text before using it in real code or data cleanup. It can help you see matches, test flags, inspect groups and
          preview replacements.
        </p>

        <h3>Example regex patterns</h3>
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Pattern</th>
                <th style={th}>Possible use</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={td}>\\d+</td><td style={td}>Find one or more digits.</td></tr>
              <tr><td style={td}>[A-Z]+</td><td style={td}>Find uppercase letters.</td></tr>
              <tr><td style={td}>\\b\\w+@\\w+\\.\\w+\\b</td><td style={td}>Simple email-like pattern for basic testing.</td></tr>
              <tr><td style={td}><code>INV-\\d&#123;4&#125;</code></td><td style={td}>Match invoice numbers like INV-1001.</td></tr>
              <tr><td style={td}>https?://\\S+</td><td style={td}>Find simple web URLs.</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Regex flags explained</h3>
        <div style={grid}>
          <div style={card}>
            <h3>g — global</h3>
            <p>Finds all matches instead of stopping after the first match.</p>
          </div>
          <div style={card}>
            <h3>i — case-insensitive</h3>
            <p>Matches uppercase and lowercase letters without treating them differently.</p>
          </div>
          <div style={card}>
            <h3>m — multiline</h3>
            <p>Changes how start and end anchors behave across multiple lines.</p>
          </div>
        </div>

        <h2>Practical developer workflow examples</h2>

        <h3>API debugging workflow</h3>
        <ol style={list}>
          <li>Decode a JWT to inspect expiry and user claims.</li>
          <li>Use URL Encoder to safely encode query parameters.</li>
          <li>Use Base64 Decoder if an API example contains Base64 values.</li>
          <li>Generate UUIDs for test request IDs.</li>
          <li>Use Regex Tester to extract IDs or error codes from logs.</li>
        </ol>

        <h3>Data cleanup workflow</h3>
        <ol style={list}>
          <li>Use Regex Tester to find product codes, invoice numbers or dates.</li>
          <li>Use Base64 or URL decoding when data is encoded.</li>
          <li>Generate UUIDs for missing unique IDs.</li>
          <li>Use JSON or CSV tools if the cleaned data needs format conversion.</li>
        </ol>

        <h3>Testing and documentation workflow</h3>
        <ol style={list}>
          <li>Create sample UUIDs for documentation.</li>
          <li>Encode sample values for URL examples.</li>
          <li>Decode JWT examples to explain token fields.</li>
          <li>Test regex patterns before sharing them with a team.</li>
        </ol>

        <h2>Security and privacy notes</h2>
        <p>
          Developer utilities are helpful, but you should be careful with sensitive data. Avoid pasting live production
          secrets, private API keys, passwords, active access tokens or confidential customer information into any tool
          unless you fully understand how the tool processes data.
        </p>

        <ul style={list}>
          <li>Do not paste live private API keys into general tools.</li>
          <li>Do not treat Base64 as encryption.</li>
          <li>Do not use decoded JWT content as proof that the token is valid.</li>
          <li>Do not use UUIDs as passwords.</li>
          <li>Test regex patterns on sample data before using them on important files.</li>
        </ul>

        <h2>Common mistakes and fixes</h2>
        <div style={grid}>
          <div style={card}>
            <h3>JWT looks readable but is not verified</h3>
            <p>Decoding only reads the token. Verification requires checking the signature with the correct key.</p>
          </div>
          <div style={card}>
            <h3>Base64 is used as a secret</h3>
            <p>Base64 is easy to decode. Do not use it to protect confidential data.</p>
          </div>
          <div style={card}>
            <h3>Wrong part of URL is encoded</h3>
            <p>Encode query parameter values carefully instead of blindly encoding every character.</p>
          </div>
          <div style={card}>
            <h3>Regex matches too much</h3>
            <p>Make patterns more specific and test them against different examples.</p>
          </div>
          <div style={card}>
            <h3>UUID is treated as secure token</h3>
            <p>UUIDs are identifiers. Use proper secure token generation for authentication secrets.</p>
          </div>
          <div style={card}>
            <h3>Regex works on one sample only</h3>
            <p>Test multiple normal and edge cases before using a regex in production.</p>
          </div>
        </div>

        <h2>Final checklist</h2>
        <ul style={list}>
          <li>Use JWT Decoder to inspect token header and payload.</li>
          <li>Use UUID Generator for test IDs and sample records.</li>
          <li>Use Base64 Tool for encoding and decoding, not encryption.</li>
          <li>Use URL Encoder for query parameters and special characters.</li>
          <li>Use Regex Tester before applying patterns to real data.</li>
          <li>Remove sensitive values before testing or sharing data.</li>
          <li>Verify important outputs in your actual app or system.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Can a JWT decoder verify a token?</h3>
            <p>No. A decoder reads the token contents. Signature verification is a separate security step.</p>
          </div>
          <div style={card}>
            <h3>Is Base64 secure?</h3>
            <p>No. Base64 is encoding, not encryption. Anyone can decode it.</p>
          </div>
          <div style={card}>
            <h3>Can I generate many UUIDs?</h3>
            <p>Yes. Bulk UUID generation is useful for test data and sample records.</p>
          </div>
          <div style={card}>
            <h3>Why should I test regex first?</h3>
            <p>A regex can match too much or too little. Testing prevents mistakes before using it in scripts or data cleanup.</p>
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
const ctaLinks = { display: 'flex', gap: '10px', flexWrap: 'wrap' };
const cta = { color: '#0f172a', background: '#38bdf8', padding: '12px 16px', borderRadius: '12px', fontWeight: 900, textDecoration: 'none' };
const inlineLink = { color: '#38bdf8', fontWeight: 900 };
const code = { background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '16px', overflow: 'auto', color: '#e2e8f0' };
const list = { paddingLeft: '24px' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', margin: '20px 0' };
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const tableWrap = { overflowX: 'auto', margin: '20px 0', border: '1px solid #334155', borderRadius: '16px' };
const table = { width: '100%', borderCollapse: 'collapse', minWidth: '680px', background: '#1e293b' };
const th = { textAlign: 'left', padding: '14px', color: '#fff', borderBottom: '1px solid #334155', background: '#0f172a' };
const td = { padding: '14px', borderBottom: '1px solid #334155', verticalAlign: 'top' };

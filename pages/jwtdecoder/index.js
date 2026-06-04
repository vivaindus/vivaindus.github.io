import React, { useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlNIQiBUb29sQm94IiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.demo-signature';

export default function JWTDecoder() {
  const [token, setToken] = useState(sampleJwt);
  const [notification, setNotification] = useState('');

  const decoded = useMemo(() => decodeJwt(token), [token]);

  const copyText = async (text, label) => {
    if (!text) {
      setNotification('Nothing to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setNotification(`${label} copied.`);
    } catch {
      setNotification('Copy failed. Please select and copy manually.');
    }
  };

  const clearAll = () => {
    setToken('');
    setNotification('Cleared.');
  };

  return (
    <ToolboxLayout
      title="JWT Decoder - Decode JSON Web Tokens Online"
      description="Decode JWT tokens online. View JWT header, payload, claims, expiry time, issued time and signature part. Browser-based JSON Web Token decoder with privacy-focused workflow."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based developer tool</p>
          <h1 style={heroTitle}>JWT Decoder</h1>
          <p style={heroText}>
            Decode JSON Web Tokens and inspect the header, payload, claims, expiry time, issued time, and signature
            section. Useful for API testing, authentication debugging, OAuth, OpenID Connect, and backend development.
          </p>
        </section>

        <section style={warningBox}>
          <strong>Important:</strong> This tool decodes JWT content only. It does not verify the signature, validate trust,
          confirm authenticity, or prove that the token is safe. Never paste sensitive production tokens into tools you do
          not trust.
        </section>

        <section style={appGrid}>
          <div style={panel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>JWT input</h2>
              <button onClick={clearAll} style={smallBtn}>Clear</button>
            </div>

            <div style={sampleRow}>
              <button onClick={() => setToken(sampleJwt)} style={sampleBtn}>Sample JWT</button>
            </div>

            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste JWT token here..."
              style={textarea}
              spellCheck={false}
            />

            <div style={buttonRow}>
              <button onClick={() => copyText(token, 'JWT')} style={secondaryBtn}>Copy input</button>
            </div>
          </div>

          <div style={panel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>Token status</h2>
              <span style={decoded.ok ? validBadge : errorBadge}>{decoded.ok ? 'Decoded' : 'Error'}</span>
            </div>

            {decoded.ok ? (
              <div style={statusGrid}>
                <div style={statCard}><strong>{decoded.algorithm || 'Unknown'}</strong><span>Algorithm</span></div>
                <div style={statCard}><strong>{decoded.type || 'Unknown'}</strong><span>Type</span></div>
                <div style={statCard}><strong>{decoded.expStatus}</strong><span>Expiry status</span></div>
                <div style={statCard}><strong>{decoded.parts.length}</strong><span>Token parts</span></div>
              </div>
            ) : (
              <div style={errorBox}>
                <strong>JWT decode error</strong>
                <p>{decoded.error}</p>
              </div>
            )}
          </div>
        </section>

        {decoded.ok && (
          <>
            <section style={appGrid}>
              <div style={panel}>
                <div style={panelHead}>
                  <h2 style={panelTitle}>Header</h2>
                  <button onClick={() => copyText(decoded.headerText, 'Header JSON')} style={smallBtn}>Copy</button>
                </div>
                <pre style={outputBox}>{decoded.headerText}</pre>
              </div>

              <div style={panel}>
                <div style={panelHead}>
                  <h2 style={panelTitle}>Payload</h2>
                  <button onClick={() => copyText(decoded.payloadText, 'Payload JSON')} style={smallBtn}>Copy</button>
                </div>
                <pre style={outputBox}>{decoded.payloadText}</pre>
              </div>
            </section>

            <section style={panel}>
              <h2 style={panelTitle}>Claims explanation</h2>
              <div style={claimGrid}>
                {decoded.claims.map((claim, index) => (
                  <div key={index} style={claimCard}>
                    <h3>{claim.name}</h3>
                    <p><strong>Value:</strong> {claim.value}</p>
                    <p>{claim.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section style={panel}>
              <h2 style={panelTitle}>Signature part</h2>
              <p style={mutedText}>
                The third part of a JWT is the signature. This decoder displays it as text only. Signature verification
                requires the correct secret or public key and must be done securely in your trusted environment.
              </p>
              <pre style={signatureBox}>{decoded.signature || 'No signature part found.'}</pre>
            </section>
          </>
        )}

        <section style={contentSection}>
          <h2>Decode JWT tokens online</h2>
          <p>
            A JWT, or JSON Web Token, is a compact token format commonly used in authentication, authorization, API
            access, OAuth flows, OpenID Connect, single sign-on, and backend service communication. A JWT usually contains
            three parts separated by dots: a header, a payload, and a signature. This JWT decoder helps you read the
            header and payload in a formatted JSON view so you can understand what claims are inside the token.
          </p>
          <p>
            Developers often need to decode JWT tokens while debugging login issues, API authorization errors, expired
            sessions, incorrect user claims, wrong audience values, missing issuer values, or unexpected token payloads.
            This tool makes the token easier to inspect without manually decoding Base64URL sections.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}><h3>JWT header decoder</h3><p>View the token algorithm, token type, key ID, and other header fields where available.</p></div>
            <div style={seoCard}><h3>JWT payload decoder</h3><p>Read user claims, issuer, audience, subject, roles, issued time, expiry time, and custom fields.</p></div>
            <div style={seoCard}><h3>Claim explanation</h3><p>Understand common JWT claims such as exp, iat, nbf, iss, aud, sub, jti, name, email, and roles.</p></div>
            <div style={seoCard}><h3>Private workflow</h3><p>The decoder is designed to run in your browser without account creation.</p></div>
          </div>

          <h2>What are the three parts of a JWT?</h2>
          <p>
            A standard JWT has three sections separated by dots. The first section is the header, which usually describes
            the signing algorithm and token type. The second section is the payload, which contains claims such as user
            ID, issuer, audience, issued time, expiry time, permissions, or custom application data. The third section is
            the signature, which is used by trusted systems to verify that the token has not been changed.
          </p>

          <h2>JWT decoding is not the same as JWT verification</h2>
          <p>
            Decoding a JWT only reads the Base64URL-encoded header and payload. It does not prove that the token is valid,
            trusted, unmodified, or authorized. To verify a JWT, the server must check the signature using the correct
            secret or public key, confirm the algorithm, validate expiry, issuer, audience, and other security rules.
            This online tool is for inspection and debugging, not for security verification.
          </p>

          <h2>Common JWT claims</h2>
          <ul style={listStyle}>
            <li><strong>sub:</strong> Subject of the token, often the user ID.</li>
            <li><strong>iss:</strong> Issuer that created the token.</li>
            <li><strong>aud:</strong> Audience the token is intended for.</li>
            <li><strong>iat:</strong> Issued-at time.</li>
            <li><strong>exp:</strong> Expiration time.</li>
            <li><strong>nbf:</strong> Not-before time.</li>
            <li><strong>jti:</strong> Unique token ID.</li>
          </ul>

          <h2>When to use a JWT decoder</h2>
          <ul style={listStyle}>
            <li>Debugging expired tokens during API testing.</li>
            <li>Checking whether the expected user ID or role is present.</li>
            <li>Reviewing OAuth or OpenID Connect ID token claims.</li>
            <li>Understanding why an API rejects an access token.</li>
            <li>Inspecting custom claims in a development or staging environment.</li>
          </ul>

          <h2>JWT safety tips</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Do not share live tokens</h3><p>JWTs can contain access rights. Treat production access tokens like passwords.</p></div>
            <div style={seoCard}><h3>Check expiry</h3><p>The exp claim tells when the token expires, but servers must still validate it.</p></div>
            <div style={seoCard}><h3>Verify server-side</h3><p>Signature verification should happen in your trusted backend or security layer.</p></div>
            <div style={seoCard}><h3>Watch sensitive claims</h3><p>JWT payloads are readable. Avoid storing secrets or private data inside JWT payloads.</p></div>
          </div>

          <h2>FAQ</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Is this JWT decoder free?</h3><p>Yes. You can decode JWT header and payload data for free without creating an account.</p></div>
            <div style={seoCard}><h3>Does this verify JWT signatures?</h3><p>No. This tool decodes JWT content only. It does not verify the signature or confirm token authenticity.</p></div>
            <div style={seoCard}><h3>Can JWT payload be read by anyone?</h3><p>Yes. JWT payloads are encoded, not encrypted, unless a separate encrypted token format is used.</p></div>
            <div style={seoCard}><h3>Is my JWT uploaded?</h3><p>The decoder is designed to process token text in your browser.</p></div>
          </div>
        </section>

        <RelatedTools currentPath="/jwtdecoder" />
      </div>
    </ToolboxLayout>
  );
}

function decodeJwt(token) {
  const clean = String(token || '').trim();
  const parts = clean.split('.');

  if (parts.length < 2) {
    return { ok: false, error: 'A JWT should contain at least header and payload parts separated by dots.' };
  }

  try {
    const header = JSON.parse(decodeBase64Url(parts[0]));
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    const signature = parts[2] || '';

    return {
      ok: true,
      parts,
      header,
      payload,
      signature,
      headerText: JSON.stringify(header, null, 2),
      payloadText: JSON.stringify(payload, null, 2),
      algorithm: header.alg,
      type: header.typ,
      expStatus: getExpiryStatus(payload.exp),
      claims: explainClaims(payload)
    };
  } catch (error) {
    return {
      ok: false,
      error: 'Unable to decode JWT. Check that the token has valid Base64URL header and payload JSON.'
    };
  }
}

function decodeBase64Url(value) {
  let base64 = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  if (padding) base64 += '='.repeat(4 - padding);

  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function getExpiryStatus(exp) {
  if (!exp) return 'No exp';
  const expiryMs = Number(exp) * 1000;
  if (Number.isNaN(expiryMs)) return 'Invalid exp';
  return Date.now() > expiryMs ? 'Expired' : 'Active';
}

function explainClaims(payload) {
  return Object.entries(payload || {}).map(([key, value]) => ({
    name: key,
    value: formatClaimValue(key, value),
    description: getClaimDescription(key, value)
  }));
}

function formatClaimValue(key, value) {
  if (['exp', 'iat', 'nbf'].includes(key) && typeof value === 'number') {
    return `${value} (${formatJwtDate(value)})`;
  }

  if (Array.isArray(value) || typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function formatJwtDate(unixSeconds) {
  const date = new Date(Number(unixSeconds) * 1000);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toISOString().replace('T', ' ').replace('.000Z', ' UTC');
}

function getClaimDescription(key) {
  const descriptions = {
    sub: 'Subject. Usually identifies the user, account, or entity the token is about.',
    iss: 'Issuer. Identifies the system or authority that created the token.',
    aud: 'Audience. Identifies the application or API that should accept the token.',
    exp: 'Expiration time. After this time, the token should no longer be accepted.',
    nbf: 'Not before time. The token should not be accepted before this time.',
    iat: 'Issued at time. Shows when the token was created.',
    jti: 'JWT ID. A unique identifier for the token.',
    name: 'Name claim. Often contains the display name of the user.',
    email: 'Email claim. Often contains the user email address.',
    roles: 'Roles claim. Often lists user permissions or role names.',
    scope: 'Scope claim. Often lists permissions granted to the token.',
    scp: 'Scope claim. Often lists permissions granted to the token.'
  };

  return descriptions[key] || 'Custom claim. This value is application-specific and should be interpreted based on the system that issued the token.';
}

const pageWrap = { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 90px' };
const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900, fontSize: '0.78rem' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)', margin: '10px 0 16px' };
const heroText = { color: '#cbd5e1', maxWidth: '820px', margin: '0 auto', lineHeight: 1.7, fontSize: '1.08rem' };
const warningBox = { background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.35)', color: '#fef3c7', borderRadius: '18px', padding: '16px', lineHeight: 1.7, marginBottom: '24px' };
const appGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '24px' };
const panel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '28px', marginBottom: '24px' };
const panelHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' };
const panelTitle = { color: '#fff', margin: 0, fontSize: '1.15rem' };
const sampleRow = { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' };
const sampleBtn = { background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '999px', padding: '8px 12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.78rem' };
const textarea = { width: '100%', minHeight: '260px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '16px', padding: '16px', resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace', boxSizing: 'border-box' };
const outputBox = { minHeight: '300px', maxHeight: '520px', overflow: 'auto', background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '16px', padding: '16px', lineHeight: 1.6, fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', boxSizing: 'border-box' };
const errorBox = { minHeight: '180px', background: 'rgba(239,68,68,0.1)', color: '#fecaca', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '16px', padding: '20px', overflowWrap: 'anywhere' };
const signatureBox = { background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', borderRadius: '14px', padding: '14px', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' };
const buttonRow = { display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' };
const primaryBtn = { background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '14px', padding: '13px 18px', fontWeight: 900, cursor: 'pointer' };
const secondaryBtn = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '14px', padding: '13px 18px', fontWeight: 900, cursor: 'pointer' };
const smallBtn = { ...secondaryBtn, padding: '9px 12px', fontSize: '0.78rem' };
const validBadge = { color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const errorBadge = { color: '#fecaca', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const statusGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' };
const statCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'center' };
const claimGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '18px' };
const claimCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', color: '#cbd5e1', overflowWrap: 'anywhere' };
const mutedText = { color: '#94a3b8', lineHeight: 1.7 };
const contentSection = { marginTop: '70px', color: '#cbd5e1', lineHeight: 1.8 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '24px' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const listStyle = { color: '#cbd5e1', lineHeight: 1.8, paddingLeft: '22px' };
const toast = { position: 'fixed', top: '86px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, zIndex: 1000 };

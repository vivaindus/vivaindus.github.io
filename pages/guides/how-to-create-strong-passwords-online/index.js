import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../../components/ToolboxLayout';

export default function PasswordGuide() {
  return (
    <ToolboxLayout
      title="How to Create Strong Passwords Online"
      description="A complete guide to creating strong passwords online. Learn password length, passphrases, password managers, two-factor authentication, weak password habits and security best practices."
    >
      <article style={wrap}>
        <p style={eyebrow}>Password security guide</p>
        <h1 style={title}>How to Create Strong Passwords Online</h1>

        <p style={intro}>
          Passwords protect email accounts, online stores, banking portals, business dashboards, cloud storage, social
          media accounts, admin panels, school portals and many everyday services. A weak password can put personal data,
          business data and customer information at risk. A strong password is one of the simplest ways to improve basic
          account security.
        </p>

        <p>
          This guide explains what makes a password strong, how to use a password generator, when to use passphrases, why
          password reuse is dangerous, how password managers help and what mistakes to avoid when creating or storing
          passwords.
        </p>

        <div style={ctaBox}>
          <div>
            <strong>Create a strong password now</strong>
            <p style={ctaText}>Use the Password Generator to create random passwords and passphrases for safer account setup.</p>
          </div>
          <Link href="/passwordgen" style={cta}>Open Password Generator →</Link>
        </div>

        <h2>What makes a password strong?</h2>
        <p>
          A strong password is difficult to guess, long enough to resist simple attacks and unique to one account. Many
          people think a password becomes strong just by adding a symbol or capital letter, but length and uniqueness are
          often more important.
        </p>

        <div style={grid}>
          <div style={card}>
            <h3>Length</h3>
            <p>Longer passwords are generally harder to guess. Aim for at least 12 to 16 characters when possible.</p>
          </div>
          <div style={card}>
            <h3>Randomness</h3>
            <p>Random passwords are harder to guess than names, birthdays, phone numbers or common words.</p>
          </div>
          <div style={card}>
            <h3>Uniqueness</h3>
            <p>Each important account should have its own password. Reusing passwords is risky.</p>
          </div>
          <div style={card}>
            <h3>Storage</h3>
            <p>A strong password should be stored safely, preferably in a trusted password manager.</p>
          </div>
        </div>

        <h2>Weak password examples</h2>
        <p>
          Weak passwords are easy to guess or commonly used. They often include names, dates, simple patterns or small
          changes to old passwords.
        </p>

        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Weak habit</th>
                <th style={th}>Why it is risky</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>Using your name or business name</td>
                <td style={td}>Names are easy to guess from public profiles or documents.</td>
              </tr>
              <tr>
                <td style={td}>Using birthdays or phone numbers</td>
                <td style={td}>These are often known or discoverable.</td>
              </tr>
              <tr>
                <td style={td}>Using Password123</td>
                <td style={td}>Common patterns are tested quickly by attackers.</td>
              </tr>
              <tr>
                <td style={td}>Reusing one password everywhere</td>
                <td style={td}>If one site leaks it, other accounts may also be at risk.</td>
              </tr>
              <tr>
                <td style={td}>Adding only one symbol to an old password</td>
                <td style={td}>Small changes are predictable and weak.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>How to use a password generator</h2>
        <p>
          A password generator creates random passwords so you do not have to invent them manually. Random passwords are
          useful for accounts that will be saved in a password manager.
        </p>

        <ol style={list}>
          <li>Open the <Link href="/passwordgen" style={inlineLink}>Password Generator</Link>.</li>
          <li>Choose a strong length, such as 16 characters or more.</li>
          <li>Include uppercase letters, lowercase letters, numbers and symbols if the website allows them.</li>
          <li>Generate the password.</li>
          <li>Copy it into the account setup form.</li>
          <li>Save it in a trusted password manager.</li>
          <li>Do not reuse it for another account.</li>
        </ol>

        <h2>Password length guide</h2>
        <p>
          Different accounts may have different password rules. Some websites limit symbols or length, but whenever
          possible, choose longer passwords.
        </p>

        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Password length</th>
                <th style={th}>Use case</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>8 characters</td>
                <td style={td}>Minimum on many websites, but not ideal for important accounts.</td>
              </tr>
              <tr>
                <td style={td}>12 characters</td>
                <td style={td}>Better for general accounts.</td>
              </tr>
              <tr>
                <td style={td}>16 characters</td>
                <td style={td}>Good target for important accounts.</td>
              </tr>
              <tr>
                <td style={td}>20+ characters</td>
                <td style={td}>Strong option when saved in a password manager.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Passphrases: easier to type, still strong</h2>
        <p>
          A passphrase is a password made from multiple words. It can be easier to type and remember than a random string,
          while still being strong if it is long and not predictable.
        </p>

        <pre style={code}>{`Example style:
river-lantern-market-cloud-72

Avoid predictable phrases:
ilovemydog
myshopname2026`}</pre>

        <p>
          Passphrases are useful for passwords you may need to type manually. Random passwords are better for accounts
          saved in a password manager.
        </p>

        <h2>Why password reuse is dangerous</h2>
        <p>
          If you use the same password on multiple websites, one leak can affect many accounts. For example, if an old
          forum account leaks your reused password, someone may try the same email and password on your email, store admin
          panel, social media or payment accounts.
        </p>

        <p>
          This is why uniqueness matters. Even a strong password becomes risky if it is reused everywhere.
        </p>

        <h2>Use a password manager</h2>
        <p>
          A password manager helps you store many unique passwords safely. Instead of remembering every password, you
          remember one strong master password and let the password manager store the rest.
        </p>

        <h3>Password manager benefits</h3>
        <ul style={list}>
          <li>You can use different passwords for every account.</li>
          <li>You do not need to memorize long random passwords.</li>
          <li>You can autofill passwords more safely.</li>
          <li>You can find old or weak saved passwords.</li>
          <li>You can share selected passwords with team members if the password manager supports it.</li>
        </ul>

        <h2>Two-factor authentication</h2>
        <p>
          Two-factor authentication, often called 2FA, adds another step after the password. This may be an authenticator
          app code, security key, push notification or SMS code. 2FA can protect your account even if the password is
          stolen, although app-based codes or security keys are generally preferred over SMS when available.
        </p>

        <h2>Business password tips</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Admin accounts</h3>
            <p>Use long unique passwords and enable 2FA for store admin, hosting, email and payment accounts.</p>
          </div>
          <div style={card}>
            <h3>Shared staff access</h3>
            <p>Avoid sharing one login. Create separate staff accounts where possible.</p>
          </div>
          <div style={card}>
            <h3>Document storage</h3>
            <p>Do not store passwords in plain text files, screenshots or unprotected spreadsheets.</p>
          </div>
          <div style={card}>
            <h3>Old employees</h3>
            <p>Remove access and change shared passwords when someone leaves the business.</p>
          </div>
        </div>

        <h2>Common password mistakes and fixes</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Using one password everywhere</h3>
            <p>Fix it by using a password manager and creating unique passwords for important accounts.</p>
          </div>
          <div style={card}>
            <h3>Saving passwords in browser only</h3>
            <p>Browser saving is convenient, but a dedicated password manager may give better control across devices.</p>
          </div>
          <div style={card}>
            <h3>Sharing passwords in chat</h3>
            <p>Use secure sharing features from a password manager instead of sending passwords through messages.</p>
          </div>
          <div style={card}>
            <h3>Using personal details</h3>
            <p>Avoid names, birthdays, phone numbers, shop names and predictable patterns.</p>
          </div>
          <div style={card}>
            <h3>Ignoring 2FA</h3>
            <p>Enable 2FA on important accounts, especially email and admin accounts.</p>
          </div>
          <div style={card}>
            <h3>Never reviewing old passwords</h3>
            <p>Periodically update weak or reused passwords, starting with your most important accounts.</p>
          </div>
        </div>

        <h2>Password safety checklist</h2>
        <ul style={list}>
          <li>Use unique passwords for every important account.</li>
          <li>Use 16 characters or more where possible.</li>
          <li>Use a password manager for storage.</li>
          <li>Enable two-factor authentication.</li>
          <li>Do not share passwords in plain text messages.</li>
          <li>Do not use names, birthdays or phone numbers.</li>
          <li>Update weak and reused passwords first.</li>
          <li>Remove access for old staff accounts.</li>
        </ul>

        <h2>What to do if a password may be exposed</h2>
        <ol style={list}>
          <li>Change the password immediately.</li>
          <li>If the password was reused, change it on every site where it was used.</li>
          <li>Enable two-factor authentication.</li>
          <li>Review account activity and logged-in devices.</li>
          <li>Check recovery email and phone number settings.</li>
          <li>Warn team members if it was a shared business account.</li>
        </ol>

        <h2>Frequently asked questions</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Are longer passwords better?</h3>
            <p>Yes. Longer passwords are generally stronger, especially when they are random or unpredictable.</p>
          </div>
          <div style={card}>
            <h3>Should I use symbols?</h3>
            <p>Symbols help, but length and uniqueness are more important than simply adding one symbol.</p>
          </div>
          <div style={card}>
            <h3>Is a passphrase good?</h3>
            <p>Yes, if it is long and not a common phrase or personal detail.</p>
          </div>
          <div style={card}>
            <h3>Can I reuse a strong password?</h3>
            <p>No. Reusing passwords is risky because one leak can affect multiple accounts.</p>
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
const code = { background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '16px', overflow: 'auto', color: '#e2e8f0' };
const list = { paddingLeft: '24px' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', margin: '20px 0' };
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const tableWrap = { overflowX: 'auto', margin: '20px 0', border: '1px solid #334155', borderRadius: '16px' };
const table = { width: '100%', borderCollapse: 'collapse', minWidth: '680px', background: '#1e293b' };
const th = { textAlign: 'left', padding: '14px', color: '#fff', borderBottom: '1px solid #334155', background: '#0f172a' };
const td = { padding: '14px', borderBottom: '1px solid #334155', verticalAlign: 'top' };

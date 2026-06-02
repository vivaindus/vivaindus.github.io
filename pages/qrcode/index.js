import React, { useEffect, useMemo, useRef, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import JSZip from 'jszip';
import { QRCodeCanvas } from 'qrcode.react';
import RelatedTools from '../../components/RelatedTools';

const QR_TYPES = {
  url: {
    label: 'Website URL',
    desc: 'Create a QR code for websites, landing pages, product pages, payment links and forms.'
  },
  text: {
    label: 'Plain Text',
    desc: 'Encode notes, product codes, serial numbers, IDs, instructions or short messages.'
  },
  email: {
    label: 'Email',
    desc: 'Open an email compose window with recipient, subject and message.'
  },
  phone: {
    label: 'Phone Call',
    desc: 'Create a QR code that opens a phone dialer.'
  },
  sms: {
    label: 'SMS',
    desc: 'Open an SMS message with phone number and message.'
  },
  whatsapp: {
    label: 'WhatsApp',
    desc: 'Open WhatsApp chat with a phone number and prepared message.'
  },
  wifi: {
    label: 'WiFi Login',
    desc: 'Let guests connect to WiFi by scanning a code.'
  },
  vcard: {
    label: 'vCard Contact',
    desc: 'Share contact details such as name, phone, email, company and website.'
  },
  location: {
    label: 'Map Location',
    desc: 'Encode latitude and longitude coordinates for map apps.'
  },
  event: {
    label: 'Calendar Event',
    desc: 'Create a calendar event QR with title, location, start date and end date.'
  }
};

const ERROR_LEVELS = [
  { value: 'L', label: 'Low - more capacity' },
  { value: 'M', label: 'Medium - balanced' },
  { value: 'Q', label: 'Quartile - safer print' },
  { value: 'H', label: 'High - best for logos/print' }
];

export default function QRCodeGen() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState('single');
  const [type, setType] = useState('url');
  const [singleInput, setSingleInput] = useState('https://www.shbstores.com/qrcode');
  const [bulkInput, setBulkInput] = useState('https://www.shbstores.com\nhttps://www.shbstores.com/qrcode');
  const [size, setSize] = useState(320);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [level, setLevel] = useState('H');
  const [includeMargin, setIncludeMargin] = useState(true);
  const [filePrefix, setFilePrefix] = useState('shb-qr');
  const [notification, setNotification] = useState('');
  const [zipping, setZipping] = useState(false);

  const [wifi, setWifi] = useState({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false
  });

  const [vcard, setVcard] = useState({
    name: '',
    company: '',
    title: '',
    phone: '',
    email: '',
    website: '',
    address: ''
  });

  const [email, setEmail] = useState({
    to: '',
    subject: '',
    body: ''
  });

  const [sms, setSms] = useState({
    phone: '',
    message: ''
  });

  const [whatsapp, setWhatsapp] = useState({
    phone: '',
    message: ''
  });

  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState({
    latitude: '',
    longitude: '',
    label: ''
  });

  const [eventData, setEventData] = useState({
    title: '',
    location: '',
    start: '',
    end: '',
    description: ''
  });

  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3500);
    return () => clearTimeout(timer);
  }, [notification]);

  const bulkLines = useMemo(() => {
    return bulkInput
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .slice(0, 500);
  }, [bulkInput]);

  const activeQrValue = useMemo(() => {
    return buildQRValue({
      type,
      singleInput,
      wifi,
      vcard,
      email,
      sms,
      whatsapp,
      phone,
      location,
      eventData
    });
  }, [type, singleInput, wifi, vcard, email, sms, whatsapp, phone, location, eventData]);

  const previewItems = useMemo(() => {
    if (mode === 'single') {
      return [{ id: 'single', label: 'Single QR', value: activeQrValue }];
    }

    return bulkLines.map((line, index) => ({
      id: `bulk-${index}`,
      label: `Line ${index + 1}`,
      value: buildBulkValue(type, line)
    }));
  }, [mode, activeQrValue, bulkLines, type]);

  const showToast = (message) => {
    setNotification(message);
  };

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lineNumbers = bulkInput.split('\n').map((_, index) => index + 1).join('\n');

  const resetStructuredFields = () => {
    setWifi({ ssid: '', password: '', encryption: 'WPA', hidden: false });
    setVcard({ name: '', company: '', title: '', phone: '', email: '', website: '', address: '' });
    setEmail({ to: '', subject: '', body: '' });
    setSms({ phone: '', message: '' });
    setWhatsapp({ phone: '', message: '' });
    setPhone('');
    setLocation({ latitude: '', longitude: '', label: '' });
    setEventData({ title: '', location: '', start: '', end: '', description: '' });
    setSingleInput('https://www.shbstores.com/qrcode');
    showToast('Fields reset.');
  };

  const downloadSingle = () => {
    const canvas = document.getElementById('qr-canvas-single');
    if (!canvas) {
      showToast('QR preview not found.');
      return;
    }

    downloadCanvas(canvas, `${sanitizeFileName(filePrefix)}.png`);
    showToast('QR code downloaded.');
  };

  const downloadZip = async () => {
    if (previewItems.length === 0) {
      showToast('No QR codes to download.');
      return;
    }

    setZipping(true);
    showToast('Preparing QR ZIP archive...');

    try {
      const zip = new JSZip();
      const folder = zip.folder('shb-qr-codes');
      const cleanPrefix = sanitizeFileName(filePrefix) || 'shb-qr';

      for (let index = 0; index < previewItems.length; index++) {
        const item = previewItems[index];
        const canvas = document.getElementById(`qr-canvas-${item.id}`);
        if (!canvas) continue;

        const blob = await canvasToBlob(canvas);
        folder.file(`${cleanPrefix}-${String(index + 1).padStart(3, '0')}.png`, blob);
      }

      folder.file('qr-data.txt', previewItems.map((item, index) => {
        return `${index + 1}. ${item.label}\n${item.value}`;
      }).join('\n\n'));

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${cleanPrefix}-qr-codes.zip`;
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast('ZIP downloaded successfully.');
    } catch {
      showToast('ZIP download failed. Try fewer QR codes.');
    } finally {
      setZipping(false);
    }
  };

  const copyQRValue = async () => {
    try {
      await navigator.clipboard.writeText(activeQrValue);
      showToast('QR data copied.');
    } catch {
      showToast('Copy failed.');
    }
  };

  if (!mounted) {
    return (
      <ToolboxLayout title="QR Code Generator" description="Loading QR code generator.">
        <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
          Loading QR engine...
        </div>
      </ToolboxLayout>
    );
  }

  return (
    <ToolboxLayout
      title="QR Code Generator - Free URL, WiFi, vCard and Bulk QR Maker"
      description="Generate QR codes for websites, text, WiFi, vCard contacts, email, phone, WhatsApp, SMS, location and events. Create single or bulk QR codes locally and download PNG or ZIP."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free local QR generator</p>
          <h1 style={heroTitle}>QR Code Generator</h1>
          <p style={heroText}>
            Create professional QR codes for URLs, WiFi, vCard contacts, WhatsApp, email, SMS, phone calls,
            locations and events. Generate one code or hundreds in bulk, then download PNG files or a ZIP archive.
          </p>
        </section>

        <section style={appGrid}>
          <main style={mainPanel}>
            <div style={modeTabs}>
              <button onClick={() => setMode('single')} style={mode === 'single' ? activeTab : tabBtn}>Single QR</button>
              <button onClick={() => setMode('bulk')} style={mode === 'bulk' ? activeTab : tabBtn}>Bulk QR</button>
            </div>

            <div style={typeGrid}>
              {Object.entries(QR_TYPES).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  style={type === key ? activeTypeBtn : typeBtn}
                >
                  <strong>{item.label}</strong>
                  <span>{item.desc}</span>
                </button>
              ))}
            </div>

            {mode === 'single' ? (
              <section style={inputCard}>
                <div style={sectionHeader}>
                  <h2 style={sectionTitle}>{QR_TYPES[type].label}</h2>
                  <button onClick={resetStructuredFields} style={ghostSmallBtn}>Reset</button>
                </div>

                {renderSingleFields({
                  type,
                  singleInput,
                  setSingleInput,
                  wifi,
                  setWifi,
                  vcard,
                  setVcard,
                  email,
                  setEmail,
                  sms,
                  setSms,
                  whatsapp,
                  setWhatsapp,
                  phone,
                  setPhone,
                  location,
                  setLocation,
                  eventData,
                  setEventData
                })}

                <div style={singleActions}>
                  <button onClick={copyQRValue} style={secondaryBtn}>Copy QR Data</button>
                  <button onClick={downloadSingle} style={primaryBtn}>Download PNG</button>
                </div>
              </section>
            ) : (
              <section style={inputCard}>
                <div style={sectionHeader}>
                  <div>
                    <h2 style={sectionTitle}>Bulk QR input</h2>
                    <p style={sectionText}>Enter one item per line. Bulk mode uses each line as direct QR data for the selected type.</p>
                  </div>
                  <span style={countPill}>{bulkLines.length} codes</span>
                </div>

                <div style={editorWrap}>
                  <div ref={lineNumbersRef} style={lineNumbersStyle}>
                    {lineNumbers}
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={bulkInput}
                    onChange={event => setBulkInput(event.target.value)}
                    onScroll={handleScroll}
                    placeholder="https://example.com&#10;https://example.com/contact&#10;https://example.com/product"
                    style={bulkTextarea}
                  />
                </div>

                <p style={hint}>
                  For bulk WiFi/vCard/event QR codes, use single QR mode for structured data. Bulk mode is best for URLs, text, product links, IDs and simple contact strings.
                </p>

                <button onClick={downloadZip} disabled={zipping || previewItems.length === 0} style={zipping || previewItems.length === 0 ? disabledBtn : primaryBtn}>
                  {zipping ? 'Preparing ZIP...' : `Download ZIP (${previewItems.length})`}
                </button>
              </section>
            )}

            <section style={previewSection}>
              <div style={sectionHeader}>
                <div>
                  <h2 style={sectionTitle}>Live Preview</h2>
                  <p style={sectionText}>
                    Preview shows {mode === 'single' ? 'the current QR code' : 'the first 12 QR codes'}.
                  </p>
                </div>

                {mode === 'bulk' && (
                  <button onClick={downloadZip} disabled={zipping || previewItems.length === 0} style={zipping || previewItems.length === 0 ? disabledSmallBtn : successSmallBtn}>
                    Download All
                  </button>
                )}
              </div>

              <div style={previewGrid}>
                {previewItems.slice(0, mode === 'single' ? 1 : 12).map((item) => (
                  <div key={item.id} style={qrCard}>
                    <div style={qrCanvasBox}>
                      <QRCodeCanvas
                        id={`qr-canvas-${item.id}`}
                        value={item.value || ' '}
                        size={Number(size)}
                        fgColor={fgColor}
                        bgColor={bgColor}
                        level={level}
                        includeMargin={includeMargin}
                      />
                    </div>
                    <strong style={qrLabel}>{item.label}</strong>
                    <span style={qrDataPreview}>{item.value}</span>
                    {mode === 'bulk' && (
                      <button
                        onClick={() => {
                          const canvas = document.getElementById(`qr-canvas-${item.id}`);
                          if (canvas) downloadCanvas(canvas, `${sanitizeFileName(filePrefix)}-${item.label.toLowerCase().replace(/\s+/g, '-')}.png`);
                        }}
                        style={miniBtn}
                      >
                        Download
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </main>

          <aside style={settingsPanel}>
            <h2 style={sideTitle}>QR Settings</h2>

            <label style={fieldWrap}>
              <span style={fieldLabel}>PNG size</span>
              <select value={size} onChange={event => setSize(Number(event.target.value))} style={inputStyle}>
                <option value={180}>180 × 180 px</option>
                <option value={256}>256 × 256 px</option>
                <option value={320}>320 × 320 px</option>
                <option value={512}>512 × 512 px</option>
                <option value={768}>768 × 768 px</option>
                <option value={1024}>1024 × 1024 px</option>
              </select>
            </label>

            <label style={fieldWrap}>
              <span style={fieldLabel}>Error correction</span>
              <select value={level} onChange={event => setLevel(event.target.value)} style={inputStyle}>
                {ERROR_LEVELS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>

            <label style={fieldWrap}>
              <span style={fieldLabel}>Foreground color</span>
              <input type="color" value={fgColor} onChange={event => setFgColor(event.target.value)} style={colorInput} />
            </label>

            <label style={fieldWrap}>
              <span style={fieldLabel}>Background color</span>
              <input type="color" value={bgColor} onChange={event => setBgColor(event.target.value)} style={colorInput} />
            </label>

            <label style={fieldWrap}>
              <span style={fieldLabel}>File prefix</span>
              <input value={filePrefix} onChange={event => setFilePrefix(event.target.value)} style={inputStyle} />
            </label>

            <label style={checkRow}>
              <input type="checkbox" checked={includeMargin} onChange={event => setIncludeMargin(event.target.checked)} />
              Include quiet-zone margin
            </label>

            <div style={tipBox}>
              <h3>Scan reliability tips</h3>
              <p>
                Use high contrast colors, keep the background light, include quiet-zone margin and choose high error correction for printed QR codes.
              </p>
            </div>
          </aside>
        </section>

        <section style={contentSection}>
          <h2>Free QR code generator for URLs, WiFi, vCard, WhatsApp and bulk QR codes</h2>
          <p>
            SHB ToolBox QR Code Generator helps you create scannable QR codes for websites, ecommerce product pages,
            Google Forms, business cards, WiFi access, WhatsApp chats, email messages, phone numbers, SMS, map locations
            and calendar events. You can create a single QR code or generate multiple QR codes from a list of links or text.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>URL QR code generator</h3>
              <p>
                Convert a website link, landing page, payment link, menu link, product URL, social profile or form URL
                into a QR code that users can scan instantly.
              </p>
            </div>

            <div style={seoCard}>
              <h3>WiFi QR code generator</h3>
              <p>
                Create WiFi QR codes for restaurants, offices, hotels, events and homes. Guests can scan the code to connect
                without manually typing the password.
              </p>
            </div>

            <div style={seoCard}>
              <h3>vCard QR code generator</h3>
              <p>
                Share contact details such as name, phone, email, company, title, website and address. vCard QR codes are useful
                for business cards, reception desks and networking events.
              </p>
            </div>

            <div style={seoCard}>
              <h3>WhatsApp QR code generator</h3>
              <p>
                Create QR codes that open a WhatsApp chat with a phone number and a prepared message. This is useful for online
                stores, customer support, lead generation and service bookings.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Bulk QR code generator</h3>
              <p>
                Paste multiple links or codes, one per line, and generate many QR codes at once. Download the complete batch
                as a ZIP file for labels, packaging, invitations, product sheets or marketing material.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Private local QR generation</h3>
              <p>
                QR codes are generated in your browser. The tool does not need to send your links, WiFi data, contact details
                or campaign data to a QR image API.
              </p>
            </div>
          </div>

          <h2>Best practices for printable QR codes</h2>
          <ul style={tipList}>
            <li>Keep the QR code dark and the background light for better scan reliability.</li>
            <li>Use enough margin or quiet zone around the QR code.</li>
            <li>Test the printed QR code using more than one phone before mass printing.</li>
            <li>Use larger QR sizes for posters, banners, packaging and outdoor displays.</li>
            <li>Avoid very long URLs when possible. Shorter QR data creates cleaner patterns.</li>
          </ul>
        </section>

        <section style={faqSection}>
          <h2>QR Code Generator FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>Can I create a QR code for a website link?</h3>
              <p>Yes. Choose Website URL, paste your link and download the PNG QR code.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I create a WiFi QR code?</h3>
              <p>Yes. Choose WiFi Login, enter the network name, password and encryption type.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I generate QR codes in bulk?</h3>
              <p>Yes. Switch to Bulk QR mode, enter one item per line and download all QR codes as a ZIP file.</p>
            </div>

            <div style={faqItem}>
              <h3>Does this QR generator use an external API?</h3>
              <p>No. QR previews and downloads are generated locally in the browser using canvas rendering.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function renderSingleFields(props) {
  const {
    type,
    singleInput,
    setSingleInput,
    wifi,
    setWifi,
    vcard,
    setVcard,
    email,
    setEmail,
    sms,
    setSms,
    whatsapp,
    setWhatsapp,
    phone,
    setPhone,
    location,
    setLocation,
    eventData,
    setEventData
  } = props;

  if (type === 'wifi') {
    return (
      <div style={formGrid}>
        <Field label="Network name / SSID">
          <input value={wifi.ssid} onChange={event => setWifi({ ...wifi, ssid: event.target.value })} style={inputStyle} placeholder="Office WiFi" />
        </Field>
        <Field label="Password">
          <input value={wifi.password} onChange={event => setWifi({ ...wifi, password: event.target.value })} style={inputStyle} placeholder="WiFi password" />
        </Field>
        <Field label="Encryption">
          <select value={wifi.encryption} onChange={event => setWifi({ ...wifi, encryption: event.target.value })} style={inputStyle}>
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">No password</option>
          </select>
        </Field>
        <label style={checkRow}>
          <input type="checkbox" checked={wifi.hidden} onChange={event => setWifi({ ...wifi, hidden: event.target.checked })} />
          Hidden network
        </label>
      </div>
    );
  }

  if (type === 'vcard') {
    return (
      <div style={formGrid}>
        <Field label="Full name">
          <input value={vcard.name} onChange={event => setVcard({ ...vcard, name: event.target.value })} style={inputStyle} placeholder="John Smith" />
        </Field>
        <Field label="Company">
          <input value={vcard.company} onChange={event => setVcard({ ...vcard, company: event.target.value })} style={inputStyle} />
        </Field>
        <Field label="Job title">
          <input value={vcard.title} onChange={event => setVcard({ ...vcard, title: event.target.value })} style={inputStyle} />
        </Field>
        <Field label="Phone">
          <input value={vcard.phone} onChange={event => setVcard({ ...vcard, phone: event.target.value })} style={inputStyle} />
        </Field>
        <Field label="Email">
          <input value={vcard.email} onChange={event => setVcard({ ...vcard, email: event.target.value })} style={inputStyle} />
        </Field>
        <Field label="Website">
          <input value={vcard.website} onChange={event => setVcard({ ...vcard, website: event.target.value })} style={inputStyle} />
        </Field>
        <Field label="Address">
          <textarea value={vcard.address} onChange={event => setVcard({ ...vcard, address: event.target.value })} style={textareaStyle} />
        </Field>
      </div>
    );
  }

  if (type === 'email') {
    return (
      <div style={formGrid}>
        <Field label="To email">
          <input value={email.to} onChange={event => setEmail({ ...email, to: event.target.value })} style={inputStyle} placeholder="name@example.com" />
        </Field>
        <Field label="Subject">
          <input value={email.subject} onChange={event => setEmail({ ...email, subject: event.target.value })} style={inputStyle} />
        </Field>
        <Field label="Message">
          <textarea value={email.body} onChange={event => setEmail({ ...email, body: event.target.value })} style={textareaStyle} />
        </Field>
      </div>
    );
  }

  if (type === 'phone') {
    return (
      <Field label="Phone number">
        <input value={phone} onChange={event => setPhone(event.target.value)} style={inputStyle} placeholder="+971501234567" />
      </Field>
    );
  }

  if (type === 'sms') {
    return (
      <div style={formGrid}>
        <Field label="Phone number">
          <input value={sms.phone} onChange={event => setSms({ ...sms, phone: event.target.value })} style={inputStyle} placeholder="+971501234567" />
        </Field>
        <Field label="Message">
          <textarea value={sms.message} onChange={event => setSms({ ...sms, message: event.target.value })} style={textareaStyle} />
        </Field>
      </div>
    );
  }

  if (type === 'whatsapp') {
    return (
      <div style={formGrid}>
        <Field label="WhatsApp number with country code">
          <input value={whatsapp.phone} onChange={event => setWhatsapp({ ...whatsapp, phone: event.target.value })} style={inputStyle} placeholder="971501234567" />
        </Field>
        <Field label="Prepared message">
          <textarea value={whatsapp.message} onChange={event => setWhatsapp({ ...whatsapp, message: event.target.value })} style={textareaStyle} />
        </Field>
      </div>
    );
  }

  if (type === 'location') {
    return (
      <div style={formGrid}>
        <Field label="Latitude">
          <input value={location.latitude} onChange={event => setLocation({ ...location, latitude: event.target.value })} style={inputStyle} placeholder="25.2048" />
        </Field>
        <Field label="Longitude">
          <input value={location.longitude} onChange={event => setLocation({ ...location, longitude: event.target.value })} style={inputStyle} placeholder="55.2708" />
        </Field>
        <Field label="Label">
          <input value={location.label} onChange={event => setLocation({ ...location, label: event.target.value })} style={inputStyle} placeholder="Dubai location" />
        </Field>
      </div>
    );
  }

  if (type === 'event') {
    return (
      <div style={formGrid}>
        <Field label="Event title">
          <input value={eventData.title} onChange={event => setEventData({ ...eventData, title: event.target.value })} style={inputStyle} />
        </Field>
        <Field label="Location">
          <input value={eventData.location} onChange={event => setEventData({ ...eventData, location: event.target.value })} style={inputStyle} />
        </Field>
        <Field label="Start date/time">
          <input type="datetime-local" value={eventData.start} onChange={event => setEventData({ ...eventData, start: event.target.value })} style={inputStyle} />
        </Field>
        <Field label="End date/time">
          <input type="datetime-local" value={eventData.end} onChange={event => setEventData({ ...eventData, end: event.target.value })} style={inputStyle} />
        </Field>
        <Field label="Description">
          <textarea value={eventData.description} onChange={event => setEventData({ ...eventData, description: event.target.value })} style={textareaStyle} />
        </Field>
      </div>
    );
  }

  return (
    <Field label={type === 'url' ? 'Website URL' : 'Text or data'}>
      <textarea
        value={singleInput}
        onChange={event => setSingleInput(event.target.value)}
        placeholder={type === 'url' ? 'https://www.example.com' : 'Enter text to encode'}
        style={largeTextarea}
      />
    </Field>
  );
}

function Field({ label, children }) {
  return (
    <label style={fieldWrap}>
      <span style={fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function buildQRValue(data) {
  const { type, singleInput, wifi, vcard, email, sms, whatsapp, phone, location, eventData } = data;

  if (type === 'wifi') {
    return `WIFI:T:${escapeWifi(wifi.encryption)};S:${escapeWifi(wifi.ssid)};P:${escapeWifi(wifi.password)};H:${wifi.hidden ? 'true' : 'false'};;`;
  }

  if (type === 'vcard') {
    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      vcard.name ? `FN:${vcard.name}` : '',
      vcard.company ? `ORG:${vcard.company}` : '',
      vcard.title ? `TITLE:${vcard.title}` : '',
      vcard.phone ? `TEL:${vcard.phone}` : '',
      vcard.email ? `EMAIL:${vcard.email}` : '',
      vcard.website ? `URL:${vcard.website}` : '',
      vcard.address ? `ADR:;;${vcard.address}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\n');
  }

  if (type === 'email') {
    return `mailto:${email.to}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
  }

  if (type === 'phone') {
    return `tel:${phone}`;
  }

  if (type === 'sms') {
    return `SMSTO:${sms.phone}:${sms.message}`;
  }

  if (type === 'whatsapp') {
    const cleanPhone = whatsapp.phone.replace(/[^\d]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsapp.message)}`;
  }

  if (type === 'location') {
    if (location.label) {
      return `geo:${location.latitude},${location.longitude}?q=${location.latitude},${location.longitude}(${encodeURIComponent(location.label)})`;
    }

    return `geo:${location.latitude},${location.longitude}`;
  }

  if (type === 'event') {
    return [
      'BEGIN:VEVENT',
      eventData.title ? `SUMMARY:${eventData.title}` : '',
      eventData.location ? `LOCATION:${eventData.location}` : '',
      eventData.start ? `DTSTART:${formatDateTime(eventData.start)}` : '',
      eventData.end ? `DTEND:${formatDateTime(eventData.end)}` : '',
      eventData.description ? `DESCRIPTION:${eventData.description}` : '',
      'END:VEVENT'
    ].filter(Boolean).join('\n');
  }

  return singleInput || ' ';
}

function buildBulkValue(type, line) {
  if (type === 'phone') return `tel:${line}`;
  if (type === 'email') return `mailto:${line}`;
  if (type === 'whatsapp') return `https://wa.me/${line.replace(/[^\d]/g, '')}`;
  if (type === 'location') return line.includes(',') ? `geo:${line}` : line;
  return line || ' ';
}

function escapeWifi(value) {
  return String(value || '').replace(/([\\;,:"])/g, '\\$1');
}

function formatDateTime(value) {
  return String(value || '').replace(/[-:]/g, '').replace('.000', '');
}

function sanitizeFileName(value) {
  return String(value || 'shb-qr')
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'shb-qr';
}

function canvasToBlob(canvas) {
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/png', 1);
  });
}

function downloadCanvas(canvas, filename) {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  link.click();
}

const pageWrap = { maxWidth: '1180px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '920px', margin: '0 auto', lineHeight: 1.75 };

const appGrid = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', alignItems: 'start' };
const mainPanel = { display: 'grid', gap: '22px' };
const settingsPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '24px', position: 'sticky', top: '92px', display: 'grid', gap: '18px' };

const modeTabs = { background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' };
const tabBtn = { background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '14px', padding: '13px', fontWeight: 850, cursor: 'pointer' };
const activeTab = { ...tabBtn, background: '#38bdf8', color: '#082f49', border: '1px solid #38bdf8' };

const typeGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' };
const typeBtn = { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '18px', padding: '15px', textAlign: 'left', display: 'grid', gap: '7px', cursor: 'pointer' };
const activeTypeBtn = { ...typeBtn, border: '1px solid #38bdf8', background: 'rgba(56,189,248,0.10)' };

const inputCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '18px' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start' };
const sectionTitle = { color: '#fff', margin: 0, fontSize: '1.3rem' };
const sectionText = { color: '#94a3b8', margin: '8px 0 0', lineHeight: 1.6, fontSize: '0.9rem' };

const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' };
const fieldWrap = { display: 'grid', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '13px', padding: '12px', outline: 'none' };
const textareaStyle = { ...inputStyle, minHeight: '90px', resize: 'vertical', lineHeight: 1.5 };
const largeTextarea = { ...inputStyle, minHeight: '150px', resize: 'vertical', lineHeight: 1.5 };

const editorWrap = { display: 'flex', background: '#0f172a', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden', height: '260px' };
const lineNumbersStyle = { width: '54px', background: '#111827', color: '#475569', padding: '16px 0', fontSize: '0.95rem', textAlign: 'center', lineHeight: '1.6', overflow: 'hidden', whiteSpace: 'pre' };
const bulkTextarea = { flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '16px', fontSize: '1rem', lineHeight: '1.6', resize: 'none', outline: 'none' };
const hint = { color: '#94a3b8', lineHeight: 1.6, margin: 0, fontSize: '0.9rem' };

const singleActions = { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '12px' };
const primaryBtn = { background: '#38bdf8', color: '#082f49', border: 'none', borderRadius: '14px', padding: '15px', fontWeight: 950, cursor: 'pointer' };
const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', borderRadius: '14px', padding: '15px', fontWeight: 850, cursor: 'pointer' };
const ghostSmallBtn = { background: '#0f172a', color: '#38bdf8', border: '1px solid #334155', borderRadius: '12px', padding: '9px 12px', fontWeight: 850, cursor: 'pointer' };
const disabledBtn = { ...primaryBtn, opacity: 0.45, cursor: 'not-allowed' };
const successSmallBtn = { background: '#34d399', color: '#052e16', border: 'none', borderRadius: '12px', padding: '10px 12px', fontWeight: 900, cursor: 'pointer' };
const disabledSmallBtn = { ...successSmallBtn, opacity: 0.45, cursor: 'not-allowed' };
const miniBtn = { background: 'transparent', color: '#38bdf8', border: '1px solid #334155', borderRadius: '12px', padding: '9px', cursor: 'pointer', fontWeight: 850 };
const countPill = { background: '#0f172a', border: '1px solid #334155', color: '#38bdf8', borderRadius: '999px', padding: '8px 12px', fontWeight: 900, whiteSpace: 'nowrap' };

const previewSection = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '18px' };
const previewGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '18px' };
const qrCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '14px', display: 'grid', gap: '10px', textAlign: 'center' };
const qrCanvasBox = { background: '#fff', borderRadius: '14px', padding: '12px', display: 'flex', justifyContent: 'center', overflow: 'hidden' };
const qrLabel = { color: '#fff', fontSize: '0.9rem' };
const qrDataPreview = { color: '#64748b', fontSize: '0.72rem', lineHeight: 1.4, wordBreak: 'break-word', maxHeight: '42px', overflow: 'hidden' };

const sideTitle = { color: '#fff', margin: 0, fontSize: '1.15rem' };
const colorInput = { width: '100%', height: '46px', background: '#0f172a', border: '1px solid #334155', borderRadius: '13px', padding: '6px', cursor: 'pointer' };
const checkRow = { color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' };
const tipBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', color: '#94a3b8', lineHeight: 1.65, fontSize: '0.9rem' };

const contentSection = { marginTop: '78px', borderTop: '1px solid #334155', paddingTop: '55px', color: '#cbd5e1', lineHeight: 1.85 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '30px 0' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '22px' };
const tipList = { paddingLeft: '20px', lineHeight: 1.9 };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px', color: '#cbd5e1', lineHeight: 1.8 };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };
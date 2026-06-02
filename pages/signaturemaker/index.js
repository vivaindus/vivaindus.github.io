import React, { useEffect, useRef, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const SIGNATURE_FONTS = [
  { label: 'Elegant Script', value: '"Brush Script MT", "Segoe Script", cursive' },
  { label: 'Classic Cursive', value: '"Lucida Handwriting", "Segoe Script", cursive' },
  { label: 'Modern Clean', value: 'Georgia, serif' },
  { label: 'Professional Serif', value: '"Times New Roman", serif' },
  { label: 'Simple Signature', value: '"Trebuchet MS", sans-serif' }
];

export default function SignatureMaker() {
  const canvasRef = useRef(null);
  const typedPreviewRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#111827');
  const [penSize, setPenSize] = useState(3);
  const [signatureText, setSignatureText] = useState('Your Name');
  const [fontFamily, setFontFamily] = useState(SIGNATURE_FONTS[0].value);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    if (!mounted) return;
    prepareCanvas();
  }, [mounted]);

  const prepareCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = window.devicePixelRatio || 1;
    const cssWidth = 760;
    const cssHeight = 260;

    canvas.width = cssWidth * ratio;
    canvas.height = cssHeight * ratio;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.clearRect(0, 0, cssWidth, cssHeight);
  };

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const source = event.touches?.[0] || event;

    return {
      x: source.clientX - rect.left,
      y: source.clientY - rect.top
    };
  };

  const startDrawing = (event) => {
    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const point = getPoint(event);

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);

    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const point = getPoint(event);

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    prepareCanvas();
    setNotification('Signature pad cleared.');
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith('image/')) {
      setNotification('Please upload a valid image file.');
      return;
    }

    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setMode('upload');
    setNotification('Signature image uploaded.');
    event.target.value = '';
  };

  const downloadDrawnSignature = (withBackground = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const output = document.createElement('canvas');
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.width / ratio;
    const height = canvas.height / ratio;

    output.width = width;
    output.height = height;

    const ctx = output.getContext('2d');

    if (withBackground) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(canvas, 0, 0, width, height);

    downloadCanvas(output, withBackground ? 'signature-white-background.png' : 'signature-transparent.png');
  };

  const downloadTypedSignature = async (withBackground = false) => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 320;

    const ctx = canvas.getContext('2d');

    if (withBackground) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = penColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `92px ${fontFamily}`;
    ctx.fillText(signatureText || 'Your Name', canvas.width / 2, canvas.height / 2);

    downloadCanvas(canvas, withBackground ? 'typed-signature-white-background.png' : 'typed-signature-transparent.png');
  };

  const downloadUploadedSignature = (withBackground = false) => {
    if (!uploadedImage) {
      setNotification('Upload a signature image first.');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxWidth = 900;
      const maxHeight = 320;
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);

      canvas.width = Math.max(1, Math.round(img.width * ratio));
      canvas.height = Math.max(1, Math.round(img.height * ratio));

      const ctx = canvas.getContext('2d');

      if (withBackground) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      downloadCanvas(canvas, withBackground ? 'uploaded-signature-white-background.png' : 'uploaded-signature-transparent.png');
    };

    img.src = uploadedImage;
  };

  const downloadActive = (withBackground = false) => {
    if (mode === 'draw') {
      downloadDrawnSignature(withBackground);
      return;
    }

    if (mode === 'type') {
      downloadTypedSignature(withBackground);
      return;
    }

    downloadUploadedSignature(withBackground);
  };
  return (
    <ToolboxLayout
      title="Signature Maker - Draw, Type or Upload Digital Signature"
      description="Create a digital signature online for free. Draw a signature, type a stylish signature, upload signature image and download transparent PNG privately in your browser."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based digital signature creator</p>
          <h1 style={heroTitle}>Signature Maker</h1>
          <p style={heroText}>
            Create a clean digital signature for invoices, PDF forms, contracts, letters, business documents and
            application files. Draw, type or upload your signature and download it as a transparent PNG.
          </p>

          <div style={heroBadges}>
            <span>✍️ Draw signature</span>
            <span>🔤 Type signature</span>
            <span>🖼️ Upload signature</span>
            <span>🔒 Private local export</span>
          </div>
        </section>

        <section style={appGrid}>
          <main style={mainPanel}>
            <section style={studioPanel}>
              <div style={sectionHeader}>
                <div>
                  <h2 style={sectionTitle}>Signature Studio</h2>
                  <p style={sectionText}>
                    Choose how you want to create your signature. Everything is processed inside your browser.
                  </p>
                </div>
              </div>

              <div style={modeGrid}>
                <button onClick={() => setMode('draw')} style={mode === 'draw' ? activeModeBtn : modeBtn}>
                  Draw
                </button>
                <button onClick={() => setMode('type')} style={mode === 'type' ? activeModeBtn : modeBtn}>
                  Type
                </button>
                <label style={mode === 'upload' ? activeModeBtn : modeBtn}>
                  Upload
                  <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                </label>
              </div>

              <div style={controlGrid}>
                <label style={fieldWrap}>
                  <span style={fieldLabel}>Signature color</span>
                  <input
                    type="color"
                    value={penColor}
                    onChange={event => setPenColor(event.target.value)}
                    style={colorInput}
                  />
                </label>

                {mode === 'draw' && (
                  <label style={fieldWrap}>
                    <span style={fieldLabel}>Pen size: {penSize}px</span>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={penSize}
                      onChange={event => setPenSize(Number(event.target.value))}
                      style={rangeStyle}
                    />
                  </label>
                )}

                {mode === 'type' && (
                  <label style={fieldWrap}>
                    <span style={fieldLabel}>Font style</span>
                    <select value={fontFamily} onChange={event => setFontFamily(event.target.value)} style={inputStyle}>
                      {SIGNATURE_FONTS.map(font => (
                        <option key={font.label} value={font.value}>{font.label}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {mode === 'draw' && (
                <div style={canvasPanel}>
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={signatureCanvas}
                    aria-label="Draw your signature"
                  />
                  <p style={canvasHint}>Draw inside the box using your mouse, touchpad, stylus or finger.</p>
                </div>
              )}

              {mode === 'type' && (
                <div style={typePanel}>
                  <label style={fieldWrap}>
                    <span style={fieldLabel}>Your name or signature text</span>
                    <input
                      value={signatureText}
                      onChange={event => setSignatureText(event.target.value)}
                      style={inputStyle}
                      placeholder="Type your name"
                    />
                  </label>

                  <div ref={typedPreviewRef} style={{ ...typedPreview, fontFamily, color: penColor }}>
                    {signatureText || 'Your Name'}
                  </div>
                </div>
              )}

              {mode === 'upload' && (
                <div style={uploadPanel}>
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded signature preview" style={uploadedPreview} />
                  ) : (
                    <div style={emptyUpload}>
                      <strong>No signature image uploaded</strong>
                      <span>Click Upload above and choose an image file.</span>
                    </div>
                  )}
                </div>
              )}

              <div style={actionGrid}>
                {mode === 'draw' && (
                  <button onClick={clearCanvas} style={secondaryBtn}>
                    Clear Pad
                  </button>
                )}

                <button onClick={() => downloadActive(false)} style={primaryBtn}>
                  Download Transparent PNG
                </button>

                <button onClick={() => downloadActive(true)} style={downloadWhiteBtn}>
                  Download White Background PNG
                </button>
              </div>
            </section>
          </main>

          <aside style={sidePanel}>
            <h2 style={sideTitle}>Best Uses</h2>

            <div style={tipBox}>
              <h3>Invoices and receipts</h3>
              <p>Create a signature image that can be added to invoice PDFs or business documents.</p>
            </div>

            <div style={tipBox}>
              <h3>PDF forms</h3>
              <p>Download transparent PNG and place it inside PDF editors, form tools or document apps.</p>
            </div>

            <div style={tipBox}>
              <h3>Professional letters</h3>
              <p>Use a typed signature style for official letters, proposals and quotations.</p>
            </div>

            <div style={privacyBox}>
              <h3>Private signature creation</h3>
              <p>Your signature is created locally in your browser. It is not uploaded to SHB ToolBox servers.</p>
            </div>
          </aside>
        </section>

        
        <RelatedTools currentPath="/signaturemaker" />

<section style={contentSection}>
          <h2>Free signature maker for digital documents</h2>
          <p>
            This Signature Maker helps you create a digital signature for invoices, PDF forms, business letters, proposals,
            receipts, contracts and other documents. You can draw your signature by hand, type a stylish signature using
            different fonts, or upload an existing signature image and export it as a PNG file.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Draw signature online</h3>
              <p>
                Use your mouse, touchpad, stylus or finger to draw a signature directly on the signature pad.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Type signature</h3>
              <p>
                Type your name and choose from professional font styles to create a clean signature for documents.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Transparent PNG signature</h3>
              <p>
                Download a transparent signature image that can be placed on PDFs, invoices, forms and letters.
              </p>
            </div>

            <div style={seoCard}>
              <h3>White background signature</h3>
              <p>
                Download a white background version for apps or websites that do not support transparent images.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Upload signature image</h3>
              <p>
                Upload an existing signature image and export it in a cleaner, document-friendly PNG format.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Private local processing</h3>
              <p>
                Your signature is created in your browser memory. This helps protect personal and business identity assets.
              </p>
            </div>
          </div>

          <h2>How to make a digital signature</h2>
          <ol style={tipList}>
            <li>Choose Draw, Type or Upload mode.</li>
            <li>Adjust signature color, pen size or font style.</li>
            <li>Create or preview your signature.</li>
            <li>Download the signature as transparent PNG or white background PNG.</li>
            <li>Add the signature image to invoices, PDF editors, contracts or forms.</li>
          </ol>

          <h2>When should you use a signature image?</h2>
          <p>
            A signature image is useful when you need to sign non-sensitive documents, add a signature to a PDF, mark approval
            on an invoice, prepare a quotation, or add a professional signature to a letter. For legally binding agreements,
            always check the legal requirements in your country and use a proper e-signature workflow when an audit trail,
            identity verification or consent record is required.
          </p>
        </section>

        <section style={faqSection}>
          <h2>Signature Maker FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>Can I draw my signature online?</h3>
              <p>Yes. Use Draw mode to create a signature with mouse, touchpad, stylus or finger.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I download a transparent signature?</h3>
              <p>Yes. Click Download Transparent PNG to save the signature without a background.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I type a signature?</h3>
              <p>Yes. Use Type mode, enter your name, choose a font style and download the result.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I upload my existing signature?</h3>
              <p>Yes. Use Upload mode to add an image file and export it as PNG.</p>
            </div>

            <div style={faqItem}>
              <h3>Is my signature uploaded?</h3>
              <p>No. The signature is processed locally in your browser by this tool.</p>
            </div>

            <div style={faqItem}>
              <h3>Is this legally binding?</h3>
              <p>This creates a signature image. For legal e-signature workflows, you may need identity verification and audit trails.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function downloadCanvas(canvas, fileName) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

const pageWrap = { maxWidth: '1180px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '920px', margin: '0 auto', lineHeight: 1.75 };
const heroBadges = { display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '24px', color: '#38bdf8', fontWeight: 850, fontSize: '0.88rem' };

const appGrid = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', alignItems: 'start' };
const mainPanel = { display: 'grid', gap: '22px' };
const sidePanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '24px', position: 'sticky', top: '92px', display: 'grid', gap: '18px' };

const studioPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '20px' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' };
const sectionTitle = { color: '#fff', margin: 0, fontSize: '1.28rem' };
const sectionText = { color: '#94a3b8', lineHeight: 1.65, margin: '8px 0 0', fontSize: '0.92rem' };

const modeGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' };
const modeBtn = { background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '14px', padding: '14px', fontWeight: 900, cursor: 'pointer', textAlign: 'center' };
const activeModeBtn = { ...modeBtn, background: '#38bdf8', color: '#082f49', border: '1px solid #38bdf8' };

const controlGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' };
const fieldWrap = { display: 'grid', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '13px', padding: '14px', outline: 'none', fontSize: '1rem' };
const rangeStyle = { width: '100%', accentColor: '#38bdf8' };
const colorInput = { width: '100%', height: '48px', background: '#0f172a', border: '1px solid #334155', borderRadius: '13px', padding: '5px', cursor: 'pointer' };

const canvasPanel = { background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '16px', overflowX: 'auto' };
const signatureCanvas = { background: 'transparent', border: '2px dashed #475569', borderRadius: '16px', touchAction: 'none', maxWidth: '100%' };
const canvasHint = { color: '#64748b', margin: '12px 0 0', fontSize: '0.88rem', textAlign: 'center' };

const typePanel = { display: 'grid', gap: '18px' };
const typedPreview = { minHeight: '220px', background: '#f8fafc', border: '1px solid #334155', borderRadius: '20px', display: 'grid', placeItems: 'center', fontSize: '4.6rem', textAlign: 'center', padding: '20px', overflowWrap: 'anywhere' };

const uploadPanel = { background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', minHeight: '260px', display: 'grid', placeItems: 'center', padding: '20px' };
const uploadedPreview = { maxWidth: '100%', maxHeight: '260px', objectFit: 'contain', background: '#fff', borderRadius: '14px', padding: '12px' };
const emptyUpload = { display: 'grid', gap: '8px', textAlign: 'center', color: '#94a3b8' };

const actionGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' };
const primaryBtn = { background: '#38bdf8', color: '#082f49', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: 950, cursor: 'pointer', fontSize: '1rem' };
const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: 900, cursor: 'pointer', fontSize: '0.95rem' };
const downloadWhiteBtn = { background: '#34d399', color: '#052e16', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: 950, cursor: 'pointer', fontSize: '1rem' };

const sideTitle = { color: '#fff', margin: 0, fontSize: '1.15rem' };
const tipBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', color: '#94a3b8', lineHeight: 1.65, fontSize: '0.9rem' };
const privacyBox = { ...tipBox, border: '1px solid #38bdf8' };

const contentSection = { marginTop: '78px', borderTop: '1px solid #334155', paddingTop: '55px', color: '#cbd5e1', lineHeight: 1.85 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '30px 0' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '22px' };
const tipList = { paddingLeft: '20px', lineHeight: 1.9 };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px', color: '#cbd5e1', lineHeight: 1.8 };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };
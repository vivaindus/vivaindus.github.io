import React, { useEffect, useMemo, useRef, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const PRESETS = [
  { key: 'uae-visa', label: 'UAE Visa Photo', width: 600, height: 600, desc: 'Square digital photo, commonly used for UAE visa-style online uploads.' },
  { key: 'passport-35x45', label: 'Passport 35×45mm', width: 413, height: 531, desc: 'Common passport photo ratio used in many countries.' },
  { key: 'us-2x2', label: 'US 2×2 inch', width: 600, height: 600, desc: 'Square passport-style photo size.' },
  { key: 'india-35x45', label: 'India Passport 35×45mm', width: 413, height: 531, desc: 'Common India passport-size photo ratio.' },
  { key: 'custom', label: 'Custom Size', width: 600, height: 600, desc: 'Enter your own pixel width and height.' }
];

export default function PassportPhotoMaker() {
  const previewCanvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [preset, setPreset] = useState('uae-visa');
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(600);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [fileName, setFileName] = useState('passport-photo');
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
    const selected = PRESETS.find(item => item.key === preset);
    if (!selected || selected.key === 'custom') return;

    setWidth(selected.width);
    setHeight(selected.height);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  }, [preset]);

  useEffect(() => {
    drawPreview();
  }, [imageObj, width, height, bgColor, zoom, offsetX, offsetY]);

  const selectedPreset = useMemo(() => {
    return PRESETS.find(item => item.key === preset) || PRESETS[0];
  }, [preset]);

  const handleUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith('image/')) {
      setNotification('Please upload a valid image file.');
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      setImageUrl(url);
      setImageObj(img);
      setFileName(file.name.replace(/\.[^.]+$/, '') || 'passport-photo');
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      setNotification('Photo loaded. Adjust crop and download.');
    };

    img.onerror = () => {
      setNotification('Could not read this image.');
    };

    img.src = url;
    event.target.value = '';
  };

  const clearPhoto = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);

    setImageUrl(null);
    setImageObj(null);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setNotification('Workspace cleared.');
  };

  const drawPreview = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const outputWidth = clampDimension(width);
    const outputHeight = clampDimension(height);
    const previewMaxWidth = 520;
    const previewScale = Math.min(previewMaxWidth / outputWidth, 1);

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    canvas.style.width = `${Math.round(outputWidth * previewScale)}px`;
    canvas.style.height = `${Math.round(outputHeight * previewScale)}px`;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    if (!imageObj) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 26px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Upload Photo', outputWidth / 2, outputHeight / 2);
      return;
    }

    const baseScale = Math.max(outputWidth / imageObj.width, outputHeight / imageObj.height);
    const finalScale = baseScale * zoom;

    const drawWidth = imageObj.width * finalScale;
    const drawHeight = imageObj.height * finalScale;

    const x = (outputWidth - drawWidth) / 2 + offsetX;
    const y = (outputHeight - drawHeight) / 2 + offsetY;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageObj, x, y, drawWidth, drawHeight);

    drawGuideLines(ctx, outputWidth, outputHeight);
  };

  const downloadSingle = () => {
    if (!imageObj) {
      setNotification('Upload a photo first.');
      return;
    }

    const canvas = buildPhotoCanvas();
    downloadCanvas(canvas, `${sanitizeFileName(fileName)}-${width}x${height}.png`);
  };

  const downloadPrintSheet = () => {
    if (!imageObj) {
      setNotification('Upload a photo first.');
      return;
    }

    const photoCanvas = buildPhotoCanvas();
    const sheet = document.createElement('canvas');

    sheet.width = 2480;
    sheet.height = 3508;

    const ctx = sheet.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sheet.width, sheet.height);

    const margin = 140;
    const gap = 60;
    const targetW = Math.min(520, photoCanvas.width);
    const targetH = Math.round(targetW * (photoCanvas.height / photoCanvas.width));

    let x = margin;
    let y = margin;

    for (let i = 0; i < 12; i++) {
      if (x + targetW > sheet.width - margin) {
        x = margin;
        y += targetH + gap + 40;
      }

      if (y + targetH > sheet.height - margin) break;

      ctx.drawImage(photoCanvas, x, y, targetW, targetH);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, targetW, targetH);

      ctx.fillStyle = '#64748b';
      ctx.font = '24px system-ui';
      ctx.fillText(`${width}×${height}px`, x, y + targetH + 28);

      x += targetW + gap;
    }

    downloadCanvas(sheet, `${sanitizeFileName(fileName)}-print-sheet-a4.png`);
  };

  const buildPhotoCanvas = () => {
    const canvas = document.createElement('canvas');
    const outputWidth = clampDimension(width);
    const outputHeight = clampDimension(height);

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    if (!imageObj) return canvas;

    const baseScale = Math.max(outputWidth / imageObj.width, outputHeight / imageObj.height);
    const finalScale = baseScale * zoom;

    const drawWidth = imageObj.width * finalScale;
    const drawHeight = imageObj.height * finalScale;

    const x = (outputWidth - drawWidth) / 2 + offsetX;
    const y = (outputHeight - drawHeight) / 2 + offsetY;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageObj, x, y, drawWidth, drawHeight);

    return canvas;
  };
  return (
    <ToolboxLayout
      title="Passport Photo Maker - Resize Photo for Passport, Visa and ID"
      description="Create passport-size photos online for free. Upload a photo, crop, resize, choose background color, download single photo or printable A4 photo sheet privately in your browser."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based passport photo resizer</p>
          <h1 style={heroTitle}>Passport Photo Maker</h1>
          <p style={heroText}>
            Create passport, visa and ID-style photos from your image. Choose a preset, adjust crop and zoom,
            set background color, then download a single photo or an A4 printable sheet.
          </p>

          <div style={heroBadges}>
            <span>📷 Passport presets</span>
            <span>✂️ Crop and zoom</span>
            <span>🖨️ A4 print sheet</span>
            <span>🔒 Private local export</span>
          </div>
        </section>

        <section style={appGrid}>
          <main style={mainPanel}>
            <section style={studioPanel}>
              <div style={sectionHeader}>
                <div>
                  <h2 style={sectionTitle}>Photo Studio</h2>
                  <p style={sectionText}>
                    Upload a photo, choose a size and position the face inside the frame.
                  </p>
                </div>

                {imageObj && (
                  <button onClick={clearPhoto} style={dangerBtn}>
                    Clear
                  </button>
                )}
              </div>

              {!imageObj ? (
                <div style={dropZone}>
                  <input type="file" accept="image/*" onChange={handleUpload} style={fileInput} />
                  <div style={dropIcon}>🖼️</div>
                  <strong>Click to upload photo</strong>
                  <span>JPG, PNG or WebP supported</span>
                </div>
              ) : (
                <div style={previewPanel}>
                  <canvas ref={previewCanvasRef} style={previewCanvas} />
                  <p style={canvasHint}>Guide lines are only for positioning and will not appear in the downloaded photo.</p>
                </div>
              )}
            </section>

            <section style={settingsPanel}>
              <div style={sectionHeader}>
                <div>
                  <h2 style={sectionTitle}>Settings</h2>
                  <p style={sectionText}>{selectedPreset.desc}</p>
                </div>
              </div>

              <label style={fieldWrap}>
                <span style={fieldLabel}>Photo preset</span>
                <select value={preset} onChange={event => setPreset(event.target.value)} style={inputStyle}>
                  {PRESETS.map(item => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
              </label>

              <div style={dimensionGrid}>
                <label style={fieldWrap}>
                  <span style={fieldLabel}>Width px</span>
                  <input
                    type="number"
                    value={width}
                    onChange={event => {
                      setPreset('custom');
                      setWidth(Number(event.target.value));
                    }}
                    style={inputStyle}
                  />
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Height px</span>
                  <input
                    type="number"
                    value={height}
                    onChange={event => {
                      setPreset('custom');
                      setHeight(Number(event.target.value));
                    }}
                    style={inputStyle}
                  />
                </label>
              </div>

              <div style={controlGrid}>
                <label style={fieldWrap}>
                  <span style={fieldLabel}>Background color</span>
                  <input type="color" value={bgColor} onChange={event => setBgColor(event.target.value)} style={colorInput} />
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Zoom: {zoom.toFixed(2)}x</span>
                  <input
                    type="range"
                    min="0.8"
                    max="3"
                    step="0.01"
                    value={zoom}
                    onChange={event => setZoom(Number(event.target.value))}
                    style={rangeStyle}
                  />
                </label>
              </div>

              <div style={controlGrid}>
                <label style={fieldWrap}>
                  <span style={fieldLabel}>Move left/right</span>
                  <input
                    type="range"
                    min="-400"
                    max="400"
                    step="1"
                    value={offsetX}
                    onChange={event => setOffsetX(Number(event.target.value))}
                    style={rangeStyle}
                  />
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Move up/down</span>
                  <input
                    type="range"
                    min="-400"
                    max="400"
                    step="1"
                    value={offsetY}
                    onChange={event => setOffsetY(Number(event.target.value))}
                    style={rangeStyle}
                  />
                </label>
              </div>

              <label style={fieldWrap}>
                <span style={fieldLabel}>Output file name</span>
                <input value={fileName} onChange={event => setFileName(event.target.value)} style={inputStyle} />
              </label>

              <div style={actionGrid}>
                <button onClick={downloadSingle} style={primaryBtn}>
                  Download Photo PNG
                </button>

                <button onClick={downloadPrintSheet} style={downloadWhiteBtn}>
                  Download A4 Print Sheet
                </button>
              </div>
            </section>
          </main>

          <aside style={sidePanel}>
            <h2 style={sideTitle}>Important Tips</h2>

            <div style={tipBox}>
              <h3>Use a clear front-facing photo</h3>
              <p>Use good lighting, neutral expression and avoid heavy shadows on the face.</p>
            </div>

            <div style={tipBox}>
              <h3>White background is default</h3>
              <p>Most passport and visa photos require a plain light or white background.</p>
            </div>

            <div style={tipBox}>
              <h3>Check official requirements</h3>
              <p>Photo size and rules vary by country, passport office and visa type.</p>
            </div>

            <div style={privacyBox}>
              <h3>Private photo editing</h3>
              <p>Your photo is processed locally in your browser. It is not uploaded to SHB ToolBox servers.</p>
            </div>
          </aside>
        </section>

        
        <RelatedTools currentPath="/passportphoto" />

<section style={contentSection}>
          <h2>Free passport photo maker for visa, ID and document photos</h2>
          <p>
            This Passport Photo Maker helps you create passport-size photos, visa photos and ID-style photos from a regular image.
            You can upload a photo, crop it to the required ratio, resize it to common passport photo dimensions, choose a background
            color and download a ready-to-use PNG image. You can also create an A4 printable sheet with multiple copies.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Passport photo resize</h3>
              <p>Resize your image to common passport photo dimensions such as square visa photos or 35×45mm-style ratios.</p>
            </div>

            <div style={seoCard}>
              <h3>Visa photo maker</h3>
              <p>Create a clean visa-style photo for online application uploads, forms and document portals.</p>
            </div>

            <div style={seoCard}>
              <h3>ID photo crop tool</h3>
              <p>Adjust zoom and position to keep the face centered inside the photo frame.</p>
            </div>

            <div style={seoCard}>
              <h3>White background photo</h3>
              <p>Use the default white background or choose another plain background color if required.</p>
            </div>

            <div style={seoCard}>
              <h3>A4 passport photo sheet</h3>
              <p>Download a printable A4 sheet with multiple copies of the same photo for printing.</p>
            </div>

            <div style={seoCard}>
              <h3>Private browser processing</h3>
              <p>Your image is edited locally in your browser. This helps protect personal photos and identity documents.</p>
            </div>
          </div>

          <h2>How to make a passport photo</h2>
          <ol style={tipList}>
            <li>Upload a clear portrait photo.</li>
            <li>Choose a passport, visa or custom photo size.</li>
            <li>Adjust zoom and position until the face is centered.</li>
            <li>Choose a background color, usually white.</li>
            <li>Download a single PNG photo or an A4 printable sheet.</li>
          </ol>

          <h2>Important passport photo note</h2>
          <p>
            Passport and visa photo requirements vary by country and authority. This tool helps you crop, resize and prepare a photo,
            but you should always verify the official rules for your specific passport, visa, Emirates ID, school ID, job application
            or government document before submitting.
          </p>
        </section>

        <section style={faqSection}>
          <h2>Passport Photo Maker FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>Can I make a passport photo online?</h3>
              <p>Yes. Upload a photo, choose a size, crop it and download the final PNG.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I create a visa photo?</h3>
              <p>Yes. Use the UAE Visa Photo preset or custom dimensions required by your application.</p>
            </div>

            <div style={faqItem}>
              <h3>Does this remove the background?</h3>
              <p>No. This version lets you set a plain background color behind the crop. Automatic background removal can be added later.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I print multiple copies?</h3>
              <p>Yes. Use Download A4 Print Sheet to create a printable sheet with multiple copies.</p>
            </div>

            <div style={faqItem}>
              <h3>Is my photo uploaded?</h3>
              <p>No. The photo is processed locally in your browser by this tool.</p>
            </div>

            <div style={faqItem}>
              <h3>Are the presets officially guaranteed?</h3>
              <p>No. Always check official requirements for your country or document authority before submission.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function drawGuideLines(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
  ctx.lineWidth = Math.max(1, Math.round(width / 350));

  ctx.setLineDash([10, 8]);

  ctx.beginPath();
  ctx.moveTo(width / 3, 0);
  ctx.lineTo(width / 3, height);
  ctx.moveTo((width * 2) / 3, 0);
  ctx.lineTo((width * 2) / 3, height);
  ctx.moveTo(0, height / 3);
  ctx.lineTo(width, height / 3);
  ctx.moveTo(0, (height * 2) / 3);
  ctx.lineTo(width, (height * 2) / 3);
  ctx.stroke();

  ctx.restore();
}

function clampDimension(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 600;
  return Math.max(100, Math.min(3000, Math.round(num)));
}

function downloadCanvas(canvas, fileName) {
  const link = document.createElement('a');
  link.download = sanitizeFileName(fileName);
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function sanitizeFileName(name) {
  const safe = String(name || 'passport-photo.png')
    .trim()
    .replace(/[^\w\-. ]+/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();

  return safe.endsWith('.png') ? safe : `${safe || 'passport-photo'}.png`;
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
const settingsPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '18px' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' };
const sectionTitle = { color: '#fff', margin: 0, fontSize: '1.28rem' };
const sectionText = { color: '#94a3b8', lineHeight: 1.65, margin: '8px 0 0', fontSize: '0.92rem' };

const dropZone = { position: 'relative', minHeight: '310px', background: '#0f172a', border: '2px dashed #334155', borderRadius: '22px', display: 'grid', placeItems: 'center', textAlign: 'center', color: '#cbd5e1', padding: '30px', gap: '8px' };
const fileInput = { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const dropIcon = { fontSize: '3rem' };

const previewPanel = { background: '#0f172a', border: '1px solid #334155', borderRadius: '22px', padding: '22px', display: 'grid', placeItems: 'center', overflowX: 'auto' };
const previewCanvas = { maxWidth: '100%', background: '#fff', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' };
const canvasHint = { color: '#64748b', margin: '14px 0 0', textAlign: 'center', fontSize: '0.86rem' };

const fieldWrap = { display: 'grid', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '13px', padding: '14px', outline: 'none', fontSize: '1rem' };
const rangeStyle = { width: '100%', accentColor: '#38bdf8' };
const colorInput = { width: '100%', height: '48px', background: '#0f172a', border: '1px solid #334155', borderRadius: '13px', padding: '5px', cursor: 'pointer' };

const dimensionGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' };
const controlGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' };
const actionGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' };

const primaryBtn = { background: '#38bdf8', color: '#082f49', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: 950, cursor: 'pointer', fontSize: '1rem' };
const downloadWhiteBtn = { background: '#34d399', color: '#052e16', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: 950, cursor: 'pointer', fontSize: '1rem' };
const dangerBtn = { background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '14px', padding: '12px 16px', fontWeight: 850, cursor: 'pointer' };

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
import React, { useMemo, useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import JSZip from 'jszip';
import RelatedTools from '../../components/RelatedTools';

const ICON_SIZES = [
  { size: 16, name: 'favicon-16x16.png', label: 'Browser tab' },
  { size: 32, name: 'favicon-32x32.png', label: 'Bookmark / desktop' },
  { size: 48, name: 'favicon-48x48.png', label: 'Windows / legacy' },
  { size: 96, name: 'favicon-96x96.png', label: 'High DPI browser' },
  { size: 180, name: 'apple-touch-icon.png', label: 'Apple touch icon' },
  { size: 192, name: 'android-chrome-192x192.png', label: 'Android / PWA' },
  { size: 512, name: 'android-chrome-512x512.png', label: 'PWA large icon' },
  { size: 512, name: 'maskable-icon-512x512.png', label: 'Maskable PWA icon', maskable: true }
];

export default function FaviconGenerator() {
  const [sourceImage, setSourceImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageInfo, setImageInfo] = useState(null);
  const [appName, setAppName] = useState('My Website');
  const [themeColor, setThemeColor] = useState('#0f172a');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [generating, setGenerating] = useState(false);
  const [notification, setNotification] = useState('');

  const implementationCode = useMemo(() => {
    return `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${themeColor}">`;
  }, [themeColor]);

  const manifestJson = useMemo(() => {
    return {
      name: appName || 'My Website',
      short_name: appName || 'Website',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      theme_color: themeColor,
      background_color: backgroundColor,
      display: 'standalone'
    };
  }, [appName, themeColor, backgroundColor]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotification('⚠️ Please upload a valid image file.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      setSourceImage(file);
      setPreviewUrl(url);
      setImageInfo({
        width: img.naturalWidth,
        height: img.naturalHeight,
        isSquare: img.naturalWidth === img.naturalHeight
      });
      setNotification('Image uploaded successfully ✅');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      setNotification('⚠️ Could not read this image. Try another file.');
    };

    img.src = url;
  };

  const resetImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSourceImage(null);
    setPreviewUrl('');
    setImageInfo(null);
    setNotification('Image removed');
  };

  const drawIconToCanvas = ({ img, size, maskable = false }) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, size, size);

    if (maskable) {
      ctx.fillStyle = backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, size, size);

      const safeSize = size * 0.72;
      const x = (size - safeSize) / 2;
      const y = (size - safeSize) / 2;
      ctx.drawImage(img, x, y, safeSize, safeSize);
      return canvas;
    }

    const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
    const drawWidth = img.naturalWidth * scale;
    const drawHeight = img.naturalHeight * scale;
    const x = (size - drawWidth) / 2;
    const y = (size - drawHeight) / 2;

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
    return canvas;
  };

  const generateIcons = async () => {
    if (!sourceImage || !previewUrl) {
      setNotification('⚠️ Please upload a logo first.');
      return;
    }

    setGenerating(true);

    try {
      const zip = new JSZip();
      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = previewUrl;
      });

      for (const icon of ICON_SIZES) {
        const canvas = drawIconToCanvas({ img, size: icon.size, maskable: icon.maskable });
        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        zip.file(icon.name, base64Data, { base64: true });
      }

      zip.file('site.webmanifest', JSON.stringify(manifestJson, null, 2));

      zip.file(
        'browserconfig.xml',
        `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/android-chrome-192x192.png"/>
      <TileColor>${themeColor}</TileColor>
    </tile>
  </msapplication>
</browserconfig>`
      );

      zip.file(
        'implementation_guide.txt',
        `SHB ToolBox - Favicon Implementation Guide

1. Upload all generated files to your website root folder or public folder.

Generated files:
${ICON_SIZES.map(icon => `- ${icon.name} (${icon.size}x${icon.size})`).join('\n')}
- site.webmanifest
- browserconfig.xml

2. Add this code inside your HTML <head> section:

${implementationCode}

3. For Next.js, place the generated files inside the /public folder and add the tags in your document head or layout head.

4. Test the favicon in:
- Browser tab
- Bookmark
- Mobile home screen
- PWA install prompt
- Lighthouse PWA checks

Note:
Use a square, simple, high-contrast logo for best results. Very detailed logos may become unreadable at 16x16 size.`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');

      link.href = URL.createObjectURL(content);
      link.download = 'favicon-package.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();

      setNotification('Favicon package downloaded 📦');
    } catch (error) {
      setNotification('⚠️ Could not generate package. Try another image.');
    } finally {
      setGenerating(false);
    }
  };

  const copyImplementation = async () => {
    try {
      await navigator.clipboard.writeText(implementationCode);
      setNotification('Implementation code copied 📋');
    } catch {
      setNotification('⚠️ Copy failed. Please copy manually.');
    }
  };

  return (
    <ToolboxLayout
      title="Favicon Generator - Create Browser Icons, Apple Touch Icons and PWA Icons"
      description="Use the free SHB ToolBox favicon generator to create favicon PNGs, Apple touch icons, Android Chrome icons, maskable PWA icons, site.webmanifest, browserconfig.xml, and implementation code."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free website icon package generator</p>
          <h1 style={heroTitle}>Favicon and App Icon Generator</h1>
          <p style={heroText}>
            Upload your logo and create a complete favicon package for browser tabs, bookmarks, iOS home screen icons,
            Android Chrome icons, and Progressive Web App installation. The ZIP includes PNG icons, a web manifest,
            browserconfig file, and ready-to-copy HTML tags.
          </p>
        </section>

        <section style={toolGrid}>
          <div style={mainPanel}>
            {!previewUrl ? (
              <label style={dropZone}>
                <input type="file" accept="image/*" onChange={handleUpload} style={fileInput} />
                <span style={dropIcon}>📁</span>
                <strong style={dropTitle}>Upload your logo or app icon</strong>
                <span style={dropText}>PNG, JPG, WebP, or SVG image. A square 512×512 or larger image is recommended.</span>
              </label>
            ) : (
              <div>
                <div style={previewHeader}>
                  <div>
                    <h2 style={panelTitle}>Preview package</h2>
                    <p style={panelText}>
                      Check how your icon may appear in different places before downloading the ZIP package.
                    </p>
                  </div>
                  <button onClick={resetImage} style={secondaryBtn}>Upload New</button>
                </div>

                <div style={imageInfoBox}>
                  <img src={previewUrl} style={sourcePreview} alt="Uploaded source icon" />
                  <div>
                    <p style={infoLine}><strong>Source size:</strong> {imageInfo?.width} × {imageInfo?.height}px</p>
                    <p style={imageInfo?.isSquare ? successText : warningText}>
                      {imageInfo?.isSquare
                        ? 'Good: your image is square, which is ideal for favicons.'
                        : 'Warning: your image is not square. The generator will fit it inside square icons, but a square logo usually looks better.'}
                    </p>
                  </div>
                </div>

                <div style={previewGrid}>
                  <div style={previewCard}>
                    <h3 style={previewTitle}>Browser tab</h3>
                    <div style={browserTab}>
                      <img src={previewUrl} style={tabIcon} alt="Tab icon preview" />
                      <span>My Website</span>
                    </div>
                  </div>

                  <div style={previewCard}>
                    <h3 style={previewTitle}>iOS home screen</h3>
                    <div style={phonePreview}>
                      <img src={previewUrl} style={iosIcon} alt="iOS icon preview" />
                      <span>{appName || 'Website'}</span>
                    </div>
                  </div>

                  <div style={previewCard}>
                    <h3 style={previewTitle}>Android / PWA</h3>
                    <div style={androidPreview}>
                      <div style={{ ...androidIconWrap, background: backgroundColor }}>
                        <img src={previewUrl} style={androidIcon} alt="PWA icon preview" />
                      </div>
                      <span>{appName || 'Website'}</span>
                    </div>
                  </div>
                </div>

                <div style={sizeGrid}>
                  {ICON_SIZES.map(icon => (
                    <div key={icon.name} style={sizeCard}>
                      <span style={sizeLabel}>{icon.label}</span>
                      <strong style={sizeName}>{icon.size}×{icon.size}</strong>
                      <small style={fileName}>{icon.name}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside style={settingsPanel}>
            <h2 style={panelTitle}>Package settings</h2>

            <div style={inputRow}>
              <label style={label}>App / website name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                style={inputStyle}
                placeholder="Example: My Website"
              />
            </div>

            <div style={inputRow}>
              <label style={label}>Theme color</label>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                style={colorInput}
              />
            </div>

            <div style={inputRow}>
              <label style={label}>PWA background color</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                style={colorInput}
              />
            </div>

            <button onClick={generateIcons} disabled={!previewUrl || generating} style={!previewUrl || generating ? disabledBtn : primaryBtn}>
              {generating ? 'Generating ZIP...' : 'Download Favicon ZIP'}
            </button>

            <button onClick={copyImplementation} style={secondaryBtn}>
              Copy HTML Tags
            </button>

            <div style={codeBox}>
              <h3 style={codeTitle}>HTML head code</h3>
              <pre style={preStyle}>{implementationCode}</pre>
            </div>
          </aside>
        </section>

        <section style={contentSection}>
          <h2 style={contentTitle}>What is a favicon?</h2>
          <p style={para}>
            A favicon is the small icon shown in browser tabs, bookmarks, history lists, search interfaces, and saved website
            shortcuts. A good favicon helps users recognize your website quickly, especially when many tabs are open.
            Modern websites often need more than one icon size because browsers, mobile devices, and PWA install screens use
            different surfaces.
          </p>

          <div style={infoGrid}>
            <div style={infoCard}>
              <h3 style={infoTitle}>Browser favicon PNGs</h3>
              <p style={paraSmall}>
                Small PNG favicons such as 16×16 and 32×32 are used for browser tabs and bookmarks. Simple, bold artwork
                usually works best because tiny icons lose fine detail.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>Apple touch icon</h3>
              <p style={paraSmall}>
                The Apple touch icon is used when iPhone or iPad users add a website to their Home Screen. A 180×180 PNG is
                commonly used for this purpose.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>PWA and Android icons</h3>
              <p style={paraSmall}>
                Progressive Web Apps use the web app manifest to define icons such as 192×192 and 512×512. These icons may
                appear during installation, on a launcher, or in app-like browser experiences.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>Maskable icons</h3>
              <p style={paraSmall}>
                Maskable icons give Android and PWA platforms more room to crop icons into different shapes. This generator
                creates a 512×512 maskable-style icon with safe inner padding.
              </p>
            </div>
          </div>

          <h2 style={contentTitle}>What files are included?</h2>
          <p style={para}>
            The downloaded ZIP includes favicon PNG files, Apple touch icon, Android Chrome icons, a maskable PWA icon,
            site.webmanifest, browserconfig.xml, and an implementation guide. You can place these files in your website
            public or root directory and paste the generated HTML tags into your page head.
          </p>

          <h2 style={contentTitle}>Tips for a better favicon</h2>
          <p style={para}>
            Use a square image with strong contrast, clear shape, and minimal detail. Avoid thin text, full business names,
            or complex photos because they may become unreadable at 16×16 pixels. If your logo has words, consider using only
            the symbol, initials, or a simplified mark for the favicon.
          </p>

          <h2 style={contentTitle}>Privacy note</h2>
          <p style={para}>
            This favicon generator works in your browser using canvas and ZIP creation. Your uploaded logo is used to create
            the icon files on the page and does not require an account. For important brand assets, always download and review
            the generated package before publishing it on your website.
          </p>
        </section>

        <section style={faqSection}>
          <h2 style={contentTitle}>Favicon Generator FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3 style={faqQ}>What image size should I upload?</h3>
              <p style={paraSmall}>A square image of at least 512×512 pixels is recommended. Larger square images usually produce cleaner results.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Do I still need favicon.ico?</h3>
              <p style={paraSmall}>Many modern sites use PNG favicons and a manifest. Some legacy setups still use favicon.ico, so check your project requirements.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>What is site.webmanifest?</h3>
              <p style={paraSmall}>It is a JSON file that tells browsers about your web app name, theme color, display mode, and app icons.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I use this for Next.js?</h3>
              <p style={paraSmall}>Yes. Place the generated files in the public folder and add the generated link tags to your head configuration.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

const pageWrap = { maxWidth: '1150px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '900px', margin: '0 auto', lineHeight: 1.75 };

const toolGrid = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', alignItems: 'start' };
const mainPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '30px', boxShadow: '0 14px 35px rgba(0,0,0,0.2)' };
const settingsPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', position: 'sticky', top: '92px' };

const dropZone = { border: '3px dashed #334155', padding: '100px 20px', borderRadius: '25px', textAlign: 'center', color: '#94a3b8', position: 'relative', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const dropIcon = { fontSize: '3rem' };
const dropTitle = { color: '#fff', fontSize: '1.2rem' };
const dropText = { color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', lineHeight: 1.6 };

const previewHeader = { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '22px' };
const panelTitle = { color: '#fff', fontSize: '1.35rem', margin: '0 0 8px' };
const panelText = { color: '#94a3b8', lineHeight: 1.6, margin: 0 };

const imageInfoBox = { display: 'flex', gap: '18px', alignItems: 'center', background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '18px', marginBottom: '20px' };
const sourcePreview = { width: '92px', height: '92px', objectFit: 'contain', background: '#fff', borderRadius: '16px', padding: '8px' };
const infoLine = { color: '#cbd5e1', margin: '0 0 8px' };
const successText = { color: '#34d399', lineHeight: 1.6, margin: 0 };
const warningText = { color: '#fbbf24', lineHeight: 1.6, margin: 0 };

const previewGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '20px' };
const previewCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '18px' };
const previewTitle = { color: '#38bdf8', fontSize: '0.95rem', margin: '0 0 14px' };
const browserTab = { background: '#e5e7eb', color: '#111827', borderRadius: '12px 12px 0 0', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' };
const tabIcon = { width: '16px', height: '16px', objectFit: 'contain' };
const phonePreview = { background: '#111827', minHeight: '120px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#fff', fontSize: '0.75rem' };
const iosIcon = { width: '58px', height: '58px', objectFit: 'contain', borderRadius: '14px', background: '#fff' };
const androidPreview = { background: '#111827', minHeight: '120px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#fff', fontSize: '0.75rem' };
const androidIconWrap = { width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' };
const androidIcon = { width: '46px', height: '46px', objectFit: 'contain' };

const sizeGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '20px' };
const sizeCard = { background: 'rgba(56,189,248,0.06)', border: '1px solid #334155', borderRadius: '16px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '6px' };
const sizeLabel = { color: '#94a3b8', fontSize: '0.78rem' };
const sizeName = { color: '#fff', fontSize: '1rem' };
const fileName = { color: '#64748b', lineHeight: 1.4 };

const inputRow = { marginBottom: '18px' };
const label = { fontSize: '0.78rem', color: '#94a3b8', fontWeight: 900, display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '14px', borderRadius: '14px', color: '#fff', fontSize: '1rem', outline: 'none' };
const colorInput = { width: '100%', height: '48px', background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '6px', cursor: 'pointer' };
const primaryBtn = { width: '100%', background: '#38bdf8', color: '#082f49', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: 950, cursor: 'pointer', marginBottom: '12px' };
const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 850, cursor: 'pointer' };
const disabledBtn = { ...primaryBtn, opacity: 0.45, cursor: 'not-allowed' };

const codeBox = { marginTop: '18px', background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '16px' };
const codeTitle = { color: '#38bdf8', margin: '0 0 10px', fontSize: '0.95rem' };
const preStyle = { color: '#cbd5e1', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.78rem', lineHeight: 1.55, margin: 0 };

const contentSection = { marginTop: '76px', borderTop: '1px solid #334155', paddingTop: '55px' };
const contentTitle = { color: '#fff', fontSize: '1.75rem', lineHeight: 1.25, margin: '0 0 18px' };
const para = { color: '#cbd5e1', lineHeight: 1.85, fontSize: '1rem', margin: '0 0 28px' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '28px 0 48px' };
const infoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '24px' };
const infoTitle = { color: '#38bdf8', margin: '0 0 12px', fontSize: '1.05rem' };
const paraSmall = { color: '#cbd5e1', lineHeight: 1.75, fontSize: '0.95rem', margin: 0 };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px' };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };
const faqQ = { color: '#fff', fontSize: '1rem', margin: '0 0 10px' };
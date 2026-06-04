import React, { useEffect, useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import imageCompression from 'browser-image-compression';

const outputFormats = {
  original: { label: 'Keep original format', fileType: undefined, extension: null },
  jpeg: { label: 'Convert to JPEG', fileType: 'image/jpeg', extension: 'jpg' },
  webp: { label: 'Convert to WebP', fileType: 'image/webp', extension: 'webp' },
  png: { label: 'Convert to PNG', fileType: 'image/png', extension: 'png' }
};

export default function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [originalInfo, setOriginalInfo] = useState(null);

  const [compressedFile, setCompressedFile] = useState(null);
  const [compressedUrl, setCompressedUrl] = useState('');
  const [compressedInfo, setCompressedInfo] = useState(null);

  const [quality, setQuality] = useState(0.8);
  const [maxSizeMB, setMaxSizeMB] = useState(1);
  const [maxWidthOrHeight, setMaxWidthOrHeight] = useState(1920);
  const [outputFormat, setOutputFormat] = useState('original');

  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notification, setNotification] = useState('');

  const savings = useMemo(() => {
    if (!originalFile || !compressedFile) return null;

    const savedBytes = originalFile.size - compressedFile.size;
    const savedPercent = originalFile.size > 0 ? (savedBytes / originalFile.size) * 100 : 0;

    return {
      savedBytes,
      savedPercent
    };
  }, [originalFile, compressedFile]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [originalUrl, compressedUrl]);

  const readImageInfo = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };

      img.onerror = reject;
      img.src = url;
    });
  };

  const resetCompressed = () => {
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedFile(null);
    setCompressedUrl('');
    setCompressedInfo(null);
    setProgress(0);
  };

  const resetAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);

    setOriginalFile(null);
    setOriginalUrl('');
    setOriginalInfo(null);
    setCompressedFile(null);
    setCompressedUrl('');
    setCompressedInfo(null);
    setProgress(0);
    setNotification('Workspace reset');
  };

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotification('⚠️ Please upload a valid image file.');
      return;
    }

    if (file.size > 40 * 1024 * 1024) {
      setNotification('⚠️ Please upload an image below 40 MB for browser performance.');
      return;
    }

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    resetCompressed();

    const url = URL.createObjectURL(file);

    try {
      const info = await readImageInfo(url);
      setOriginalFile(file);
      setOriginalUrl(url);
      setOriginalInfo(info);
      setNotification('Image loaded. Choose settings and compress 📸');
    } catch {
      URL.revokeObjectURL(url);
      setNotification('⚠️ Could not read this image. Try another file.');
    }
  };

  const handleUpload = (e) => {
    handleFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleCompress = async () => {
    if (!originalFile) {
      setNotification('⚠️ Please upload an image first.');
      return;
    }

    setCompressing(true);
    setProgress(0);
    resetCompressed();

    const format = outputFormats[outputFormat];

    const options = {
      maxSizeMB: Number(maxSizeMB) || 1,
      maxWidthOrHeight: Number(maxWidthOrHeight) || 1920,
      useWebWorker: true,
      initialQuality: Number(quality),
      alwaysKeepResolution: false,
      onProgress: (value) => setProgress(Math.round(value))
    };

    if (format.fileType) {
      options.fileType = format.fileType;
    }

    try {
      const optimizedFile = await imageCompression(originalFile, options);
      const url = URL.createObjectURL(optimizedFile);
      const info = await readImageInfo(url);

      setCompressedFile(optimizedFile);
      setCompressedUrl(url);
      setCompressedInfo(info);
      setProgress(100);
      setNotification('Image compressed successfully ✅');
    } catch (error) {
      setNotification('⚠️ Compression failed. Try another image or different settings.');
    } finally {
      setCompressing(false);
    }
  };

  const getDownloadName = () => {
    if (!originalFile) return 'compressed-image';

    const originalName = originalFile.name.replace(/\.[^/.]+$/, '');
    const selected = outputFormats[outputFormat];
    const fallbackExtension = originalFile.name.split('.').pop() || 'jpg';
    const extension = selected.extension || fallbackExtension;

    return `compressed-${originalName}.${extension}`;
  };

  const copyReport = async () => {
    if (!originalFile || !compressedFile || !savings) {
      setNotification('⚠️ Compress an image first.');
      return;
    }

    const report = [
      'SHB ToolBox Image Compression Report',
      `Original file: ${originalFile.name}`,
      `Original size: ${formatBytes(originalFile.size)}`,
      `Compressed size: ${formatBytes(compressedFile.size)}`,
      `Saved: ${formatBytes(Math.max(0, savings.savedBytes))} (${Math.max(0, savings.savedPercent).toFixed(1)}%)`,
      `Original dimensions: ${originalInfo?.width} × ${originalInfo?.height}px`,
      `Output dimensions: ${compressedInfo?.width} × ${compressedInfo?.height}px`,
      `Quality setting: ${Math.round(quality * 100)}%`,
      `Max size target: ${maxSizeMB} MB`,
      `Max width/height: ${maxWidthOrHeight}px`,
      `Output format: ${outputFormats[outputFormat].label}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(report);
      setNotification('Compression report copied 📋');
    } catch {
      setNotification('⚠️ Copy failed. Please copy manually.');
    }
  };

  return (
    <ToolboxLayout
      title="Image Compressor - Compress JPG, PNG and WebP Online"
      description="Use the free SHB ToolBox image compressor to reduce JPG, PNG and WebP file size, choose output quality, resize large images, convert formats, compare before and after size, and download optimized images."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based image optimizer</p>
          <h1 style={heroTitle}>Image Compressor</h1>
          <p style={heroText}>
            Compress images for websites, email, forms, blogs, product pages, and social media. Upload an image,
            choose quality and size settings, compare the before-and-after file size, and download the optimized version.
          </p>
        </section>

        <section style={toolGrid}>
          <div style={mainPanel}>
            {!originalFile ? (
              <label
                style={dropZone}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input type="file" accept="image/*" onChange={handleUpload} style={fileInput} />
                <span style={dropIcon}>🖼️</span>
                <strong style={dropTitle}>Upload or drag an image here</strong>
                <span style={dropText}>
                  Supports common browser-readable image formats such as JPG, PNG, WebP, and SVG previews.
                  HEIC support depends on your browser.
                </span>
              </label>
            ) : (
              <div>
                <div style={previewHeader}>
                  <div>
                    <h2 style={panelTitle}>Image preview</h2>
                    <p style={panelText}>Review the original and compressed image details.</p>
                  </div>
                  <button onClick={resetAll} style={secondaryBtn}>Reset</button>
                </div>

                <div style={compareGrid}>
                  <div style={imageCard}>
                    <span style={cardLabel}>Original</span>
                    <img src={originalUrl} style={imgPreview} alt="Original uploaded image" />
                    <div style={fileStats}>
                      <strong>{formatBytes(originalFile.size)}</strong>
                      <span>{originalInfo?.width} × {originalInfo?.height}px</span>
                      <span>{originalFile.type || 'Image file'}</span>
                    </div>
                  </div>

                  <div style={imageCard}>
                    <span style={cardLabelSuccess}>Compressed</span>
                    {compressedUrl ? (
                      <>
                        <img src={compressedUrl} style={imgPreview} alt="Compressed image preview" />
                        <div style={fileStats}>
                          <strong>{formatBytes(compressedFile.size)}</strong>
                          <span>{compressedInfo?.width} × {compressedInfo?.height}px</span>
                          <span>{compressedFile.type || 'Optimized image'}</span>
                        </div>
                      </>
                    ) : (
                      <div style={placeholderBox}>
                        Compressed preview will appear here after processing.
                      </div>
                    )}
                  </div>
                </div>

                {compressedFile && savings && (
                  <div style={savingBox}>
                    <div>
                      <span style={savingLabel}>Size saved</span>
                      <strong style={savingValue}>{formatBytes(Math.max(0, savings.savedBytes))}</strong>
                    </div>
                    <div>
                      <span style={savingLabel}>Reduction</span>
                      <strong style={savingValue}>{Math.max(0, savings.savedPercent).toFixed(1)}%</strong>
                    </div>
                    <div>
                      <span style={savingLabel}>Final size</span>
                      <strong style={savingValue}>{formatBytes(compressedFile.size)}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside style={settingsPanel}>
            <h2 style={panelTitle}>Compression settings</h2>

            <div style={inputRow}>
              <div style={labelLine}>
                <label style={label}>Quality</label>
                <span style={valuePill}>{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                style={rangeStyle}
              />
              <p style={hint}>Higher quality keeps more detail. Lower quality reduces file size more.</p>
            </div>

            <div style={inputRow}>
              <label style={label}>Target max file size</label>
              <select value={maxSizeMB} onChange={(e) => setMaxSizeMB(Number(e.target.value))} style={inputStyle}>
                <option value={0.2}>200 KB</option>
                <option value={0.5}>500 KB</option>
                <option value={1}>1 MB</option>
                <option value={2}>2 MB</option>
                <option value={5}>5 MB</option>
              </select>
            </div>

            <div style={inputRow}>
              <label style={label}>Max width or height</label>
              <select value={maxWidthOrHeight} onChange={(e) => setMaxWidthOrHeight(Number(e.target.value))} style={inputStyle}>
                <option value={800}>800 px</option>
                <option value={1200}>1200 px</option>
                <option value={1600}>1600 px</option>
                <option value={1920}>1920 px</option>
                <option value={2560}>2560 px</option>
                <option value={4096}>4096 px</option>
              </select>
            </div>

            <div style={inputRow}>
              <label style={label}>Output format</label>
              <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} style={inputStyle}>
                {Object.entries(outputFormats).map(([key, item]) => (
                  <option key={key} value={key}>{item.label}</option>
                ))}
              </select>
            </div>

            {compressing && (
              <div style={progressWrap}>
                <div style={{ ...progressBar, width: `${progress}%` }} />
                <span style={progressText}>{progress}%</span>
              </div>
            )}

            <button onClick={handleCompress} disabled={!originalFile || compressing} style={!originalFile || compressing ? disabledBtn : primaryBtn}>
              {compressing ? 'Compressing...' : 'Compress Image'}
            </button>

            {compressedUrl && (
              <>
                <a href={compressedUrl} download={getDownloadName()} style={downloadBtn}>
                  Download Optimized Image
                </a>
                <button onClick={copyReport} style={secondaryFullBtn}>Copy Report</button>
              </>
            )}

            <div style={tipBox}>
              <h3 style={tipTitle}>Recommended settings</h3>
              <p style={tipText}>
                For websites, try 75–85% quality and 1600–1920 px max size. For email or forms, try 60–75% quality and a smaller file target.
              </p>
            </div>
          </aside>
        </section>
<section style={contentSection}>
          <h2 style={contentTitle}>What does image compression do?</h2>
          <p style={para}>
            Image compression reduces file size so images load faster and are easier to upload, email, store, and publish.
            The goal is to keep the image visually useful while removing unnecessary file weight. This can help websites feel
            faster, reduce bandwidth use, and make image-heavy pages easier to browse.
          </p>

          <div style={infoGrid}>
            <div style={infoCard}>
              <h3 style={infoTitle}>For websites and SEO</h3>
              <p style={paraSmall}>
                Large images can slow down pages, especially on mobile connections. Compressing banners, blog images,
                product photos, and thumbnails can improve page experience and reduce loading time.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>For forms and email</h3>
              <p style={paraSmall}>
                Many application forms, portals, and email platforms have file size limits. Compressing an image can help it
                fit upload limits without manually resizing it in design software.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>For social media and ecommerce</h3>
              <p style={paraSmall}>
                Product photos and social media images should be sharp but not unnecessarily heavy. A balanced quality setting
                can keep images clear while reducing file size.
              </p>
            </div>
          </div>

          <h2 style={contentTitle}>How to choose compression quality</h2>
          <p style={para}>
            A quality setting around 80% is often a good starting point for general web images. If the file is still too large,
            reduce the quality or lower the maximum width and height. If the image contains text, logos, product details, or
            important fine lines, keep quality higher and preview the result before publishing.
          </p>

          <h2 style={contentTitle}>JPG, PNG, and WebP compression</h2>
          <p style={para}>
            JPG is usually good for photos. PNG is useful for transparent graphics, screenshots, and logos, but it can be larger.
            WebP often provides strong compression for web use, but you should confirm compatibility with your website, app,
            or upload platform before converting every image.
          </p>

          <h2 style={contentTitle}>Privacy note</h2>
          <p style={para}>
            This image compressor is designed to work in your browser using client-side processing. Your image is selected on
            your device, compressed in the browser, and downloaded from the page. For sensitive documents, always review the
            image and output file before sharing it.
          </p>
        </section>

        <section style={faqSection}>
          <h2 style={contentTitle}>Image Compressor FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3 style={faqQ}>Will compression reduce image quality?</h3>
              <p style={paraSmall}>Some quality reduction may happen, especially at lower settings. Use the preview and compare the output before publishing.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>What quality setting should I use?</h3>
              <p style={paraSmall}>Start around 80% for websites. Use higher quality for product details and lower quality when file size matters more.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I convert images to WebP?</h3>
              <p style={paraSmall}>Yes, choose WebP as the output format. Confirm your target platform supports WebP before uploading.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Why is my PNG still large?</h3>
              <p style={paraSmall}>PNG files can remain large because they preserve transparency and sharp edges. Try WebP or JPEG if transparency is not needed.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function formatBytes(bytes) {
  const safeBytes = Number(bytes) || 0;
  if (safeBytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(safeBytes) / Math.log(1024));
  const value = safeBytes / Math.pow(1024, index);

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 2)} ${units[index]}`;
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

const dropZone = { border: '3px dashed #334155', padding: '90px 20px', borderRadius: '26px', textAlign: 'center', color: '#94a3b8', position: 'relative', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const dropIcon = { fontSize: '3.5rem' };
const dropTitle = { color: '#fff', fontSize: '1.2rem' };
const dropText = { color: '#94a3b8', fontSize: '0.9rem', maxWidth: '430px', lineHeight: 1.6 };

const previewHeader = { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '22px' };
const panelTitle = { color: '#fff', fontSize: '1.35rem', margin: '0 0 8px' };
const panelText = { color: '#94a3b8', lineHeight: 1.6, margin: 0 };

const compareGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' };
const imageCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '18px', textAlign: 'center' };
const cardLabel = { color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900, fontSize: '0.78rem' };
const cardLabelSuccess = { color: '#34d399', textTransform: 'uppercase', fontWeight: 900, fontSize: '0.78rem' };
const imgPreview = { width: '100%', height: '240px', objectFit: 'contain', borderRadius: '14px', marginTop: '14px', background: '#111827' };
const fileStats = { display: 'flex', flexDirection: 'column', gap: '6px', color: '#94a3b8', marginTop: '14px', fontSize: '0.9rem' };
const placeholderBox = { height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic', border: '1px dashed #334155', borderRadius: '14px', marginTop: '14px', padding: '20px' };

const savingBox = { marginTop: '18px', background: 'rgba(56,189,248,0.08)', border: '1px solid #334155', borderRadius: '18px', padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' };
const savingLabel = { color: '#94a3b8', display: 'block', fontSize: '0.8rem', marginBottom: '5px' };
const savingValue = { color: '#38bdf8', fontSize: '1.2rem' };

const inputRow = { marginBottom: '20px' };
const labelLine = { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '10px' };
const label = { fontSize: '0.78rem', color: '#94a3b8', fontWeight: 900, display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' };
const valuePill = { color: '#38bdf8', background: '#0f172a', border: '1px solid #334155', padding: '6px 10px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 850 };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '14px', borderRadius: '14px', color: '#fff', fontSize: '1rem', outline: 'none' };
const rangeStyle = { width: '100%', accentColor: '#38bdf8' };
const hint = { color: '#64748b', lineHeight: 1.55, fontSize: '0.84rem', margin: '10px 0 0' };

const progressWrap = { background: '#0f172a', border: '1px solid #334155', height: '28px', borderRadius: '999px', position: 'relative', overflow: 'hidden', marginBottom: '14px' };
const progressBar = { height: '100%', background: '#38bdf8', transition: 'width 0.2s ease' };
const progressText = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#0f172a', fontWeight: 900, fontSize: '0.8rem' };

const primaryBtn = { width: '100%', background: '#38bdf8', color: '#082f49', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: 950, cursor: 'pointer', marginBottom: '12px' };
const disabledBtn = { ...primaryBtn, opacity: 0.45, cursor: 'not-allowed' };
const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 850, cursor: 'pointer' };
const secondaryFullBtn = { width: '100%', background: '#334155', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 850, cursor: 'pointer', marginTop: '12px' };
const downloadBtn = { display: 'block', textAlign: 'center', background: '#34d399', color: '#052e16', textDecoration: 'none', padding: '15px', borderRadius: '14px', fontWeight: 950, marginBottom: '12px' };

const tipBox = { marginTop: '18px', background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '16px' };
const tipTitle = { color: '#38bdf8', margin: '0 0 10px', fontSize: '1rem' };
const tipText = { color: '#94a3b8', lineHeight: 1.7, fontSize: '0.88rem', margin: 0 };

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
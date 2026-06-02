import React, { useEffect, useMemo, useRef, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import JSZip from 'jszip';

const OUTPUT_FORMATS = [
  { value: 'image/png', label: 'PNG - lossless quality', extension: 'png' },
  { value: 'image/jpeg', label: 'JPG - smaller file size', extension: 'jpg' },
  { value: 'image/webp', label: 'WebP - modern web format', extension: 'webp' }
];

const SCALE_OPTIONS = [
  { value: 1, label: '1x - Fast preview' },
  { value: 1.5, label: '1.5x - Balanced' },
  { value: 2, label: '2x - HD' },
  { value: 2.5, label: '2.5x - Extra HD' },
  { value: 3, label: '3x - Print sharp' }
];

export default function PDFToImage() {
  const [mounted, setMounted] = useState(false);
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [images, setImages] = useState([]);
  const [format, setFormat] = useState('image/png');
  const [scale, setScale] = useState(2.5);
  const [quality, setQuality] = useState(0.92);
  const [pageMode, setPageMode] = useState('all');
  const [pageRange, setPageRange] = useState('1-3');
  const [filePrefix, setFilePrefix] = useState('pdf-page');
  const [whiteBackground, setWhiteBackground] = useState(true);
  const [converting, setConverting] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notification, setNotification] = useState('');

  const cancelRef = useRef(false);

  const selectedPages = useMemo(() => {
    if (!pageCount) return [];
    if (pageMode === 'all') return Array.from({ length: pageCount }, (_, index) => index + 1);
    return parsePageRange(pageRange, pageCount);
  }, [pageMode, pageRange, pageCount]);

  const outputExtension = useMemo(() => {
    return OUTPUT_FORMATS.find(item => item.value === format)?.extension || 'png';
  }, [format]);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      loadPdfJs()
        .then(setPdfjsLib)
        .catch(() => {
          setNotification('PDF engine failed to load. Please refresh the page.');
        });
    }
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.url));
    };
  }, [images]);

  const showToast = (message) => {
    setNotification(message);
  };

  const handleFiles = async (fileList) => {
    const file = Array.from(fileList || []).find(item => item.type === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf'));

    if (!file) {
      showToast('Please upload a valid PDF file.');
      return;
    }

    if (file.size > 80 * 1024 * 1024) {
      showToast('This PDF is very large. Please use a file below 80 MB for browser performance.');
      return;
    }

    clearImageResults();
    setPdfFile(file);
    setPageCount(0);
    setProgress(0);
    setFilePrefix(sanitizeFileName(file.name.replace(/\.pdf$/i, '')) || 'pdf-page');

    if (!pdfjsLib) {
      showToast('PDF engine is still loading. Try again in a moment.');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      setPageCount(pdf.numPages);
      setPageRange(pdf.numPages >= 3 ? '1-3' : `1-${pdf.numPages}`);
      showToast(`PDF loaded successfully. ${pdf.numPages} page${pdf.numPages === 1 ? '' : 's'} detected.`);
    } catch {
      showToast('Could not read this PDF. It may be password protected or damaged.');
    }
  };

  const handleUpload = (event) => {
    handleFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const clearImageResults = () => {
    setImages(prev => {
      prev.forEach(image => URL.revokeObjectURL(image.url));
      return [];
    });
  };

  const clearWorkspace = () => {
    cancelRef.current = true;
    clearImageResults();
    setPdfFile(null);
    setPageCount(0);
    setProgress(0);
    setConverting(false);
    showToast('Workspace cleared.');
  };

  const cancelConversion = () => {
    cancelRef.current = true;
    setConverting(false);
    showToast('Conversion cancelled.');
  };

  const convertPDF = async () => {
    if (!pdfFile) {
      showToast('Please upload a PDF first.');
      return;
    }

    if (!pdfjsLib) {
      showToast('PDF engine is still loading. Please wait.');
      return;
    }

    const pagesToConvert = selectedPages;

    if (pagesToConvert.length === 0) {
      showToast('No valid pages selected. Check your page range.');
      return;
    }

    if (pagesToConvert.length > 120) {
      showToast('Please convert 120 pages or fewer at once for browser performance.');
      return;
    }

    cancelRef.current = false;
    setConverting(true);
    setProgress(0);
    clearImageResults();

    try {
      const buffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const output = [];

      for (let index = 0; index < pagesToConvert.length; index++) {
        if (cancelRef.current) break;

        const pageNumber = pagesToConvert[index];
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: Number(scale) });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { alpha: format === 'image/png' && !whiteBackground });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        if (whiteBackground || format !== 'image/png') {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
        }

        await page.render({
          canvasContext: context,
          viewport
        }).promise;

        const blob = await canvasToBlob(canvas, format, Number(quality));
        const url = URL.createObjectURL(blob);

        output.push({
          page: pageNumber,
          url,
          blob,
          width: canvas.width,
          height: canvas.height,
          size: blob.size,
          extension: outputExtension
        });

        setImages([...output]);
        setProgress(Math.round(((index + 1) / pagesToConvert.length) * 100));
      }

      if (!cancelRef.current) {
        showToast(`Converted ${output.length} page${output.length === 1 ? '' : 's'} successfully.`);
      }
    } catch (error) {
      showToast('Error converting PDF. It may be password protected or too large.');
    } finally {
      setConverting(false);
    }
  };

  const downloadSingle = (image) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `${sanitizeFileName(filePrefix)}-page-${padNumber(image.page)}.${image.extension}`;
    link.click();
  };

  const downloadZip = async () => {
    if (images.length === 0) {
      showToast('No converted images to download.');
      return;
    }

    setZipping(true);

    try {
      const zip = new JSZip();
      const cleanPrefix = sanitizeFileName(filePrefix) || 'pdf-page';

      images.forEach(image => {
        zip.file(`${cleanPrefix}-page-${padNumber(image.page)}.${image.extension}`, image.blob);
      });

      zip.file(
        'conversion-info.txt',
        [
          'SHB ToolBox PDF to Image Export',
          `Source PDF: ${pdfFile?.name || 'Unknown'}`,
          `Total exported images: ${images.length}`,
          `Format: ${outputExtension.toUpperCase()}`,
          `Scale: ${scale}x`,
          `Generated locally in browser.`
        ].join('\n')
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(content);

      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `${cleanPrefix}-images.zip`;
      link.click();

      setTimeout(() => URL.revokeObjectURL(zipUrl), 1500);
      showToast('ZIP archive downloaded.');
    } catch {
      showToast('ZIP creation failed. Try fewer pages.');
    } finally {
      setZipping(false);
    }
  };

  if (!mounted) {
    return (
      <ToolboxLayout title="PDF to Image Converter" description="Loading PDF converter.">
        <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
          Loading PDF rendering engine...
        </div>
      </ToolboxLayout>
    );
  }

  return (
    <ToolboxLayout
      title="PDF to Image Converter - Convert PDF to JPG, PNG and WebP"
      description="Convert PDF pages to high-resolution JPG, PNG or WebP images. Select page ranges, choose image quality, download single pages or export all converted pages as a ZIP file."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based PDF extraction tool</p>
          <h1 style={heroTitle}>PDF to Image Converter</h1>
          <p style={heroText}>
            Convert PDF pages into sharp PNG, JPG or WebP images. Upload a document, select all pages or a custom page range,
            choose output quality, preview the results and download individual pages or a complete ZIP archive.
          </p>
        </section>

        <section style={toolGrid}>
          <main style={mainPanel}>
            {!pdfFile ? (
              <label
                style={dropZone}
                onDragOver={event => event.preventDefault()}
                onDrop={handleDrop}
              >
                <input type="file" accept="application/pdf,.pdf" onChange={handleUpload} style={fileInput} />
                <span style={dropIcon}>📄</span>
                <strong style={dropTitle}>Upload or drag a PDF here</strong>
                <span style={dropText}>Convert PDF pages into high-resolution images directly in your browser.</span>
              </label>
            ) : (
              <div style={fileBox}>
                <div>
                  <h2 style={fileName}>{pdfFile.name}</h2>
                  <p style={fileMeta}>
                    {formatBytes(pdfFile.size)} • {pageCount || 'Reading'} page{pageCount === 1 ? '' : 's'}
                  </p>
                </div>
                <button onClick={clearWorkspace} style={dangerBtn}>Clear</button>
              </div>
            )}

            {pdfFile && (
              <>
                <div style={convertSummary}>
                  <div>
                    <span style={summaryLabel}>Selected pages</span>
                    <strong style={summaryValue}>{selectedPages.length || 0}</strong>
                  </div>
                  <div>
                    <span style={summaryLabel}>Output</span>
                    <strong style={summaryValue}>{outputExtension.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span style={summaryLabel}>Scale</span>
                    <strong style={summaryValue}>{scale}x</strong>
                  </div>
                </div>

                {converting && (
                  <div style={progressWrap}>
                    <div style={{ ...progressBar, width: `${progress}%` }} />
                    <span style={progressText}>{progress}%</span>
                  </div>
                )}

                <div style={actionRow}>
                  {!converting ? (
                    <button onClick={convertPDF} style={primaryBtn}>
                      Convert PDF to Images
                    </button>
                  ) : (
                    <button onClick={cancelConversion} style={dangerBtn}>
                      Cancel Conversion
                    </button>
                  )}

                  <button onClick={downloadZip} disabled={images.length === 0 || zipping} style={images.length === 0 || zipping ? disabledBtn : successBtn}>
                    {zipping ? 'Preparing ZIP...' : `Download ZIP (${images.length})`}
                  </button>
                </div>
              </>
            )}

            {images.length > 0 && (
              <section style={resultSection}>
                <div style={resultHeader}>
                  <div>
                    <h2 style={sectionTitle}>Converted Pages</h2>
                    <p style={sectionText}>Preview pages below and download single images if needed.</p>
                  </div>
                  <button onClick={downloadZip} style={successBtn}>Download All</button>
                </div>

                <div style={imageGrid}>
                  {images.map(image => (
                    <div key={image.page} style={imageCard}>
                      <div style={pageBadge}>Page {image.page}</div>
                      <img src={image.url} style={previewImg} alt={`Converted PDF page ${image.page}`} />
                      <div style={imageInfo}>
                        <span>{image.width} × {image.height}px</span>
                        <span>{formatBytes(image.size)}</span>
                      </div>
                      <button onClick={() => downloadSingle(image)} style={miniDownloadBtn}>
                        Download Page {image.page}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside style={settingsPanel}>
            <h2 style={sideTitle}>Conversion Settings</h2>

            <label style={fieldWrap}>
              <span style={fieldLabel}>Image format</span>
              <select value={format} onChange={event => setFormat(event.target.value)} disabled={converting} style={inputStyle}>
                {OUTPUT_FORMATS.map(item => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>

            <label style={fieldWrap}>
              <span style={fieldLabel}>Resolution scale</span>
              <select value={scale} onChange={event => setScale(Number(event.target.value))} disabled={converting} style={inputStyle}>
                {SCALE_OPTIONS.map(item => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>

            {(format === 'image/jpeg' || format === 'image/webp') && (
              <div style={fieldWrap}>
                <div style={labelLine}>
                  <span style={fieldLabel}>Image quality</span>
                  <strong style={valuePill}>{Math.round(quality * 100)}%</strong>
                </div>
                <input
                  type="range"
                  min="0.45"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={event => setQuality(Number(event.target.value))}
                  disabled={converting}
                  style={rangeStyle}
                />
              </div>
            )}

            <label style={fieldWrap}>
              <span style={fieldLabel}>Pages to convert</span>
              <select value={pageMode} onChange={event => setPageMode(event.target.value)} disabled={converting} style={inputStyle}>
                <option value="all">All pages</option>
                <option value="range">Custom range</option>
              </select>
            </label>

            {pageMode === 'range' && (
              <label style={fieldWrap}>
                <span style={fieldLabel}>Page range</span>
                <input
                  value={pageRange}
                  onChange={event => setPageRange(event.target.value)}
                  disabled={converting}
                  placeholder="Example: 1-3,5,8"
                  style={inputStyle}
                />
                <span style={hint}>Use commas and ranges. Example: 1-3,5,8</span>
              </label>
            )}

            <label style={fieldWrap}>
              <span style={fieldLabel}>Filename prefix</span>
              <input
                value={filePrefix}
                onChange={event => setFilePrefix(event.target.value)}
                disabled={converting}
                style={inputStyle}
              />
            </label>

            <label style={checkRow}>
              <input
                type="checkbox"
                checked={whiteBackground}
                onChange={event => setWhiteBackground(event.target.checked)}
                disabled={converting}
              />
              Add white background behind pages
            </label>

            <div style={tipBox}>
              <h3>Best settings</h3>
              <p>
                Use PNG for text-heavy documents and JPG/WebP for photo-heavy PDFs. Use 2x or 2.5x for sharp readable output.
              </p>
            </div>
          </aside>
        </section>

        <section style={contentSection}>
          <h2>What is a PDF to image converter?</h2>
          <p>
            A PDF to image converter renders each PDF page as a picture file. This is useful when you need to share a single
            page as an image, create thumbnails, extract pages for social media, upload document pages to systems that accept
            only images, or turn reports and presentations into visual assets.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>PNG for sharp text</h3>
              <p>
                PNG is a lossless image format. It is usually best for invoices, forms, reports, screenshots, text pages,
                diagrams and documents where sharp lines matter.
              </p>
            </div>

            <div style={seoCard}>
              <h3>JPG for smaller files</h3>
              <p>
                JPG produces smaller image files and works well for scanned photos, presentations and image-heavy PDFs where
                a compact file size is more important.
              </p>
            </div>

            <div style={seoCard}>
              <h3>WebP for modern websites</h3>
              <p>
                WebP can provide strong compression with good visual quality, making it useful for websites, online stores,
                blogs and lightweight previews.
              </p>
            </div>
          </div>

          <h2>Why resolution scale matters</h2>
          <p>
            PDF pages are vector-based or high-quality print documents, but images are pixel-based. A higher rendering scale
            creates more pixels and sharper text. A 1x conversion is faster, while 2x, 2.5x and 3x outputs are better for
            reading, printing, product images and professional sharing.
          </p>

          <h2>Privacy-first PDF conversion</h2>
          <p>
            This converter is designed to process the PDF in your browser. Your document is read by the page and converted
            locally using browser memory. For sensitive files such as contracts, invoices, ID scans, reports or bank documents,
            always review the output before sharing it.
          </p>
        </section>

        <section style={faqSection}>
          <h2>PDF to Image Converter FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>Can I convert only selected PDF pages?</h3>
              <p>Yes. Choose custom range and enter pages such as 1-3,5,8.</p>
            </div>

            <div style={faqItem}>
              <h3>Which format should I use?</h3>
              <p>Use PNG for sharp text, JPG for smaller files, and WebP for modern web use.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I download all pages at once?</h3>
              <p>Yes. After conversion, click Download ZIP to download all converted pages in one archive.</p>
            </div>

            <div style={faqItem}>
              <h3>Why is conversion slow for some PDFs?</h3>
              <p>Large PDFs, high scale settings and many pages require more browser memory and processing time.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

async function loadPdfJs() {
  let pdfjs;

  try {
    pdfjs = await import('pdfjs-dist/build/pdf.mjs');
  } catch {
    pdfjs = await import('pdfjs-dist/build/pdf');
  }

  if (pdfjs?.GlobalWorkerOptions) {
    // Use local worker from /public to avoid CDN 404 and fake-worker warnings.
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
  }

  return pdfjs;
}

function parsePageRange(value, maxPages) {
  const result = new Set();

  String(value || '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)
    .forEach(part => {
      if (part.includes('-')) {
        const [startRaw, endRaw] = part.split('-');
        const start = Math.max(1, Number(startRaw));
        const end = Math.min(maxPages, Number(endRaw));

        if (Number.isFinite(start) && Number.isFinite(end)) {
          const min = Math.min(start, end);
          const max = Math.max(start, end);

          for (let page = min; page <= max; page++) {
            result.add(page);
          }
        }
      } else {
        const page = Number(part);

        if (Number.isFinite(page) && page >= 1 && page <= maxPages) {
          result.add(page);
        }
      }
    });

  return Array.from(result).sort((a, b) => a - b);
}

function canvasToBlob(canvas, format, quality) {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      } else {
        resolve(dataUrlToBlob(canvas.toDataURL(format, quality)));
      }
    }, format, quality);
  });
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mime });
}

function sanitizeFileName(value) {
  return String(value || 'pdf-page')
    .trim()
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'pdf-page';
}

function padNumber(value) {
  return String(value).padStart(3, '0');
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
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '900px', margin: '0 auto', lineHeight: 1.75 };

const toolGrid = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 330px', gap: '24px', alignItems: 'start' };
const mainPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '30px', boxShadow: '0 14px 35px rgba(0,0,0,0.2)' };
const settingsPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '24px', position: 'sticky', top: '92px', display: 'grid', gap: '18px' };

const dropZone = { border: '3px dashed #334155', padding: '82px 20px', borderRadius: '26px', textAlign: 'center', color: '#94a3b8', position: 'relative', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const dropIcon = { fontSize: '3.4rem' };
const dropTitle = { color: '#fff', fontSize: '1.2rem' };
const dropText = { color: '#94a3b8', maxWidth: '450px', lineHeight: 1.6 };

const fileBox = { background: '#0f172a', border: '1px solid #38bdf8', borderRadius: '20px', padding: '22px', display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'center', marginBottom: '22px' };
const fileName = { color: '#fff', fontSize: '1.15rem', margin: '0 0 6px', wordBreak: 'break-word' };
const fileMeta = { color: '#94a3b8', margin: 0, fontSize: '0.9rem' };

const convertSummary = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', margin: '18px 0', color: '#cbd5e1' };
const summaryLabel = { display: 'block', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 900, marginBottom: '5px' };
const summaryValue = { color: '#38bdf8', fontSize: '1.2rem' };

const progressWrap = { background: '#0f172a', border: '1px solid #334155', height: '28px', borderRadius: '999px', position: 'relative', overflow: 'hidden', margin: '18px 0' };
const progressBar = { height: '100%', background: '#38bdf8', transition: 'width 0.2s ease' };
const progressText = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#0f172a', fontWeight: 900, fontSize: '0.8rem' };

const actionRow = { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '12px', marginTop: '18px' };
const primaryBtn = { background: '#38bdf8', color: '#082f49', border: 'none', borderRadius: '14px', padding: '15px', fontWeight: 950, cursor: 'pointer' };
const successBtn = { background: '#34d399', color: '#052e16', border: 'none', borderRadius: '14px', padding: '15px', fontWeight: 950, cursor: 'pointer' };
const dangerBtn = { background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '14px', padding: '13px 15px', fontWeight: 850, cursor: 'pointer' };
const disabledBtn = { ...successBtn, opacity: 0.45, cursor: 'not-allowed' };

const resultSection = { marginTop: '34px' };
const resultHeader = { display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', marginBottom: '18px' };
const sectionTitle = { color: '#fff', fontSize: '1.35rem', margin: '0 0 8px' };
const sectionText = { color: '#94a3b8', margin: 0, lineHeight: 1.6 };
const imageGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '18px' };
const imageCard = { position: 'relative', background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '12px', display: 'grid', gap: '10px' };
const pageBadge = { position: 'absolute', top: '18px', left: '18px', background: 'rgba(15,23,42,0.86)', color: '#fff', borderRadius: '999px', padding: '5px 9px', fontSize: '0.7rem', fontWeight: 900 };
const previewImg = { width: '100%', maxHeight: '260px', objectFit: 'contain', borderRadius: '12px', background: '#fff', border: '1px solid #334155' };
const imageInfo = { display: 'flex', justifyContent: 'space-between', gap: '10px', color: '#94a3b8', fontSize: '0.75rem' };
const miniDownloadBtn = { background: 'transparent', color: '#38bdf8', border: '1px solid #334155', borderRadius: '12px', padding: '10px', cursor: 'pointer', fontWeight: 850 };

const sideTitle = { color: '#fff', margin: 0, fontSize: '1.2rem' };
const fieldWrap = { display: 'grid', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' };
const labelLine = { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' };
const valuePill = { color: '#38bdf8', background: '#0f172a', border: '1px solid #334155', padding: '6px 10px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 850 };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '13px', padding: '12px', outline: 'none' };
const rangeStyle = { width: '100%', accentColor: '#38bdf8' };
const checkRow = { color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' };
const hint = { color: '#64748b', lineHeight: 1.55, fontSize: '0.82rem' };
const tipBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', color: '#94a3b8', lineHeight: 1.65, fontSize: '0.9rem' };

const contentSection = { marginTop: '78px', borderTop: '1px solid #334155', paddingTop: '55px', color: '#cbd5e1', lineHeight: 1.85 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '30px 0' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '22px' };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px', color: '#cbd5e1', lineHeight: 1.8 };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };

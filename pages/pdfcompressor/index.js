import React, { useEffect, useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { PDFDocument } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import RelatedTools from '../../components/RelatedTools';

export default function PDFCompressor() {
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [mode, setMode] = useState('image');
  const [quality, setQuality] = useState(0.72);
  const [scale, setScale] = useState(1.35);
  const [outputName, setOutputName] = useState('compressed-document');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    setMounted(true);

    import('pdfjs-dist/legacy/build/pdf.mjs')
      .then(pdfjs => {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';
        setPdfjsLib(pdfjs);
      })
      .catch(error => {
        console.error('PDF.js load error:', error);
        setNotification('PDF preview engine could not load.');
      });
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3500);
    return () => clearTimeout(timer);
  }, [notification]);

  const savings = useMemo(() => {
    if (!pdfFile || !result?.size) return null;

    const difference = pdfFile.size - result.size;
    const percent = (difference / pdfFile.size) * 100;

    return {
      difference,
      percent
    };
  }, [pdfFile, result]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      setNotification('Please select a valid PDF file.');
      return;
    }

    setNotification('Reading PDF...');

    const info = await inspectPdf(file, pdfjsLib);

    if (!info || info.error) {
      setNotification('Could not read this PDF. It may be password-protected or damaged.');
      event.target.value = '';
      return;
    }

    setPdfFile(file);
    setPdfInfo(info);
    setOutputName(file.name.replace(/\.pdf$/i, '') || 'compressed-document');
    setResult(null);
    setNotification(`PDF loaded with ${info.pages} page${info.pages > 1 ? 's' : ''}.`);
    event.target.value = '';
  };

  const resetWorkspace = () => {
    if (result?.url) URL.revokeObjectURL(result.url);

    setPdfFile(null);
    setPdfInfo(null);
    setResult(null);
    setOutputName('compressed-document');
    setNotification('Workspace cleared.');
  };

  const compressPDF = async () => {
    if (!pdfFile || !pdfInfo) return;

    setProcessing(true);

    if (result?.url) {
      URL.revokeObjectURL(result.url);
      setResult(null);
    }

    try {
      let outputBytes;

      if (mode === 'safe') {
        outputBytes = await safeOptimizePDF(pdfFile);
      } else {
        outputBytes = await rasterCompressPDF(pdfFile, pdfjsLib, quality, scale);
      }

      const blob = new Blob([outputBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResult({
        url,
        size: blob.size,
        name: `${sanitizeFileName(outputName)}-compressed.pdf`
      });

      const reduction = ((pdfFile.size - blob.size) / pdfFile.size) * 100;

      if (reduction > 0) {
        setNotification(`Compression complete. Saved ${Math.max(0, reduction).toFixed(1)}%.`);
      } else {
        setNotification('Compression complete. This PDF was already optimized, so size reduction is limited.');
      }
    } catch (error) {
      console.error(error);
      setNotification('Could not compress this PDF. Try another mode or unlock the PDF first.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result?.url) return;

    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.name;
    link.click();
  };

  
  return (
    <ToolboxLayout
      title="PDF Compressor - Reduce PDF File Size Online"
      description="Compress PDF files online for free. Reduce scanned PDF size, optimize documents, choose quality settings and download smaller PDFs privately in your browser."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based PDF size reducer</p>
          <h1 style={heroTitle}>PDF Compressor</h1>
          <p style={heroText}>
            Reduce PDF file size for email, WhatsApp, online forms, visa portals, job applications, school uploads
            and business sharing. Choose safe optimization or stronger image compression for scanned PDFs.
          </p>

          <div style={heroBadges}>
            <span>📉 Reduce PDF size</span>
            <span>🖼️ Scanned PDF support</span>
            <span>🎚️ Quality control</span>
            <span>🔒 Client-side privacy</span>
          </div>
        </section>

        <section style={appGrid}>
          <main style={mainPanel}>
            <section style={uploadPanel}>
              <div style={sectionHeader}>
                <div>
                  <h2 style={sectionTitle}>Upload PDF</h2>
                  <p style={sectionText}>Choose one PDF file to compress.</p>
                </div>

                {pdfFile && (
                  <button onClick={resetWorkspace} style={dangerBtn}>
                    Clear
                  </button>
                )}
              </div>

              {!pdfFile ? (
                <div style={dropZone}>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleUpload}
                    style={fileInput}
                  />

                  <div style={dropIcon}>📄</div>
                  <strong>Click to select a PDF</strong>
                  <span>Upload one PDF file from your computer</span>
                </div>
              ) : (
                <div style={filePreviewCard}>
                  <div style={thumbWrap}>
                    {pdfInfo?.thumbnail ? (
                      <img src={pdfInfo.thumbnail} alt="PDF first page preview" style={thumbImg} />
                    ) : (
                      <div style={thumbFallback}>PDF</div>
                    )}
                  </div>

                  <div style={fileInfo}>
                    <strong>{pdfFile.name}</strong>
                    <span>{formatBytes(pdfFile.size)} • {pdfInfo.pages} page{pdfInfo.pages > 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}
            </section>

            {pdfFile && pdfInfo && (
              <>
                <section style={settingsPanel}>
                  <div style={sectionHeader}>
                    <div>
                      <h2 style={sectionTitle}>Compression Settings</h2>
                      <p style={sectionText}>
                        Use Image Compression for scanned PDFs or image-heavy PDFs. Use Safe Optimize for text/vector documents.
                      </p>
                    </div>
                  </div>

                  <label style={fieldWrap}>
                    <span style={fieldLabel}>Compression mode</span>
                    <select value={mode} onChange={event => setMode(event.target.value)} style={inputStyle}>
                      <option value="image">Image Compression - Best for scanned PDFs</option>
                      <option value="safe">Safe Optimize - Preserve PDF structure</option>
                    </select>
                  </label>

                  {mode === 'image' && (
                    <div style={controlGrid}>
                      <label style={fieldWrap}>
                        <span style={fieldLabel}>Image quality: {Math.round(quality * 100)}%</span>
                        <input
                          type="range"
                          min="0.35"
                          max="0.92"
                          step="0.01"
                          value={quality}
                          onChange={event => setQuality(Number(event.target.value))}
                          style={rangeStyle}
                        />
                      </label>

                      <label style={fieldWrap}>
                        <span style={fieldLabel}>Render scale: {scale.toFixed(2)}x</span>
                        <input
                          type="range"
                          min="0.85"
                          max="2.2"
                          step="0.05"
                          value={scale}
                          onChange={event => setScale(Number(event.target.value))}
                          style={rangeStyle}
                        />
                      </label>
                    </div>
                  )}

                  <label style={fieldWrap}>
                    <span style={fieldLabel}>Output file name</span>
                    <input
                      value={outputName}
                      onChange={event => setOutputName(event.target.value)}
                      placeholder="compressed-document"
                      style={inputStyle}
                    />
                  </label>

                  <button onClick={compressPDF} disabled={processing} style={processing ? disabledPrimaryBtn : primaryBtn}>
                    {processing ? 'Compressing PDF...' : 'Compress PDF'}
                  </button>
                </section>

                <section style={resultPanel}>
                  <h2 style={sectionTitle}>Compression Result</h2>

                  {!result ? (
                    <p style={emptyText}>Your compressed PDF result will appear here after processing.</p>
                  ) : (
                    <div style={resultGrid}>
                      <div style={resultCard}>
                        <span>Original Size</span>
                        <strong>{formatBytes(pdfFile.size)}</strong>
                      </div>

                      <div style={resultCard}>
                        <span>Compressed Size</span>
                        <strong>{formatBytes(result.size)}</strong>
                      </div>

                      <div style={resultCard}>
                        <span>{savings?.difference >= 0 ? 'Saved' : 'Change'}</span>
                        <strong style={{ color: savings?.difference >= 0 ? '#34d399' : '#fbbf24' }}>
                          {savings ? `${savings.percent.toFixed(1)}%` : '--'}
                        </strong>
                      </div>

                      <button onClick={downloadResult} style={downloadBtn}>
                        Download Compressed PDF
                      </button>
                    </div>
                  )}
                </section>
              </>
            )}
          </main>

          <aside style={sidePanel}>
            <h2 style={sideTitle}>Compression Guide</h2>

            <div style={tipBox}>
              <h3>Scanned PDFs</h3>
              <p>Use Image Compression. Lower quality and scale gives smaller files but less sharpness.</p>
            </div>

            <div style={tipBox}>
              <h3>Text PDFs</h3>
              <p>Use Safe Optimize first. It preserves selectable text better than rasterizing pages.</p>
            </div>

            <div style={tipBox}>
              <h3>Best balance</h3>
              <p>For scanned documents, 70% quality and 1.35x scale is a good starting point.</p>
            </div>

            <div style={privacyBox}>
              <h3>Private compression</h3>
              <p>Your PDF is processed in your browser memory. It is not uploaded to a server by this tool.</p>
            </div>
          </aside>
        </section>

        
        <RelatedTools currentPath="/pdfcompressor" />

<section style={contentSection}>
          <h2>Free PDF compressor to reduce PDF file size online</h2>
          <p>
            This PDF compressor helps reduce PDF file size for email attachments, WhatsApp sharing, school uploads,
            job applications, visa portals, online forms and business document submission. Large PDF files are often rejected
            by websites because they exceed upload limits. Compressing the PDF can make it easier to send, upload, archive
            and store.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Compress scanned PDF files</h3>
              <p>
                Scanned PDFs are usually large because each page is stored as an image. Image compression can reduce these files
                significantly by lowering image quality and resolution.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Reduce PDF size for email</h3>
              <p>
                Many email providers limit attachment size. Compressing PDFs helps you send reports, receipts, invoices and
                forms more easily.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Optimize PDF for online upload</h3>
              <p>
                Government portals, school portals, job sites and application forms often require smaller files. This tool helps
                create upload-friendly PDF documents.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Quality and scale control</h3>
              <p>
                Adjust quality and render scale to balance size and readability. Higher quality keeps documents sharper while
                lower quality creates smaller files.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Safe optimize mode</h3>
              <p>
                Safe Optimize re-saves the PDF structure and may reduce some overhead without converting pages into images.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Private PDF compression</h3>
              <p>
                Your file is processed locally inside your browser. This helps protect sensitive documents such as IDs,
                invoices, certificates and business records.
              </p>
            </div>
          </div>

          <h2>How to compress a PDF</h2>
          <ol style={tipList}>
            <li>Upload one PDF file.</li>
            <li>Choose Image Compression for scanned PDFs or Safe Optimize for text PDFs.</li>
            <li>Adjust quality and scale if using image compression.</li>
            <li>Click Compress PDF.</li>
            <li>Compare original and compressed size, then download the smaller PDF.</li>
          </ol>

          <h2>Why some PDFs do not compress much</h2>
          <p>
            Some PDFs are already optimized by professional software, so the file size may not reduce much. Text-heavy PDFs can
            already be very small. Scanned/image-heavy PDFs usually compress better because the images inside the document can
            be reduced in quality or resolution.
          </p>
        </section>

        <section style={faqSection}>
          <h2>PDF Compressor FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>Can I reduce PDF size for email?</h3>
              <p>Yes. Upload the PDF, compress it, and download a smaller version for email or messaging.</p>
            </div>

            <div style={faqItem}>
              <h3>Which mode should I use?</h3>
              <p>Use Image Compression for scanned PDFs. Use Safe Optimize for text/vector PDFs.</p>
            </div>

            <div style={faqItem}>
              <h3>Will text stay selectable?</h3>
              <p>Safe Optimize usually preserves text. Image Compression rasterizes pages, so text may no longer be selectable.</p>
            </div>

            <div style={faqItem}>
              <h3>Are my PDFs uploaded?</h3>
              <p>No. The compression process runs locally in your browser.</p>
            </div>

            <div style={faqItem}>
              <h3>Why did the file become larger?</h3>
              <p>Some already-optimized PDFs may not compress further. Try Safe Optimize or adjust quality/scale settings.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I compress password-protected PDFs?</h3>
              <p>Locked or encrypted PDFs may need to be unlocked before this tool can process them.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

async function inspectPdf(file, pdfjsLib) {
  if (!pdfjsLib) return { error: true };

  try {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.28 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    await page.render({ canvasContext: context, viewport }).promise;

    return {
      pages: pdf.numPages,
      thumbnail: canvas.toDataURL('image/jpeg', 0.72),
      error: false
    };
  } catch (error) {
    console.warn('PDF inspect failed:', error);
    return { error: true };
  }
}

async function safeOptimizePDF(file) {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  pdfDoc.setTitle('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('SHB ToolBox PDF Compressor');
  pdfDoc.setCreator('SHB ToolBox');

  return await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false
  });
}

async function rasterCompressPDF(file, pdfjsLib, quality, scale) {
  if (!pdfjsLib) throw new Error('PDF.js not loaded');

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let doc = null;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    await page.render({ canvasContext: context, viewport }).promise;

    const imgData = canvas.toDataURL('image/jpeg', quality);
    const orientation = canvas.width > canvas.height ? 'l' : 'p';

    if (!doc) {
      doc = new jsPDF({
        orientation,
        unit: 'px',
        format: [canvas.width, canvas.height],
        compress: true
      });
    } else {
      doc.addPage([canvas.width, canvas.height], orientation);
    }

    doc.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
  }

  if (!doc) throw new Error('No pages rendered');

  return doc.output('arraybuffer');
}

function sanitizeFileName(name) {
  return String(name || 'compressed-document')
    .trim()
    .replace(/[^\w\- ]+/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase() || 'compressed-document';
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
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

const uploadPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '20px' };
const settingsPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '18px' };
const resultPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '18px' };

const sectionHeader = { display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' };
const sectionTitle = { color: '#fff', margin: 0, fontSize: '1.28rem' };
const sectionText = { color: '#94a3b8', lineHeight: 1.65, margin: '8px 0 0', fontSize: '0.92rem' };

const dropZone = { position: 'relative', minHeight: '210px', background: '#0f172a', border: '2px dashed #334155', borderRadius: '22px', display: 'grid', placeItems: 'center', textAlign: 'center', color: '#cbd5e1', padding: '30px', gap: '8px' };
const fileInput = { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const dropIcon = { fontSize: '3rem' };

const filePreviewCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '16px', display: 'grid', gridTemplateColumns: '78px 1fr', gap: '16px', alignItems: 'center' };
const thumbWrap = { width: '64px', height: '82px', background: '#111827', border: '1px solid #334155', borderRadius: '10px', overflow: 'hidden', display: 'grid', placeItems: 'center' };
const thumbImg = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
const thumbFallback = { color: '#38bdf8', fontWeight: 950, fontSize: '0.85rem' };
const fileInfo = { display: 'grid', gap: '5px', color: '#fff', minWidth: 0 };

const fieldWrap = { display: 'grid', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '13px', padding: '14px', outline: 'none', fontSize: '1rem' };
const rangeStyle = { width: '100%', accentColor: '#38bdf8' };
const controlGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' };

const primaryBtn = { width: '100%', background: '#38bdf8', color: '#082f49', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: 950, cursor: 'pointer', fontSize: '1rem' };
const disabledPrimaryBtn = { ...primaryBtn, opacity: 0.45, cursor: 'not-allowed' };
const dangerBtn = { background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '14px', padding: '12px 16px', fontWeight: 850, cursor: 'pointer' };
const downloadBtn = { gridColumn: '1 / -1', background: '#34d399', color: '#052e16', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: 950, cursor: 'pointer', fontSize: '1rem' };

const emptyText = { color: '#94a3b8', margin: 0, lineHeight: 1.7 };
const resultGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' };
const resultCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'grid', gap: '8px', color: '#94a3b8' };

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
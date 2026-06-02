import React, { useEffect, useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import RelatedTools from '../../components/RelatedTools';

export default function PDFSplit() {
  const [mounted, setMounted] = useState(false);
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [pageRange, setPageRange] = useState('1');
  const [outputName, setOutputName] = useState('split-document');
  const [selectedPages, setSelectedPages] = useState([]);
  const [processing, setProcessing] = useState(false);
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

  const selectedPageList = useMemo(() => {
    if (!pdfInfo?.pages) return [];
    return parsePageRange(pageRange, pdfInfo.pages);
  }, [pageRange, pdfInfo]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      setNotification('Please select a valid PDF file.');
      return;
    }

    setNotification('Reading PDF pages...');

    const info = await inspectPdf(file, pdfjsLib);

    if (!info || info.error) {
      setNotification('Could not read this PDF. It may be password-protected or damaged.');
      event.target.value = '';
      return;
    }

    setPdfFile(file);
    setPdfInfo(info);
    setPageRange(info.pages > 1 ? `1-${Math.min(3, info.pages)}` : '1');
    setSelectedPages([]);
    setOutputName(file.name.replace(/\.pdf$/i, '') || 'split-document');
    setNotification(`PDF loaded with ${info.pages} page${info.pages > 1 ? 's' : ''}.`);
    event.target.value = '';
  };

  const resetWorkspace = () => {
    setPdfFile(null);
    setPdfInfo(null);
    setPageRange('1');
    setSelectedPages([]);
    setOutputName('split-document');
    setNotification('Workspace cleared.');
  };

  const togglePage = (pageNumber) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNumber)) {
        return prev.filter(page => page !== pageNumber);
      }

      return [...prev, pageNumber].sort((a, b) => a - b);
    });
  };

  const useVisualSelection = () => {
    if (!selectedPages.length) {
      setNotification('Select one or more page chips first.');
      return;
    }

    setPageRange(compactPageRange(selectedPages));
    setNotification('Selected pages copied to range box.');
  };

  const extractAsOnePDF = async () => {
    if (!pdfFile || !pdfInfo) return;

    const pages = parsePageRange(pageRange, pdfInfo.pages);

    if (!pages.length) {
      setNotification('Enter a valid page range, for example 1-3, 5, 8.');
      return;
    }

    setProcessing(true);

    try {
      const sourceBytes = await pdfFile.arrayBuffer();
      const sourcePdf = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      const copiedPages = await newPdf.copyPages(sourcePdf, pages.map(page => page - 1));
      copiedPages.forEach(page => newPdf.addPage(page));

      const outputBytes = await newPdf.save();
      downloadBlob(outputBytes, `${sanitizeFileName(outputName)}-pages-${sanitizeFileName(pageRange)}.pdf`, 'application/pdf');

      setNotification('Selected pages downloaded as one PDF.');
    } catch (error) {
      console.error(error);
      setNotification('Could not split this PDF. It may be locked or unsupported.');
    } finally {
      setProcessing(false);
    }
  };

  const extractEachPageZip = async () => {
    if (!pdfFile || !pdfInfo) return;

    setProcessing(true);

    try {
      const sourceBytes = await pdfFile.arrayBuffer();
      const sourcePdf = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
      const zip = new JSZip();
      const folder = zip.folder(sanitizeFileName(outputName) || 'split-pages');

      for (let i = 0; i < pdfInfo.pages; i++) {
        const pagePdf = await PDFDocument.create();
        const [copiedPage] = await pagePdf.copyPages(sourcePdf, [i]);

        pagePdf.addPage(copiedPage);

        const pageBytes = await pagePdf.save();
        folder.file(`${sanitizeFileName(outputName)}-page-${String(i + 1).padStart(3, '0')}.pdf`, pageBytes);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `${sanitizeFileName(outputName)}-all-pages.zip`;
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setNotification('All pages exported as separate PDFs in ZIP.');
    } catch (error) {
      console.error(error);
      setNotification('Could not extract individual pages.');
    } finally {
      setProcessing(false);
    }
  };
  return (
    <ToolboxLayout
      title="PDF Splitter - Extract Pages from PDF Online"
      description="Split PDF files online for free. Extract selected pages, split every page into separate PDFs, preview first page, use page ranges and download privately in your browser."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based PDF page extractor</p>
          <h1 style={heroTitle}>PDF Splitter</h1>
          <p style={heroText}>
            Extract selected pages from a PDF, remove unwanted pages, or split every page into separate PDF files.
            Use page ranges like <strong>1-3, 5, 8-10</strong> and download the result without uploading your document.
          </p>

          <div style={heroBadges}>
            <span>✂️ Extract pages</span>
            <span>📄 Range support</span>
            <span>📦 ZIP export</span>
            <span>🔒 Client-side privacy</span>
          </div>
        </section>

        <section style={appGrid}>
          <main style={mainPanel}>
            <section style={uploadPanel}>
              <div style={sectionHeader}>
                <div>
                  <h2 style={sectionTitle}>Upload PDF</h2>
                  <p style={sectionText}>Choose one PDF file to split or extract pages from.</p>
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
                <section style={splitPanel}>
                  <div style={sectionHeader}>
                    <div>
                      <h2 style={sectionTitle}>Split Settings</h2>
                      <p style={sectionText}>
                        Enter a page range. Examples: <strong>1</strong>, <strong>1-3</strong>, <strong>1-3, 7, 10-12</strong>.
                      </p>
                    </div>
                  </div>

                  <label style={fieldWrap}>
                    <span style={fieldLabel}>Page range</span>
                    <input
                      value={pageRange}
                      onChange={event => setPageRange(event.target.value)}
                      placeholder="1-3, 5, 8-10"
                      style={inputStyle}
                    />
                  </label>

                  <label style={fieldWrap}>
                    <span style={fieldLabel}>Output file name</span>
                    <input
                      value={outputName}
                      onChange={event => setOutputName(event.target.value)}
                      placeholder="split-document"
                      style={inputStyle}
                    />
                  </label>

                  <div style={rangePreview}>
                    <strong>{selectedPageList.length || 0}</strong>
                    <span>
                      selected page{selectedPageList.length === 1 ? '' : 's'}
                      {selectedPageList.length ? `: ${selectedPageList.join(', ')}` : ''}
                    </span>
                  </div>

                  <div style={buttonGrid}>
                    <button onClick={extractAsOnePDF} disabled={processing} style={processing ? disabledPrimaryBtn : primaryBtn}>
                      {processing ? 'Processing...' : 'Download Selected Pages as One PDF'}
                    </button>

                    <button onClick={extractEachPageZip} disabled={processing} style={processing ? disabledSecondaryBtn : secondaryBtn}>
                      Export Every Page as ZIP
                    </button>
                  </div>
                </section>

                <section style={pagePickerPanel}>
                  <div style={sectionHeader}>
                    <div>
                      <h2 style={sectionTitle}>Visual Page Picker</h2>
                      <p style={sectionText}>
                        Click page numbers to select them, then copy them into the range box.
                      </p>
                    </div>

                    <button onClick={useVisualSelection} style={secondaryBtn}>
                      Use Selected Pages
                    </button>
                  </div>

                  <div style={pageChipGrid}>
                    {Array.from({ length: pdfInfo.pages }, (_, index) => index + 1).map(page => {
                      const active = selectedPages.includes(page);

                      return (
                        <button
                          key={page}
                          onClick={() => togglePage(page)}
                          style={active ? activePageChip : pageChip}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </>
            )}
          </main>

          <aside style={sidePanel}>
            <h2 style={sideTitle}>Best Uses</h2>

            <div style={tipBox}>
              <h3>Extract only needed pages</h3>
              <p>Save specific pages from large contracts, reports, manuals or study PDFs.</p>
            </div>

            <div style={tipBox}>
              <h3>Remove unnecessary pages</h3>
              <p>Create a cleaner PDF by downloading only the important pages.</p>
            </div>

            <div style={tipBox}>
              <h3>Separate every page</h3>
              <p>Export each page as its own PDF inside a ZIP file for organized filing.</p>
            </div>

            <div style={privacyBox}>
              <h3>Private splitting</h3>
              <p>Your PDF is processed in your browser memory. It is not uploaded to a server by this tool.</p>
            </div>
          </aside>
        </section>

        
        <RelatedTools currentPath="/pdfsplit" />

<section style={contentSection}>
          <h2>Free PDF splitter to extract pages from PDF files</h2>
          <p>
            This PDF splitter lets you extract selected pages from a PDF or split every page into individual PDF files.
            It is useful for invoices, reports, scanned documents, contracts, certificates, forms, ebooks, assignments,
            manuals and business records. You can enter page ranges, select pages visually, and download the result directly.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Split PDF by page range</h3>
              <p>Use ranges like 1-3, 5, 8-10 to extract exactly the pages you need from a larger PDF.</p>
            </div>

            <div style={seoCard}>
              <h3>Extract selected pages</h3>
              <p>Create a new PDF containing only selected pages. This is useful when sharing part of a document.</p>
            </div>

            <div style={seoCard}>
              <h3>Split all pages into ZIP</h3>
              <p>Export each page as a separate PDF and download all files together in a ZIP archive.</p>
            </div>

            <div style={seoCard}>
              <h3>Visual page picker</h3>
              <p>Select page numbers visually before generating the final page range.</p>
            </div>

            <div style={seoCard}>
              <h3>Private PDF processing</h3>
              <p>Your files are handled locally in your browser, useful for sensitive documents and business files.</p>
            </div>

            <div style={seoCard}>
              <h3>No login required</h3>
              <p>Upload a PDF, choose pages, and download the split PDF without creating an account.</p>
            </div>
          </div>

          <h2>How to split a PDF</h2>
          <ol style={tipList}>
            <li>Upload one PDF file.</li>
            <li>Enter the page range you want to extract.</li>
            <li>Use the visual page picker if you prefer selecting pages manually.</li>
            <li>Download selected pages as one PDF or export every page as a ZIP file.</li>
          </ol>
        </section>

        <section style={faqSection}>
          <h2>PDF Splitter FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>Can I extract only one page?</h3>
              <p>Yes. Enter a single page number such as 4 and download that page as a PDF.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I extract multiple ranges?</h3>
              <p>Yes. Use comma-separated ranges such as 1-3, 5, 8-10.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I split every page separately?</h3>
              <p>Yes. Use Export Every Page as ZIP to download each page as its own PDF.</p>
            </div>

            <div style={faqItem}>
              <h3>Are my PDFs uploaded?</h3>
              <p>No. The splitting process runs locally in your browser.</p>
            </div>

            <div style={faqItem}>
              <h3>Why does a PDF fail to load?</h3>
              <p>Password-protected, encrypted or damaged PDFs may not be readable until unlocked or repaired.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I remove pages from a PDF?</h3>
              <p>Yes. Select only the pages you want to keep and download them as a new PDF.</p>
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

function parsePageRange(input, maxPages) {
  const raw = String(input || '').replace(/\s/g, '');
  if (!raw) return [];

  const pages = new Set();

  raw.split(',').forEach(part => {
    if (!part) return;

    if (part.includes('-')) {
      const [startRaw, endRaw] = part.split('-');
      const start = Number(startRaw);
      const end = Number(endRaw);

      if (!Number.isInteger(start) || !Number.isInteger(end)) return;

      const low = Math.min(start, end);
      const high = Math.max(start, end);

      for (let page = low; page <= high; page++) {
        if (page >= 1 && page <= maxPages) pages.add(page);
      }
    } else {
      const page = Number(part);

      if (Number.isInteger(page) && page >= 1 && page <= maxPages) {
        pages.add(page);
      }
    }
  });

  return Array.from(pages).sort((a, b) => a - b);
}

function compactPageRange(pages) {
  const sorted = [...pages].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const current = sorted[i];

    if (current === prev + 1) {
      prev = current;
      continue;
    }

    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    start = current;
    prev = current;
  }

  return ranges.join(', ');
}

function sanitizeFileName(name) {
  return String(name || 'split-document')
    .trim()
    .replace(/[^\w\- ,]+/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase() || 'split-document';
}

function downloadBlob(bytes, fileName, type) {
  const blob = new Blob([bytes], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1500);
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
const splitPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '18px' };
const pagePickerPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '20px' };

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

const rangePreview = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '14px 16px', color: '#94a3b8', display: 'grid', gap: '5px' };
const buttonGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' };

const primaryBtn = { width: '100%', background: '#38bdf8', color: '#082f49', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: 950, cursor: 'pointer', fontSize: '1rem' };
const disabledPrimaryBtn = { ...primaryBtn, opacity: 0.45, cursor: 'not-allowed' };
const secondaryBtn = { width: '100%', background: '#334155', color: '#fff', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: 900, cursor: 'pointer', fontSize: '0.95rem' };
const disabledSecondaryBtn = { ...secondaryBtn, opacity: 0.45, cursor: 'not-allowed' };
const dangerBtn = { background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '14px', padding: '12px 16px', fontWeight: 850, cursor: 'pointer' };

const pageChipGrid = { display: 'flex', flexWrap: 'wrap', gap: '10px' };
const pageChip = { width: '44px', height: '44px', borderRadius: '12px', background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', fontWeight: 900, cursor: 'pointer' };
const activePageChip = { ...pageChip, background: '#38bdf8', color: '#082f49', border: '1px solid #38bdf8' };

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
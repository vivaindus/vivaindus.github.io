import React, { useEffect, useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { PDFDocument } from 'pdf-lib';
import RelatedTools from '../../components/RelatedTools';

export default function PDFMerge() {
  const [mounted, setMounted] = useState(false);
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [files, setFiles] = useState([]);
  const [outputName, setOutputName] = useState('merged-document');
  const [merging, setMerging] = useState(false);
  const [dragId, setDragId] = useState(null);
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
        setNotification('PDF preview engine could not load. Merge will still work.');
      });
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3500);
    return () => clearTimeout(timer);
  }, [notification]);

  const totalSize = useMemo(() => {
    return files.reduce((sum, item) => sum + item.size, 0);
  }, [files]);

  const handleFiles = async (event) => {
    const selected = Array.from(event.target.files || []);
    const pdfFiles = selected.filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      setNotification('Please select valid PDF files.');
      return;
    }

    setNotification('Preparing PDF previews...');

    const newItems = await Promise.all(
      pdfFiles.map(async file => {
        const preview = await createPdfPreview(file, pdfjsLib);

        return {
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          pages: preview.pages,
          thumbnail: preview.thumbnail,
          previewError: preview.error
        };
      })
    );

    setFiles(prev => [...prev, ...newItems]);
    setNotification(`${pdfFiles.length} PDF file${pdfFiles.length > 1 ? 's' : ''} added.`);
    event.target.value = '';
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(item => item.id !== id));
    setNotification('PDF removed.');
  };

  const clearFiles = () => {
    setFiles([]);
    setNotification('Workspace cleared.');
  };

  const moveFile = (index, direction) => {
    setFiles(prev => {
      const next = [...prev];
      const target = index + direction;

      if (target < 0 || target >= next.length) return prev;

      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleDragStart = (id) => {
    setDragId(id);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (targetId) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }

    setFiles(prev => {
      const next = [...prev];
      const fromIndex = next.findIndex(item => item.id === dragId);
      const toIndex = next.findIndex(item => item.id === targetId);

      if (fromIndex === -1 || toIndex === -1) return prev;

      const [dragged] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, dragged);

      return next;
    });

    setDragId(null);
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      setNotification('Add at least 2 PDF files to merge.');
      return;
    }

    setMerging(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const bytes = await item.file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());

        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const safeName = sanitizeFileName(outputName || 'merged-document');

      link.href = url;
      link.download = `${safeName}.pdf`;
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setNotification('Merged PDF downloaded successfully.');
    } catch (error) {
      console.error(error);
      setNotification('Could not merge one or more PDFs. Password-protected PDFs may fail.');
    } finally {
      setMerging(false);
    }
  };

  if (!mounted) {
    return (
      <ToolboxLayout title="PDF Merger" description="Loading PDF merger.">
        <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
          Loading PDF merge engine...
        </div>
      </ToolboxLayout>
    );
  }

  return (
    <ToolboxLayout
      title="PDF Merger - Combine Multiple PDF Files Online"
      description="Merge multiple PDF files into one document for free. Preview first-page thumbnails, reorder PDFs by drag and drop, choose output name and download a combined PDF privately in your browser."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based PDF combiner</p>
          <h1 style={heroTitle}>PDF Merger</h1>
          <p style={heroText}>
            Combine multiple PDF files into one clean document. Add invoices, reports, forms, certificates,
            ID scans or study notes, preview the first page, reorder by drag-and-drop, and download one merged PDF.
          </p>

          <div style={heroBadges}>
            <span>🔒 Client-side processing</span>
            <span>🖼️ PDF thumbnails</span>
            <span>↕️ Drag-and-drop order</span>
            <span>⚡ No login required</span>
          </div>
        </section>

        <section style={appGrid}>
          <main style={mainPanel}>
            <section style={uploadPanel}>
              <div style={sectionHeader}>
                <div>
                  <h2 style={sectionTitle}>Upload PDF Files</h2>
                  <p style={sectionText}>
                    Add two or more PDF files. The final PDF will follow the order shown below.
                  </p>
                </div>

                {files.length > 0 && (
                  <button onClick={clearFiles} style={dangerBtn}>
                    Clear All
                  </button>
                )}
              </div>

              <div style={dropZone}>
                <input
                  type="file"
                  multiple
                  accept="application/pdf,.pdf"
                  onChange={handleFiles}
                  style={fileInput}
                />

                <div style={dropIcon}>📎</div>
                <strong>Click to select PDF files</strong>
                <span>Choose multiple PDFs from your computer</span>
              </div>
            </section>

            {files.length > 0 && (
              <section style={queuePanel}>
                <div style={sectionHeader}>
                  <div>
                    <h2 style={sectionTitle}>Merge Order</h2>
                    <p style={sectionText}>
                      Drag files to reorder, or use the up/down buttons. First file becomes the first pages of the merged PDF.
                    </p>
                  </div>

                  <div style={summaryBox}>
                    <strong>{files.length}</strong>
                    <span>PDFs • {formatBytes(totalSize)}</span>
                  </div>
                </div>

                <div style={fileList}>
                  {files.map((item, index) => (
                    <article
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(item.id)}
                      onDragEnd={() => setDragId(null)}
                      style={dragId === item.id ? draggingFileCard : fileCard}
                    >
                      <div style={fileNumber}>{index + 1}</div>

                      <div style={thumbWrap}>
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={`${item.name} first page preview`} style={thumbImg} />
                        ) : (
                          <div style={thumbFallback}>
                            <span>PDF</span>
                          </div>
                        )}
                      </div>

                      <div style={fileInfo}>
                        <strong title={item.name}>{item.name}</strong>
                        <span>
                          {formatBytes(item.size)}
                          {item.pages ? ` • ${item.pages} page${item.pages > 1 ? 's' : ''}` : ''}
                          {item.previewError ? ' • preview unavailable' : ''}
                        </span>
                      </div>

                      <div style={fileActions}>
                        <button
                          onClick={() => moveFile(index, -1)}
                          disabled={index === 0}
                          style={index === 0 ? disabledSmallBtn : smallBtn}
                          title="Move up"
                        >
                          ↑
                        </button>

                        <button
                          onClick={() => moveFile(index, 1)}
                          disabled={index === files.length - 1}
                          style={index === files.length - 1 ? disabledSmallBtn : smallBtn}
                          title="Move down"
                        >
                          ↓
                        </button>

                        <button onClick={() => removeFile(item.id)} style={removeBtn}>
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section style={outputPanel}>
              <div style={sectionHeader}>
                <div>
                  <h2 style={sectionTitle}>Output Settings</h2>
                  <p style={sectionText}>Choose a file name for the final merged PDF.</p>
                </div>
              </div>

              <label style={fieldWrap}>
                <span style={fieldLabel}>Output PDF name</span>
                <input
                  value={outputName}
                  onChange={event => setOutputName(event.target.value)}
                  placeholder="merged-document"
                  style={inputStyle}
                />
              </label>

              <button
                onClick={mergePDFs}
                disabled={merging || files.length < 2}
                style={merging || files.length < 2 ? disabledPrimaryBtn : primaryBtn}
              >
                {merging ? 'Merging PDFs...' : `Merge ${files.length || 0} PDFs`}
              </button>

              {files.length < 2 && (
                <p style={hintText}>Add at least 2 PDF files to enable merge.</p>
              )}
            </section>
          </main>

          <aside style={sidePanel}>
            <h2 style={sideTitle}>Best Uses</h2>

            <div style={tipBox}>
              <h3>Invoices and receipts</h3>
              <p>Combine monthly invoices, expense receipts and payment proofs into one clean PDF.</p>
            </div>

            <div style={tipBox}>
              <h3>Application documents</h3>
              <p>Merge ID scans, certificates, forms and supporting documents before online submission.</p>
            </div>

            <div style={tipBox}>
              <h3>Reports and studies</h3>
              <p>Combine chapters, notes, appendices or research materials into one readable file.</p>
            </div>

            <div style={privacyBox}>
              <h3>Privacy-first</h3>
              <p>
                Your PDFs are processed in your browser memory. This tool does not upload your documents to a backend server.
              </p>
            </div>
          </aside>
        </section>

        
        <RelatedTools currentPath="/pdfmerge" />

<section style={contentSection}>
          <h2>Free PDF merger to combine PDF files online</h2>
          <p>
            This PDF merger lets you combine multiple PDF files into one document directly in your browser. It is useful when
            you need to join invoices, reports, scanned documents, certificates, application files, contracts, project notes,
            school materials or business paperwork. You can upload several PDFs, view first-page previews, arrange their order
            and download one combined PDF file.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Merge PDF files</h3>
              <p>Add multiple PDFs and merge them into a single file. The order of the file list controls the final page order.</p>
            </div>

            <div style={seoCard}>
              <h3>PDF thumbnail previews</h3>
              <p>Preview the first page of each PDF so you can recognize documents quickly before merging.</p>
            </div>

            <div style={seoCard}>
              <h3>Drag-and-drop PDF reorder</h3>
              <p>Move PDF files by dragging them, or use the up and down buttons for precise ordering.</p>
            </div>

            <div style={seoCard}>
              <h3>Private PDF processing</h3>
              <p>Your selected PDF files are handled locally by your browser, useful for IDs, statements and business documents.</p>
            </div>
          </div>

          <h2>How to merge PDF files</h2>
          <ol style={tipList}>
            <li>Select two or more PDF files from your computer.</li>
            <li>Check the first-page thumbnail previews.</li>
            <li>Drag files or use the up/down buttons to arrange the order.</li>
            <li>Enter a name for the output PDF file.</li>
            <li>Click Merge PDFs and download the combined document.</li>
          </ol>
        </section>

        <section style={faqSection}>
          <h2>PDF Merger FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>Can I preview PDFs before merging?</h3>
              <p>Yes. The tool shows a small preview of the first page of each uploaded PDF.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I drag and drop PDF order?</h3>
              <p>Yes. Drag a file card and drop it above another file to change the merge order.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I still use buttons to reorder?</h3>
              <p>Yes. The up and down buttons are kept for users who prefer click-based ordering.</p>
            </div>

            <div style={faqItem}>
              <h3>Are my PDFs uploaded?</h3>
              <p>No. The merge process runs in your browser using client-side PDF processing.</p>
            </div>

            <div style={faqItem}>
              <h3>Why does a thumbnail fail?</h3>
              <p>Some locked, damaged or unusual PDFs may not render a preview, but standard PDFs should work normally.</p>
            </div>

            <div style={faqItem}>
              <h3>Will this compress the PDF?</h3>
              <p>No. This tool merges PDFs. Use a PDF compressor when you need smaller file size.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

async function createPdfPreview(file, pdfjsLib) {
  if (!pdfjsLib) {
    return { thumbnail: null, pages: null, error: true };
  }

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
      thumbnail: canvas.toDataURL('image/jpeg', 0.72),
      pages: pdf.numPages,
      error: false
    };
  } catch (error) {
    console.warn('PDF preview failed:', error);
    return { thumbnail: null, pages: null, error: true };
  }
}

function sanitizeFileName(name) {
  return String(name || 'merged-document')
    .trim()
    .replace(/[^\w\- ]+/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase() || 'merged-document';
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
const queuePanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '20px' };
const outputPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '18px' };

const sectionHeader = { display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' };
const sectionTitle = { color: '#fff', margin: 0, fontSize: '1.28rem' };
const sectionText = { color: '#94a3b8', lineHeight: 1.65, margin: '8px 0 0', fontSize: '0.92rem' };

const dropZone = { position: 'relative', minHeight: '210px', background: '#0f172a', border: '2px dashed #334155', borderRadius: '22px', display: 'grid', placeItems: 'center', textAlign: 'center', color: '#cbd5e1', padding: '30px', gap: '8px' };
const fileInput = { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const dropIcon = { fontSize: '3rem' };

const summaryBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '12px 16px', color: '#94a3b8', display: 'grid', gap: '4px', minWidth: '130px', textAlign: 'center' };
const fileList = { display: 'grid', gap: '12px' };
const fileCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '14px', display: 'grid', gridTemplateColumns: '42px 74px minmax(0,1fr) auto', gap: '14px', alignItems: 'center', cursor: 'grab' };
const draggingFileCard = { ...fileCard, opacity: 0.55, border: '1px dashed #38bdf8' };
const fileNumber = { width: '34px', height: '34px', borderRadius: '50%', background: '#38bdf8', color: '#082f49', display: 'grid', placeItems: 'center', fontWeight: 950 };
const thumbWrap = { width: '64px', height: '82px', background: '#111827', border: '1px solid #334155', borderRadius: '10px', overflow: 'hidden', display: 'grid', placeItems: 'center' };
const thumbImg = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
const thumbFallback = { width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#38bdf8', fontWeight: 950, fontSize: '0.85rem' };
const fileInfo = { display: 'grid', gap: '5px', color: '#fff', minWidth: 0 };
const fileActions = { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' };

const fieldWrap = { display: 'grid', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '13px', padding: '14px', outline: 'none', fontSize: '1rem' };

const primaryBtn = { width: '100%', background: '#38bdf8', color: '#082f49', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: 950, cursor: 'pointer', fontSize: '1.05rem' };
const disabledPrimaryBtn = { ...primaryBtn, opacity: 0.45, cursor: 'not-allowed' };
const smallBtn = { background: '#334155', color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 11px', fontWeight: 900, cursor: 'pointer' };
const disabledSmallBtn = { ...smallBtn, opacity: 0.35, cursor: 'not-allowed' };
const removeBtn = { background: 'transparent', color: '#f87171', border: '1px solid #334155', borderRadius: '10px', padding: '9px 11px', fontWeight: 900, cursor: 'pointer' };
const dangerBtn = { background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '14px', padding: '12px 16px', fontWeight: 850, cursor: 'pointer' };
const hintText = { color: '#64748b', margin: 0, textAlign: 'center', fontSize: '0.9rem' };

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
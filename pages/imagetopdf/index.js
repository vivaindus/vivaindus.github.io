import React, { useEffect, useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const PAGE_SIZES = [
  { value: 'a4', label: 'A4 - International', note: '210 × 297 mm' },
  { value: 'letter', label: 'Letter - US / Canada', note: '8.5 × 11 in' },
  { value: 'legal', label: 'Legal', note: '8.5 × 14 in' },
  { value: 'a3', label: 'A3 - Large', note: '297 × 420 mm' }
];

const FIT_MODES = {
  contain: {
    label: 'Fit full image',
    description: 'Keeps the full image visible and adds background space if needed.'
  },
  cover: {
    label: 'Fill page / crop edges',
    description: 'Fills the printable area and crops edges if the image ratio is different.'
  },
  stretch: {
    label: 'Stretch to page',
    description: 'Forces the image to fill the printable area. This may distort the image.'
  }
};

export default function ImageToPDF() {
  const [mounted, setMounted] = useState(false);
  const [images, setImages] = useState([]);
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState('p');
  const [fitMode, setFitMode] = useState('contain');
  const [margin, setMargin] = useState(10);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [jpegQuality, setJpegQuality] = useState(0.92);
  const [fileName, setFileName] = useState('image-to-pdf');
  const [includePageNumbers, setIncludePageNumbers] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notification, setNotification] = useState('');

  const totalSize = useMemo(() => {
    return images.reduce((sum, image) => sum + image.file.size, 0);
  }, [images]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.url));
    };
  }, []);

  const showToast = (message) => {
    setNotification(message);
  };

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

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter(file => file.type.startsWith('image/'));

    if (files.length === 0) {
      showToast('⚠️ Please select valid image files.');
      return;
    }

    if (files.length + images.length > 80) {
      showToast('⚠️ Please keep the queue below 80 images for browser performance.');
      return;
    }

    const newImages = [];

    for (const file of files) {
      if (file.size > 30 * 1024 * 1024) {
        showToast(`⚠️ ${file.name} is too large. Please use images below 30 MB.`);
        continue;
      }

      const url = URL.createObjectURL(file);

      try {
        const info = await readImageInfo(url);

        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          url,
          name: file.name,
          size: file.size,
          type: file.type,
          width: info.width,
          height: info.height
        });
      } catch {
        URL.revokeObjectURL(url);
      }
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      showToast(`${newImages.length} image${newImages.length > 1 ? 's' : ''} added to PDF queue 📥`);
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

  const removeImage = (id) => {
    setImages(prev => {
      const target = prev.find(image => image.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter(image => image.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach(image => URL.revokeObjectURL(image.url));
    setImages([]);
    setProgress(0);
    showToast('Image queue cleared');
  };

  const moveImage = (index, direction) => {
    setImages(prev => {
      const next = [...prev];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= next.length) return prev;

      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const loadImageElement = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  const makePageImage = ({ imageElement, contentWidthMm, contentHeightMm }) => {
    const pxPerMm = 4;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(contentWidthMm * pxPerMm));
    canvas.height = Math.max(1, Math.round(contentHeightMm * pxPerMm));

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const draw = getDrawDimensions({
      sourceWidth: imageElement.naturalWidth,
      sourceHeight: imageElement.naturalHeight,
      targetWidth: canvas.width,
      targetHeight: canvas.height,
      fitMode
    });

    ctx.drawImage(
      imageElement,
      draw.sourceX,
      draw.sourceY,
      draw.sourceWidth,
      draw.sourceHeight,
      draw.targetX,
      draw.targetY,
      draw.targetWidth,
      draw.targetHeight
    );

    return canvas.toDataURL('image/jpeg', jpegQuality);
  };

  const generatePDF = async () => {
    if (images.length === 0) {
      showToast('⚠️ Please add at least one image.');
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize
      });

      doc.setProperties({
        title: fileName || 'image-to-pdf',
        subject: 'Image to PDF document generated with SHB ToolBox',
        creator: 'SHB ToolBox'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const safeMargin = Math.min(Number(margin) || 0, Math.min(pageWidth, pageHeight) / 3);
      const contentWidth = pageWidth - safeMargin * 2;
      const contentHeight = pageHeight - safeMargin * 2;

      for (let i = 0; i < images.length; i++) {
        if (i > 0) doc.addPage(pageSize, orientation);

        const img = await loadImageElement(images[i].url);
        const pageImage = makePageImage({
          imageElement: img,
          contentWidthMm: contentWidth,
          contentHeightMm: contentHeight
        });

        doc.addImage(pageImage, 'JPEG', safeMargin, safeMargin, contentWidth, contentHeight, undefined, 'FAST');

        if (includePageNumbers) {
          doc.setFontSize(9);
          doc.setTextColor(120, 120, 120);
          doc.text(`${i + 1} / ${images.length}`, pageWidth / 2, pageHeight - 4, { align: 'center' });
        }

        setProgress(Math.round(((i + 1) / images.length) * 100));
      }

      const cleanName = sanitizeFileName(fileName || 'image-to-pdf');
      doc.save(`${cleanName}.pdf`);
      showToast('PDF generated and downloaded 📄✅');
    } catch (error) {
      showToast('⚠️ PDF generation failed. Try fewer images or smaller files.');
    } finally {
      setGenerating(false);
    }
  };

  if (!mounted) {
    return (
      <ToolboxLayout title="Image to PDF Converter" description="Convert images to PDF online.">
        <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
          Loading image to PDF converter...
        </div>
      </ToolboxLayout>
    );
  }

  return (
    <ToolboxLayout
      title="Image to PDF Converter - Convert JPG, PNG and WebP Images to PDF"
      description="Use the free SHB ToolBox image to PDF converter to combine JPG, PNG, WebP and photo scans into one PDF. Choose A4, Letter, Legal or A3, reorder images, set margins, fit or crop pages, add page numbers and download privately."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based PDF creator</p>
          <h1 style={heroTitle}>Image to PDF Converter</h1>
          <p style={heroText}>
            Convert photos, screenshots, scanned documents, product images, receipts, notes, and ID copies into a clean
            PDF document. Add multiple images, reorder pages, choose paper size, control margins, and download the final PDF.
          </p>
        </section>

        <section style={toolGrid}>
          <div style={mainPanel}>
            <label
              style={dropZone}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <input type="file" multiple accept="image/*" onChange={handleUpload} style={fileInput} />
              <span style={dropIcon}>➕</span>
              <strong style={dropTitle}>Upload or drag images here</strong>
              <span style={dropText}>
                Select multiple JPG, PNG, WebP, or browser-readable images. Each image becomes one PDF page.
              </span>
              <span style={queueCount}>{images.length} image{images.length === 1 ? '' : 's'} selected</span>
            </label>

            {images.length > 0 && (
              <div style={queueSection}>
                <div style={queueHeader}>
                  <div>
                    <h2 style={panelTitle}>Page queue</h2>
                    <p style={panelText}>
                      {images.length} page{images.length === 1 ? '' : 's'} • Total source size {formatBytes(totalSize)}
                    </p>
                  </div>
                  <button onClick={clearAll} style={dangerBtn}>Clear All</button>
                </div>

                <div style={thumbGrid}>
                  {images.map((image, index) => (
                    <div key={image.id} style={thumbCard}>
                      <div style={pageBadge}>Page {index + 1}</div>
                      <img src={image.url} style={thumbImg} alt={`PDF page ${index + 1}`} />

                      <div style={thumbInfo}>
                        <strong title={image.name}>{shortenName(image.name)}</strong>
                        <span>{image.width} × {image.height}px</span>
                        <span>{formatBytes(image.size)}</span>
                      </div>

                      <div style={thumbControls}>
                        <button onClick={() => moveImage(index, -1)} disabled={index === 0} style={miniBtn}>↑</button>
                        <button onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} style={miniBtn}>↓</button>
                        <button onClick={() => removeImage(image.id)} style={removeBtn}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside style={settingsPanel}>
            <h2 style={panelTitle}>PDF settings</h2>

            <div style={inputRow}>
              <label style={label}>PDF file name</label>
              <input
                type="text"
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                style={inputStyle}
                placeholder="image-to-pdf"
              />
            </div>

            <div style={inputRow}>
              <label style={label}>Paper size</label>
              <select value={pageSize} onChange={(event) => setPageSize(event.target.value)} style={inputStyle}>
                {PAGE_SIZES.map(size => (
                  <option key={size.value} value={size.value}>{size.label} - {size.note}</option>
                ))}
              </select>
            </div>

            <div style={inputRow}>
              <label style={label}>Orientation</label>
              <select value={orientation} onChange={(event) => setOrientation(event.target.value)} style={inputStyle}>
                <option value="p">Portrait</option>
                <option value="l">Landscape</option>
              </select>
            </div>

            <div style={inputRow}>
              <label style={label}>Image placement</label>
              <select value={fitMode} onChange={(event) => setFitMode(event.target.value)} style={inputStyle}>
                {Object.entries(FIT_MODES).map(([key, item]) => (
                  <option key={key} value={key}>{item.label}</option>
                ))}
              </select>
              <p style={hint}>{FIT_MODES[fitMode].description}</p>
            </div>

            <div style={inputRow}>
              <div style={labelLine}>
                <label style={label}>Margin</label>
                <span style={valuePill}>{margin} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={margin}
                onChange={(event) => setMargin(Number(event.target.value))}
                style={rangeStyle}
              />
            </div>

            <div style={inputRow}>
              <label style={label}>Page background</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(event) => setBackgroundColor(event.target.value)}
                style={colorInput}
              />
            </div>

            <div style={inputRow}>
              <div style={labelLine}>
                <label style={label}>Image quality</label>
                <span style={valuePill}>{Math.round(jpegQuality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1"
                step="0.05"
                value={jpegQuality}
                onChange={(event) => setJpegQuality(Number(event.target.value))}
                style={rangeStyle}
              />
              <p style={hint}>Higher quality gives clearer pages but may create a larger PDF.</p>
            </div>

            <label style={checkRow}>
              <input
                type="checkbox"
                checked={includePageNumbers}
                onChange={(event) => setIncludePageNumbers(event.target.checked)}
              />
              Add page numbers
            </label>

            {generating && (
              <div style={progressWrap}>
                <div style={{ ...progressBar, width: `${progress}%` }} />
                <span style={progressText}>{progress}%</span>
              </div>
            )}

            <button onClick={generatePDF} disabled={images.length === 0 || generating} style={images.length === 0 || generating ? disabledBtn : primaryBtn}>
              {generating ? 'Building PDF...' : `Build PDF (${images.length} pages)`}
            </button>

            <div style={tipBox}>
              <h3 style={tipTitle}>Best practice</h3>
              <p style={tipText}>
                Use “Fit full image” for receipts and documents. Use “Fill page / crop edges” for photo books and full-page visual layouts.
              </p>
            </div>
          </aside>
        </section>

        
        <RelatedTools currentPath="/imagetopdf" />

<section style={contentSection}>
          <h2 style={contentTitle}>What does an image to PDF converter do?</h2>
          <p style={para}>
            An image to PDF converter turns one or more images into a PDF document. Each uploaded image becomes a page in the
            PDF. This is useful for scanned documents, receipts, handwritten notes, certificates, product photos, screenshots,
            identity copies, forms, and other image-based records that need to be shared as a single document.
          </p>

          <div style={infoGrid}>
            <div style={infoCard}>
              <h3 style={infoTitle}>For scanned documents</h3>
              <p style={paraSmall}>
                Combine photos of paper documents into a clean multi-page PDF. Use A4, portrait orientation, and fit mode to
                keep the full page visible.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>For receipts and invoices</h3>
              <p style={paraSmall}>
                Convert multiple receipt photos into one PDF for accounting, reimbursement, expense records, or email submission.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>For photos and portfolios</h3>
              <p style={paraSmall}>
                Use landscape orientation or fill mode to create photo-based PDF pages for visual presentations, product sheets,
                or simple portfolios.
              </p>
            </div>
          </div>

          <h2 style={contentTitle}>A4, Letter, Legal and A3 PDF sizes</h2>
          <p style={para}>
            A4 is widely used internationally, including many business and office workflows. Letter is common in the United
            States and Canada. Legal is longer than Letter and is sometimes used for contracts. A3 is larger and can be useful
            for posters, diagrams, visual layouts, and large-format print preparation.
          </p>

          <h2 style={contentTitle}>Fit full image vs fill page</h2>
          <p style={para}>
            Fit full image keeps the entire image visible and may leave background space around it. Fill page crops the image
            to cover the printable area, which can look better for photos but may remove edges. Stretch mode fills the page
            exactly but may distort the image, so it should be used only when distortion is acceptable.
          </p>

          <h2 style={contentTitle}>Privacy note</h2>
          <p style={para}>
            This converter is designed to build the PDF in your browser. Your images are selected on your device and processed
            on the page using browser memory. For sensitive documents, always review the generated PDF before sending it to
            another person or organization.
          </p>
        </section>

        <section style={faqSection}>
          <h2 style={contentTitle}>Image to PDF Converter FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3 style={faqQ}>Can I combine multiple images into one PDF?</h3>
              <p style={paraSmall}>Yes. Upload multiple images and each image will become one page in the final PDF.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I reorder pages before creating the PDF?</h3>
              <p style={paraSmall}>Yes. Use the up and down buttons on each image card to change the page order.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Which paper size should I choose?</h3>
              <p style={paraSmall}>Use A4 for most international documents, Letter for US/Canada documents, and A3 for larger layouts.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Why is my PDF file large?</h3>
              <p style={paraSmall}>Large source images and high quality settings create larger PDFs. Reduce image quality or use fewer high-resolution images if needed.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function getDrawDimensions({ sourceWidth, sourceHeight, targetWidth, targetHeight, fitMode }) {
  if (fitMode === 'stretch') {
    return {
      sourceX: 0,
      sourceY: 0,
      sourceWidth,
      sourceHeight,
      targetX: 0,
      targetY: 0,
      targetWidth,
      targetHeight
    };
  }

  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;

  if (fitMode === 'contain') {
    let drawWidth = targetWidth;
    let drawHeight = targetWidth / sourceRatio;

    if (drawHeight > targetHeight) {
      drawHeight = targetHeight;
      drawWidth = targetHeight * sourceRatio;
    }

    return {
      sourceX: 0,
      sourceY: 0,
      sourceWidth,
      sourceHeight,
      targetX: (targetWidth - drawWidth) / 2,
      targetY: (targetHeight - drawHeight) / 2,
      targetWidth: drawWidth,
      targetHeight: drawHeight
    };
  }

  let cropWidth = sourceWidth;
  let cropHeight = sourceWidth / targetRatio;

  if (cropHeight > sourceHeight) {
    cropHeight = sourceHeight;
    cropWidth = sourceHeight * targetRatio;
  }

  return {
    sourceX: (sourceWidth - cropWidth) / 2,
    sourceY: (sourceHeight - cropHeight) / 2,
    sourceWidth: cropWidth,
    sourceHeight: cropHeight,
    targetX: 0,
    targetY: 0,
    targetWidth,
    targetHeight
  };
}

function sanitizeFileName(value) {
  return String(value || 'image-to-pdf')
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'image-to-pdf';
}

function shortenName(name) {
  if (!name) return 'image';
  return name.length > 20 ? `${name.slice(0, 10)}...${name.slice(-7)}` : name;
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

const dropZone = { border: '3px dashed #334155', padding: '70px 20px', borderRadius: '26px', textAlign: 'center', color: '#94a3b8', position: 'relative', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const dropIcon = { fontSize: '3rem' };
const dropTitle = { color: '#fff', fontSize: '1.2rem' };
const dropText = { color: '#94a3b8', fontSize: '0.9rem', maxWidth: '430px', lineHeight: 1.6 };
const queueCount = { color: '#38bdf8', background: 'rgba(56,189,248,0.08)', border: '1px solid #334155', padding: '8px 12px', borderRadius: '999px', fontWeight: 850, fontSize: '0.85rem' };

const queueSection = { marginTop: '28px' };
const queueHeader = { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '18px' };
const panelTitle = { color: '#fff', fontSize: '1.35rem', margin: '0 0 8px' };
const panelText = { color: '#94a3b8', lineHeight: 1.6, margin: 0 };

const thumbGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px' };
const thumbCard = { position: 'relative', background: '#0f172a', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' };
const pageBadge = { position: 'absolute', top: '8px', left: '8px', background: 'rgba(15,23,42,0.85)', color: '#fff', borderRadius: '999px', padding: '5px 9px', fontSize: '0.7rem', fontWeight: 900, zIndex: 2 };
const thumbImg = { width: '100%', height: '130px', objectFit: 'cover', display: 'block' };
const thumbInfo = { padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#94a3b8', fontSize: '0.74rem' };
const thumbControls = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', padding: '0 10px 10px' };
const miniBtn = { background: '#334155', color: '#fff', border: 'none', padding: '7px', borderRadius: '9px', cursor: 'pointer', fontWeight: 900 };
const removeBtn = { background: '#f87171', color: '#fff', border: 'none', padding: '7px', borderRadius: '9px', cursor: 'pointer', fontWeight: 900 };
const dangerBtn = { background: 'none', color: '#f87171', border: '1px solid #f87171', padding: '10px 14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 850 };

const inputRow = { marginBottom: '18px' };
const label = { fontSize: '0.78rem', color: '#94a3b8', fontWeight: 900, display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' };
const labelLine = { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '10px' };
const valuePill = { color: '#38bdf8', background: '#0f172a', border: '1px solid #334155', padding: '6px 10px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 850 };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '14px', borderRadius: '14px', color: '#fff', fontSize: '1rem', outline: 'none' };
const colorInput = { width: '100%', height: '48px', background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '6px', cursor: 'pointer' };
const rangeStyle = { width: '100%', accentColor: '#38bdf8' };
const hint = { color: '#64748b', lineHeight: 1.55, fontSize: '0.84rem', margin: '10px 0 0' };
const checkRow = { display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.92rem', margin: '0 0 20px', cursor: 'pointer' };

const progressWrap = { background: '#0f172a', border: '1px solid #334155', height: '28px', borderRadius: '999px', position: 'relative', overflow: 'hidden', marginBottom: '14px' };
const progressBar = { height: '100%', background: '#38bdf8', transition: 'width 0.2s ease' };
const progressText = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#0f172a', fontWeight: 900, fontSize: '0.8rem' };

const primaryBtn = { width: '100%', background: '#38bdf8', color: '#082f49', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: 950, cursor: 'pointer', marginTop: '4px' };
const disabledBtn = { ...primaryBtn, opacity: 0.45, cursor: 'not-allowed' };

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
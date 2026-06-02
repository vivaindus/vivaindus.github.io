import React, { useEffect, useRef, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import RelatedTools from '../../components/RelatedTools';

const TOOL_DEFS = [
  { id: 'select', label: 'Select', icon: '↔️', help: 'Select, move, resize and edit placed items.' },
  { id: 'text', label: 'Text', icon: 'T', help: 'Add editable text to the PDF.' },
  { id: 'highlight', label: 'Highlight', icon: '▰', help: 'Highlight important areas.' },
  { id: 'box', label: 'Box', icon: '□', help: 'Draw a rectangle around content.' },
  { id: 'signature', label: 'Signature', icon: '✍️', help: 'Place your uploaded signature image.' },
  { id: 'stamp', label: 'Image / Stamp', icon: '🖼️', help: 'Place a logo, stamp, seal or image.' }
];

export default function PDFEditor() {
  const canvasRef = useRef(null);
  const scrollWrapRef = useRef(null);
  const pdfStageRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfProxy, setPdfProxy] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageSizes, setPageSizes] = useState([]);
  const [selectedPage, setSelectedPage] = useState(1);

  const [tool, setTool] = useState('select');
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [dragState, setDragState] = useState(null);

  const [textValue, setTextValue] = useState('Approved');
  const [fontSize, setFontSize] = useState(18);
  const [drawColor, setDrawColor] = useState('#111827');

  const [signatureImage, setSignatureImage] = useState(null);
  const [stampImage, setStampImage] = useState(null);

  const [deletedPages, setDeletedPages] = useState([]);
  const [rotations, setRotations] = useState({});

  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [pageNumbering, setPageNumbering] = useState(true);
  const [batesPrefix, setBatesPrefix] = useState('');
  const [batesStart, setBatesStart] = useState(1);

  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    subject: '',
    keywords: ''
  });

  const [outputName, setOutputName] = useState('edited-document');
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

  useEffect(() => {
    renderPage();
  }, [pdfProxy, selectedPage, rotations]);

  useEffect(() => {
    const onMove = event => {
      if (!dragState || !pdfStageRef.current) return;

      const size = pageSizes[selectedPage - 1];
      if (!size) return;

      const point = getPdfPointFromEvent(event);
      const dx = point.x - dragState.startX;
      const dy = point.y - dragState.startY;

      setAnnotations(prev =>
        prev.map(item => {
          if (item.id !== dragState.id) return item;

          if (dragState.mode === 'move') {
            return {
              ...item,
              x: clamp(dragState.original.x + dx, 0, size.width),
              y: clamp(dragState.original.y + dy, 0, size.height)
            };
          }

          if (dragState.mode === 'resize') {
            return {
              ...item,
              width: Math.max(20, dragState.original.width + dx),
              height: Math.max(16, dragState.original.height - dy)
            };
          }

          return item;
        })
      );
    };

    const onUp = () => setDragState(null);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragState, selectedPage, pageSizes]);

  const handleUpload = async event => {
    const file = event.target.files?.[0];

    if (!file || !(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      setNotification('Please upload a valid PDF file.');
      return;
    }

    if (!pdfjsLib) {
      setNotification('PDF engine is still loading. Please try again.');
      return;
    }

    try {
      setNotification('Loading PDF editor...');

      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;

      const sizes = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        sizes.push({ width: viewport.width, height: viewport.height });
      }

      setPdfFile(file);
      setPdfProxy(pdf);
      setPageCount(pdf.numPages);
      setPageSizes(sizes);
      setSelectedPage(1);
      setTool('select');
      setAnnotations([]);
      setSelectedAnnotationId(null);
      setDeletedPages([]);
      setRotations({});
      setOutputName(file.name.replace(/\.pdf$/i, '') || 'edited-document');
      setMetadata({
        title: file.name.replace(/\.pdf$/i, ''),
        author: '',
        subject: '',
        keywords: ''
      });

      setNotification(`PDF loaded with ${pdf.numPages} page${pdf.numPages > 1 ? 's' : ''}.`);
    } catch (error) {
      console.error(error);
      setNotification('Could not load PDF. It may be locked, damaged or unsupported.');
    }

    event.target.value = '';
  };

  const renderPage = async () => {
    if (!pdfProxy || !canvasRef.current) return;

    try {
      const page = await pdfProxy.getPage(selectedPage);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = '100%';
      canvas.style.height = 'auto';

      await page.render({ canvasContext: context, viewport }).promise;
    } catch (error) {
      console.error('Render failed:', error);
    }
  };

  const getPdfPointFromEvent = event => {
    const size = pageSizes[selectedPage - 1];
    const stage = pdfStageRef.current;

    if (!size || !stage) return { x: 0, y: 0 };

    const rect = stage.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * size.width;
    const y = size.height - ((event.clientY - rect.top) / rect.height) * size.height;

    return {
      x: clamp(x, 0, size.width),
      y: clamp(y, 0, size.height)
    };
  };

  const handleStageClick = event => {
    if (!pdfFile || !pdfStageRef.current) return;

    if (tool === 'select') {
      setSelectedAnnotationId(null);
      return;
    }

    if (deletedPages.includes(selectedPage)) {
      setNotification('This page is skipped. Unskip it before adding items.');
      return;
    }

    const { x, y } = getPdfPointFromEvent(event);
    let item = null;

    if (tool === 'text') {
      item = {
        id: Date.now(),
        type: 'text',
        page: selectedPage,
        x,
        y,
        width: 190,
        height: 36,
        text: textValue || 'Text',
        size: fontSize,
        color: drawColor
      };
    }

    if (tool === 'highlight') {
      item = {
        id: Date.now(),
        type: 'highlight',
        page: selectedPage,
        x,
        y,
        width: 220,
        height: 38,
        color: '#facc15',
        opacity: 0.38
      };
    }

    if (tool === 'box') {
      item = {
        id: Date.now(),
        type: 'box',
        page: selectedPage,
        x,
        y,
        width: 220,
        height: 90,
        color: drawColor
      };
    }

    if (tool === 'signature') {
      if (!signatureImage) {
        setNotification('Upload a signature first, then click Signature again.');
        return;
      }

      item = {
        id: Date.now(),
        type: 'signature',
        page: selectedPage,
        x,
        y,
        width: 190,
        height: 75
      };
    }

    if (tool === 'stamp') {
      if (!stampImage) {
        setNotification('Upload an image/stamp first, then click Image / Stamp again.');
        return;
      }

      item = {
        id: Date.now(),
        type: 'stamp',
        page: selectedPage,
        x,
        y,
        width: 180,
        height: 110
      };
    }

    if (!item) return;

    setAnnotations(prev => [...prev, item]);
    setSelectedAnnotationId(item.id);
    setTool('select');
    setNotification(`${getToolLabel(tool)} added. Drag to move, use the corner handle to resize.`);
  };

  const startMove = (event, item) => {
    event.stopPropagation();
    event.preventDefault();

    const point = getPdfPointFromEvent(event);

    setTool('select');
    setSelectedAnnotationId(item.id);
    setDragState({
      id: item.id,
      mode: 'move',
      startX: point.x,
      startY: point.y,
      original: { ...item }
    });
  };

  const startResize = (event, item) => {
    event.stopPropagation();
    event.preventDefault();

    const point = getPdfPointFromEvent(event);

    setSelectedAnnotationId(item.id);
    setDragState({
      id: item.id,
      mode: 'resize',
      startX: point.x,
      startY: point.y,
      original: { ...item }
    });
  };

  const uploadImageFile = async (event, setter, label) => {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith('image/')) {
      setNotification('Please upload a PNG or JPG image.');
      return;
    }

    const bytes = await file.arrayBuffer();
    const url = URL.createObjectURL(file);

    setter({
      bytes,
      url,
      type: file.type,
      name: file.name
    });

    setNotification(`${label} uploaded. Select the related tool and click the PDF page to place it.`);
    event.target.value = '';
  };

  const updateSelectedAnnotation = patch => {
    if (!selectedAnnotationId) return;
    setAnnotations(prev => prev.map(item => item.id === selectedAnnotationId ? { ...item, ...patch } : item));
  };

  const removeAnnotation = id => {
    setAnnotations(prev => prev.filter(item => item.id !== id));
    if (selectedAnnotationId === id) setSelectedAnnotationId(null);
  };

  const moveSelectedLayer = direction => {
    if (!selectedAnnotationId) return;

    setAnnotations(prev => {
      const before = [];
      const pageItems = [];
      const after = [];

      prev.forEach(item => {
        if (item.page === selectedPage) pageItems.push(item);
        else before.push(item);
      });

      const index = pageItems.findIndex(item => item.id === selectedAnnotationId);
      if (index === -1) return prev;

      const reordered = [...pageItems];
      const [selected] = reordered.splice(index, 1);

      if (direction === 'front') {
        reordered.push(selected);
      }

      if (direction === 'back') {
        reordered.unshift(selected);
      }

      if (direction === 'forward') {
        reordered.splice(Math.min(index + 1, reordered.length), 0, selected);
      }

      if (direction === 'backward') {
        reordered.splice(Math.max(index - 1, 0), 0, selected);
      }

      return [...before, ...after, ...reordered];
    });

    setNotification('Layer order updated.');
  };

  const clearPageAnnotations = () => {
    setAnnotations(prev => prev.filter(item => item.page !== selectedPage));
    setSelectedAnnotationId(null);
    setNotification(`All items removed from page ${selectedPage}.`);
  };

  const toggleDeletePage = () => {
    setDeletedPages(prev => {
      if (prev.includes(selectedPage)) {
        return prev.filter(page => page !== selectedPage);
      }

      if (prev.length >= pageCount - 1) {
        setNotification('At least one page must remain.');
        return prev;
      }

      return [...prev, selectedPage].sort((a, b) => a - b);
    });
  };

  const rotateSelectedPage = () => {
    setRotations(prev => {
      const current = prev[selectedPage] || 0;
      return { ...prev, [selectedPage]: (current + 90) % 360 };
    });
  };

  const downloadEditedPDF = async () => {
  if (!pdfFile || !pageCount || !pdfProxy) {
    setNotification('Upload a PDF first.');
    return;
  }

  setProcessing(true);

  try {
    const outputPdf = await PDFDocument.create();
    applyMetadata(outputPdf, metadata);

    const keptPages = [];
    for (let i = 1; i <= pageCount; i++) {
      if (!deletedPages.includes(i)) keptPages.push(i);
    }

    for (let outputIndex = 0; outputIndex < keptPages.length; outputIndex++) {
      const originalPageNumber = keptPages[outputIndex];
      const pdfPage = await pdfProxy.getPage(originalPageNumber);

      const baseViewport = pdfPage.getViewport({ scale: 1 });
      const exportScale = 2.5;
      const viewport = pdfPage.getViewport({ scale: exportScale });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      await pdfPage.render({
        canvasContext: ctx,
        viewport
      }).promise;

      const pageAnnotations = annotations.filter(item => item.page === originalPageNumber);

      for (const item of pageAnnotations) {
        await drawCanvasAnnotation(ctx, item, {
          baseWidth: baseViewport.width,
          baseHeight: baseViewport.height,
          scale: exportScale,
          signatureImage,
          stampImage
        });
      }

      drawCanvasHeaderFooter(ctx, {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        scale: exportScale,
        headerText,
        footerText,
        pageNumbering,
        batesPrefix,
        batesStart,
        outputIndex,
        totalPages: keptPages.length
      });

      const pngDataUrl = canvas.toDataURL('image/png');
      const pngBytes = dataUrlToUint8Array(pngDataUrl);
      const embeddedImage = await outputPdf.embedPng(pngBytes);

      const finalPage = outputPdf.addPage([baseViewport.width, baseViewport.height]);

      finalPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: baseViewport.width,
        height: baseViewport.height
      });
    }

    const outputBytes = await outputPdf.save({
      useObjectStreams: true,
      addDefaultPage: false
    });

    const blob = new Blob([outputBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${sanitizeFileName(outputName)}-edited.pdf`;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1500);
    setNotification('Edited PDF downloaded exactly as preview.');
  } catch (error) {
    console.error(error);
    setNotification('Could not export edited PDF. Try again with an unlocked PDF.');
  } finally {
    setProcessing(false);
  }
};
const drawCanvasAnnotation = async (ctx, item, options) => {
  const {
    baseHeight,
    scale,
    signatureImage,
    stampImage
  } = options;

  const x = item.x * scale;
  const y = (baseHeight - item.y) * scale;
  const width = (item.width || 120) * scale;
  const height = (item.height || 40) * scale;

  if (item.type === 'text') {
    ctx.save();
    ctx.fillStyle = item.color || '#111827';
    ctx.font = `700 ${(item.size || 18) * scale}px Arial, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(item.text || 'Text', x, y - height);
    ctx.restore();
    return;
  }

  if (item.type === 'highlight') {
    ctx.save();
    ctx.fillStyle = 'rgba(250, 204, 21, 0.38)';
    ctx.fillRect(x, y - height, width, height);
    ctx.restore();
    return;
  }

  if (item.type === 'box') {
    ctx.save();
    ctx.strokeStyle = item.color || '#111827';
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(x, y - height, width, height);
    ctx.restore();
    return;
  }

  if (item.type === 'signature' && signatureImage?.url) {
    const img = await loadBrowserImage(signatureImage.url);
    ctx.drawImage(img, x, y - height, width, height);
    return;
  }

  if (item.type === 'stamp' && stampImage?.url) {
    const img = await loadBrowserImage(stampImage.url);
    ctx.drawImage(img, x, y - height, width, height);
  }
};

const drawCanvasHeaderFooter = (ctx, options) => {
  const {
    canvasWidth,
    canvasHeight,
    scale,
    headerText,
    footerText,
    pageNumbering,
    batesPrefix,
    batesStart,
    outputIndex,
    totalPages
  } = options;

  ctx.save();
  ctx.fillStyle = '#334155';
  ctx.font = `${9 * scale}px Arial, sans-serif`;
  ctx.textBaseline = 'top';

  if (headerText.trim()) {
    ctx.fillText(headerText.trim(), 40 * scale, 22 * scale);
  }

  if (footerText.trim()) {
    ctx.fillText(footerText.trim(), 40 * scale, canvasHeight - 34 * scale);
  }

  if (pageNumbering) {
    const label = `Page ${outputIndex + 1} of ${totalPages}`;
    const metrics = ctx.measureText(label);
    ctx.fillText(label, (canvasWidth - metrics.width) / 2, canvasHeight - 34 * scale);
  }

  if (batesPrefix.trim()) {
    const label = `${batesPrefix.trim()}-${String(Number(batesStart || 1) + outputIndex).padStart(6, '0')}`;
    const metrics = ctx.measureText(label);
    ctx.fillText(label, canvasWidth - metrics.width - 40 * scale, 22 * scale);
  }

  ctx.restore();
};

const loadBrowserImage = src => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const dataUrlToUint8Array = dataUrl => {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};
  const selectedAnnotation = annotations.find(item => item.id === selectedAnnotationId);
  const currentSize = pageSizes[selectedPage - 1];
  const currentAnnotations = annotations.filter(item => item.page === selectedPage);

  return (
    <ToolboxLayout
      title="PDF Editor & Annotator - Add Text, Signature, Images and Page Numbers"
      description="Edit PDF files online for free. Add text, highlights, signatures, images, boxes, page numbers, Bates numbers, headers, footers, metadata and download privately in your browser."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based PDF editor</p>
          <h1 style={heroTitle}>PDF Editor / Annotator</h1>
          <p style={heroText}>
            Upload a PDF, add text, signatures, highlights, boxes or stamps, move and resize each item,
            control layer order, then download the edited PDF.
          </p>
          <div style={heroBadges}>
            <span>✍️ Text</span>
            <span>🖊️ Signature</span>
            <span>🟨 Highlight</span>
            <span>🖼️ Image / Stamp</span>
            <span>↕️ Layer control</span>
            <span>🔒 Local processing</span>
          </div>
        </section>

        {!pdfFile && (
          <section style={uploadPanel}>
            <div style={dropZone}>
              <input type="file" accept="application/pdf,.pdf" onChange={handleUpload} style={fileInput} />
              <div style={dropIcon}>📄</div>
              <strong>Click to upload PDF</strong>
              <span>PDF files are processed inside your browser.</span>
            </div>

            <div style={startTips}>
              <h2>What you can do</h2>
              <p>Add text, highlight areas, draw boxes, add signatures, place stamps or logos, skip pages, rotate pages, add page numbers, add Bates numbering and edit PDF metadata.</p>
            </div>
          </section>
        )}

        {pdfFile && (
          <section style={editorShell}>
            <aside style={leftToolbar}>
              <div style={fileSummary}>
                <strong>{pdfFile.name}</strong>
                <span>{pageCount} page{pageCount > 1 ? 's' : ''}</span>
              </div>

              <div style={toolbarGroup}>
                <h2 style={toolbarTitle}>Tools</h2>
                {TOOL_DEFS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setTool(item.id)}
                    style={tool === item.id ? activeToolButton : toolButton}
                    title={item.help}
                  >
                    <span style={toolIcon}>{item.icon}</span>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.help}</small>
                    </span>
                  </button>
                ))}
              </div>

              <div style={toolbarGroup}>
                <h2 style={toolbarTitle}>Tool Options</h2>

                {tool === 'text' && (
                  <>
                    <label style={fieldWrap}>
                      <span style={fieldLabel}>Text to place</span>
                      <input value={textValue} onChange={e => setTextValue(e.target.value)} style={inputStyle} />
                    </label>

                    <label style={fieldWrap}>
                      <span style={fieldLabel}>Font size: {fontSize}px</span>
                      <input type="range" min="8" max="56" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={rangeStyle} />
                    </label>
                  </>
                )}

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Color</span>
                  <input type="color" value={drawColor} onChange={e => setDrawColor(e.target.value)} style={colorInput} />
                </label>

                <label style={uploadMini}>
                  Upload Signature
                  <input type="file" accept="image/*" onChange={e => uploadImageFile(e, setSignatureImage, 'Signature')} style={{ display: 'none' }} />
                </label>
                {signatureImage && <img src={signatureImage.url} alt="Signature preview" style={assetPreview} />}

                <label style={uploadMini}>
                  Upload Stamp / Image / Logo
                  <input type="file" accept="image/*" onChange={e => uploadImageFile(e, setStampImage, 'Image')} style={{ display: 'none' }} />
                </label>
                {stampImage && <img src={stampImage.url} alt="Stamp preview" style={assetPreview} />}
              </div>

              <div style={toolbarGroup}>
                <h2 style={toolbarTitle}>Page Actions</h2>
                <button onClick={rotateSelectedPage} style={secondaryBtn}>Rotate Page</button>
                <button onClick={clearPageAnnotations} style={secondaryBtn}>Clear Page Items</button>
                <button onClick={toggleDeletePage} style={deletedPages.includes(selectedPage) ? restoreBtn : dangerBtn}>
                  {deletedPages.includes(selectedPage) ? 'Unskip Page' : 'Skip Page in Output'}
                </button>
              </div>
            </aside>

            <main style={centerWorkspace}>
              <div style={topBar}>
                <div>
                  <h2 style={pageTitle}>Page {selectedPage}</h2>
                  <p style={pageHelp}>
                    {tool === 'select'
                      ? 'Select an item to move, resize, edit or change layer order.'
                      : `Click on the PDF to place: ${getToolLabel(tool)}.`}
                  </p>
                </div>

                <button onClick={downloadEditedPDF} disabled={processing} style={processing ? disabledDownloadBtn : downloadBtn}>
                  {processing ? 'Exporting...' : 'Download Edited PDF'}
                </button>
              </div>

              <div style={pageTabs}>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => {
                      setSelectedPage(page);
                      setSelectedAnnotationId(null);
                    }}
                    style={selectedPage === page ? activePageBtn : pageBtn}
                  >
                    {deletedPages.includes(page) ? `✕ ${page}` : page}
                  </button>
                ))}
              </div>

              <div ref={scrollWrapRef} style={canvasScroll}>
                <div ref={pdfStageRef} onClick={handleStageClick} style={pdfStage}>
                  <canvas ref={canvasRef} style={canvasStyle} />

                  {currentSize && currentAnnotations.map(item => (
                    <AnnotationOverlay
                      key={item.id}
                      item={item}
                      size={currentSize}
                      selected={selectedAnnotationId === item.id}
                      signatureImage={signatureImage}
                      stampImage={stampImage}
                      onMoveStart={startMove}
                      onResizeStart={startResize}
                      onSelect={setSelectedAnnotationId}
                      onRemove={removeAnnotation}
                    />
                  ))}

                  {deletedPages.includes(selectedPage) && (
                    <div style={deletedOverlay}>This page will be skipped in the final PDF</div>
                  )}
                </div>
              </div>
            </main>

            <aside style={rightPanel}>
              <div style={toolbarGroup}>
                <h2 style={toolbarTitle}>Selected Item</h2>

                {!selectedAnnotation && (
                  <div style={emptySelection}>
                    <strong>No item selected</strong>
                    <span>Click an added item on the PDF to edit, move, resize or reorder it.</span>
                  </div>
                )}

                {selectedAnnotation && (
                  <div style={selectedPanel}>
                    <div style={selectedType}>{getToolLabel(selectedAnnotation.type)}</div>

                    {selectedAnnotation.type === 'text' && (
                      <>
                        <label style={fieldWrap}>
                          <span style={fieldLabel}>Edit text</span>
                          <input value={selectedAnnotation.text} onChange={e => updateSelectedAnnotation({ text: e.target.value })} style={inputStyle} />
                        </label>

                        <label style={fieldWrap}>
                          <span style={fieldLabel}>Font size: {selectedAnnotation.size}px</span>
                          <input type="range" min="8" max="64" value={selectedAnnotation.size} onChange={e => updateSelectedAnnotation({ size: Number(e.target.value) })} style={rangeStyle} />
                        </label>
                      </>
                    )}

                    {(selectedAnnotation.type === 'text' || selectedAnnotation.type === 'box') && (
                      <label style={fieldWrap}>
                        <span style={fieldLabel}>Color</span>
                        <input type="color" value={selectedAnnotation.color || drawColor} onChange={e => updateSelectedAnnotation({ color: e.target.value })} style={colorInput} />
                      </label>
                    )}

                    <div style={dimensionGrid}>
                      <label style={fieldWrap}>
                        <span style={fieldLabel}>Width</span>
                        <input type="number" value={Math.round(selectedAnnotation.width || 100)} onChange={e => updateSelectedAnnotation({ width: Number(e.target.value) })} style={inputStyle} />
                      </label>

                      <label style={fieldWrap}>
                        <span style={fieldLabel}>Height</span>
                        <input type="number" value={Math.round(selectedAnnotation.height || 40)} onChange={e => updateSelectedAnnotation({ height: Number(e.target.value) })} style={inputStyle} />
                      </label>
                    </div>

                    <div style={dimensionGrid}>
                      <label style={fieldWrap}>
                        <span style={fieldLabel}>X position</span>
                        <input type="number" value={Math.round(selectedAnnotation.x || 0)} onChange={e => updateSelectedAnnotation({ x: Number(e.target.value) })} style={inputStyle} />
                      </label>

                      <label style={fieldWrap}>
                        <span style={fieldLabel}>Y position</span>
                        <input type="number" value={Math.round(selectedAnnotation.y || 0)} onChange={e => updateSelectedAnnotation({ y: Number(e.target.value) })} style={inputStyle} />
                      </label>
                    </div>

                    <div style={miniHelpBox}>
                      <strong>Layer order</strong>
                      <span>Use this when a signature must appear above a stamp or image.</span>
                    </div>

                    <div style={layerGrid}>
                      <button onClick={() => moveSelectedLayer('forward')} style={layerBtn}>Bring Forward</button>
                      <button onClick={() => moveSelectedLayer('backward')} style={layerBtn}>Send Backward</button>
                      <button onClick={() => moveSelectedLayer('front')} style={layerBtn}>Bring to Front</button>
                      <button onClick={() => moveSelectedLayer('back')} style={layerBtn}>Send to Back</button>
                    </div>

                    <button onClick={() => removeAnnotation(selectedAnnotation.id)} style={dangerBtn}>Delete Selected Item</button>
                  </div>
                )}
              </div>

              <div style={toolbarGroup}>
                <h2 style={toolbarTitle}>Headers & Numbering</h2>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Header text</span>
                  <input value={headerText} onChange={e => setHeaderText(e.target.value)} style={inputStyle} placeholder="Optional header" />
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Footer text</span>
                  <input value={footerText} onChange={e => setFooterText(e.target.value)} style={inputStyle} placeholder="Optional footer" />
                </label>

                <label style={checkRow}>
                  <input type="checkbox" checked={pageNumbering} onChange={e => setPageNumbering(e.target.checked)} />
                  Add page numbers
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Bates prefix</span>
                  <input value={batesPrefix} onChange={e => setBatesPrefix(e.target.value)} style={inputStyle} placeholder="CASE-A" />
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Bates start</span>
                  <input type="number" value={batesStart} onChange={e => setBatesStart(e.target.value)} style={inputStyle} />
                </label>
              </div>

              <div style={toolbarGroup}>
                <h2 style={toolbarTitle}>PDF Details</h2>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Output name</span>
                  <input value={outputName} onChange={e => setOutputName(e.target.value)} style={inputStyle} />
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Title</span>
                  <input value={metadata.title} onChange={e => setMetadata({ ...metadata, title: e.target.value })} style={inputStyle} />
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Author</span>
                  <input value={metadata.author} onChange={e => setMetadata({ ...metadata, author: e.target.value })} style={inputStyle} />
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Subject</span>
                  <input value={metadata.subject} onChange={e => setMetadata({ ...metadata, subject: e.target.value })} style={inputStyle} />
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Keywords</span>
                  <input value={metadata.keywords} onChange={e => setMetadata({ ...metadata, keywords: e.target.value })} style={inputStyle} />
                </label>
              </div>
            </aside>
          </section>
        )}

        

        
        <RelatedTools currentPath="/pdfeditor" />

<section style={contentSection}>
          <h2>Free PDF editor and annotator online</h2>
          <p>
            This PDF Editor helps you add text, signatures, stamps, images, highlights, boxes, headers, footers,
            page numbers, Bates numbering and PDF metadata. It is built for fast document editing, approval,
            invoice signing, office forms, scanned PDFs and simple PDF annotation workflows.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Add text to PDF</h3>
              <p>Place custom text anywhere on a PDF page, then edit, resize or move it.</p>
            </div>

            <div style={seoCard}>
              <h3>Sign PDF online</h3>
              <p>Upload your signature image and place the actual signature directly on the PDF.</p>
            </div>

            <div style={seoCard}>
              <h3>Add stamp or logo to PDF</h3>
              <p>Upload an image, stamp, seal or logo and place it on a document.</p>
            </div>

            <div style={seoCard}>
              <h3>Highlight PDF</h3>
              <p>Add highlight blocks to mark important text or document areas.</p>
            </div>

            <div style={seoCard}>
              <h3>Layer control</h3>
              <p>Bring objects forward, send them backward, or place signatures above stamps.</p>
            </div>

            <div style={seoCard}>
              <h3>Private PDF editing</h3>
              <p>Your file is edited locally inside your browser and downloaded without server upload.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function AnnotationOverlay({ item, size, selected, signatureImage, stampImage, onMoveStart, onResizeStart, onSelect, onRemove }) {
  return (
    <div
      style={annotationOverlay(item, size, selected)}
      onMouseDown={event => onMoveStart(event, item)}
      onClick={event => {
        event.stopPropagation();
        onSelect(item.id);
      }}
      title="Drag to move. Use the corner handle to resize."
    >
      {item.type === 'text' && (
        <span style={{ color: item.color, fontSize: `${Math.max(10, item.size * 0.75)}px`, fontWeight: 800, lineHeight: 1 }}>
          {item.text}
        </span>
      )}

      {item.type === 'highlight' && <span style={{ color: '#713f12', fontWeight: 900, fontSize: 12 }}>Highlight</span>}
      {item.type === 'box' && <span style={{ color: item.color, fontWeight: 900, fontSize: 12 }}>Box</span>}

      {item.type === 'signature' && signatureImage && (
        <img src={signatureImage.url} alt="Signature annotation" style={overlayImage} draggable={false} />
      )}

      {item.type === 'stamp' && stampImage && (
        <img src={stampImage.url} alt="Stamp annotation" style={overlayImage} draggable={false} />
      )}

      {selected && (
        <>
          <button
            onClick={event => {
              event.stopPropagation();
              onRemove(item.id);
            }}
            style={removeAnnBtn}
            title="Delete item"
          >
            ×
          </button>

          <div
            onMouseDown={event => onResizeStart(event, item)}
            style={resizeHandle}
            title="Drag to resize"
          />
        </>
      )}
    </div>
  );
}

function drawAnnotation(page, annotation, font, embeddedSignature, embeddedStamp) {
  const color = hexToRgb(annotation.color || '#111827');

  if (annotation.type === 'text') {
    page.drawText(annotation.text || 'Text', {
      x: annotation.x,
      y: annotation.y,
      size: annotation.size || 18,
      font,
      color: rgb(color.r, color.g, color.b)
    });
  }

  if (annotation.type === 'highlight') {
    page.drawRectangle({
      x: annotation.x,
      y: annotation.y - annotation.height,
      width: annotation.width,
      height: annotation.height,
      color: rgb(0.98, 0.8, 0.08),
      opacity: annotation.opacity || 0.38
    });
  }

  if (annotation.type === 'box') {
    page.drawRectangle({
      x: annotation.x,
      y: annotation.y - annotation.height,
      width: annotation.width,
      height: annotation.height,
      borderColor: rgb(color.r, color.g, color.b),
      borderWidth: 2,
      opacity: 0
    });
  }

  if (annotation.type === 'signature' && embeddedSignature) {
    page.drawImage(embeddedSignature, {
      x: annotation.x,
      y: annotation.y - annotation.height,
      width: annotation.width,
      height: annotation.height
    });
  }

  if (annotation.type === 'stamp' && embeddedStamp) {
    page.drawImage(embeddedStamp, {
      x: annotation.x,
      y: annotation.y - annotation.height,
      width: annotation.width,
      height: annotation.height
    });
  }
}

async function embedImage(pdfDoc, image) {
  const bytes = new Uint8Array(image.bytes);
  if (image.type.includes('png')) return await pdfDoc.embedPng(bytes);
  return await pdfDoc.embedJpg(bytes);
}

function applyMetadata(pdfDoc, metadata) {
  if (metadata.title) pdfDoc.setTitle(metadata.title);
  if (metadata.author) pdfDoc.setAuthor(metadata.author);
  if (metadata.subject) pdfDoc.setSubject(metadata.subject);
  if (metadata.keywords) {
    pdfDoc.setKeywords(metadata.keywords.split(',').map(item => item.trim()).filter(Boolean));
  }

  pdfDoc.setCreator('SHB ToolBox PDF Editor');
  pdfDoc.setProducer('SHB ToolBox');
}

function annotationOverlay(item, size, selected) {
  const left = `${(item.x / size.width) * 100}%`;
  const top = `${((size.height - item.y) / size.height) * 100}%`;
  const width = `${((item.width || 120) / size.width) * 100}%`;
  const height = `${((item.height || 40) / size.height) * 100}%`;

  const base = {
    position: 'absolute',
    left,
    top,
    width,
    height,
    transform: 'translateY(-100%)',
    border: selected ? '2px solid #38bdf8' : '1px dashed rgba(56,189,248,0.7)',
    borderRadius: '6px',
    cursor: 'move',
    userSelect: 'none',
    zIndex: selected ? 999 : 10,
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.1)',
    boxSizing: 'border-box'
  };

  if (item.type === 'highlight') {
    return {
      ...base,
      background: 'rgba(250, 204, 21, 0.45)',
      border: selected ? '2px solid #eab308' : '1px dashed #eab308'
    };
  }

  if (item.type === 'box') {
    return {
      ...base,
      background: 'transparent',
      border: selected ? `2px solid ${item.color}` : `2px dashed ${item.color}`
    };
  }

  if (item.type === 'signature' || item.type === 'stamp') {
    return {
      ...base,
      background: 'rgba(255,255,255,0.18)'
    };
  }

  return base;
}

function getToolLabel(tool) {
  const found = TOOL_DEFS.find(item => item.id === tool);
  return found ? found.label : tool;
}

function hexToRgb(hex) {
  const normalized = String(hex || '#111827').replace('#', '');
  const bigint = parseInt(normalized, 16);

  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255
  };
}

function sanitizeFileName(name) {
  return String(name || 'edited-document')
    .trim()
    .replace(/[^\w\- ]+/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase() || 'edited-document';
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const pageWrap = { maxWidth: '1600px', margin: '0 auto', padding: '45px 18px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 2000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '34px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '980px', margin: '0 auto', lineHeight: 1.75 };
const heroBadges = { display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '22px', color: '#38bdf8', fontWeight: 850, fontSize: '0.88rem' };

const uploadPanel = { display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 24, alignItems: 'stretch' };
const dropZone = { position: 'relative', minHeight: 310, background: '#0f172a', border: '2px dashed #334155', borderRadius: 26, display: 'grid', placeItems: 'center', textAlign: 'center', color: '#cbd5e1', padding: 30, gap: 8 };
const fileInput = { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const dropIcon = { fontSize: '4rem' };
const startTips = { background: '#1e293b', border: '1px solid #334155', borderRadius: 26, padding: 28, color: '#cbd5e1', lineHeight: 1.75 };

const editorShell = { display: 'grid', gridTemplateColumns: '330px minmax(0, 1fr) 330px', gap: 18, alignItems: 'start' };
const leftToolbar = { background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: 18, display: 'grid', gap: 16, position: 'sticky', top: 84, maxHeight: 'calc(100vh - 100px)', overflow: 'auto' };
const rightPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: 18, display: 'grid', gap: 16, position: 'sticky', top: 84, maxHeight: 'calc(100vh - 100px)', overflow: 'auto' };
const centerWorkspace = { minWidth: 0, display: 'grid', gap: 14 };

const fileSummary = { background: '#0f172a', border: '1px solid #334155', borderRadius: 16, padding: 14, color: '#fff', display: 'grid', gap: 6, fontSize: '0.88rem' };
const toolbarGroup = { background: '#0f172a', border: '1px solid #334155', borderRadius: 18, padding: 14, display: 'grid', gap: 12 };
const toolbarTitle = { color: '#fff', margin: 0, fontSize: '1rem' };

const toolButton = { background: '#111c2f', color: '#cbd5e1', border: '1px solid #334155', borderRadius: 14, padding: 12, display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', textAlign: 'left' };
const activeToolButton = { ...toolButton, background: '#38bdf8', color: '#082f49', border: '1px solid #38bdf8' };
const toolIcon = { width: 30, height: 30, borderRadius: 10, background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center', fontWeight: 950 };

const fieldWrap = { display: 'grid', gap: 7 };
const fieldLabel = { color: '#94a3b8', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: 12, padding: 12, outline: 'none', fontSize: '0.94rem' };
const rangeStyle = { width: '100%', accentColor: '#38bdf8' };
const colorInput = { width: '100%', height: 44, background: '#020617', border: '1px solid #334155', borderRadius: 12, padding: 4, cursor: 'pointer' };

const uploadMini = { background: '#111c2f', color: '#38bdf8', border: '1px solid #334155', borderRadius: 12, padding: 12, fontWeight: 900, cursor: 'pointer', textAlign: 'center' };
const assetPreview = { maxWidth: '100%', maxHeight: 92, objectFit: 'contain', background: '#fff', borderRadius: 10, padding: 8 };

const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', borderRadius: 12, padding: 12, fontWeight: 900, cursor: 'pointer' };
const dangerBtn = { background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: 12, padding: 12, fontWeight: 900, cursor: 'pointer' };
const restoreBtn = { background: '#34d399', color: '#052e16', border: 'none', borderRadius: 12, padding: 12, fontWeight: 900, cursor: 'pointer' };

const topBar = { background: '#1e293b', border: '1px solid #334155', borderRadius: 20, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' };
const pageTitle = { color: '#fff', margin: 0, fontSize: '1.25rem' };
const pageHelp = { color: '#94a3b8', margin: '6px 0 0', fontSize: '0.9rem' };
const downloadBtn = { background: '#38bdf8', color: '#082f49', border: 'none', borderRadius: 14, padding: '14px 20px', fontWeight: 950, cursor: 'pointer' };
const disabledDownloadBtn = { ...downloadBtn, opacity: 0.45, cursor: 'not-allowed' };

const pageTabs = { display: 'flex', gap: 8, flexWrap: 'wrap', background: '#1e293b', border: '1px solid #334155', borderRadius: 18, padding: 12 };
const pageBtn = { background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: 10, padding: '8px 11px', cursor: 'pointer', fontWeight: 900 };
const activePageBtn = { ...pageBtn, background: '#38bdf8', color: '#082f49', border: '1px solid #38bdf8' };

const canvasScroll = { background: '#475569', border: '1px solid #334155', borderRadius: 22, padding: 26, overflow: 'auto', minHeight: 'calc(100vh - 230px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' };
const pdfStage = { position: 'relative', display: 'inline-block', width: '100%', maxWidth: 1120, background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' };
const canvasStyle = { display: 'block', width: '100%', height: 'auto', background: '#fff', cursor: 'crosshair' };

const overlayImage = { width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' };
const removeAnnBtn = { position: 'absolute', top: -12, right: -12, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontWeight: 900, zIndex: 1000 };
const resizeHandle = { position: 'absolute', right: -8, bottom: -8, width: 17, height: 17, borderRadius: '50%', background: '#38bdf8', border: '2px solid #082f49', cursor: 'nwse-resize', zIndex: 1000 };
const deletedOverlay = { position: 'absolute', inset: 0, background: 'rgba(127,29,29,0.65)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 950, zIndex: 2000 };

const emptySelection = { color: '#94a3b8', lineHeight: 1.6, display: 'grid', gap: 6, fontSize: '0.9rem' };
const selectedPanel = { display: 'grid', gap: 12 };
const selectedType = { background: '#38bdf8', color: '#082f49', borderRadius: 12, padding: 10, fontWeight: 950, textAlign: 'center' };
const dimensionGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };
const miniHelpBox = { background: 'rgba(56,189,248,0.08)', border: '1px solid #334155', borderRadius: 12, padding: 11, color: '#cbd5e1', display: 'grid', gap: 5, fontSize: '0.82rem', lineHeight: 1.5 };
const layerGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 };
const layerBtn = { background: '#020617', color: '#cbd5e1', border: '1px solid #334155', borderRadius: 11, padding: 10, fontWeight: 850, cursor: 'pointer', fontSize: '0.76rem' };
const checkRow = { color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '0.9rem' };

const contentSection = { marginTop: 72, borderTop: '1px solid #334155', paddingTop: 50, color: '#cbd5e1', lineHeight: 1.85 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, margin: '30px 0' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: 22, padding: 22 };
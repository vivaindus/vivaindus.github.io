import React, { useEffect, useMemo, useRef, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const BARCODE_TYPES = [
  { value: 'code128', label: 'Code 128', note: 'Best general-purpose barcode for text, numbers, SKU, inventory, labels and product IDs.' },
  { value: 'code39', label: 'Code 39', note: 'Simple alphanumeric barcode used for inventory, warehouse and asset labels.' },
  { value: 'ean13', label: 'EAN-13', note: 'Retail product barcode. Requires valid 13-digit EAN data.' },
  { value: 'ean8', label: 'EAN-8', note: 'Compact retail barcode. Requires valid 8-digit EAN data.' },
  { value: 'upca', label: 'UPC-A', note: 'Retail barcode common in North America. Requires valid 12-digit UPC data.' },
  { value: 'itf14', label: 'ITF-14', note: 'Used for cartons, packaging and logistics. Requires valid 14-digit data.' },
  { value: 'codabar', label: 'Codabar', note: 'Used in libraries, blood banks and legacy systems.' },
  { value: 'qrcode', label: 'QR Code', note: '2D code for URLs, text, contact details and general data.' },
  { value: 'datamatrix', label: 'Data Matrix', note: '2D barcode used for small labels, manufacturing and tracking.' },
  { value: 'pdf417', label: 'PDF417', note: 'Stacked 2D barcode used for IDs, documents and logistics.' },
  { value: 'azteccode', label: 'Aztec Code', note: '2D barcode used for tickets, transport and compact data.' }
];

const PAPER_SIZES = {
  a4: { label: 'A4', width: 210, height: 297 },
  letter: { label: 'Letter', width: 216, height: 279 },
  a5: { label: 'A5', width: 148, height: 210 },
  thermal80: { label: '80mm Thermal Roll', width: 80, height: 200 },
  thermal58: { label: '58mm Thermal Roll', width: 58, height: 200 }
};

const simpleSample = `SHB-1001
SHB-1002
SHB-1003
SHB-1004
SHB-1005`;

const labelSample = `4108701256100
108701/PC/BBQAIUM TRAYS
Price: 306
256100 - :14062026

SHB-1002
Girls Dress Pink
Price: AED 35
Size: 3Y

SHB-1003
Kids Co-ord Set
Price: AED 45
Size: 4Y`;

export default function BarcodeGenerator() {
  const [barcodeType, setBarcodeType] = useState('code128');
  const [dataMode, setDataMode] = useState('simple');
  const [inputText, setInputText] = useState(simpleSample);
  const [copies, setCopies] = useState(1);

  const [scale, setScale] = useState(3);
  const [height, setHeight] = useState(12);
  const [showBarcodeText, setShowBarcodeText] = useState(true);
  const [showLabelText, setShowLabelText] = useState(true);
  const [textAlign, setTextAlign] = useState('center');

  const [labelWidth, setLabelWidth] = useState(60);
  const [labelHeight, setLabelHeight] = useState(40);
  const [barcodeAreaPercent, setBarcodeAreaPercent] = useState(45);
  const [mainTextSize, setMainTextSize] = useState(10);
  const [extraTextSize, setExtraTextSize] = useState(8);
  const [labelBorder, setLabelBorder] = useState(true);
  const [roundedCorners, setRoundedCorners] = useState(true);

  const [paper, setPaper] = useState('a4');
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(8);
  const [gap, setGap] = useState(3);
  const [pageMargin, setPageMargin] = useState(8);

  const [generated, setGenerated] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState('');
  const settingsInputRef = useRef(null);
  const csvInputRef = useRef(null);

  const paperInfo = PAPER_SIZES[paper];
  const labelsPerPage = Math.max(1, Number(columns) || 1) * Math.max(1, Number(rows) || 1);
  const selectedType = BARCODE_TYPES.find(t => t.value === barcodeType);

  const labelItems = useMemo(() => {
    const base = dataMode === 'label' || dataMode === 'csv'
      ? parseLabelBlocks(inputText)
      : parseSimpleLines(inputText);

    const repeated = [];
    base.forEach(item => {
      for (let i = 0; i < Math.max(1, Number(copies) || 1); i++) {
        repeated.push(item);
      }
    });

    return repeated.slice(0, 500);
  }, [inputText, dataMode, copies]);

  useEffect(() => {
    const timer = setTimeout(() => {
      generateBarcodes({ silent: true });
    }, 250);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcodeType, inputText, dataMode, copies, scale, height, showBarcodeText, textAlign]);

  async function generateBarcodes(options = {}) {
    const silent = Boolean(options.silent);

    if (!labelItems.length) {
      setGenerated([]);
      if (!silent) setNotification('Enter at least one barcode value.');
      return;
    }

    setIsGenerating(true);
    if (!silent) setNotification('');

    try {
      const bwipModule = await import('bwip-js');
      const bwipjs = bwipModule.default || bwipModule;
      const output = [];

      for (const item of labelItems) {
        const dataUrl = renderBarcode(bwipjs, item.value);
        output.push({ ...item, dataUrl, type: barcodeType });
      }

      setGenerated(output);
      if (!silent) setNotification(`${output.length} barcode${output.length === 1 ? '' : 's'} generated.`);
    } catch (error) {
      setGenerated([]);
      if (!silent) {
        setNotification(error.message || 'Unable to generate barcode. Check barcode type and value.');
      }
    } finally {
      setIsGenerating(false);
    }
  }

  function renderBarcode(bwipjs, value) {
    const canvas = document.createElement('canvas');

    bwipjs.toCanvas(canvas, {
      bcid: barcodeType,
      text: value,
      scale: Number(scale) || 3,
      height: Number(height) || 12,
      includetext: showBarcodeText,
      textxalign: textAlign,
      paddingwidth: 8,
      paddingheight: 8,
      backgroundcolor: 'FFFFFF',
      barcolor: '000000'
    });

    return canvas.toDataURL('image/png');
  }

  function applySimpleSample() {
    setDataMode('simple');
    setInputText(simpleSample);
    setNotification('Simple sample loaded.');
  }

  function applyLabelSample() {
    setDataMode('label');
    setInputText(labelSample);
    setNotification('Multi-line label sample loaded.');
  }

  function getCurrentSettings() {
    return {
      version: 2,
      barcodeType,
      dataMode,
      copies,
      scale,
      height,
      showBarcodeText,
      showLabelText,
      textAlign,
      labelWidth,
      labelHeight,
      barcodeAreaPercent,
      mainTextSize,
      extraTextSize,
      labelBorder,
      roundedCorners,
      paper,
      columns,
      rows,
      gap,
      pageMargin
    };
  }

  function downloadSettings() {
    const blob = new Blob([JSON.stringify(getCurrentSettings(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'barcode-generator-settings.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotification('Settings downloaded.');
  }

  async function uploadSettings(file) {
    if (!file) return;

    try {
      const settings = JSON.parse(await file.text());

      if (settings.barcodeType) setBarcodeType(settings.barcodeType);
      if (settings.dataMode) setDataMode(settings.dataMode);
      if (settings.copies) setCopies(settings.copies);
      if (settings.scale) setScale(settings.scale);
      if (settings.height) setHeight(settings.height);
      if (typeof settings.showBarcodeText === 'boolean') setShowBarcodeText(settings.showBarcodeText);
      if (typeof settings.showLabelText === 'boolean') setShowLabelText(settings.showLabelText);
      if (settings.textAlign) setTextAlign(settings.textAlign);
      if (settings.labelWidth) setLabelWidth(settings.labelWidth);
      if (settings.labelHeight) setLabelHeight(settings.labelHeight);
      if (settings.barcodeAreaPercent) setBarcodeAreaPercent(settings.barcodeAreaPercent);
      if (settings.mainTextSize) setMainTextSize(settings.mainTextSize);
      if (settings.extraTextSize) setExtraTextSize(settings.extraTextSize);
      if (typeof settings.labelBorder === 'boolean') setLabelBorder(settings.labelBorder);
      if (typeof settings.roundedCorners === 'boolean') setRoundedCorners(settings.roundedCorners);
      if (settings.paper) setPaper(settings.paper);
      if (settings.columns) setColumns(settings.columns);
      if (settings.rows) setRows(settings.rows);
      if (settings.gap !== undefined) setGap(settings.gap);
      if (settings.pageMargin !== undefined) setPageMargin(settings.pageMargin);

      setNotification('Settings uploaded.');
    } catch {
      setNotification('Invalid settings file. Upload a valid barcode-generator-settings.json file.');
    }
  }

  function downloadCsvSample() {
    const csvRows = [
      ['Barcode Value', 'Row1 Text', 'Row1 Value', 'Row2 Text', 'Row2 Value', 'Row3 Text', 'Row3 Value', 'Row4 Text', 'Row4 Value'],
      ['4108701256100', 'Item', '108701/PC/PREMIUM TRAY', 'Price', '305', 'Batch', '256100-:14052026', '', ''],
      ['4108701256117', 'Item', '108739/PC/PREMIUM TRAY', 'Price', '425', 'Batch', '256117-:14052026', '', '']
    ];

    const csv = csvRows.map(row => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'barcode-label-sample.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotification('Sample CSV downloaded.');
  }

  async function uploadCsv(file) {
    if (!file) return;

    try {
      let text = await file.text();
      text = normalizeUploadedCsvText(text);

      const rows = parseCsv(text);

      if (rows.length < 2) {
        setNotification('CSV file does not contain data rows.');
        return;
      }

      const header = rows[0].map(h => normalizeHeader(h));
      const indexOf = (name) => header.indexOf(normalizeHeader(name));

      const barcodeIndex = indexOf('Barcode Value');
      if (barcodeIndex === -1) {
        setNotification('CSV must contain Barcode Value header.');
        return;
      }

      const blocks = rows.slice(1)
        .map(row => {
          const barcodeValue = cleanCsvCell(row[barcodeIndex]);
          if (!barcodeValue) return '';

          const lines = [barcodeValue];

          for (let i = 1; i <= 4; i++) {
            const textIndex = indexOf(`Row${i} Text`);
            const valueIndex = indexOf(`Row${i} Value`);
            const rowText = textIndex >= 0 ? cleanCsvCell(row[textIndex]) : '';
            const rowValue = valueIndex >= 0 ? cleanCsvCell(row[valueIndex]) : '';

            if (rowText && rowValue) lines.push(`${rowText}: ${rowValue}`);
            else if (rowValue) lines.push(rowValue);
            else if (rowText) lines.push(rowText);
          }

          return lines.join('\n');
        })
        .filter(Boolean);

      if (!blocks.length) {
        setNotification('CSV uploaded, but no barcode rows were found.');
        return;
      }

      setDataMode('csv');
      setInputText(blocks.join('\n\n'));
      setNotification(`${blocks.length} barcode label rows loaded from CSV.`);
    } catch {
      setNotification('Unable to read CSV. Please check the file format.');
    }
  }

  async function downloadFirst() {
    if (!generated[0]) {
      setNotification('Generate a barcode first.');
      return;
    }

    const dataUrl = await renderFullLabelPng(generated[0]);
    downloadDataUrl(dataUrl, `${safeFileName(generated[0].value)}-${barcodeType}-label.png`);
  }

  async function downloadAll() {
    if (!generated.length) {
      setNotification('Generate barcodes first.');
      return;
    }

    for (let index = 0; index < Math.min(generated.length, 100); index++) {
      const item = generated[index];
      const dataUrl = await renderFullLabelPng(item);
      setTimeout(() => {
        downloadDataUrl(dataUrl, `${String(index + 1).padStart(3, '0')}-${safeFileName(item.value)}-${barcodeType}-label.png`);
      }, index * 150);
    }

    setNotification('Downloading label PNG files. Browser may ask permission for multiple downloads.');
  }

  async function renderFullLabelPng(item) {
    const width = Math.max(240, Number(labelWidth) * 8);
    const heightPx = Math.max(160, Number(labelHeight) * 8);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = heightPx;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, heightPx);

    if (labelBorder) {
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, width - 8, heightPx - 8);
    }

    const displayLines = getDisplayLabelLines(item);
    const hasLabelText = showLabelText && displayLines.length > 0;
    const barcodeHeightPx = hasLabelText ? Math.floor(heightPx * (Number(barcodeAreaPercent) / 100)) : heightPx - 20;

    const img = await loadImage(item.dataUrl);
    const barcodeMaxWidth = width - 28;
    const barcodeMaxHeight = barcodeHeightPx - 18;
    const ratio = Math.min(barcodeMaxWidth / img.width, barcodeMaxHeight / img.height);
    const imgW = img.width * ratio;
    const imgH = img.height * ratio;

    ctx.drawImage(img, (width - imgW) / 2, 10 + Math.max(0, (barcodeMaxHeight - imgH) / 2), imgW, imgH);

    if (hasLabelText) {
      const textTop = barcodeHeightPx + 4;
      const textAreaHeight = heightPx - textTop - 10;
      const lineHeights = displayLines.map((_, index) => index === 0 ? Number(mainTextSize) * 2.9 : Number(extraTextSize) * 2.7);
      const totalTextHeight = lineHeights.reduce((a, b) => a + b, 0);
      let y = textTop + Math.max(0, (textAreaHeight - totalTextHeight) / 2);

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      displayLines.forEach((line, index) => {
        const fontSize = index === 0 ? Number(mainTextSize) : Number(extraTextSize);
        ctx.font = `${index === 0 ? '700' : '500'} ${fontSize * 2}px Arial`;
        ctx.fillText(line, width / 2, y, width - 24);
        y += lineHeights[index];
      });
    }

    return canvas.toDataURL('image/png');
  }

  function printLabels() {
    if (!generated.length) {
      setNotification('Generate barcodes first.');
      return;
    }

    window.print();
  }

  return (
    <ToolboxLayout
      title="Barcode Generator - Create, Download and Print Barcodes Online"
      description="Generate barcodes online for Code 128, Code 39, EAN, UPC, ITF-14, QR Code, Data Matrix, PDF417 and Aztec. Create single or bulk barcodes, design labels, download PNG files and print barcode label sheets."
    >
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          #barcode-print-area,
          #barcode-print-area * {
            visibility: visible !important;
          }

          #barcode-print-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            background: #fff !important;
            color: #000 !important;
          }

          .barcode-print-page {
            page-break-after: always;
            box-sizing: border-box;
            background: #fff !important;
          }

          .barcode-print-page:last-child {
            page-break-after: auto;
          }

          .barcode-print-label {
            break-inside: avoid;
            overflow: hidden;
          }

          @page {
            margin: 0;
          }
        }
      `}</style>

      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based barcode label tool</p>
          <h1 style={heroTitle}>Barcode Generator</h1>
          <p style={heroText}>
            Create single or bulk barcodes, design barcode labels, upload CSV data, download full label PNG files and
            print barcode labels directly on A4, Letter, A5, 80mm thermal roll or 58mm thermal roll layouts.
          </p>
        </section>

        <section style={builderGrid}>
          <div style={controlsPanel}>
            <Step title="Step 1: Choose barcode type">
              <Field label="Barcode type" tip="Choose the barcode format required by your scanner, label system, retail system or workflow.">
                <select value={barcodeType} onChange={(e) => setBarcodeType(e.target.value)} style={inputStyle}>
                  {BARCODE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </Field>
              <div style={infoBox}>{selectedType?.note}</div>
            </Step>

            <Step title="Step 2: Enter barcode data">
              <div style={tabs}>
                <button onClick={() => setDataMode('simple')} style={dataMode === 'simple' ? activeTab : tab}>Simple list</button>
                <button onClick={() => setDataMode('label')} style={dataMode === 'label' ? activeTab : tab}>Multi-line labels</button>
                <button onClick={() => setDataMode('csv')} style={dataMode === 'csv' ? activeTab : tab}>CSV upload</button>
              </div>

              <div style={buttonRow}>
                <button onClick={applySimpleSample} style={sampleBtn}>Simple sample</button>
                <button onClick={applyLabelSample} style={sampleBtn}>Multi-line sample</button>
                <button onClick={downloadCsvSample} style={sampleBtn}>Download CSV sample</button>
                <button onClick={() => csvInputRef.current?.click()} style={sampleBtn}>Upload CSV</button>
                <input ref={csvInputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={(e) => uploadCsv(e.target.files?.[0])} />
              </div>

              <div style={infoBox}>
                {dataMode === 'simple' && <>Simple list: enter one barcode value per line. The barcode value is shown inside the barcode image only.</>}
                {dataMode === 'label' && (
                  <>
                    Multi-line label format:<br />
                    first line = barcode value to encode.<br />
                    other lines = label text to print.<br />
                    blank line = next barcode label.
                  </>
                )}
                {dataMode === 'csv' && (
                  <>
                    CSV upload mode: download the sample CSV, edit your rows, then upload it. Each CSV row becomes one
                    barcode label automatically.
                  </>
                )}
              </div>

              <Field
                label={dataMode === 'simple' ? 'Barcode values, one per line' : dataMode === 'csv' ? 'CSV converted label blocks' : 'Barcode label blocks'}
                tip={dataMode === 'simple' ? 'Each line becomes one barcode. The same value is not repeated again under the barcode.' : dataMode === 'csv' ? 'CSV rows are converted here. First line is barcode value; other lines are label details.' : 'Each block becomes one label. First line creates the barcode; remaining lines print under it.'}
              >
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={dataMode === 'simple' ? 'SHB-1001\nSHB-1002\nSHB-1003' : '4108701256100\nItem: Premium Tray\nPrice: 306\nBatch: 14062026\n\nSHB-1002\nItem: Girls Dress Pink\nPrice: AED 35'}
                  style={textarea}
                  spellCheck={false}
                />
              </Field>

              <Field label="Copies per value" tip="Print multiple copies of each barcode value.">
                <input type="number" min="1" max="100" value={copies} onChange={(e) => setCopies(e.target.value)} style={inputStyle} />
              </Field>
            </Step>

            <Step title="Step 3: Barcode design">
              <div style={twoCol}>
                <Field label="Scale" tip="Controls barcode thickness and resolution. Higher values make the barcode image larger and sharper.">
                  <input type="number" min="1" max="8" value={scale} onChange={(e) => setScale(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Barcode height" tip="Controls the height of 1D barcode bars. Larger height can improve scanning.">
                  <input type="number" min="5" max="80" value={height} onChange={(e) => setHeight(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Text alignment" tip="Aligns the human-readable barcode text generated by the barcode image.">
                  <select value={textAlign} onChange={(e) => setTextAlign(e.target.value)} style={inputStyle}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </Field>
                <Field label="Barcode area %" tip="How much of the label height is used for the barcode image. Reduce this when you need more text space.">
                  <input type="number" min="30" max="90" value={barcodeAreaPercent} onChange={(e) => setBarcodeAreaPercent(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Main text size pt" tip="Font size for the first custom label text line.">
                  <input type="number" min="5" max="24" value={mainTextSize} onChange={(e) => setMainTextSize(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Extra text size pt" tip="Font size for extra label lines such as product name, price, size or batch.">
                  <input type="number" min="5" max="20" value={extraTextSize} onChange={(e) => setExtraTextSize(e.target.value)} style={inputStyle} />
                </Field>
              </div>

              <div style={checks}>
                <label title="Shows barcode value inside the barcode image when the barcode type supports it.">
                  <input type="checkbox" checked={showBarcodeText} onChange={(e) => setShowBarcodeText(e.target.checked)} /> Show barcode text
                </label>
                <label title="Shows custom label text below the barcode. Simple list values are not duplicated here.">
                  <input type="checkbox" checked={showLabelText} onChange={(e) => setShowLabelText(e.target.checked)} /> Show custom label text
                </label>
                <label title="Shows a light border around each printed label, useful for testing alignment.">
                  <input type="checkbox" checked={labelBorder} onChange={(e) => setLabelBorder(e.target.checked)} /> Print label border
                </label>
                <label title="Rounds label corners in preview and print. Turn off for strict rectangular labels.">
                  <input type="checkbox" checked={roundedCorners} onChange={(e) => setRoundedCorners(e.target.checked)} /> Rounded corners
                </label>
              </div>
            </Step>

            <Step title="Step 4: Label size">
              <div style={twoCol}>
                <Field label="Label width mm" tip="Actual printed width of one label. Increase for long barcodes or more text.">
                  <input type="number" min="10" max="200" value={labelWidth} onChange={(e) => setLabelWidth(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Label height mm" tip="Actual printed height of one label. Increase when you add more text lines.">
                  <input type="number" min="10" max="200" value={labelHeight} onChange={(e) => setLabelHeight(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Gap mm" tip="Space between labels on the printed sheet. Match your label paper gap.">
                  <input type="number" min="0" max="30" value={gap} onChange={(e) => setGap(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Page margin mm" tip="Blank space around the outside of the page before labels begin.">
                  <input type="number" min="0" max="30" value={pageMargin} onChange={(e) => setPageMargin(e.target.value)} style={inputStyle} />
                </Field>
              </div>
              <div style={infoBox}>
                The barcode and text arrange inside this label size. If the label looks crowded, increase label height,
                reduce text size, or reduce barcode area percentage.
              </div>
            </Step>

            <Step title="Step 5: Print setup">
              <div style={twoCol}>
                <Field label="Paper size" tip="Choose the paper or roll size. Select the same size again in the browser print dialog.">
                  <select value={paper} onChange={(e) => setPaper(e.target.value)} style={inputStyle}>
                    {Object.entries(PAPER_SIZES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label} ({value.width} × {value.height} mm)</option>
                    ))}
                  </select>
                </Field>
                <Field label="Columns per page" tip="Number of labels from left to right on one page.">
                  <input type="number" min="1" max="10" value={columns} onChange={(e) => setColumns(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Rows per page" tip="Number of labels from top to bottom on one page.">
                  <input type="number" min="1" max="20" value={rows} onChange={(e) => setRows(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Labels per page" tip="Automatically calculated from columns × rows.">
                  <input value={labelsPerPage} readOnly style={inputStyle} />
                </Field>
              </div>

              <div style={printNote}>
                Print tip: after clicking Print labels, choose the same paper size in your browser print dialog, disable
                headers and footers, and use 100% scale where possible.
              </div>

              <div style={buttonRow}>
                <button onClick={downloadSettings} style={secondaryBtn}>Download settings</button>
                <button onClick={() => settingsInputRef.current?.click()} style={secondaryBtn}>Upload settings</button>
                <input ref={settingsInputRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={(e) => uploadSettings(e.target.files?.[0])} />
              </div>
            </Step>
          </div>

          <aside style={previewPanel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>Live preview</h2>
              <span style={validBadge}>{generated.length} ready</span>
            </div>

            <div style={singlePreviewWrap}>
              {generated[0] ? (
                <LabelPreview
                  item={generated[0]}
                  labelWidth={labelWidth}
                  labelHeight={labelHeight}
                  barcodeAreaPercent={barcodeAreaPercent}
                  mainTextSize={mainTextSize}
                  extraTextSize={extraTextSize}
                  showLabelText={showLabelText}
                  labelBorder={labelBorder}
                  roundedCorners={roundedCorners}
                />
              ) : (
                <p style={emptyText}>Generate barcodes to preview the label.</p>
              )}
            </div>

            <div style={buttonRow}>
              <button onClick={() => generateBarcodes()} style={primaryBtn}>{isGenerating ? 'Generating...' : 'Generate barcodes'}</button>
              <button onClick={downloadFirst} style={secondaryBtn}>Download first PNG</button>
              <button onClick={downloadAll} style={secondaryBtn}>Download all PNG</button>
              <button onClick={printLabels} style={secondaryBtn}>Print labels</button>
            </div>

            <h3 style={subTitle}>Bulk preview</h3>
            <div style={previewGrid}>
              {generated.slice(0, 12).map((item, index) => (
                <LabelPreview
                  key={`${item.value}-${index}`}
                  item={item}
                  labelWidth={labelWidth}
                  labelHeight={labelHeight}
                  barcodeAreaPercent={barcodeAreaPercent}
                  mainTextSize={mainTextSize}
                  extraTextSize={extraTextSize}
                  showLabelText={showLabelText}
                  labelBorder={labelBorder}
                  roundedCorners={roundedCorners}
                  small
                />
              ))}
            </div>
          </aside>
        </section>

        <div id="barcode-print-area" style={printAreaStyle}>
          {chunk(generated, labelsPerPage).map((pageItems, pageIndex) => (
            <div
              key={pageIndex}
              className="barcode-print-page"
              style={{
                width: `${paperInfo.width}mm`,
                minHeight: `${paperInfo.height}mm`,
                padding: `${pageMargin}mm`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, ${labelWidth}mm)`,
                gridAutoRows: `${labelHeight}mm`,
                gap: `${gap}mm`,
                alignContent: 'start',
                justifyContent: 'start',
                boxSizing: 'border-box'
              }}
            >
              {pageItems.map((item, index) => (
                <PrintLabel
                  key={`${item.value}-${index}`}
                  item={item}
                  labelWidth={labelWidth}
                  labelHeight={labelHeight}
                  barcodeAreaPercent={barcodeAreaPercent}
                  mainTextSize={mainTextSize}
                  extraTextSize={extraTextSize}
                  showLabelText={showLabelText}
                  labelBorder={labelBorder}
                  roundedCorners={roundedCorners}
                />
              ))}
            </div>
          ))}
        </div>

        <section style={contentSection}>
          <h2>Generate, design and print barcodes online</h2>
          <p>
            This barcode generator helps you create barcode labels for products, inventory, warehouse items, price tags,
            carton labels, asset tags, document tracking, retail workflows and internal business use. You can create a
            single barcode, generate many barcodes from a list, upload barcode data from CSV, add product details below
            the barcode, download full label PNG files and print label sheets directly from your browser.
          </p>
          <p>
            The app supports popular barcode formats including Code 128, Code 39, EAN-13, EAN-8, UPC-A, ITF-14, Codabar,
            QR Code, Data Matrix, PDF417 and Aztec Code. You can also control barcode size, barcode text, label width,
            label height, paper size, rows, columns, gaps, margins, font sizes, borders and saved printer settings.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}><h3>Single barcode generator</h3><p>Create one barcode for a product code, SKU, serial number, invoice number, URL, text value or item reference.</p></div>
            <div style={seoCard}><h3>Bulk barcode generator</h3><p>Paste multiple values line by line and generate many barcode labels at once.</p></div>
            <div style={seoCard}><h3>CSV barcode upload</h3><p>Upload barcode data from a CSV file with barcode values, product details, price, batch and custom rows.</p></div>
            <div style={seoCard}><h3>Print barcode labels</h3><p>Design label size and print barcode sheets on A4, Letter, A5, 80mm thermal roll or 58mm thermal roll layouts.</p></div>
          </div>

          <h2>How to use this Barcode Generator</h2>
          <ol style={listStyle}>
            <li><strong>Choose the barcode type:</strong> Select the barcode format required by your scanner, software, product system or retail workflow.</li>
            <li><strong>Enter barcode data:</strong> Use Simple list, Multi-line labels or CSV upload depending on how much label information you need.</li>
            <li><strong>Adjust barcode design:</strong> Change scale, barcode height, barcode text, text alignment and custom label text settings.</li>
            <li><strong>Set label size:</strong> Enter the real label width and height in millimeters so the preview and print layout match your label paper.</li>
            <li><strong>Set print layout:</strong> Choose paper size, rows, columns, label gaps and page margins.</li>
            <li><strong>Check live preview:</strong> Confirm the barcode and label text fit correctly before downloading or printing.</li>
            <li><strong>Download or print:</strong> Download the first label PNG, download all label PNG files or print barcode labels directly.</li>
          </ol>

          <h2>Barcode data modes explained</h2>
          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Simple list mode</h3>
              <p>
                Use this when you only need barcode values. Enter one barcode value per line. The app creates one barcode
                for each line. In this mode, the barcode value is shown inside the barcode image only, so it is not repeated
                again as separate label text.
              </p>
            </div>
            <div style={seoCard}>
              <h3>Multi-line labels mode</h3>
              <p>
                Use this when you want extra printed text under the barcode, such as item name, price, size, batch, expiry
                date or location. The first line of each block becomes the barcode value. The remaining lines are printed
                as label details. Leave one blank line between labels.
              </p>
            </div>
            <div style={seoCard}>
              <h3>CSV upload mode</h3>
              <p>
                Use this when you already have many products in a spreadsheet. Download the sample CSV, fill your barcode
                values and row details, then upload the file. Each CSV row becomes one barcode label automatically.
              </p>
            </div>
            <div style={seoCard}>
              <h3>Copies per value</h3>
              <p>
                This creates multiple copies of each barcode value. For example, if you enter 10 barcode values and set
                copies to 2, the app creates 20 labels.
              </p>
            </div>
          </div>

          <h2>CSV upload format</h2>
          <p>
            The CSV upload option is designed for users who manage barcode data in Excel, Google Sheets or inventory
            exports. The sample CSV contains these headers:
          </p>
          <div style={codeLike}>
            Barcode Value | Row1 Text | Row1 Value | Row2 Text | Row2 Value | Row3 Text | Row3 Value | Row4 Text | Row4 Value
          </div>
          <p>
            <strong>Barcode Value</strong> is the actual value encoded into the barcode. The Row Text and Row Value columns
            are combined into printable label lines. For example, if Row1 Text is “Item” and Row1 Value is “Premium Tray”,
            the label prints “Item: Premium Tray”.
          </p>

          <h2>What each barcode design option means</h2>
          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Scale</h3>
              <p>
                Scale controls the thickness and resolution of the barcode image. A higher scale usually creates a sharper
                and larger barcode image. If the barcode looks too small or thin, increase the scale.
              </p>
            </div>
            <div style={seoCard}>
              <h3>Barcode height</h3>
              <p>
                Barcode height controls the height of vertical bars for 1D barcodes such as Code 128 and Code 39. Taller
                bars are usually easier to scan, especially on printed labels.
              </p>
            </div>
            <div style={seoCard}>
              <h3>Show barcode text</h3>
              <p>
                This shows the barcode value inside the generated barcode image when the barcode type supports it. Turn it
                on when humans need to read the barcode value under the bars.
              </p>
            </div>
            <div style={seoCard}>
              <h3>Show custom label text</h3>
              <p>
                This shows extra label details below the barcode. In Simple list mode, the value is not repeated again.
                In Multi-line or CSV mode, product details, price, batch and other rows are printed below the barcode.
              </p>
            </div>
            <div style={seoCard}>
              <h3>Text alignment</h3>
              <p>
                This aligns the human-readable text generated by the barcode image. Center alignment is best for most labels.
              </p>
            </div>
            <div style={seoCard}>
              <h3>Barcode area %</h3>
              <p>
                This controls how much of the label height is reserved for the barcode image. Increase it for a larger
                barcode. Reduce it when you need more space for product name, price or batch text.
              </p>
            </div>
            <div style={seoCard}>
              <h3>Main text size</h3>
              <p>
                This controls the first custom label text line below the barcode. Use it for the most important detail,
                such as product name or item reference.
              </p>
            </div>
            <div style={seoCard}>
              <h3>Extra text size</h3>
              <p>
                This controls additional label text lines such as price, size, batch number, expiry date or location.
              </p>
            </div>
          </div>

          <h2>Label size and print setup explained</h2>
          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Label width mm</h3>
              <p>
                This is the real printed width of one label in millimeters. Increase the width if the barcode value is long
                or if the barcode looks compressed.
              </p>
            </div>
            <div style={seoCard}>
              <h3>Label height mm</h3>
              <p>
                This is the real printed height of one label in millimeters. Increase the height when you use multiple
                label text lines or when the label looks crowded.
              </p>
            </div>
            <div style={seoCard}>
              <h3>Gap mm</h3>
              <p>
                This is the space between labels on the printed sheet. Match this with your sticker sheet or label roll gap.
              </p>
            </div>
            <div style={seoCard}>
              <h3>Page margin mm</h3>
              <p>
                This is the blank space around the outside of the printed page before labels start. Adjust it to align the
                print with your label sheet.
              </p>
            </div>
            <div style={seoCard}>
              <h3>Paper size</h3>
              <p>
                Choose the paper or roll size you are printing on. Select the same paper size again in the browser print
                dialog for accurate output.
              </p>
            </div>
            <div style={seoCard}>
              <h3>Columns and rows</h3>
              <p>
                Columns control how many labels print from left to right. Rows control how many labels print from top to
                bottom. Together they calculate the total labels per page.
              </p>
            </div>
          </div>

          <h2>Which barcode type should I choose?</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Code 128</h3><p>Best for most internal labels, SKU labels, inventory labels, product IDs, serial numbers and mixed letters/numbers.</p></div>
            <div style={seoCard}><h3>Code 39</h3><p>Good for simple warehouse, asset and alphanumeric labels, but usually less compact than Code 128.</p></div>
            <div style={seoCard}><h3>EAN-13 / EAN-8</h3><p>Used for retail product barcodes. These require valid retail barcode numbers with correct digit length.</p></div>
            <div style={seoCard}><h3>UPC-A</h3><p>Common retail barcode format in North America. Requires valid 12-digit UPC data.</p></div>
            <div style={seoCard}><h3>ITF-14</h3><p>Used for cartons, packaging and logistics labels. Requires valid 14-digit data.</p></div>
            <div style={seoCard}><h3>QR Code</h3><p>Useful for URLs, text, contact details, instructions and mobile scanning.</p></div>
            <div style={seoCard}><h3>Data Matrix</h3><p>Useful for small labels, manufacturing, healthcare, parts tracking and compact data.</p></div>
            <div style={seoCard}><h3>PDF417 / Aztec</h3><p>Useful for tickets, IDs, documents, transport labels and high-density 2D barcode needs.</p></div>
          </div>

          <h2>Save and restore your printer settings</h2>
          <p>
            Once you adjust your barcode settings for your printer, label paper or thermal roll, use <strong>Download settings</strong>
            to save your configuration as a JSON file. Later, on the same computer or another computer, use <strong>Upload settings</strong>
            to restore the same barcode type, label size, paper size, rows, columns, gaps, margins, text sizes and design options.
            This is useful when browser cache is cleared, when changing devices, or when multiple staff use the same label format.
          </p>

          <h2>Barcode printing tips</h2>
          <ul style={listStyle}>
            <li>Use Code 128 for normal inventory, SKU, serial number and internal product labels.</li>
            <li>Use valid numbers for EAN and UPC retail barcodes.</li>
            <li>Increase label width if a long barcode looks compressed.</li>
            <li>Increase label height if product name, price or batch lines look crowded.</li>
            <li>Reduce barcode area percentage when you need more room for label text.</li>
            <li>Use 100% scale in the browser print dialog for accurate label dimensions.</li>
            <li>Disable browser headers and footers before printing label sheets.</li>
            <li>Print one test page first and scan the barcode before printing many labels.</li>
          </ul>

          <h2>Common barcode problems and fixes</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Barcode input is too long</h3><p>Use a wider label, reduce the value length, or choose a barcode type that supports larger data such as QR Code.</p></div>
            <div style={seoCard}><h3>EAN or UPC shows error</h3><p>Retail barcode formats require exact digit lengths and valid data. Use Code 128 for normal internal labels.</p></div>
            <div style={seoCard}><h3>Text looks crowded</h3><p>Increase label height, reduce extra text size, or reduce barcode area percentage.</p></div>
            <div style={seoCard}><h3>Print does not align</h3><p>Adjust page margin, label width, label height, gap, columns and rows. Also set browser print scale to 100%.</p></div>
          </div>

          <h2>FAQ</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Is this barcode generator free?</h3><p>Yes. You can generate, download and print barcodes for free.</p></div>
            <div style={seoCard}><h3>Can I create multiple barcodes?</h3><p>Yes. Use Simple list mode, Multi-line labels mode or CSV upload mode.</p></div>
            <div style={seoCard}><h3>Can I upload barcode data from Excel?</h3><p>Yes. Save your Excel sheet as CSV using the sample headers, then upload it.</p></div>
            <div style={seoCard}><h3>Can I download barcode labels as PNG?</h3><p>Yes. The download option saves the full label, including barcode and printed label details.</p></div>
            <div style={seoCard}><h3>Can I print directly from the app?</h3><p>Yes. Set label size and print layout, then click Print labels.</p></div>
            <div style={seoCard}><h3>Can I save my printer settings?</h3><p>Yes. Download settings as JSON and upload the same file later to restore your layout.</p></div>
          </div>
        </section>

        <RelatedTools currentPath="/barcodegenerator" />
      </div>
    </ToolboxLayout>
  );
}

function Step({ title, children }) {
  return (
    <section style={stepBlock}>
      <h2 style={stepTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, tip, children }) {
  return (
    <label style={fieldWrap} title={tip}>
      <span style={fieldLabel}>{label}</span>
      {children}
      <span style={tipText}>{tip}</span>
    </label>
  );
}

function LabelPreview({ item, labelWidth, labelHeight, barcodeAreaPercent, mainTextSize, extraTextSize, showLabelText, labelBorder, roundedCorners, small }) {
  const displayLines = getDisplayLabelLines(item);
  const hasLabelText = showLabelText && displayLines.length > 0;
  const widthPx = small ? 170 : Math.min(360, Math.max(230, Number(labelWidth) * 4));
  const heightPx = small ? Math.max(110, Number(labelHeight) * 3) : Math.min(280, Math.max(150, Number(labelHeight) * 4));

  return (
    <div
      style={{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        background: '#fff',
        color: '#000',
        border: labelBorder ? '1px solid #cbd5e1' : '1px solid transparent',
        borderRadius: roundedCorners ? '14px' : 0,
        padding: small ? '8px' : '12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <div style={{ height: hasLabelText ? `${barcodeAreaPercent}%` : '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src={item.dataUrl} alt={item.value} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>

      {hasLabelText && (
        <div style={{ height: `${100 - Number(barcodeAreaPercent)}%`, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', overflow: 'hidden', lineHeight: 1.12 }}>
          {displayLines.map((line, index) => (
            <div
              key={index}
              style={{
                fontWeight: index === 0 ? 800 : 500,
                fontSize: small ? (index === 0 ? '0.72rem' : '0.62rem') : (index === 0 ? `${mainTextSize}pt` : `${extraTextSize}pt`),
                wordBreak: 'break-word'
              }}
            >
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PrintLabel({ item, labelWidth, labelHeight, barcodeAreaPercent, mainTextSize, extraTextSize, showLabelText, labelBorder, roundedCorners }) {
  const displayLines = getDisplayLabelLines(item);
  const hasLabelText = showLabelText && displayLines.length > 0;

  return (
    <div
      className="barcode-print-label"
      style={{
        width: `${labelWidth}mm`,
        height: `${labelHeight}mm`,
        border: labelBorder ? '0.2mm solid #d1d5db' : '0.2mm solid transparent',
        borderRadius: roundedCorners ? '2mm' : 0,
        padding: '2mm',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        background: '#fff',
        overflow: 'hidden'
      }}
    >
      <div style={{ height: hasLabelText ? `${barcodeAreaPercent}%` : '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src={item.dataUrl} alt={item.value} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>

      {hasLabelText && (
        <div style={{ height: `${100 - Number(barcodeAreaPercent)}%`, color: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', overflow: 'hidden', lineHeight: 1.12 }}>
          {displayLines.map((line, index) => (
            <div
              key={index}
              style={{
                fontWeight: index === 0 ? 800 : 500,
                fontSize: index === 0 ? `${mainTextSize}pt` : `${extraTextSize}pt`,
                wordBreak: 'break-word'
              }}
            >
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getDisplayLabelLines(item) {
  const lines = item.labelLines?.length ? item.labelLines : [];

  if (!lines.length) return [];

  if (String(lines[0]).trim() === String(item.value).trim()) {
    return lines.slice(1);
  }

  return lines;
}

function normalizeUploadedCsvText(text) {
  const value = String(text || '');

  if (!value.includes('\n') && value.includes('\\n')) {
    return value.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');
  }

  return value;
}

function normalizeHeader(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function cleanCsvCell(value) {
  return String(value ?? '').trim();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  const source = String(text || '');

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const next = source[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);

  return rows.filter(r => r.some(c => String(c || '').trim() !== ''));
}

function parseSimpleLines(source) {
  return String(source || '')
    .split(/\r?\n/)
    .map(v => v.trim())
    .filter(Boolean)
    .map(value => ({ value, labelLines: [] }));
}

function parseLabelBlocks(source) {
  return String(source || '')
    .split(/\n\s*\n/g)
    .map(block => block.split(/\r?\n/).map(line => line.trim()).filter(Boolean))
    .filter(lines => lines.length)
    .map(lines => ({ value: lines[0], labelLines: lines }));
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

function safeFileName(value) {
  return String(value || 'barcode').replace(/[\\/:*?"<>|]+/g, '-').slice(0, 80) || 'barcode';
}

function chunk(items, size) {
  const pages = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

const pageWrap = { maxWidth: '1320px', margin: '0 auto', padding: '40px 20px 90px' };
const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900, fontSize: '0.78rem' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)', margin: '10px 0 16px' };
const heroText = { color: '#cbd5e1', maxWidth: '900px', margin: '0 auto', lineHeight: 1.7, fontSize: '1.08rem' };
const builderGrid = { display: 'grid', gridTemplateColumns: 'minmax(360px, 520px) minmax(360px, 1fr)', gap: '24px', alignItems: 'start' };
const controlsPanel = { display: 'grid', gap: '18px' };
const previewPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '28px', position: 'sticky', top: '90px' };
const stepBlock = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '22px' };
const stepTitle = { color: '#fff', margin: '0 0 16px', fontSize: '1.1rem' };
const panelHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' };
const panelTitle = { color: '#fff', margin: 0, fontSize: '1.15rem' };
const subTitle = { color: '#fff', margin: '26px 0 14px', fontSize: '1rem' };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '12px' };
const fieldLabel = { color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 900 };
const tipText = { color: '#64748b', fontSize: '0.72rem', lineHeight: 1.4 };
const inputStyle = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', padding: '12px', boxSizing: 'border-box', width: '100%' };
const textarea = { width: '100%', minHeight: '230px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '16px', padding: '14px', resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace', boxSizing: 'border-box' };
const tabs = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', margin: '12px 0' };
const tab = { padding: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: '#94a3b8', fontWeight: 900, cursor: 'pointer' };
const activeTab = { ...tab, background: '#38bdf8', color: '#0f172a' };
const twoCol = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' };
const buttonRow = { display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' };
const primaryBtn = { background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '14px', padding: '12px 16px', fontWeight: 900, cursor: 'pointer' };
const secondaryBtn = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '14px', padding: '12px 16px', fontWeight: 900, cursor: 'pointer' };
const sampleBtn = { background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '999px', padding: '8px 12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.78rem' };
const checks = { display: 'grid', gap: '10px', marginTop: '16px', color: '#cbd5e1', fontSize: '0.94rem' };
const infoBox = { color: '#cbd5e1', background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '12px', lineHeight: 1.6, marginTop: '12px' };
const printNote = { color: '#fef3c7', background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', borderRadius: '14px', padding: '12px', lineHeight: 1.6, marginTop: '14px' };
const codeLike = { background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '14px', color: '#e2e8f0', fontFamily: 'monospace', overflowWrap: 'anywhere', margin: '14px 0' };
const validBadge = { color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const singlePreviewWrap = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', minHeight: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' };
const previewGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' };
const emptyText = { color: '#94a3b8' };
const printAreaStyle = { position: 'fixed', left: '-9999px', top: 0, background: '#fff', color: '#000' };
const contentSection = { marginTop: '70px', color: '#cbd5e1', lineHeight: 1.8 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '24px' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const listStyle = { color: '#cbd5e1', lineHeight: 1.8, paddingLeft: '22px' };
const toast = { position: 'fixed', top: '86px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, zIndex: 1000 };

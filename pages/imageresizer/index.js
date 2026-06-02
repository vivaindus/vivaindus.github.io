import React, { useEffect, useMemo, useRef, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

const PRESETS = [
  { name: 'Instagram Square Post', w: 1080, h: 1080, cat: 'Instagram' },
  { name: 'Instagram Portrait Post', w: 1080, h: 1350, cat: 'Instagram' },
  { name: 'Instagram Story / Reel', w: 1080, h: 1920, cat: 'Instagram' },
  { name: 'TikTok / Shorts Vertical', w: 1080, h: 1920, cat: 'Video' },
  { name: 'YouTube Thumbnail', w: 1280, h: 720, cat: 'YouTube' },
  { name: 'YouTube Channel Banner', w: 2560, h: 1440, cat: 'YouTube' },
  { name: 'Facebook Square Post', w: 1080, h: 1080, cat: 'Facebook' },
  { name: 'Facebook Story', w: 1080, h: 1920, cat: 'Facebook' },
  { name: 'LinkedIn Profile Banner', w: 1584, h: 396, cat: 'LinkedIn' },
  { name: 'LinkedIn Post Landscape', w: 1200, h: 627, cat: 'LinkedIn' },
  { name: 'Website Hero Banner', w: 1920, h: 800, cat: 'Website' },
  { name: 'Blog Featured Image', w: 1200, h: 630, cat: 'Website' },
  { name: 'Product Image Square', w: 1000, h: 1000, cat: 'Ecommerce' },
  { name: 'Passport Photo 35x45mm', w: 413, h: 531, cat: 'Document' }
];

const outputFormats = {
  jpeg: { label: 'JPG / JPEG', mime: 'image/jpeg', extension: 'jpg', supportsQuality: true },
  png: { label: 'PNG', mime: 'image/png', extension: 'png', supportsQuality: false },
  webp: { label: 'WebP', mime: 'image/webp', extension: 'webp', supportsQuality: true }
};

const fitModes = {
  contain: {
    label: 'Fit inside canvas',
    description: 'Keeps the full image visible and adds background if the target ratio is different.'
  },
  cover: {
    label: 'Auto crop to fill',
    description: 'Automatically fills the target size and crops extra edges from the center.'
  },
  manualCrop: {
    label: 'Manual crop grid',
    description: 'Move the crop grid over the image. Only the selected area will be exported.'
  },
  stretch: {
    label: 'Stretch exactly',
    description: 'Forces the image into the exact target size. This may distort the image.'
  }
};

export default function ImageResizer() {
  const [mounted, setMounted] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [originalInfo, setOriginalInfo] = useState(null);

  const [dimensions, setDimensions] = useState({ width: 1080, height: 1080 });
  const [lockRatio, setLockRatio] = useState(true);
  const [fitMode, setFitMode] = useState('contain');
  const [cropPosition, setCropPosition] = useState('center');
  const [manualCrop, setManualCrop] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const [cropZoom, setCropZoom] = useState(80);

  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [outputFormat, setOutputFormat] = useState('jpeg');
  const [quality, setQuality] = useState(0.92);

  const [resizedUrl, setResizedUrl] = useState('');
  const [resizedBlob, setResizedBlob] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState('');

  const dragRef = useRef(null);
  const cropFrameRef = useRef(null);

  const selectedFormat = outputFormats[outputFormat];

  const ratioText = useMemo(() => {
    if (!dimensions.width || !dimensions.height) return '0:0';
    return simplifyRatio(Number(dimensions.width), Number(dimensions.height));
  }, [dimensions]);

  const fileSavings = useMemo(() => {
    if (!originalFile || !resizedBlob) return null;
    const difference = originalFile.size - resizedBlob.size;
    const percent = originalFile.size > 0 ? (difference / originalFile.size) * 100 : 0;
    return { difference, percent };
  }, [originalFile, resizedBlob]);

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
    const stopDrag = () => {
      dragRef.current = null;
    };

    const moveDrag = (event) => {
      if (!dragRef.current || !cropFrameRef.current) return;

      if (event.cancelable) {
        event.preventDefault();
      }

      const dragState = dragRef.current;
      const point = getPointerPoint(event);
      const frame = cropFrameRef.current.getBoundingClientRect();

      if (!frame.width || !frame.height) return;

      const deltaX = ((point.clientX - dragState.startX) / frame.width) * 100;
      const deltaY = ((point.clientY - dragState.startY) / frame.height) * 100;

      setManualCrop(prev => {
        const nextX = clamp(dragState.cropStart.x + deltaX, 0, 100 - prev.w);
        const nextY = clamp(dragState.cropStart.y + deltaY, 0, 100 - prev.h);
        return { ...prev, x: nextX, y: nextY };
      });
    };

    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', moveDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);

    return () => {
      window.removeEventListener('mousemove', moveDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', moveDrag);
      window.removeEventListener('touchend', stopDrag);
    };
  }, []);

  useEffect(() => {
    updateManualCropForTarget(cropZoom);
  }, [dimensions.width, dimensions.height, cropZoom, originalInfo]);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    };
  }, [originalUrl, resizedUrl]);

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

  const clearOutputOnly = () => {
    setResizedUrl('');
    setResizedBlob(null);
  };

  const resetAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);

    setOriginalFile(null);
    setOriginalUrl('');
    setOriginalInfo(null);
    setResizedUrl('');
    setResizedBlob(null);
    setManualCrop({ x: 10, y: 10, w: 80, h: 80 });
    setCropZoom(80);
    showToast('Workspace reset');
  };

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Please upload a valid image file.');
      return;
    }

    if (file.size > 40 * 1024 * 1024) {
      showToast('⚠️ Please upload an image below 40 MB for browser performance.');
      return;
    }

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);

    const url = URL.createObjectURL(file);

    try {
      const info = await readImageInfo(url);

      setOriginalFile(file);
      setOriginalUrl(url);
      setOriginalInfo(info);
      setDimensions({ width: info.width, height: info.height });
      setResizedUrl('');
      setResizedBlob(null);
      setCropZoom(80);
      showToast('Image loaded. Choose a preset or custom size 🖼️');
    } catch {
      URL.revokeObjectURL(url);
      showToast('⚠️ Could not read this image. Try another file.');
    }
  };

  const handleUpload = (event) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleDimensionChange = (name, value) => {
    const numericValue = Math.max(1, Number(value) || 1);

    if (!originalInfo || !lockRatio) {
      setDimensions(prev => ({ ...prev, [name]: numericValue }));
      clearOutputOnly();
      return;
    }

    const originalRatio = originalInfo.width / originalInfo.height;

    if (name === 'width') {
      setDimensions({
        width: numericValue,
        height: Math.max(1, Math.round(numericValue / originalRatio))
      });
    } else {
      setDimensions({
        height: numericValue,
        width: Math.max(1, Math.round(numericValue * originalRatio))
      });
    }

    clearOutputOnly();
  };

  const applyPreset = (preset) => {
    setDimensions({ width: preset.w, height: preset.h });
    setLockRatio(false);
    setFitMode('manualCrop');
    setCropZoom(80);
    clearOutputOnly();
    showToast(`${preset.name} preset applied`);
  };

  const updateManualCropForTarget = (zoomValue) => {
    if (!originalInfo || !dimensions.width || !dimensions.height) return;

    const targetRatio = Number(dimensions.width) / Number(dimensions.height);
    const imageRatio = originalInfo.width / originalInfo.height;

    let cropW;
    let cropH;

    if (targetRatio >= imageRatio) {
      cropW = Number(zoomValue);
      cropH = cropW / targetRatio * imageRatio;
    } else {
      cropH = Number(zoomValue);
      cropW = cropH * targetRatio / imageRatio;
    }

    cropW = clamp(cropW, 5, 100);
    cropH = clamp(cropH, 5, 100);

    setManualCrop(prev => ({
      w: cropW,
      h: cropH,
      x: clamp(prev.x, 0, 100 - cropW),
      y: clamp(prev.y, 0, 100 - cropH)
    }));
  };

  const startCropDrag = (event) => {
    event.preventDefault();
    const point = getPointerPoint(event);

    dragRef.current = {
      startX: point.clientX,
      startY: point.clientY,
      cropStart: { ...manualCrop }
    };
  };

  const resetCrop = () => {
    updateManualCropForTarget(cropZoom);
    setManualCrop(prev => ({
      ...prev,
      x: (100 - prev.w) / 2,
      y: (100 - prev.h) / 2
    }));
    clearOutputOnly();
    showToast('Crop grid reset');
  };

  const processImage = async () => {
    if (!originalUrl || !originalFile) {
      showToast('⚠️ Please upload an image first.');
      return;
    }

    if (dimensions.width < 1 || dimensions.height < 1) {
      showToast('⚠️ Width and height must be greater than 0.');
      return;
    }

    if (dimensions.width > 8000 || dimensions.height > 8000) {
      showToast('⚠️ Please keep width and height below 8000 px for browser performance.');
      return;
    }

    setProcessing(true);

    try {
      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = originalUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = Number(dimensions.width);
      canvas.height = Number(dimensions.height);

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.fillStyle = outputFormat === 'png' ? 'rgba(0,0,0,0)' : backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const draw = getDrawDimensions({
        sourceWidth: img.naturalWidth,
        sourceHeight: img.naturalHeight,
        targetWidth: canvas.width,
        targetHeight: canvas.height,
        fitMode,
        cropPosition,
        manualCrop
      });

      ctx.drawImage(
        img,
        draw.sourceX,
        draw.sourceY,
        draw.sourceWidth,
        draw.sourceHeight,
        draw.targetX,
        draw.targetY,
        draw.targetWidth,
        draw.targetHeight
      );

      const blob = await new Promise(resolve => {
        canvas.toBlob(
          resolve,
          selectedFormat.mime,
          selectedFormat.supportsQuality ? quality : undefined
        );
      });

      if (!blob) {
        showToast('⚠️ Could not generate image. Try another format.');
        return;
      }

      if (resizedUrl) URL.revokeObjectURL(resizedUrl);

      const url = URL.createObjectURL(blob);
      setResizedBlob(blob);
      setResizedUrl(url);
      showToast('Image resized successfully ✅');
    } catch {
      showToast('⚠️ Resize failed. Try another image or smaller dimensions.');
    } finally {
      setProcessing(false);
    }
  };

  const getDownloadName = () => {
    const baseName = originalFile?.name?.replace(/\.[^/.]+$/, '') || 'image';
    return `resized-${baseName}-${dimensions.width}x${dimensions.height}.${selectedFormat.extension}`;
  };

  const copyReport = async () => {
    if (!originalFile || !resizedBlob) {
      showToast('⚠️ Resize the image first.');
      return;
    }

    const report = [
      'SHB ToolBox Image Resize Report',
      `Original file: ${originalFile.name}`,
      `Original dimensions: ${originalInfo?.width} × ${originalInfo?.height}px`,
      `Original size: ${formatBytes(originalFile.size)}`,
      `New dimensions: ${dimensions.width} × ${dimensions.height}px`,
      `Aspect ratio: ${ratioText}`,
      `Fit mode: ${fitModes[fitMode].label}`,
      `Output format: ${selectedFormat.label}`,
      `Output size: ${formatBytes(resizedBlob.size)}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(report);
      showToast('Resize report copied 📋');
    } catch {
      showToast('⚠️ Copy failed. Please copy manually.');
    }
  };

  if (!mounted) {
    return (
      <ToolboxLayout title="Image Resizer" description="Resize images online.">
        <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
          Loading image resizer...
        </div>
      </ToolboxLayout>
    );
  }

  return (
    <ToolboxLayout
      title="Image Resizer - Resize, Crop and Convert Images Online"
      description="Use the free SHB ToolBox image resizer to resize JPG, PNG and WebP images, use social media presets, crop with a movable grid, lock aspect ratio, fit image, convert format, and download resized images."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based image resizing tool</p>
          <h1 style={heroTitle}>Image Resizer with Manual Crop Grid</h1>
          <p style={heroText}>
            Resize images for Instagram, YouTube thumbnails, LinkedIn banners, websites, ecommerce product photos,
            documents, and custom pixel dimensions. Choose a preset, fit the full image, crop automatically, or use the
            movable crop grid to export exactly the area you want.
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
                <span style={dropIcon}>📁</span>
                <strong style={dropTitle}>Upload or drag an image here</strong>
                <span style={dropText}>Supports common browser-readable image formats such as JPG, PNG, WebP, SVG, and GIF first-frame preview.</span>
              </label>
            ) : (
              <div>
                <div style={previewHeader}>
                  <div>
                    <h2 style={panelTitle}>Preview</h2>
                    <p style={panelText}>
                      Original: {originalInfo?.width} × {originalInfo?.height}px • {formatBytes(originalFile.size)}
                    </p>
                  </div>
                  <button onClick={resetAll} style={secondaryBtn}>Upload New</button>
                </div>

                <div style={previewBox}>
                  <div style={imageFrame} ref={cropFrameRef}>
                    <img src={resizedUrl || originalUrl} style={previewImage} alt="Image resize preview" />

                    {fitMode === 'manualCrop' && !resizedUrl && (
                      <>
                        <div style={cropDimLayer} />
                        <div
                          style={{
                            ...cropBox,
                            left: `${manualCrop.x}%`,
                            top: `${manualCrop.y}%`,
                            width: `${manualCrop.w}%`,
                            height: `${manualCrop.h}%`
                          }}
                          onMouseDown={startCropDrag}
                          onTouchStart={startCropDrag}
                        >
                          <span style={gridLineV1} />
                          <span style={gridLineV2} />
                          <span style={gridLineH1} />
                          <span style={gridLineH2} />
                          <span style={cropMoveHint}>Drag crop area</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {fitMode === 'manualCrop' && !resizedUrl && (
                  <div style={cropHelpBox}>
                    Move the crop grid to choose the exact area to export. The crop grid keeps your selected output ratio of {ratioText}.
                  </div>
                )}

                {resizedBlob && (
                  <div style={resultStats}>
                    <div>
                      <span style={statLabel}>New dimensions</span>
                      <strong style={statValue}>{dimensions.width} × {dimensions.height}px</strong>
                    </div>
                    <div>
                      <span style={statLabel}>Output size</span>
                      <strong style={statValue}>{formatBytes(resizedBlob.size)}</strong>
                    </div>
                    <div>
                      <span style={statLabel}>Size change</span>
                      <strong style={statValue}>
                        {fileSavings?.difference >= 0 ? '-' : '+'}{formatBytes(Math.abs(fileSavings?.difference || 0))}
                      </strong>
                    </div>
                  </div>
                )}

                {resizedUrl && (
                  <div style={downloadRow}>
                    <a href={resizedUrl} download={getDownloadName()} style={downloadBtn}>
                      Download Resized Image
                    </a>
                    <button onClick={copyReport} style={secondaryBtn}>Copy Report</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside style={settingsPanel}>
            <h2 style={panelTitle}>Resize settings</h2>

            <div style={inputGrid}>
              <div>
                <label style={label}>Width px</label>
                <input
                  type="number"
                  min="1"
                  max="8000"
                  value={dimensions.width}
                  onChange={(e) => handleDimensionChange('width', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={label}>Height px</label>
                <input
                  type="number"
                  min="1"
                  max="8000"
                  value={dimensions.height}
                  onChange={(e) => handleDimensionChange('height', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <label style={checkRow}>
              <input
                type="checkbox"
                checked={lockRatio}
                onChange={(e) => {
                  setLockRatio(e.target.checked);
                  clearOutputOnly();
                }}
              />
              Lock original aspect ratio
            </label>

            <div style={inputRow}>
              <label style={label}>Resize mode</label>
              <select
                value={fitMode}
                onChange={(e) => {
                  setFitMode(e.target.value);
                  clearOutputOnly();
                }}
                style={inputStyle}
              >
                {Object.entries(fitModes).map(([key, item]) => (
                  <option key={key} value={key}>{item.label}</option>
                ))}
              </select>
              <p style={hint}>{fitModes[fitMode].description}</p>
            </div>

            {fitMode === 'cover' && (
              <div style={inputRow}>
                <label style={label}>Auto crop position</label>
                <select
                  value={cropPosition}
                  onChange={(e) => {
                    setCropPosition(e.target.value);
                    clearOutputOnly();
                  }}
                  style={inputStyle}
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            )}

            {fitMode === 'manualCrop' && (
              <div style={inputRow}>
                <div style={labelLine}>
                  <label style={label}>Crop zoom</label>
                  <span style={valuePill}>{cropZoom}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="1"
                  value={cropZoom}
                  onChange={(e) => {
                    setCropZoom(Number(e.target.value));
                    clearOutputOnly();
                  }}
                  style={rangeStyle}
                />
                <button onClick={resetCrop} style={miniBtn}>Reset crop position</button>
              </div>
            )}

            {fitMode === 'contain' && outputFormat !== 'png' && (
              <div style={inputRow}>
                <label style={label}>Canvas background</label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => {
                    setBackgroundColor(e.target.value);
                    clearOutputOnly();
                  }}
                  style={colorInput}
                />
              </div>
            )}

            <div style={inputRow}>
              <label style={label}>Output format</label>
              <select
                value={outputFormat}
                onChange={(e) => {
                  setOutputFormat(e.target.value);
                  clearOutputOnly();
                }}
                style={inputStyle}
              >
                {Object.entries(outputFormats).map(([key, item]) => (
                  <option key={key} value={key}>{item.label}</option>
                ))}
              </select>
            </div>

            {selectedFormat.supportsQuality && (
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
                  onChange={(e) => {
                    setQuality(Number(e.target.value));
                    clearOutputOnly();
                  }}
                  style={rangeStyle}
                />
              </div>
            )}

            <button onClick={processImage} disabled={!originalFile || processing} style={!originalFile || processing ? disabledBtn : primaryBtn}>
              {processing ? 'Resizing...' : 'Resize Image'}
            </button>
          </aside>
        </section>

        <section style={presetSection}>
          <h2 style={sectionTitle}>Popular size presets</h2>
          <p style={sectionDesc}>
            Choose a common size for social media, video thumbnails, website images, ecommerce, or documents.
            Presets use fixed platform dimensions and switch to manual crop mode so you can choose the visible area.
          </p>

          <div style={presetGrid}>
            {PRESETS.map(preset => (
              <button key={`${preset.name}-${preset.w}-${preset.h}`} onClick={() => applyPreset(preset)} style={presetBtn}>
                <span style={presetCat}>{preset.cat}</span>
                <strong style={presetName}>{preset.name}</strong>
                <span style={presetSize}>{preset.w} × {preset.h}px</span>
              </button>
            ))}
          </div>
        </section>

        <section style={contentSection}>
          <h2 style={contentTitle}>What does image resizing do?</h2>
          <p style={para}>
            Image resizing changes the pixel dimensions of a picture. For example, a phone photo may be 4000 pixels wide,
            but a website card may only need 800 pixels. Resizing the image before uploading can reduce file weight,
            improve loading speed, and help the image fit the exact place where it will be used.
          </p>

          <div style={infoGrid}>
            <div style={infoCard}>
              <h3 style={infoTitle}>Fit inside canvas</h3>
              <p style={paraSmall}>
                Fit mode keeps the entire image visible. If the target size has a different aspect ratio, empty space is added
                around the image using the selected background color.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>Auto crop to fill</h3>
              <p style={paraSmall}>
                Auto crop mode fills the full target size without distortion. Some edges may be removed, so it is useful for
                social posts, thumbnails, and banners that require an exact ratio.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>Manual crop grid</h3>
              <p style={paraSmall}>
                Manual crop mode lets you move a grid over the image and export only the selected area. This is useful when
                the subject must stay centered in Instagram posts, product images, or thumbnails.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>Stretch exactly</h3>
              <p style={paraSmall}>
                Stretch mode forces the image into the target dimensions. It is useful only when distortion is acceptable or
                when you are working with abstract graphics.
              </p>
            </div>
          </div>

          <h2 style={contentTitle}>How to choose the right image size</h2>
          <p style={para}>
            Use the final display location as your guide. Social media posts need platform-specific sizes, YouTube thumbnails
            commonly use a 16:9 ratio, website banners are usually wide, and product images often work best as squares.
            When quality matters, avoid resizing small images upward too much because upscaling cannot create real detail that
            was not present in the original image.
          </p>

          <h2 style={contentTitle}>Resize vs crop vs compress</h2>
          <p style={para}>
            Resizing changes width and height. Cropping selects only part of an image. Compression reduces file size by
            adjusting image data and quality. For best website performance, resize or crop an image to the correct display
            dimensions first, then compress it if the file is still too large.
          </p>

          <h2 style={contentTitle}>Privacy note</h2>
          <p style={para}>
            This image resizer works in your browser using canvas processing. Your image is selected on your device, resized
            on the page, and downloaded from the browser. For sensitive images, always review the final file before sharing or
            publishing it.
          </p>
        </section>

        <section style={faqSection}>
          <h2 style={contentTitle}>Image Resizer FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3 style={faqQ}>What is the best size for Instagram posts?</h3>
              <p style={paraSmall}>Common Instagram sizes include 1080×1080 for square posts, 1080×1350 for portrait posts, and 1080×1920 for stories or reels.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>What is the best YouTube thumbnail size?</h3>
              <p style={paraSmall}>A common YouTube thumbnail size is 1280×720 pixels, which uses a 16:9 aspect ratio.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Should I use crop or fit?</h3>
              <p style={paraSmall}>Use crop when you need the exact full frame. Use fit when you want the entire original image visible.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Can resizing improve website speed?</h3>
              <p style={paraSmall}>Yes. Uploading images close to their display size can reduce unnecessary file weight and improve page loading.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function getPointerPoint(event) {
  if (event.touches && event.touches[0]) return event.touches[0];
  return event;
}

function getDrawDimensions({ sourceWidth, sourceHeight, targetWidth, targetHeight, fitMode, cropPosition, manualCrop }) {
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

  if (fitMode === 'manualCrop') {
    return {
      sourceX: (manualCrop.x / 100) * sourceWidth,
      sourceY: (manualCrop.y / 100) * sourceHeight,
      sourceWidth: (manualCrop.w / 100) * sourceWidth,
      sourceHeight: (manualCrop.h / 100) * sourceHeight,
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

  let sourceX = (sourceWidth - cropWidth) / 2;
  let sourceY = (sourceHeight - cropHeight) / 2;

  if (cropPosition === 'top') sourceY = 0;
  if (cropPosition === 'bottom') sourceY = sourceHeight - cropHeight;
  if (cropPosition === 'left') sourceX = 0;
  if (cropPosition === 'right') sourceX = sourceWidth - cropWidth;

  return {
    sourceX,
    sourceY,
    sourceWidth: cropWidth,
    sourceHeight: cropHeight,
    targetX: 0,
    targetY: 0,
    targetWidth,
    targetHeight
  };
}

function simplifyRatio(width, height) {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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
const previewBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '22px', minHeight: '430px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflow: 'hidden' };
const imageFrame = { position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '480px', lineHeight: 0 };
const previewImage = { maxWidth: '100%', maxHeight: '480px', objectFit: 'contain', borderRadius: '12px', display: 'block' };

const cropDimLayer = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)', borderRadius: '12px', pointerEvents: 'none' };
const cropBox = { position: 'absolute', border: '2px solid #38bdf8', boxShadow: '0 0 0 9999px rgba(0,0,0,0.38)', cursor: 'move', touchAction: 'none', overflow: 'hidden', background: 'rgba(56,189,248,0.04)' };
const gridLineV1 = { position: 'absolute', top: 0, bottom: 0, left: '33.33%', width: '1px', background: 'rgba(255,255,255,0.75)' };
const gridLineV2 = { position: 'absolute', top: 0, bottom: 0, left: '66.66%', width: '1px', background: 'rgba(255,255,255,0.75)' };
const gridLineH1 = { position: 'absolute', left: 0, right: 0, top: '33.33%', height: '1px', background: 'rgba(255,255,255,0.75)' };
const gridLineH2 = { position: 'absolute', left: 0, right: 0, top: '66.66%', height: '1px', background: 'rgba(255,255,255,0.75)' };
const cropMoveHint = { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(15,23,42,0.75)', color: '#fff', padding: '6px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 900, whiteSpace: 'nowrap' };
const cropHelpBox = { marginTop: '14px', background: 'rgba(56,189,248,0.08)', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '16px', padding: '14px', lineHeight: 1.6, fontSize: '0.9rem' };

const resultStats = { marginTop: '18px', background: 'rgba(56,189,248,0.08)', border: '1px solid #334155', borderRadius: '18px', padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' };
const statLabel = { color: '#94a3b8', display: 'block', fontSize: '0.8rem', marginBottom: '5px' };
const statValue = { color: '#38bdf8', fontSize: '1rem' };
const downloadRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '18px' };

const inputGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' };
const inputRow = { marginBottom: '18px' };
const label = { fontSize: '0.78rem', color: '#94a3b8', fontWeight: 900, display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' };
const labelLine = { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '10px' };
const valuePill = { color: '#38bdf8', background: '#0f172a', border: '1px solid #334155', padding: '6px 10px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 850 };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '14px', borderRadius: '14px', color: '#fff', fontSize: '1rem', outline: 'none' };
const colorInput = { width: '100%', height: '48px', background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '6px', cursor: 'pointer' };
const checkRow = { display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.92rem', margin: '0 0 20px', cursor: 'pointer' };
const hint = { color: '#64748b', lineHeight: 1.55, fontSize: '0.84rem', margin: '10px 0 0' };
const rangeStyle = { width: '100%', accentColor: '#38bdf8' };

const primaryBtn = { width: '100%', background: '#38bdf8', color: '#082f49', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: 950, cursor: 'pointer', marginTop: '4px' };
const disabledBtn = { ...primaryBtn, opacity: 0.45, cursor: 'not-allowed' };
const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 850, cursor: 'pointer' };
const miniBtn = { width: '100%', marginTop: '10px', background: '#334155', color: '#fff', border: 'none', padding: '11px', borderRadius: '12px', fontWeight: 850, cursor: 'pointer' };
const downloadBtn = { display: 'block', textAlign: 'center', background: '#34d399', color: '#052e16', textDecoration: 'none', padding: '15px', borderRadius: '14px', fontWeight: 950 };

const presetSection = { marginTop: '28px', background: '#1e293b', border: '1px solid #334155', borderRadius: '26px', padding: '28px' };
const sectionTitle = { color: '#fff', fontSize: '1.45rem', margin: '0 0 10px' };
const sectionDesc = { color: '#94a3b8', lineHeight: 1.65, margin: '0 0 20px' };
const presetGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' };
const presetBtn = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '16px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' };
const presetCat = { color: '#38bdf8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' };
const presetName = { color: '#fff', fontSize: '0.95rem' };
const presetSize = { color: '#94a3b8', fontSize: '0.84rem' };

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

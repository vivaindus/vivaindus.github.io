import React, { useEffect, useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

const THUMBNAIL_QUALITIES = [
  {
    key: 'maxresdefault',
    label: 'Maximum Resolution',
    file: 'maxresdefault.jpg',
    size: 'Up to 1280×720 / 1920×1080',
    desc: 'Best available YouTube thumbnail quality when uploaded by the creator.',
    tag: 'Best Quality'
  },
  {
    key: 'sddefault',
    label: 'Standard Definition',
    file: 'sddefault.jpg',
    size: '640×480',
    desc: 'Good quality fallback for many videos and older uploads.',
    tag: 'SD'
  },
  {
    key: 'hqdefault',
    label: 'High Quality',
    file: 'hqdefault.jpg',
    size: '480×360',
    desc: 'Reliable thumbnail size that is available for nearly every YouTube video.',
    tag: 'Reliable'
  },
  {
    key: 'mqdefault',
    label: 'Medium Quality',
    file: 'mqdefault.jpg',
    size: '320×180',
    desc: 'Lightweight thumbnail for web previews and quick sharing.',
    tag: 'Small'
  },
  {
    key: 'default',
    label: 'Default Thumbnail',
    file: 'default.jpg',
    size: '120×90',
    desc: 'Smallest default YouTube thumbnail preview.',
    tag: 'Tiny'
  }
];

const SAMPLE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

export default function ThumbnailDownloader() {
  const [mounted, setMounted] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [manualId, setManualId] = useState('');
  const [mode, setMode] = useState('url');
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const videoId = useMemo(() => {
    if (mode === 'manual') {
      return cleanVideoId(manualId);
    }

    return extractYouTubeId(videoUrl);
  }, [mode, videoUrl, manualId]);

  const thumbnails = useMemo(() => {
    if (!videoId) return [];

    return THUMBNAIL_QUALITIES.map(item => ({
      ...item,
      url: `https://img.youtube.com/vi/${videoId}/${item.file}`
    }));
  }, [videoId]);

  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';

  const handleUrlChange = (value) => {
    setVideoUrl(value);
    setError('');

    if (!value.trim()) return;

    const id = extractYouTubeId(value);

    if (id) {
      setNotification('Video ID detected successfully.');
    } else {
      setError('Please paste a valid YouTube video, Shorts, live, embed or share link.');
    }
  };

  const useSample = () => {
    setMode('url');
    setVideoUrl(SAMPLE_URL);
    setError('');
    setNotification('Sample YouTube URL loaded.');
  };

  const clearAll = () => {
    setVideoUrl('');
    setManualId('');
    setError('');
    setDownloading('');
    setNotification('Workspace cleared.');
  };

  const copyText = async (text, message) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotification(message || 'Copied.');
    } catch {
      setNotification('Copy failed. Please copy manually.');
    }
  };

  const downloadImage = async (thumb) => {
    if (!thumb?.url) return;

    setDownloading(thumb.key);

    try {
      const response = await fetch(thumb.url, { mode: 'cors' });

      if (!response.ok) {
        window.open(thumb.url, '_blank', 'noopener,noreferrer');
        setNotification('Image opened. Right-click and save if download is blocked.');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `youtube-thumbnail-${videoId}-${thumb.key}.jpg`;
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setNotification(`${thumb.label} downloaded.`);
    } catch {
      window.open(thumb.url, '_blank', 'noopener,noreferrer');
      setNotification('Image opened. Right-click and save if direct download is blocked.');
    } finally {
      setDownloading('');
    }
  };

  const downloadBest = () => {
    if (!thumbnails.length) return;
    downloadImage(thumbnails[0]);
  };

  if (!mounted) {
    return (
      <ToolboxLayout title="YouTube Thumbnail Downloader" description="Loading YouTube thumbnail downloader.">
        <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
          Loading thumbnail extractor...
        </div>
      </ToolboxLayout>
    );
  }

  return (
    <ToolboxLayout
      title="YouTube Thumbnail Downloader - HD, Shorts and Video Cover Extractor"
      description="Download YouTube thumbnails in maximum resolution, HD, SD, medium and default sizes. Supports normal videos, Shorts, embed links and raw video IDs with no backend required."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free YouTube thumbnail extractor</p>
          <h1 style={heroTitle}>YouTube Thumbnail Downloader</h1>
          <p style={heroText}>
            Paste a YouTube video, Shorts, live, embed or share link to extract available thumbnail images.
            Download maximum resolution, HD, SD, medium and default thumbnail versions for research, previews,
            presentations, blog references and content planning.
          </p>

          <div style={heroActions}>
            <button onClick={useSample} style={secondaryBtn}>Use Sample URL</button>
            <button onClick={clearAll} style={ghostBtn}>Clear</button>
          </div>
        </section>

        <section style={appGrid}>
          <main style={mainPanel}>
            <section style={inputPanel}>
              <div style={modeTabs}>
                <button onClick={() => setMode('url')} style={mode === 'url' ? activeTab : tabBtn}>Paste URL</button>
                <button onClick={() => setMode('manual')} style={mode === 'manual' ? activeTab : tabBtn}>Video ID</button>
              </div>

              {mode === 'url' ? (
                <label style={fieldWrap}>
                  <span style={fieldLabel}>YouTube video, Shorts, live or embed URL</span>
                  <input
                    value={videoUrl}
                    onChange={event => handleUrlChange(event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={inputStyle}
                  />
                </label>
              ) : (
                <label style={fieldWrap}>
                  <span style={fieldLabel}>YouTube video ID</span>
                  <input
                    value={manualId}
                    onChange={event => {
                      setManualId(event.target.value);
                      setError('');
                    }}
                    placeholder="11-character video ID"
                    style={inputStyle}
                  />
                </label>
              )}

              {error && (
                <div style={errorBox}>
                  {error}
                </div>
              )}

              {videoId && (
                <div style={detectedBox}>
                  <div>
                    <span style={fieldLabel}>Detected Video ID</span>
                    <strong style={detectedId}>{videoId}</strong>
                  </div>

                  <button onClick={() => copyText(videoId, 'Video ID copied.')} style={secondaryBtn}>
                    Copy ID
                  </button>
                </div>
              )}
            </section>

            {videoId && (
              <>
                <section style={previewPanel}>
                  <div style={sectionHeader}>
                    <div>
                      <h2 style={sectionTitle}>Video Preview</h2>
                      <p style={sectionText}>Confirm this is the correct video before downloading the thumbnail.</p>
                    </div>

                    <button onClick={downloadBest} style={primaryBtn}>
                      Download Best Quality
                    </button>
                  </div>

                  <div style={embedWrap}>
                    <iframe
                      src={embedUrl}
                      title="YouTube video preview"
                      style={embedFrame}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </section>

                <section style={galleryPanel}>
                  <div style={sectionHeader}>
                    <div>
                      <h2 style={sectionTitle}>Available Thumbnail Sizes</h2>
                      <p style={sectionText}>
                        YouTube may not provide true maximum resolution for every video. If the largest version is not custom uploaded,
                        use the HD or SD version.
                      </p>
                    </div>
                  </div>

                  <div style={thumbGrid}>
                    {thumbnails.map(thumb => (
                      <article key={thumb.key} style={thumbCard}>
                        <div style={thumbImageWrap}>
                          <img src={thumb.url} alt={`${thumb.label} YouTube thumbnail`} style={thumbImage} />
                          <span style={thumbTag}>{thumb.tag}</span>
                        </div>

                        <div style={thumbBody}>
                          <h3 style={thumbTitle}>{thumb.label}</h3>
                          <p style={thumbSize}>{thumb.size}</p>
                          <p style={thumbDesc}>{thumb.desc}</p>

                          <div style={thumbActions}>
                            <button
                              onClick={() => downloadImage(thumb)}
                              disabled={downloading === thumb.key}
                              style={downloading === thumb.key ? disabledBtn : primarySmallBtn}
                            >
                              {downloading === thumb.key ? 'Downloading...' : 'Download'}
                            </button>

                            <button onClick={() => copyText(thumb.url, 'Thumbnail URL copied.')} style={secondarySmallBtn}>
                              Copy URL
                            </button>

                            <a href={thumb.url} target="_blank" rel="noreferrer" style={linkSmallBtn}>
                              Open
                            </a>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </>
            )}

            {!videoId && (
              <section style={emptyPanel}>
                <strong>Paste a YouTube link to begin</strong>
                <span>
                  Supported formats include youtube.com/watch, youtu.be, YouTube Shorts, embed URLs and live URLs.
                </span>
              </section>
            )}
          </main>

          <aside style={sidePanel}>
            <h2 style={sideTitle}>Supported Links</h2>

            <div style={exampleList}>
              <code>youtube.com/watch?v=VIDEOID</code>
              <code>youtu.be/VIDEOID</code>
              <code>youtube.com/shorts/VIDEOID</code>
              <code>youtube.com/embed/VIDEOID</code>
              <code>youtube.com/live/VIDEOID</code>
            </div>

            <div style={tipBox}>
              <h3>Best quality tip</h3>
              <p>
                The maximum resolution thumbnail is usually best for blog headers, presentation slides and content research.
                If it looks low quality, choose HD or SD.
              </p>
            </div>

            <div style={tipBox}>
              <h3>Usage reminder</h3>
              <p>
                Thumbnails may be copyrighted by the creator or rights holder. Use them responsibly for reference, commentary,
                education or with permission.
              </p>
            </div>
          </aside>
        </section>

        <section style={contentSection}>
          <h2>Free YouTube thumbnail downloader for HD video covers</h2>
          <p>
            This YouTube thumbnail downloader helps you extract thumbnail images from YouTube videos, Shorts and share links.
            It is useful for creators, bloggers, designers, students, marketers and researchers who need to view or save a
            video cover image for reference, content planning, presentations, editorial work or thumbnail inspiration.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>YouTube thumbnail downloader</h3>
              <p>
                Paste a YouTube video link and instantly view the available thumbnail image versions. Download the image or copy
                the direct thumbnail URL.
              </p>
            </div>

            <div style={seoCard}>
              <h3>YouTube Shorts thumbnail downloader</h3>
              <p>
                Shorts links are supported. Paste a youtube.com/shorts link to extract the thumbnail connected to the Shorts video ID.
              </p>
            </div>

            <div style={seoCard}>
              <h3>HD thumbnail extractor</h3>
              <p>
                Download maximum resolution, SD, HD, medium and default thumbnail sizes. The best version depends on what YouTube
                generated for that video.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Video cover image download</h3>
              <p>
                Use extracted video cover images for personal reference, mood boards, design analysis, educational commentary
                or video planning.
              </p>
            </div>

            <div style={seoCard}>
              <h3>No API key required</h3>
              <p>
                The tool only needs the public YouTube video ID to build thumbnail image links. No YouTube API key or account login
                is required.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Fast browser-based parsing</h3>
              <p>
                The video ID extraction happens inside your browser. The tool does not need a backend database to parse YouTube links.
              </p>
            </div>
          </div>

          <h2>Understanding YouTube thumbnail sizes</h2>
          <ul style={tipList}>
            <li><strong>Maximum resolution:</strong> best quality if available, commonly used for custom thumbnails.</li>
            <li><strong>SD default:</strong> standard definition version useful when maximum resolution is unavailable.</li>
            <li><strong>HQ default:</strong> reliable high-quality fallback available for most videos.</li>
            <li><strong>MQ default:</strong> medium size thumbnail for lightweight previews.</li>
            <li><strong>Default:</strong> small thumbnail version for quick previews.</li>
          </ul>

          <h2>How to use downloaded YouTube thumbnails responsibly</h2>
          <p>
            YouTube thumbnails are usually created by the video owner or automatically generated from the video. They may be
            protected by copyright or brand rights. Use downloaded thumbnails responsibly, especially for commercial use. For
            republishing, advertising, or business use, get permission from the original creator or rights holder.
          </p>
        </section>

        <section style={faqSection}>
          <h2>YouTube Thumbnail Downloader FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>Can I download thumbnails from YouTube Shorts?</h3>
              <p>Yes. Paste the Shorts URL and the tool will extract the video ID and show thumbnail versions.</p>
            </div>

            <div style={faqItem}>
              <h3>Why is maximum resolution not always sharp?</h3>
              <p>Not every video has a custom maximum-resolution thumbnail. Use HD or SD if the max version is not ideal.</p>
            </div>

            <div style={faqItem}>
              <h3>Do I need a YouTube API key?</h3>
              <p>No. This tool uses the public thumbnail URL pattern based on the YouTube video ID.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I use thumbnails commercially?</h3>
              <p>Only if you have the right to use them. Thumbnails may be copyrighted by the creator or rights holder.</p>
            </div>

            <div style={faqItem}>
              <h3>What if the download button opens the image?</h3>
              <p>Some browsers block direct cross-origin downloads. If that happens, right-click the opened image and choose Save Image As.</p>
            </div>

            <div style={faqItem}>
              <h3>Which thumbnail quality should I choose?</h3>
              <p>Start with maximum resolution. If it is not available or looks low quality, use SD or HQ.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function extractYouTubeId(input) {
  const value = String(input || '').trim();

  if (!value) return '';

  const rawId = cleanVideoId(value);
  if (rawId.length === 11 && !value.includes('/') && !value.includes('?')) {
    return rawId;
  }

  const patterns = [
    /(?:youtube\.com\/watch\?.*?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  try {
    const url = new URL(value);
    const id = url.searchParams.get('v');
    if (id && cleanVideoId(id).length === 11) return cleanVideoId(id);
  } catch {
    // Not a URL.
  }

  return '';
}

function cleanVideoId(value) {
  return String(value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 11);
}

const pageWrap = { maxWidth: '1180px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#ef4444', color: '#fff', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '920px', margin: '0 auto', lineHeight: 1.75 };
const heroActions = { display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '24px' };

const appGrid = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', alignItems: 'start' };
const mainPanel = { display: 'grid', gap: '22px' };
const sidePanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '24px', position: 'sticky', top: '92px', display: 'grid', gap: '18px' };

const inputPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '18px' };
const modeTabs = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' };
const tabBtn = { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '12px', padding: '12px', fontWeight: 850, cursor: 'pointer' };
const activeTab = { ...tabBtn, background: '#ef4444', color: '#fff', border: '1px solid #ef4444' };

const fieldWrap = { display: 'grid', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '13px', padding: '14px', outline: 'none', fontSize: '1rem' };
const errorBox = { background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.35)', color: '#fecaca', borderRadius: '14px', padding: '14px', fontWeight: 850 };
const detectedBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '16px', display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', flexWrap: 'wrap' };
const detectedId = { color: '#fff', display: 'block', fontSize: '1.2rem', marginTop: '6px', letterSpacing: '0.04em' };

const previewPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '18px' };
const galleryPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' };
const sectionTitle = { color: '#fff', margin: 0, fontSize: '1.28rem' };
const sectionText = { color: '#94a3b8', lineHeight: 1.65, margin: '8px 0 0', fontSize: '0.92rem' };

const embedWrap = { position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '18px', overflow: 'hidden', background: '#0f172a', border: '1px solid #334155' };
const embedFrame = { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' };

const thumbGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginTop: '22px' };
const thumbCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '22px', overflow: 'hidden' };
const thumbImageWrap = { position: 'relative', background: '#111827' };
const thumbImage = { width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' };
const thumbTag = { position: 'absolute', top: '10px', left: '10px', background: '#ef4444', color: '#fff', borderRadius: '999px', padding: '6px 10px', fontSize: '0.72rem', fontWeight: 900 };
const thumbBody = { padding: '16px', display: 'grid', gap: '8px' };
const thumbTitle = { color: '#fff', margin: 0, fontSize: '1rem' };
const thumbSize = { color: '#ef4444', margin: 0, fontSize: '0.82rem', fontWeight: 900 };
const thumbDesc = { color: '#94a3b8', margin: 0, lineHeight: 1.55, fontSize: '0.88rem' };
const thumbActions = { display: 'grid', gridTemplateColumns: '1fr 1fr 0.8fr', gap: '8px', marginTop: '8px' };

const primaryBtn = { background: '#ef4444', color: '#fff', border: 'none', borderRadius: '14px', padding: '13px 16px', fontWeight: 950, cursor: 'pointer' };
const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', borderRadius: '14px', padding: '13px 16px', fontWeight: 850, cursor: 'pointer' };
const ghostBtn = { background: 'transparent', color: '#ef4444', border: '1px solid #334155', borderRadius: '14px', padding: '13px 16px', fontWeight: 850, cursor: 'pointer' };
const primarySmallBtn = { background: '#ef4444', color: '#fff', border: 'none', borderRadius: '11px', padding: '11px', fontWeight: 900, cursor: 'pointer', fontSize: '0.78rem' };
const disabledBtn = { ...primarySmallBtn, opacity: 0.5, cursor: 'not-allowed' };
const secondarySmallBtn = { background: '#334155', color: '#fff', border: 'none', borderRadius: '11px', padding: '11px', fontWeight: 850, cursor: 'pointer', fontSize: '0.78rem' };
const linkSmallBtn = { background: 'transparent', color: '#ef4444', border: '1px solid #334155', borderRadius: '11px', padding: '10px', fontWeight: 850, cursor: 'pointer', fontSize: '0.78rem', textDecoration: 'none', textAlign: 'center' };

const emptyPanel = { background: '#1e293b', border: '1px dashed #334155', borderRadius: '28px', padding: '65px 24px', textAlign: 'center', color: '#64748b', display: 'grid', gap: '8px' };

const sideTitle = { color: '#fff', margin: 0, fontSize: '1.15rem' };
const exampleList = { display: 'grid', gap: '10px' };
const tipBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', color: '#94a3b8', lineHeight: 1.65, fontSize: '0.9rem' };

const contentSection = { marginTop: '78px', borderTop: '1px solid #334155', paddingTop: '55px', color: '#cbd5e1', lineHeight: 1.85 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '30px 0' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '22px' };
const tipList = { paddingLeft: '20px', lineHeight: 1.9 };

const faqSection = { marginTop: '70px', background: 'rgba(239,68,68,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px', color: '#cbd5e1', lineHeight: 1.8 };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };

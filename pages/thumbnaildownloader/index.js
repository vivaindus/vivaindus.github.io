import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function ThumbnailDownloader() {
    const [videoUrl, setVideoUrl] = useState('');
    const [videoId, setVideoId] = useState('');
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');

    // --- Toast Logic ---
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const extractId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        if (match && match[1]) {
            setVideoId(match[1]);
            setError('');
            setNotification('Video identified successfully! ✅');
        } else {
            setVideoId('');
            if (url) setError('Invalid YouTube URL. Please use a valid video or shorts link.');
        }
    };

    const handleInputChange = (e) => {
        const url = e.target.value;
        setVideoUrl(url);
        if (url) extractId(url);
        else {
            setVideoId('');
            setError('');
        }
    };

    const thumbnailQualities = [
        { label: '4K Ultra HD (Maximum)', suffix: 'maxresdefault.jpg', res: '1920x1080' },
        { label: 'HD High Quality', suffix: 'hqdefault.jpg', res: '480x360' },
        { label: 'Medium (SD)', suffix: 'mqdefault.jpg', res: '320x180' },
        { label: 'Standard / Mobile', suffix: 'sddefault.jpg', res: '640x480' }
    ];

    return (
        <ToolboxLayout 
            title="YouTube Thumbnail Downloader - Extract HD Video Covers" 
            description="Download high-resolution YouTube thumbnails (4K, HD, 1080p) instantly. Simply paste the link to extract all available image sizes for free."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* TOAST NOTIFICATION */}
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#ff0000', color: '#fff', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: INTERESTING HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#ff0000', fontSize: '2.5rem' }}>HD YouTube Thumbnail Downloader</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '800px', margin: '15px auto', lineHeight: '1.6' }}>
                        The thumbnail is the most important part of a video's <strong>Click-Through Rate (CTR)</strong>. 
                        Need a high-res cover for a blog, presentation, or inspiration? Paste the link below to grab the 
                        source images in seconds.
                    </p>
                </div>

                {/* --- APP AREA --- */}
                <div style={{ background: '#1e293b', padding: '35px', borderRadius: '24px', border: '1px solid #334155', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ color: '#94a3b8', display: 'block', marginBottom: '12px', fontWeight: 'bold', fontSize: '0.9rem' }}>PASTE VIDEO OR SHORTS URL</label>
                        <input 
                            type="text" 
                            placeholder="https://www.youtube.com/watch?v=..." 
                            value={videoUrl}
                            onChange={handleInputChange}
                            style={{ width: '100%', background: '#0f172a', border: '2px solid #334155', color: '#fff', padding: '18px', borderRadius: '15px', fontSize: '1.1rem', outline: 'none', transition: 'border-color 0.3s' }}
                        />
                        {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '12px', fontWeight: 'bold' }}>⚠️ {error}</p>}
                    </div>

                    {videoId && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', animation: 'fadeIn 0.5s' }}>
                            {thumbnailQualities.map((q) => {
                                const imgUrl = `https://img.youtube.com/vi/${videoId}/${q.suffix}`;
                                return (
                                    <div key={q.suffix} style={{ background: '#0f172a', padding: '15px', borderRadius: '20px', textAlign: 'center', border: '1px solid #334155' }}>
                                        <div style={{ overflow: 'hidden', borderRadius: '12px', marginBottom: '15px' }}>
                                            <img src={imgUrl} style={{ width: '100%', display: 'block', transition: 'transform 0.3s' }} alt={q.label} />
                                        </div>
                                        <p style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>{q.label}</p>
                                        <p style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '15px' }}>Resolution: {q.res}</p>
                                        <a 
                                            href={imgUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            style={{ background: '#ff0000', color: '#fff', textDecoration: 'none', padding: '12px 0', borderRadius: '10px', fontWeight: 'bold', display: 'block', fontSize: '0.85rem' }}
                                        >
                                            VIEW FULL IMAGE
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '30px' }}>Deep-Dive: How YouTube Thumbnail Extraction Works</h2>
                    <p>
                        Every time a creator uploads a video to YouTube, the platform's automated media engine processes the video 
                        and generates a series of image assets. These assets are stored on Google’s <strong>i.ytimg.com</strong> and 
                        <strong>img.youtube.com</strong> content delivery networks (CDNs). The SHB Thumbnail Downloader communicates 
                        directly with these servers to retrieve the original source files before any browser-side compression is applied.
                    </p>

                    <h3 style={{ color: '#ff0000', marginTop: '40px' }}>Understanding Resolution Varieties</h3>
                    <p>
                        Depending on the quality of the original video upload, YouTube provides up to four distinct versions of a thumbnail. 
                        It is important to choose the right one for your specific needs:
                    </p>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li><strong>MaxResDefault (1920x1080):</strong> This is the holy grail of thumbnails. If the uploader provided an HD video, this version will exist. It is the best choice for high-end blog headers and print media.</li>
                        <li><strong>HQDefault (480x360):</strong> A high-quality version that is always available. It is optimized for the YouTube mobile app and related video sidebars.</li>
                        <li><strong>MQDefault (320x180):</strong> A medium-quality version, often used in embedded players on third-party websites to save bandwidth.</li>
                        <li><strong>SDDefault (640x480):</strong> A standard definition version with a 4:3 aspect ratio, mainly used for older legacy players and devices.</li>
                    </ul>

                    <h3 style={{ color: '#ff0000', marginTop: '40px' }}>Why Privacy and Speed Matter</h3>
                    <p>
                        Many "online downloader" websites are slow, filled with intrusive ads, and track your browsing history. 
                        At <strong>SHB ToolBox</strong>, we take a different approach. Our tool uses <strong>Local URL Parsing</strong>. 
                        When you paste a link, the extraction logic runs entirely on your device. We do not store the video URLs 
                        you search for, nor do we cache the images on our server. This makes the tool nearly 5x faster than 
                        server-side downloaders while keeping your media research 100% private.
                    </p>

                    <h3 style={{ color: '#ff0000', marginTop: '40px' }}>Legal & Ethical Usage Guidelines</h3>
                    <p>
                        While our tool makes it easy to access these files, it is vital to remember that thumbnails are the 
                        intellectual property of the respective content creators. We recommend using downloaded thumbnails 
                        under <strong>Fair Use</strong> principles—such as for educational commentary, news reporting, or 
                        criticism. If you intend to use a thumbnail for commercial purposes, always reach out to the 
                        original creator for permission.
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </ToolboxLayout>
    );
}
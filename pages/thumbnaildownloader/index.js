import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function ThumbnailDownloader() {
    const [videoUrl, setVideoUrl] = useState('');
    const [videoId, setVideoId] = useState('');
    const [error, setError] = useState('');

    const extractId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        if (match && match[1]) {
            setVideoId(match[1]);
            setError('');
        } else {
            setVideoId('');
            setError('Invalid YouTube URL. Please check the link.');
        }
    };

    const handleInputChange = (e) => {
        const url = e.target.value;
        setVideoUrl(url);
        if (url) extractId(url);
        else setVideoId('');
    };

    const thumbnailQualities = [
        { label: 'Maximum Resolution (4K/HD)', suffix: 'maxresdefault.jpg' },
        { label: 'High Quality (HQ)', suffix: 'hqdefault.jpg' },
        { label: 'Medium Quality (MQ)', suffix: 'mqdefault.jpg' },
        { label: 'Standard Quality', suffix: 'sddefault.jpg' }
    ];

    return (
        <ToolboxLayout title="YouTube Thumbnail Downloader" description="Download high-resolution YouTube thumbnails in 4K, HD, and SD quality for free.">
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#ff0000', marginBottom: '10px' }}>YouTube Thumbnail Downloader</h1>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '30px' }}>Grab high-definition thumbnails instantly from any YouTube video.</p>

                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    
                    {/* INPUT SECTION */}
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ color: '#94a3b8', display: 'block', marginBottom: '10px' }}>Paste YouTube Video URL</label>
                        <input 
                            type="text" 
                            placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                            value={videoUrl}
                            onChange={handleInputChange}
                            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '15px', borderRadius: '12px', fontSize: '1rem' }}
                        />
                        {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '10px' }}>{error}</p>}
                    </div>

                    {/* RESULTS SECTION */}
                    {videoId && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {thumbnailQualities.map((q) => {
                                const imgUrl = `https://img.youtube.com/vi/${videoId}/${q.suffix}`;
                                return (
                                    <div key={q.suffix} style={{ background: '#0f172a', padding: '15px', borderRadius: '15px', textAlign: 'center', border: '1px solid #334155' }}>
                                        <img src={imgUrl} style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }} alt={q.label} />
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px' }}>{q.label}</p>
                                        <a 
                                            href={imgUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            download 
                                            style={{ background: '#38bdf8', color: '#0f172a', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'block' }}
                                        >
                                            VIEW & DOWNLOAD
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* --- PROFESSIONAL SEO SECTION --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>Professional YouTube Thumbnail Extraction Tool</h2>
                    <p>
                        The SHB YouTube Thumbnail Downloader is a high-speed utility designed for content creators, designers, and digital marketers. 
                        Whether you need a reference for your own video design, a featured image for a blog post, or a visual for your 
                        social media campaign, our tool provides the highest resolution images available directly from the video source.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>How to Download Thumbnails in 4K & HD</h3>
                    <p>
                        Every YouTube video is stored with multiple thumbnail resolutions. Our tool automatically extracts the unique 
                        Video ID from your link and fetches the raw image files from the YouTube image servers:
                    </p>
                    <ul>
                        <li><strong>MaxResDefault:</strong> The highest resolution (usually 1280x720 or 1920x1080). Recommended for thumbnails and blog headers.</li>
                        <li><strong>HQDefault:</strong> A high-quality version (480x360). Perfect for social media shares and smaller widgets.</li>
                        <li><strong>SD & MQ:</strong> Optimized smaller versions for faster loading in mobile apps and email newsletters.</li>
                    </ul>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Full Support for All YouTube Formats</h3>
                    <p>
                        Our extraction logic is compatible with all modern YouTube link structures. Simply paste the URL from your 
                        address bar, the "Share" button link (youtu.be), or even <strong>YouTube Shorts</strong>. The engine will 
                        instantly identify the video and display all available qualities for download.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Copyright & Creative Usage</h3>
                    <p>
                        While SHB ToolBox makes it easy to download these images, we recommend respecting the intellectual property 
                        of the original creators. Always ensure you have the necessary permissions before using a downloaded 
                        thumbnail for commercial purposes or as part of your own video content.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Privacy and Convenience</h3>
                    <p>
                        At SHB ToolBox, we do not track which videos you are looking at. The extraction process happens locally in 
                        your browser's session. We do not store links, images, or video metadata in our Supabase database. This 
                        makes our tool one of the fastest and most private thumbnail grabbers available online.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}
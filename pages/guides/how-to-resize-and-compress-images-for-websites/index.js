import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../../components/ToolboxLayout';

export default function ImageOptimizationGuide() {
  return (
    <ToolboxLayout
      title="How to Resize and Compress Images for Websites and Online Forms"
      description="A complete guide to resizing and compressing images for websites, ecommerce, online forms, documents and social media. Learn image dimensions, file size, quality, formats and best practices."
    >
      <article style={wrap}>
        <p style={eyebrow}>Image optimization guide</p>
        <h1 style={title}>How to Resize and Compress Images for Websites and Online Forms</h1>

        <p style={intro}>
          Images are used everywhere: websites, ecommerce stores, online forms, job applications, school portals, visa
          portals, product catalogs, social media posts, email attachments and documents. But images are often too large,
          too heavy or the wrong dimensions. This can slow down a website, fail an upload, reduce user experience or make
          a document difficult to share.
        </p>

        <p>
          This guide explains how to resize and compress images properly, when to use each method, how to choose image
          dimensions, how to reduce file size without making the image look bad, and how to use SHB ToolBox image tools
          for practical daily work.
        </p>

        <div style={ctaBox}>
          <div>
            <strong>Optimize images now</strong>
            <p style={ctaText}>Resize images to exact dimensions or compress them to reduce file size.</p>
          </div>
          <div style={ctaLinks}>
            <Link href="/imageresizer" style={cta}>Open Image Resizer →</Link>
            <Link href="/imagecompressor" style={cta}>Open Image Compressor →</Link>
          </div>
        </div>

        <h2>Resize vs compress: what is the difference?</h2>
        <p>
          Resizing and compressing are related, but they are not the same. Resizing changes the pixel dimensions of an
          image. Compressing reduces the file size. For example, a photo may be 4000×3000 pixels and 6 MB. If you resize
          it to 1200×900 pixels, the file size usually becomes smaller because the image has fewer pixels. If you compress
          it after resizing, the file size can reduce even more.
        </p>

        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Action</th>
                <th style={th}>What it changes</th>
                <th style={th}>When to use it</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>Resize</td>
                <td style={td}>Pixel width and height.</td>
                <td style={td}>When the image dimensions are too large or need an exact size.</td>
              </tr>
              <tr>
                <td style={td}>Compress</td>
                <td style={td}>File size and sometimes visual quality.</td>
                <td style={td}>When the image dimensions are okay, but the file size is too large.</td>
              </tr>
              <tr>
                <td style={td}>Crop</td>
                <td style={td}>Visible area and aspect ratio.</td>
                <td style={td}>When the image needs to fit a specific layout or frame.</td>
              </tr>
              <tr>
                <td style={td}>Convert format</td>
                <td style={td}>File type, such as JPG, PNG or WebP.</td>
                <td style={td}>When a website, form or workflow requires a specific image format.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>When should you resize an image?</h2>
        <p>
          Resize an image when its dimensions are bigger than needed or when a platform requires exact pixel dimensions.
          A large camera photo may be much bigger than a website needs. Uploading the full-size photo can waste bandwidth
          and slow down page loading.
        </p>

        <h3>Common reasons to resize images</h3>
        <ul style={list}>
          <li>Preparing product photos for ecommerce stores.</li>
          <li>Creating website banners, thumbnails or blog images.</li>
          <li>Uploading photos to online forms with dimension limits.</li>
          <li>Creating social media images with specific aspect ratios.</li>
          <li>Reducing very large camera photos before sharing.</li>
          <li>Making images fit a passport, visa or ID photo layout.</li>
        </ul>

        <h2>How to use the Image Resizer</h2>
        <ol style={list}>
          <li>Open the <Link href="/imageresizer" style={inlineLink}>Image Resizer</Link>.</li>
          <li>Upload or select the image you want to resize.</li>
          <li>Enter the required width and height.</li>
          <li>Choose whether to keep aspect ratio if the option is available.</li>
          <li>Preview the result to ensure the image does not look stretched.</li>
          <li>Download the resized image.</li>
        </ol>

        <h2>What is aspect ratio?</h2>
        <p>
          Aspect ratio is the relationship between width and height. If you resize an image without keeping the correct
          ratio, it can look stretched or squeezed. For example, a square image uses a 1:1 ratio. A wide banner may use
          3:1 or 16:9. A portrait social media post may use 4:5.
        </p>

        <div style={grid}>
          <div style={card}>
            <h3>1:1</h3>
            <p>Square images. Useful for profile photos, product thumbnails and grid layouts.</p>
          </div>
          <div style={card}>
            <h3>4:5</h3>
            <p>Portrait social media posts. Common for product and fashion content.</p>
          </div>
          <div style={card}>
            <h3>16:9</h3>
            <p>Wide video thumbnails, banners and presentation-style images.</p>
          </div>
          <div style={card}>
            <h3>3:1</h3>
            <p>Website banners and wide promotional graphics.</p>
          </div>
        </div>

        <h2>When should you compress an image?</h2>
        <p>
          Compress an image when the visual size is correct but the file is still too heavy. Compression is useful for
          websites because smaller images load faster. It is also useful for portals that limit upload size, such as 500 KB,
          1 MB or 2 MB.
        </p>

        <h3>Common reasons to compress images</h3>
        <ul style={list}>
          <li>Website pages loading too slowly.</li>
          <li>Online forms rejecting large image files.</li>
          <li>Email attachments being too large.</li>
          <li>WhatsApp or messaging uploads taking too long.</li>
          <li>Product pages needing faster performance.</li>
          <li>Document images increasing PDF file size.</li>
        </ul>

        <h2>How to use the Image Compressor</h2>
        <ol style={list}>
          <li>Open the <Link href="/imagecompressor" style={inlineLink}>Image Compressor</Link>.</li>
          <li>Upload the image file.</li>
          <li>Choose the compression level or quality setting if available.</li>
          <li>Compare original and compressed file sizes.</li>
          <li>Preview the compressed image for quality.</li>
          <li>Download the optimized image.</li>
        </ol>

        <h2>Image formats explained</h2>
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Format</th>
                <th style={th}>Best for</th>
                <th style={th}>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>JPG / JPEG</td>
                <td style={td}>Photos, product images, banners and general website images.</td>
                <td style={td}>Good compression, but does not support transparency.</td>
              </tr>
              <tr>
                <td style={td}>PNG</td>
                <td style={td}>Logos, graphics, screenshots and transparent backgrounds.</td>
                <td style={td}>Can be larger than JPG for photos.</td>
              </tr>
              <tr>
                <td style={td}>WebP</td>
                <td style={td}>Modern websites and optimized web images.</td>
                <td style={td}>Often smaller than JPG/PNG with good quality.</td>
              </tr>
              <tr>
                <td style={td}>GIF</td>
                <td style={td}>Simple animations or very basic graphics.</td>
                <td style={td}>Not ideal for high-quality photos.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Recommended image sizes for common uses</h2>
        <p>
          Exact dimensions depend on the platform, theme and layout, but these general ranges are useful for planning.
        </p>

        <div style={grid}>
          <div style={card}>
            <h3>Product images</h3>
            <p>Often 800px to 1600px wide. Keep enough detail for zoom if needed.</p>
          </div>
          <div style={card}>
            <h3>Website banners</h3>
            <p>Often wide ratios such as 3:1 or 16:9. Keep important text away from edges.</p>
          </div>
          <div style={card}>
            <h3>Blog images</h3>
            <p>Often around 1200px wide for good balance between clarity and file size.</p>
          </div>
          <div style={card}>
            <h3>Online forms</h3>
            <p>Follow the exact requirements listed by the portal for pixels, format and file size.</p>
          </div>
          <div style={card}>
            <h3>Profile images</h3>
            <p>Square dimensions such as 512×512 or 1024×1024 are commonly useful.</p>
          </div>
          <div style={card}>
            <h3>Social posts</h3>
            <p>Use the platform’s recommended ratio, such as square, portrait or story format.</p>
          </div>
        </div>

        <h2>Website image optimization workflow</h2>
        <ol style={list}>
          <li>Start with the best original image available.</li>
          <li>Crop the image to the correct layout or aspect ratio.</li>
          <li>Resize it to the required display dimensions.</li>
          <li>Compress it to reduce file size.</li>
          <li>Preview quality after compression.</li>
          <li>Upload it to the website and test page speed visually.</li>
        </ol>

        <h2>Online form image workflow</h2>
        <ol style={list}>
          <li>Read the portal’s exact requirements for size, dimensions and format.</li>
          <li>Resize the image to the required pixel dimensions.</li>
          <li>Compress the image if file size is too large.</li>
          <li>Check that text, face, signature or document details remain clear.</li>
          <li>Upload the final image and keep a copy.</li>
        </ol>

        <h2>Common image problems and fixes</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Image looks stretched</h3>
            <p>The aspect ratio was changed incorrectly. Resize with aspect ratio locked or crop to the correct ratio.</p>
          </div>
          <div style={card}>
            <h3>Image is blurry</h3>
            <p>The image may have been enlarged too much or compressed too heavily.</p>
          </div>
          <div style={card}>
            <h3>File is still too large</h3>
            <p>Resize dimensions first, then compress. Very large dimensions often keep file size high.</p>
          </div>
          <div style={card}>
            <h3>Transparent background is lost</h3>
            <p>JPG does not support transparency. Use PNG or WebP when transparency is needed.</p>
          </div>
          <div style={card}>
            <h3>Text is unreadable</h3>
            <p>Use less compression or larger dimensions when the image contains small text.</p>
          </div>
          <div style={card}>
            <h3>Upload portal rejects file</h3>
            <p>Check file format, dimensions and maximum file size exactly.</p>
          </div>
        </div>

        <h2>Quality tips for ecommerce images</h2>
        <p>
          Product images should load fast but still show important details. For fashion, accessories, electronics, tools
          and home products, details matter. Avoid over-compressing images if fabric texture, labels, colors, buttons or
          product edges need to be visible.
        </p>

        <ul style={list}>
          <li>Use consistent image size across product listings.</li>
          <li>Keep background clean and not distracting.</li>
          <li>Use enough resolution for customers to inspect details.</li>
          <li>Compress images after resizing, not before.</li>
          <li>Check mobile view because most customers browse on phones.</li>
        </ul>

        <h2>Best practices before downloading final images</h2>
        <ul style={list}>
          <li>Keep the original image as backup.</li>
          <li>Use resize before compressing for best file-size reduction.</li>
          <li>Check aspect ratio to avoid distortion.</li>
          <li>Preview compressed images before uploading.</li>
          <li>Use JPG for photos, PNG for transparency and WebP for modern web optimization.</li>
          <li>Do not over-compress important document scans or product details.</li>
        </ul>

        <h2>Final checklist</h2>
        <ul style={list}>
          <li>Know the required image dimensions.</li>
          <li>Resize to the correct width and height.</li>
          <li>Compress to meet file size requirements.</li>
          <li>Choose the correct file format.</li>
          <li>Preview the final image for clarity.</li>
          <li>Test the upload or website display.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Should I resize or compress first?</h3>
            <p>Resize first, then compress. Resizing removes unnecessary pixels before compression.</p>
          </div>
          <div style={card}>
            <h3>Which format is best for photos?</h3>
            <p>JPG is commonly used for photos. WebP is also good for modern web use.</p>
          </div>
          <div style={card}>
            <h3>Why does my image look blurry?</h3>
            <p>It may be enlarged too much or compressed too strongly.</p>
          </div>
          <div style={card}>
            <h3>Can I use these tools for online forms?</h3>
            <p>Yes. Check the form’s required dimensions, format and file size, then resize and compress accordingly.</p>
          </div>
        </div>
      </article>
    </ToolboxLayout>
  );
}

const wrap = { maxWidth: '940px', margin: '0 auto', padding: '50px 20px 90px', color: '#cbd5e1', lineHeight: 1.8 };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.08em' };
const title = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.1 };
const intro = { fontSize: '1.12rem', color: '#e2e8f0' };
const ctaBox = { display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '22px', margin: '30px 0' };
const ctaText = { margin: '6px 0 0', color: '#94a3b8' };
const ctaLinks = { display: 'flex', gap: '10px', flexWrap: 'wrap' };
const cta = { color: '#0f172a', background: '#38bdf8', padding: '12px 16px', borderRadius: '12px', fontWeight: 900, textDecoration: 'none' };
const inlineLink = { color: '#38bdf8', fontWeight: 900 };
const list = { paddingLeft: '24px' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', margin: '20px 0' };
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const tableWrap = { overflowX: 'auto', margin: '20px 0', border: '1px solid #334155', borderRadius: '16px' };
const table = { width: '100%', borderCollapse: 'collapse', minWidth: '680px', background: '#1e293b' };
const th = { textAlign: 'left', padding: '14px', color: '#fff', borderBottom: '1px solid #334155', background: '#0f172a' };
const td = { padding: '14px', borderBottom: '1px solid #334155', verticalAlign: 'top' };

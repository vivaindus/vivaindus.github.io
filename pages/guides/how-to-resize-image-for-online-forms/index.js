import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../../components/ToolboxLayout';
import RelatedTools from '../../../components/RelatedTools';

export default function ResizeImageGuide() {
  return (
    <ToolboxLayout
      title="How to Resize Images for Online Forms"
      description="Learn how to resize images for online forms, job applications, school portals, passport photos, websites and document uploads."
    >
      <main style={pageWrap}>
        <article style={articleCard}>
          <p style={eyebrow}>Image Guide</p>
          <h1 style={title}>How to Resize Images for Online Forms</h1>

          <p style={intro}>
            Many online forms ask for images in a specific size, file type, or file limit. You may need to upload a passport
            photo, ID photo, product image, scanned document, certificate, signature, or profile picture. If the image is too
            large or the dimensions are wrong, the form may reject it.
          </p>

          <div style={ctaBox}>
            <div>
              <h2 style={ctaTitle}>Need to resize an image now?</h2>
              <p style={ctaText}>
                Use SHB ToolBox Image Resizer to resize, crop, convert, and prepare images for online forms, websites,
                social media, school portals, applications, and document uploads.
              </p>
            </div>
            <Link href="/imageresizer" style={primaryBtn}>Open Image Resizer</Link>
          </div>

          <section style={section}>
            <h2 style={h2}>Why online forms reject images</h2>
            <p style={para}>
              Online portals often reject images for simple technical reasons: the image is too large, the width and height
              are incorrect, the file format is not accepted, or the photo is not cropped properly. Some portals require
              exact pixel dimensions, while others only mention a maximum file size such as 100 KB, 200 KB, 500 KB, or 1 MB.
            </p>
            <p style={para}>
              Image resizing changes the width and height. Image compression reduces the file size. Cropping removes unwanted
              parts of the image. For best results, you may need all three: crop first, resize second, and compress last.
            </p>
          </section>

          <section style={section}>
            <h2 style={h2}>Common image requirements</h2>
            <div style={checkGrid}>
              <div style={checkCard}>
                <h3 style={h3}>Passport or visa photo</h3>
                <p style={paraSmall}>Usually needs a clean face crop, plain background, correct ratio, and printable size.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Job application photo</h3>
                <p style={paraSmall}>Often requires JPG format, small file size, and professional crop around the face.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>School or college portal</h3>
                <p style={paraSmall}>May ask for student photo, ID proof, signature, certificate scan, or document image.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Website image</h3>
                <p style={paraSmall}>Needs balanced dimensions and reduced file size so pages load faster.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Product image</h3>
                <p style={paraSmall}>Should be clear, consistent, and resized for store thumbnails, banners, or catalogs.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Signature image</h3>
                <p style={paraSmall}>Needs transparent or clean background, small dimensions, and readable ink lines.</p>
              </div>
            </div>
          </section>

          <section style={section}>
            <h2 style={h2}>Step-by-step: resize an image correctly</h2>
            <ol style={steps}>
              <li>
                <strong>Read the upload requirement.</strong>
                <span>Check required width, height, file type, file size limit, background, and photo ratio.</span>
              </li>
              <li>
                <strong>Upload the original image.</strong>
                <span>Use the clearest version you have. Avoid screenshots if you have the original photo.</span>
              </li>
              <li>
                <strong>Crop the image if needed.</strong>
                <span>Remove extra background and focus on the important subject, such as face, document, product, or signature.</span>
              </li>
              <li>
                <strong>Set width and height.</strong>
                <span>Enter the required pixel dimensions or choose a preset if available.</span>
              </li>
              <li>
                <strong>Choose output format.</strong>
                <span>Use JPG for photos, PNG for transparency, and WebP when the platform supports it.</span>
              </li>
              <li>
                <strong>Compress if the file is still too large.</strong>
                <span>Reduce quality slowly until the file is under the required limit but still clear.</span>
              </li>
              <li>
                <strong>Preview before upload.</strong>
                <span>Open the final file and check sharpness, face crop, document text, and background.</span>
              </li>
            </ol>
          </section>

          <section style={section}>
            <h2 style={h2}>Resize vs crop vs compress</h2>
            <div style={exampleBox}>
              <p><strong>Resize:</strong> changes image width and height, such as 1200×800 to 600×400.</p>
              <p><strong>Crop:</strong> cuts out unwanted areas and changes the visible composition.</p>
              <p><strong>Compress:</strong> reduces file size by optimizing quality or image data.</p>
              <p><strong>Convert:</strong> changes file type, such as PNG to JPG or JPG to WebP.</p>
            </div>
          </section>

          <section style={section}>
            <h2 style={h2}>Common mistakes to avoid</h2>
            <ul style={list}>
              <li>Stretching an image and making faces or documents look distorted.</li>
              <li>Compressing too much until text becomes unreadable.</li>
              <li>Using PNG for large photos when JPG would be smaller.</li>
              <li>Uploading a screenshot instead of the original image.</li>
              <li>Ignoring background requirements for passport or ID photos.</li>
              <li>Changing the file extension manually without actually converting the image.</li>
            </ul>
          </section>

          <section style={section}>
            <h2 style={h2}>FAQ: Resize image online</h2>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I resize an image without installing software?</h3>
              <p style={paraSmall}>
                Yes. SHB ToolBox Image Resizer works in the browser and helps resize images for common online use cases.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Should I resize or compress first?</h3>
              <p style={paraSmall}>
                Usually resize first, then compress if the file size is still too large. Cropping should normally happen before both.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Which format is best for form uploads?</h3>
              <p style={paraSmall}>
                JPG is commonly accepted for photos. PNG is useful for transparency. Always follow the exact portal requirement.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I create passport-size photos?</h3>
              <p style={paraSmall}>
                Yes. Use the Passport Photo Maker for passport, visa, ID, and application-style photo preparation.
              </p>
            </div>
          </section>

          <div style={buttonRow}>
            <Link href="/imageresizer" style={primaryBtn}>Resize Image Now</Link>
            <Link href="/imagecompressor" style={secondaryBtn}>Compress Image</Link>
            <Link href="/passportphoto" style={secondaryBtn}>Passport Photo Maker</Link>
          </div>

          <RelatedTools currentPath="/imageresizer" />
        </article>
      </main>
    </ToolboxLayout>
  );
}

const pageWrap = { maxWidth: '1050px', margin: '0 auto', padding: '60px 20px 90px' };
const articleCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '42px', lineHeight: 1.85 };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.08em' };
const title = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.05, margin: '10px 0 20px' };
const intro = { color: '#cbd5e1', fontSize: '1.12rem', maxWidth: '850px' };
const section = { marginTop: '52px' };
const h2 = { color: '#fff', fontSize: '1.75rem', marginBottom: '14px' };
const h3 = { color: '#38bdf8', fontSize: '1.05rem', margin: '0 0 8px' };
const para = { color: '#cbd5e1', fontSize: '1rem', marginBottom: '16px' };
const paraSmall = { color: '#94a3b8', fontSize: '0.95rem', margin: 0 };
const ctaBox = { marginTop: '30px', display: 'flex', gap: '22px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', background: '#0f172a', border: '1px solid #334155', borderRadius: '22px', padding: '24px' };
const ctaTitle = { color: '#fff', margin: '0 0 8px', fontSize: '1.25rem' };
const ctaText = { color: '#94a3b8', margin: 0, maxWidth: '650px' };
const primaryBtn = { background: '#38bdf8', color: '#0f172a', textDecoration: 'none', padding: '14px 20px', borderRadius: '14px', fontWeight: 900, display: 'inline-block' };
const secondaryBtn = { background: '#0f172a', color: '#fff', textDecoration: 'none', padding: '14px 20px', borderRadius: '14px', fontWeight: 900, display: 'inline-block', border: '1px solid #334155' };
const checkGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '22px' };
const checkCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const steps = { color: '#cbd5e1', display: 'grid', gap: '16px', paddingLeft: '22px' };
const exampleBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '22px', color: '#cbd5e1' };
const list = { color: '#cbd5e1', paddingLeft: '22px' };
const buttonRow = { display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '40px' };
const faqItem = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', marginBottom: '14px' };
const faqQ = { color: '#fff', fontSize: '1rem', margin: '0 0 8px' };

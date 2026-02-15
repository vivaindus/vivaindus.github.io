import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import JSZip from 'jszip';

export default function PDFToImage() {
    const [pdfFile, setPdfFile] = useState(null);
    const [images, setImages] = useState([]);
    const [converting, setConverting] = useState(false);
    const [format, setFormat] = useState('image/png');
    const [pdfjsLib, setPdfjsLib] = useState(null);

    // Load PDF.js only in the browser
    useEffect(() => {
        import('pdfjs-dist/build/pdf').then((pdfjs) => {
            pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
            setPdfjsLib(pdfjs);
        });
    }, []);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setImages([]);
        }
    };

    const convertPDF = async () => {
        if (!pdfFile || !pdfjsLib) return;
        setConverting(true);
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const tempImages = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            tempImages.push({ page: i, url: canvas.toDataURL(format) });
        }
        setImages(tempImages);
        setConverting(false);
    };

    const downloadZip = async () => {
        const zip = new JSZip();
        images.forEach((img, idx) => {
            const data = img.url.replace(/^data:image\/(png|jpeg);base64,/, "");
            zip.file(`page_${idx + 1}.${format === 'image/png' ? 'png' : 'jpg'}`, data, { base64: true });
        });
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "shb_pdf_images.zip";
        link.click();
    };

    return (
        <ToolboxLayout title="PDF to Image" description="Convert PDF to PNG locally.">
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#38bdf8' }}>PDF to Image</h1>
                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '20px', border: '1px solid #334155' }}>
                    <input type="file" accept="application/pdf" onChange={handleUpload} style={{ marginBottom: '20px' }} />
                    {pdfFile && (
                        <button onClick={convertPDF} disabled={converting} style={{ width: '100%', background: '#38bdf8', padding: '15px', borderRadius: '12px', fontWeight: 'bold' }}>
                            {converting ? 'Converting...' : 'Convert to Images'}
                        </button>
                    )}
                    {images.length > 0 && <button onClick={downloadZip} style={{ width: '100%', background: '#34d399', marginTop: '10px', padding: '15px', borderRadius: '12px', fontWeight: 'bold' }}>Download ZIP</button>}
                </div>
            </div>
        </ToolboxLayout>
    );
}
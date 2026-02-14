import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import JSZip from 'jszip';

export default function QRCodeGen() {
    const [input, setInput] = useState('shbstores.com');
    const [color, setColor] = useState('000000');
    const [size, setSize] = useState('300');
    const [type, setType] = useState('standard');

    const lines = input.split('\n').filter(l => l.trim() !== "");

    const getUrl = (data) => {
        let finalData = data;
        if (type === 'wifi') finalData = `WIFI:S:${data};T:WPA;P:password;;`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&color=${color}&data=${encodeURIComponent(finalData)}`;
    };

    const downloadZip = async () => {
        const zip = new JSZip();
        const folder = zip.folder("qr_codes");

        for (let i = 0; i < lines.length; i++) {
            const response = await fetch(getUrl(lines[i]));
            const blob = await response.blob();
            folder.file(`qr_${i + 1}.png`, blob);
        }

        zip.generateAsync({ type: "blob" }).then((content) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "shb_qr_bulk.zip";
            link.click();
        });
    };

    return (
        <ToolboxLayout title="Bulk QR Generator" description="Generate single or bulk QR codes with custom colors.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', textAlign:'center' }}>
                <h1 style={{color:'#38bdf8'}}>Pro QR Generator</h1>
                
                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    <textarea value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Enter one link/text per line for bulk..." style={{ width: '100%', height:'120px', background: '#0f172a', border: '1px solid #334155', padding: '15px', borderRadius: '12px', color: '#fff', marginBottom: '20px' }} />

                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px'}}>
                        <select onChange={(e)=>setType(e.target.value)} style={{background:'#0f172a', color:'#fff', padding:'10px', borderRadius:'10px'}}>
                            <option value="standard">Standard URL/Text</option>
                            <option value="wifi">WiFi Setup</option>
                        </select>
                        <div style={{display:'flex', alignItems:'center', gap:'10px', background:'#0f172a', padding:'5px 10px', borderRadius:'10px'}}>
                            <small>Color:</small>
                            <input type="color" onChange={(e)=>setColor(e.target.value.replace('#',''))} />
                        </div>
                    </div>

                    <div style={{ background: '#fff', padding: '15px', display: 'inline-block', borderRadius: '12px' }}>
                        <img src={getUrl(lines[0] || 'shb')} alt="Preview" style={{ width: '180px' }} />
                        <div style={{color:'#000', fontSize:'0.7rem', marginTop:'5px'}}>Previewing Line 1</div>
                    </div>

                    <button onClick={downloadZip} style={{ display: 'block', width: '100%', marginTop: '20px', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        DOWNLOAD {lines.length > 1 ? `ZIP (${lines.length} CODES)` : 'PNG'}
                    </button>
                </div>
            </div>
        </ToolboxLayout>
    );
}
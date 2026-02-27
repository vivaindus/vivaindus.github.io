export const styles = {
    app: { display: 'flex', background: '#1e293b', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
    
    // Controls Sidebar
    sidebar: { width: '360px', background: '#0f172a', padding: '25px', color: '#fff', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto', borderRight: '1px solid #334155' },
    card: { background: '#1e293b', padding: '15px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '15px' },
    h3: { fontSize: '0.75rem', fontWeight: '800', color: '#38bdf8', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' },
    
    // Paper/Editor
    workspace: { flex: 1, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' },
    paper: { 
        background: '#fff', width: '210mm', minHeight: '297mm', padding: '20mm',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)', borderRadius: '2px', position: 'relative', color: '#000'
    },

    // Inline Inputs (Transparent until hover)
    ghostInp: { border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem', padding: '2px' },
    areaInp: { border: 'none', outline: 'none', background: 'transparent', width: '100%', resize: 'none', minHeight: '50px', fontFamily: 'inherit' },
    
    // Table
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { background: '#f8fafc', padding: '10px', textAlign: 'left', fontSize: '0.7rem', fontWeight: '800', color: '#64748b', borderBottom: '2px solid #000' },
    td: { padding: '10px 8px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' },

    // Buttons
    btn: { padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none', width: '100%', fontSize: '0.85rem' },
    btnPrimary: { background: '#38bdf8', color: '#0f172a' },
    btnReset: { background: 'none', border: '1px solid #f87171', color: '#f87171', marginTop: '10px' },
    
    // Totals Section
    totalRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.9rem' },
    grandRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #000', fontWeight: '900', fontSize: '1.2rem', marginTop: '5px' }
};
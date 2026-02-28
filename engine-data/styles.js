export const styles = {
    app: { display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    sidebar: { width: '420px', background: '#ffffff', padding: '25px', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto', borderRight: '1px solid #e2e8f0', zIndex: 10 },
    workspace: { flex: 1, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' },
    paper: { background: '#fff', width: '210mm', minHeight: '297mm', padding: '18mm', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', position: 'relative', color: '#000', display: 'flex', flexDirection: 'column' },
    
    // UI Panels
    card: { background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '15px' },
    h3: { fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    lCap: { fontSize: '0.7rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' },
    
    // Inputs
    ghostInp: { border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem', color: 'inherit', padding: '4px' },
    areaInp: { border: 'none', outline: 'none', background: 'transparent', width: '100%', resize: 'none', minHeight: '40px', fontFamily: 'inherit' },
    selS: { width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px', color: '#0f172a', borderRadius: '8px', fontSize: '0.85rem' },
    
    // Table
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { background: '#f8fafc', padding: '12px 8px', textAlign: 'left', fontSize: '0.7rem', fontWeight: '800', color: '#64748b', borderBottom: '2px solid #064e3b' },
    td: { padding: '12px 8px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' },
    
    // Buttons
    btn: { padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', border: 'none', transition: '0.2s', width: '100%' },
    btnPrimary: { background: '#064e3b', color: '#fff' },
    btnGold: { background: '#d4af37', color: '#064e3b' },
    btnAction: { background: '#f1f5f9', color: '#475569', padding: '6px 10px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', border: '1px solid #e2e8f0' },
    
    // Totals
    totalBox: { marginTop: '40px', display: 'flex', justifyContent: 'flex-end' },
    tRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', width: '320px' },
    grandRow: { display: 'flex', justifyContent: 'space-between', padding: '15px 12px', borderTop: '2px solid #000', fontWeight: '900', fontSize: '1.4rem', width: '320px', background: '#f8fafc', color: '#064e3b' },
    
    badge: { fontSize: '0.6rem', background: '#000', color: '#fff', padding: '4px 10px', fontWeight: '900', borderRadius: '4px' }
};
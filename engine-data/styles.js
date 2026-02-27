export const styles = {
    app: { display: 'flex', background: '#0f172a', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
    sidebar: { width: '400px', background: '#1e293b', padding: '25px', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto', borderRight: '1px solid #334155' },
    card: { background: '#0f172a', padding: '20px', borderRadius: '15px', border: '1px solid #334155', marginBottom: '15px' },
    h3: { fontSize: '0.8rem', fontWeight: '800', color: '#38bdf8', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' },
    
    workspace: { flex: 1, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' },
    paper: { background: '#fff', width: '210mm', minHeight: '297mm', padding: '20mm', boxShadow: '0 0 50px rgba(0,0,0,0.5)', position: 'relative', color: '#000' },
    
    // Table
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { background: '#f8fafc', padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', borderBottom: '2px solid #000' },
    td: { padding: '12px 8px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' },
    
    // Inputs
    ghostInp: { border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem', color: 'inherit' },
    areaInp: { border: 'none', outline: 'none', background: 'transparent', width: '100%', resize: 'none', minHeight: '50px', fontFamily: 'inherit', fontSize: '0.85rem' },
    
    // Buttons
    btn: { padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none', transition: '0.2s' },
    btnPrimary: { background: '#38bdf8', color: '#0f172a' },
    btnGold: { background: '#d4af37', color: '#064e3b' },
    btnReset: { background: 'none', border: '1px solid #f87171', color: '#f87171' },
    
    // Totals
    totalBox: { marginTop: '40px', display: 'flex', justifyContent: 'flex-end' },
    tRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', width: '300px' },
    grandRow: { display: 'flex', justifyContent: 'space-between', padding: '12px', borderTop: '2px solid #000', fontWeight: '900', fontSize: '1.3rem', width: '300px', background: '#f8fafc' }
};
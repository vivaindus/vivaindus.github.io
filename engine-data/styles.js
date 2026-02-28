export const styles = {
    app: { display: 'flex', background: '#0f172a', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
    sidebar: { width: '420px', background: '#1e293b', padding: '25px', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto', borderRight: '1px solid #334155' },
    workspace: { flex: 1, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    paper: { background: '#fff', width: '210mm', minHeight: '297mm', padding: '20mm', boxShadow: '0 0 50px rgba(0,0,0,0.5)', position: 'relative', color: '#000' },
    
    card: { background: '#0f172a', padding: '20px', borderRadius: '15px', border: '1px solid #334155', marginBottom: '15px' },
    h3: { fontSize: '0.8rem', fontWeight: '800', color: '#38bdf8', marginBottom: '15px', textTransform: 'uppercase' },
    lCap: { fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '5px' },
    
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { background: '#f8fafc', padding: '12px 8px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', borderBottom: '2px solid #000' },
    td: { padding: '12px 8px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' },
    
    ghostInp: { border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem' },
    areaInp: { border: 'none', outline: 'none', background: 'transparent', width: '100%', resize: 'none', minHeight: '40px', fontFamily: 'inherit' },
    
    tRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', width: '300px' },
    grandRow: { display: 'flex', justifyContent: 'space-between', padding: '12px', borderTop: '2px solid #000', fontWeight: '900', fontSize: '1.3rem', width: '300px', background: '#f8fafc' },
    btn: { padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', border: 'none', width: '100%' }
};
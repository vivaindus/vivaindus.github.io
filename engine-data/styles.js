export const styles = {
    app: { display: 'flex', background: '#0f172a', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    sidebar: { width: '420px', background: '#1e293b', padding: '25px', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto', borderRight: '1px solid #334155' },
    workspace: { flex: 1, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    paper: { background: '#fff', width: '210mm', minHeight: '297mm', padding: '15mm', boxShadow: '0 0 50px rgba(0,0,0,0.5)', position: 'relative', color: '#000' },
    card: { background: '#0f172a', padding: '18px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '15px' },
    h3: { fontSize: '0.8rem', fontWeight: '800', color: '#38bdf8', marginBottom: '12px', textTransform: 'uppercase' },
    lCap: { fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' },
    ghostInp: { border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem', color: 'inherit' },
    areaInp: { border: 'none', outline: 'none', background: 'transparent', width: '100%', resize: 'none', fontFamily: 'inherit', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { background: '#f8fafc', padding: '10px 8px', textAlign: 'left', fontSize: '0.7rem', fontWeight: '800', color: '#64748b', borderBottom: '2px solid #000' },
    td: { padding: '10px 8px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' },
    grandRow: { display: 'flex', justifyContent: 'space-between', padding: '12px', borderTop: '2px solid #000', fontWeight: '900', fontSize: '1.3rem', width: '320px', background: '#f8fafc' },
    btn: { padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none', width: '100%', transition: '0.2s' }
};
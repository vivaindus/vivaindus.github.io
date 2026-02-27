export const styles = {
    // Layout
    sidebarArea: { flex: '0 0 360px', display: 'flex', flexDirection: 'column', gap: '20px' },
    panelCard: { background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' },
    paperWrapper: { flex: '1', background: '#334155', padding: '40px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'center', overflowX: 'auto' },
    
    // Typography
    hS: { color: '#38bdf8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px', marginBottom: '15px', display: 'block' },
    lCap: { fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', marginBottom: '6px', display: 'block' },
    
    // Inputs & Selects
    selS: { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', color: '#fff', borderRadius: '10px', fontSize: '0.85rem' },
    inpF: { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' },
    
    // Buttons
    btnMain: { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
    btnSave: { background: '#34d399', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', width: '100%' },
    btnMin: { background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem' },
    actB: { background: '#38bdf8', color: '#0f172a', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', border: 'none' },

    // Paper Specific
    paperS: { background: '#fff', color: '#000', padding: '20mm', width: '210mm', minHeight: '297mm', display: 'flex', flexDirection: 'column' },
    titleI: { fontSize: '2.5rem', fontWeight: '900', border: 'none', width: '100%', outline: 'none' },
    areaI: { width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: '0.9rem', fontFamily: 'inherit' },
    
    // Table
    tableS: { width: '100%', borderCollapse: 'collapse', marginTop: '30px' },
    thS: { background: '#f8fafc', padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textAlign: 'left', textTransform: 'uppercase', borderBottom: '2px solid #000' },
    tdS: { padding: '10px', borderBottom: '1px solid #f1f5f9' },
    rawI: { border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' },

    // Modals
    modalO: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    modalC: { background: '#1e293b', width: '100%', maxWidth: '500px', borderRadius: '20px', padding: '30px', border: '1px solid #334155' },
    
    // Dynamic Column Controls
    colItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#0f172a', borderRadius: '8px', marginBottom: '8px' },
    
    // Totals
    sumR: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' },
    grandR: { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '2px solid #000', fontWeight: '900', fontSize: '1.4rem' },
    toastS: { position: 'fixed', bottom: '30px', right: '30px', background: '#34d399', color: '#0f172a', padding: '16px 32px', borderRadius: '12px', fontWeight: 'bold', zIndex: 100000 }
};
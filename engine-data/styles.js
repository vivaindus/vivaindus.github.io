export const styles = {
    // Sidebar & Cards
    sidebarArea: { flex: 1, minWidth: '340px', display: 'flex', flexDirection: 'column', gap: '15px' },
    panelCard: { background: '#1e293b', padding: '25px', borderRadius: '20px', border: '1px solid #334155', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
    hS: { color: '#38bdf8', fontSize: '0.8rem', textTransform: 'uppercase', margin: '20px 0 10px 0', fontWeight: 'bold', borderBottom: '1px solid #334155', paddingBottom: '5px' },
    lCap: { fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' },
    
    // Inputs
    selS: { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', color: '#fff', borderRadius: '8px', marginBottom: '10px', outline: 'none', fontSize: '0.85rem' },
    clrI: { width: '100%', height: '35px', background: 'none', border: '1px solid #334155', cursor: 'pointer', borderRadius: '4px' },
    inpF: { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '0.75rem' },
    
    // Buttons
    btnMain: { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
    btnSave: { width: '100%', background: '#34d399', color: '#0f172a', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' },
    btnMin: { background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem' },
    actB: { background: '#38bdf8', border: '1px solid #334155', color: '#0f172a', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' },
    btnReset: { width: '100%', background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
    ghB: { background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.7rem', padding: '4px' },
    addB: { width: '100%', padding: '10px', background: '#f8fafc', border: '1px dashed #ccc', color: '#94a3b8', cursor: 'pointer', marginTop: '15px', borderRadius: '8px', fontSize: '0.75rem' },

    // Paper Components
    paperWrapper: { flex: '3', minWidth: '0', background: '#334155', padding: '40px 10px', borderRadius: '15px', display: 'flex', justifyContent: 'center', overflowX: 'auto' },
    paperS: { background: '#fff', color: '#000', padding: '20mm 15mm', display: 'flex', flexDirection: 'column', minHeight: '297mm', boxShadow: '0 0 60px rgba(0,0,0,0.5)', width: '210mm' },
    headerG: { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px' },
    titleI: { fontSize: '2.8rem', fontWeight: '900', textTransform: 'uppercase', width: '100%' },
    areaI: { fontSize: '0.85rem', color: '#475569', height: '60px', width: '100%', resize: 'none' },
    
    // Table
    tableS: { width: '100%', borderCollapse: 'collapse', marginTop: '25px' },
    thS: { textAlign: 'left', padding: '12px 10px', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' },
    tdS: { padding: '12px 10px', borderBottom: '1px solid #f1f5f9' },
    rawI: { fontSize: '0.9rem', width: '100%', border: 'none', outline: 'none', background: 'transparent' },

    // Totals & Footer
    sumR: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' },
    grandR: { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '2px solid #000', fontWeight: 'bold', fontSize: '1.3rem', marginTop: '10px' },
    tagL: { fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '5px' },
    paperF: { marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' },
    urlI: { width: '40%', fontSize: '0.65rem', color: '#94a3b8', fontStyle: 'italic' },
    
    // Notification
    toastS: { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 100000 },
};
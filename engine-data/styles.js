export const styles = {
    container: { display: 'flex', background: '#f0f2f5', minHeight: '100vh', padding: '0' },
    
    // Sidebar with Refrens-style spacing
    sidebar: { width: '380px', background: '#fff', borderRight: '1px solid #e5e7eb', padding: '30px', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto' },
    
    // The Workspace
    workspace: { flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    
    // The Paper (The Magic Piece)
    paper: { 
        background: '#fff', width: '210mm', minHeight: '297mm', padding: '20mm',
        boxShadow: '0 0 40px rgba(0,0,0,0.05)', borderRadius: '8px', position: 'relative'
    },

    // UI Controls
    h3: { fontSize: '0.9rem', fontWeight: '800', color: '#064e3b', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    toggleGroup: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' },
    checkLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#374151', cursor: 'pointer' },
    
    // Table (Refrens Style)
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '30px' },
    th: { background: '#f8fafc', padding: '12px', textAlign: 'left', fontSize: '0.7rem', fontWeight: '800', color: '#64748b', borderBottom: '2px solid #e2e8f0' },
    td: { padding: '12px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' },
    
    // Input Overrides
    inlineInput: { border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem', padding: '4px' },
    
    // Totals Block
    totalsArea: { marginTop: '40px', borderTop: '2px solid #064e3b', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' },
    totalsTable: { width: '300px' },
    totalRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' },
    grandTotal: { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '1px solid #eee', fontWeight: '900', fontSize: '1.2rem', color: '#064e3b' }
};
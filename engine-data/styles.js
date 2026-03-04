export const invoiceStyles = `
  #invoice-root {
    --primary: #2563eb;
    --primary-dark: #1e40af;
    --slate-50: #f8fafc;
    --slate-100: #f1f5f9;
    --slate-200: #e2e8f0;
    --slate-300: #cbd5e1;
    --slate-400: #94a3b8;
    --slate-500: #64748b;
    --slate-600: #475569;
    --slate-700: #334155;
    --slate-800: #1e293b;
    --slate-900: #0f172a;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: var(--slate-900);
  }

  /* GHOST INPUT SYSTEM */
  #invoice-root .ghost-input {
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 8px 12px;
    width: 100%;
    font-size: 0.875rem;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  #invoice-root .ghost-input:hover:not(:disabled) {
    background: rgba(37, 99, 235, 0.04);
    border-color: var(--slate-200);
  }
  #invoice-root .ghost-input:focus {
    background: white;
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  #invoice-root .ghost-input:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }

  /* LAYOUT - SPLIT VIEW */
  #invoice-root .engine-container {
    display: grid;
    grid-template-columns: 1fr 500px;
    height: calc(100vh - 64px);
    overflow: hidden;
  }
  @media (min-width: 1536px) {
    #invoice-root .engine-container { grid-template-columns: 1fr 650px; }
  }

  /* EDITOR SIDE */
  #invoice-root .editor-panel {
    padding: 3rem;
    overflow-y: auto;
    background: #fdfdfd;
    border-right: 1px solid var(--slate-200);
  }

  /* PREVIEW SIDE (A4) */
  #invoice-root .preview-panel {
    background: var(--slate-300);
    padding: 40px;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  /* A4 GEOMETRY ENGINE */
  #invoice-root .a4-paper {
    width: 210mm;
    min-height: 297mm;
    background: white;
    padding: 20mm;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    position: relative;
    box-sizing: border-box;
  }

  /* TABLE DESIGN */
  #invoice-root .line-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 2rem;
  }
  #invoice-root .line-table th {
    text-align: left;
    padding: 12px 8px;
    border-bottom: 2px solid var(--slate-900);
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  #invoice-root .line-table td {
    padding: 16px 8px;
    border-bottom: 1px solid var(--slate-100);
    vertical-align: top;
  }

  /* SAAS UI COMPONENTS */
  #invoice-root .saas-card {
    background: white;
    border-radius: 20px;
    border: 1px solid var(--slate-200);
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  #invoice-root .section-title {
    font-size: 10px;
    font-weight: 900;
    color: var(--slate-400);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 1.5rem;
    display: block;
  }

  /* WATERMARK */
  #invoice-root .watermark-cancelled::after {
    content: "CANCELLED";
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 120px;
    font-weight: 900;
    color: rgba(239, 68, 68, 0.08);
    border: 15px solid rgba(239, 68, 68, 0.08);
    padding: 20px 40px;
    pointer-events: none;
    z-index: 50;
  }

  /* PRINT ENGINE */
  @media print {
    #invoice-root .no-print { display: none !important; }
    #invoice-root .preview-panel { background: white !important; padding: 0 !important; overflow: visible !important; }
    #invoice-root .a4-paper { 
      box-shadow: none !important; 
      margin: 0 !important; 
      width: 210mm !important; 
      height: 297mm !important; 
      padding: 15mm !important;
    }
    body { background: white !important; }
  }
`;
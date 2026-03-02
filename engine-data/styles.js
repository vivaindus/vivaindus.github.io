export const InvoiceStyles = {
  canvas: "bg-slate-50 min-h-screen py-10 flex flex-row gap-6 justify-center no-print px-4",
  sidebar: "w-96 bg-white shadow-xl rounded-2xl p-6 h-[calc(100vh-80px)] sticky top-10 overflow-y-auto border border-slate-200",
  page: "relative w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[15mm] flex flex-col border border-slate-100 a4-page",
  
  // Professional Typography
  h1: "text-5xl font-black text-slate-900 tracking-tighter uppercase italic",
  label: "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1",
  value: "text-sm font-bold text-slate-800",
  
  // Table Styling
  thead: "bg-slate-900 text-white text-[9px] font-black uppercase tracking-tighter",
  cell: "p-3 border-b border-slate-100 text-xs text-slate-700",
  
  // Sections
  metadataGrid: "grid grid-cols-2 gap-8 py-8 border-y border-slate-100 my-8",
  totalsLine: "flex justify-between text-xs py-1",
  grandTotal: "flex justify-between items-center bg-slate-900 text-white p-4 mt-4 rounded-lg shadow-lg",

  // Print Logic
  printCSS: `
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; margin: 0; }
      .a4-page { margin: 0 !important; box-shadow: none !important; border: none !important; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
      .page-number:after { content: counter(page); }
    }
  `
};
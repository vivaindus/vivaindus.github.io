export const InvoiceStyles = {
  // Enterprise A4 Print Logic
  printCSS: `
    @media print {
      body { background: white !important; margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .invoice-container { 
        box-shadow: none !important; 
        margin: 0 !important; 
        width: 100% !important; 
        padding: 0 !important;
      }
      .private-column { display: none !important; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
      .watermark {
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 100px; color: rgba(200, 200, 200, 0.2); pointer-events: none; z-index: 999;
      }
    }
    .a4-page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      margin: 10px auto;
      background: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
  `,

  // Tailwind Class Presets
  canvas: "bg-gray-100 min-h-screen py-10 font-sans antialiased",
  tableHeader: "bg-slate-50 border-y border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600",
  cell: "px-4 py-3 text-sm border-b border-slate-100",
  input: "w-full border-none focus:ring-2 focus:ring-blue-500 rounded p-1 text-sm",
  grandTotal: "text-3xl font-black text-slate-900 mt-4",
  sidebar: "w-80 bg-white border-l border-slate-200 p-6 space-y-6 no-print overflow-y-auto h-screen sticky top-0"
};
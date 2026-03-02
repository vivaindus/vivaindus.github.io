export const InvoiceStyles = {
  // A4 Layout container
  canvas: "bg-slate-900 min-h-screen py-10 flex flex-col items-center no-print",
  page: "relative w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[20mm] flex flex-col",
  
  // Table styles
  tableHead: "bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest",
  tableCell: "border-b border-slate-100 p-3 text-xs",
  
  // Input styles
  inputClean: "border-none p-0 focus:ring-0 w-full bg-transparent",
  inputField: "border border-slate-200 rounded p-2 text-sm focus:border-blue-500 outline-none",
  
  // Totals Section
  grandTotalBox: "border-t-4 border-slate-900 pt-4 mt-4 text-right",
  
  // Utilities
  printOnly: "@media print { .no-print { display: none !important; } }",
  watermark: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-[100px] font-black text-slate-100 pointer-events-none select-none z-0"
};
// pages/invoice-engine/styles.js
export const invoiceStyles = `
  /* General Layout */
  .refrens-layout {
    --primary-color: #2563eb;
    --accent-color: #1e40af;
    --bg-light: #f3f4f6;
    --border-color: #d1d5db;
    --danger-color: #b91c1c;
    --success-color: #15803d;
    --text-color: #111827;
    --text-muted: #6b7280;
    --font-main: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

    background: var(--bg-light);
    min-height: 100vh;
    padding: 2rem;
    font-family: var(--font-main);
    color: var(--text-color);
    display: flex;
    justify-content: center;
    gap: 2rem;
  }

  /* Responsive Grid */
  .grid-container {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 1.5fr); /* Editor left, Preview right */
    gap: 2rem;
    max-width: 1400px;
    width: 100%;
    align-items: start; /* Align top */
  }

  @media (max-width: 1024px) {
    .grid-container {
      grid-template-columns: 1fr; /* Stack on smaller screens */
    }
  }

  /* Shared Card Styling */
  .card {
    background: #ffffff;
    border-radius: 0.5rem;
    padding: 1.25rem;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  }

  /* Invoice Paper (Preview Area) */
  .invoice-paper {
    width: 210mm; /* A4 width */
    min-height: 297mm; /* A4 height */
    padding: 50px;
    margin: 0 auto;
    box-shadow: 0 10px 50px rgba(0,0,0,0.05);
    position: relative;
    background: white;
  }

  /* Input Styling (Refrens look) */
  .r-input, .r-select, .r-textarea {
    border: 1px solid transparent;
    padding: 0.5rem 0.75rem;
    width: 100%;
    border-radius: 0.375rem;
    transition: all 0.2s ease-in-out;
    font-size: 0.85rem;
    font-family: inherit;
    color: var(--text-color);
  }
  .r-input:hover:not(:disabled), .r-select:hover:not(:disabled), .r-textarea:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #e2e8f0;
  }
  .r-input:focus:not(:disabled), .r-select:focus:not(:disabled), .r-textarea:focus:not(:disabled) {
    outline: none;
    border-color: var(--primary-color);
    background: white;
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
  }
  .r-input::placeholder, .r-textarea::placeholder {
    color: var(--text-muted);
  }
  .r-input:disabled, .r-select:disabled, .r-textarea:disabled {
    cursor: not-allowed;
    background-color: #f9fafb;
    color: #6b7280;
    border-color: #e2e8f0;
  }

  /* Buttons */
  .btn {
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 0.375rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }
  .btn-primary { background: var(--primary-color); color: white; }
  .btn-primary:hover:not(:disabled) { background: var(--accent-color); }
  .btn-secondary { background: #eef2f6; color: var(--text-color); border: 1px solid var(--border-color); }
  .btn-secondary:hover:not(:disabled) { background: #e2e8f0; }
  .btn-danger { background: var(--danger-color); color: white; }
  .btn-danger:hover:not(:disabled) { background: #dc2626; }
  .btn-add-line { background: none; border: none; color: var(--primary-color); font-weight: 700; font-size: 0.85rem; cursor: pointer; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.25rem; }
  .btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Headings & Labels */
  .section-heading {
    font-size: 0.9rem;
    font-weight: 700;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
  }
  .input-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    display: block;
    margin-bottom: 0.25rem;
  }

  /* Table Styling */
  .invoice-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    font-size: 0.8rem;
  }
  .invoice-table th, .invoice-table td {
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid #f1f5f9;
    text-align: left;
  }
  .invoice-table th {
    background: #f8fafc;
    font-weight: 700;
    color: #4b5563;
    text-transform: uppercase;
    font-size: 0.7rem;
  }
  .invoice-table tbody tr:last-child td {
    border-bottom: none;
  }

  /* Totals Section */
  .totals-summary {
    width: 280px;
    margin-left: auto;
    margin-top: 2rem;
  }
  .totals-row {
    display: flex;
    justify-content: space-between;
    padding: 0.35rem 0;
    font-size: 0.85rem;
    color: #4b5563;
  }
  .totals-row.grand-total {
    border-top: 2px solid #000;
    padding-top: 1rem;
    margin-top: 0.5rem;
    font-size: 1.25rem;
    font-weight: 900;
    color: #000;
  }

  /* Specific Components */
  .company-logo-placeholder {
    width: 150px;
    height: 80px;
    border: 1px dashed var(--border-color);
    background: #f9fafb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: var(--text-muted);
  }
  .status-tag {
    background: #ecfdf5;
    color: var(--success-color);
    border: 1px solid #d1fae5;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
  }
  .status-tag.draft { background: #fffbeb; color: #d97706; border-color: #fcd34d; }
  .status-tag.cancelled { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

  .column-control-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    border: 1px solid var(--border-color);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
  }
  .column-control-pill.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
  .column-control-pill:hover:not(.active) {
    background: #f1f5f9;
  }

  .field-toggle-btn {
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.75rem;
  }

  /* PDF Visibility Toggle (Eye icon) */
  .pdf-visibility-toggle {
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.4;
    transition: opacity 0.2s ease-in-out;
    padding: 0.2rem;
    margin-left: 0.5rem;
  }
  .pdf-visibility-toggle:hover {
    opacity: 1;
  }
  .pdf-visibility-toggle.hidden-in-pdf {
    color: var(--danger-color); /* Indicate it's hidden */
  }

  /* Print Specific Styling */
  @media print {
    .no-print { display: none !important; }
    .refrens-layout { background: white; padding: 0; }
    .grid-container { grid-template-columns: 1fr; gap: 0; }
    .card { box-shadow: none; border: none; padding: 0; }
    .invoice-paper { box-shadow: none; border: none; margin: 0; width: 100%; height: auto; padding: 15mm; }
    .invoice-paper * { color: #000 !important; } /* Force black text for print */
    .invoice-table th, .invoice-table td { border-color: #e0e0e0; }
    .invoice-table thead { display: table-header-group; } /* Repeats header on new page */
    .private-col-print-hidden { display: none !important; } /* Hides private columns in print */
  }
`;
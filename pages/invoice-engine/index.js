import React, { useState, useMemo, useRef, useEffect } from 'react';
import Decimal from 'decimal.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- FINANCIAL MATH ENGINE ---
class InvoiceEngine {
  constructor(config) {
    this.config = {
      taxInclusive: config.taxInclusive || false,
      roundingMode: config.roundingMode || 'HALF_EVEN',
      precision: 2
    };
  }

  calculate(data) {
    let subtotal = new Decimal(0);
    let totalTax = new Decimal(0);
    let totalLineDiscount = new Decimal(0);
    const taxSummary = {};

    const items = data.items.map(item => {
      const qty = new Decimal(item.qty || 0);
      const rate = new Decimal(item.rate || 0);
      const base = qty.mul(rate);

      // Line Discount
      const disc = new Decimal(item.discount || 0);
      const afterDisc = base.minus(disc);
      totalLineDiscount = totalLineDiscount.plus(disc);

      // Tax Logic
      const taxRate = new Decimal(item.vat || 0).div(100);
      let taxAmt, netAmt;

      if (this.config.taxInclusive) {
        taxAmt = afterDisc.minus(afterDisc.div(taxRate.plus(1)));
        netAmt = afterDisc.minus(taxAmt);
      } else {
        taxAmt = afterDisc.mul(taxRate);
        netAmt = afterDisc;
      }

      const rateKey = (item.vat || 0).toString();
      taxSummary[rateKey] = (taxSummary[rateKey] || new Decimal(0)).plus(taxAmt);

      subtotal = subtotal.plus(netAmt);
      totalTax = totalTax.plus(taxAmt);

      return { ...item, netAmt: netAmt.toNumber(), taxAmt: taxAmt.toNumber(), total: netAmt.plus(taxAmt).toNumber() };
    });

    let runningTotal = subtotal.plus(totalTax);

    // TDS Deduction
    const tdsAmt = runningTotal.mul(new Decimal(data.tdsRate || 0).div(100));
    runningTotal = runningTotal.minus(tdsAmt);

    // Extra Charges & Overall Discount
    const extra = new Decimal(data.extraCharges || 0);
    const overallDisc = new Decimal(data.overallDiscount || 0);
    runningTotal = runningTotal.plus(extra).minus(overallDisc);

    // Rounding
    let grandTotal;
    if (data.manualRounding === 'up') grandTotal = runningTotal.ceil();
    else if (data.manualRounding === 'down') grandTotal = runningTotal.floor();
    else grandTotal = runningTotal.toDecimalPlaces(this.config.precision, Decimal.ROUND_HALF_EVEN);

    return {
      items,
      subtotal: subtotal.toNumber(),
      totalTax: totalTax.toNumber(),
      taxSummary: Object.entries(taxSummary).map(([r, a]) => ({ rate: r, amt: a.toNumber() })),
      totalLineDiscount: totalLineDiscount.toNumber(),
      tdsAmount: tdsAmt.toNumber(),
      extraCharges: extra.toNumber(),
      overallDiscount: overallDisc.toNumber(),
      roundingAdj: grandTotal.minus(runningTotal).toNumber(),
      grandTotal: grandTotal.toNumber()
    };
  }
}

// --- AMOUNT IN WORDS UTILITY ---
const numberToWords = (n, currency) => {
  const amount = Math.floor(n || 0);
  if (amount === 0) return "ZERO ONLY";
  const s =['','ONE ','TWO ','THREE ','FOUR ','FIVE ','SIX ','SEVEN ','EIGHT ','NINE ','TEN ','ELEVEN ','TWELVE ','THIRTEEN ','FOURTEEN ','FIFTEEN ','SIXTEEN ','SEVENTEEN ','EIGHTEEN ','NINETEEN '];
  const t =['', '', 'TWENTY','THIRTY','FORTY','FIFTY','SIXTY','SEVENTY','EIGHTY','NINETY'];
  const num = amount.toString().padStart(9, '0');
  const gn = (idx, label) => {
    const v = parseInt(num.substr(idx, 2));
    if (v === 0) return '';
    return (s[v] || t[num[idx]] + ' ' + s[num[idx+1]]) + label + ' ';
  };
  let res = gn(0, 'CRORE ') + gn(2, 'LAKH ') + gn(4, 'THOUSAND ') + gn(6, 'HUNDRED ');
  const last2 = parseInt(num.substr(7, 2));
  if (last2 > 0) res += (s[last2] || t[num[7]] + ' ' + s[num[8]]);
  return `${currency} ${res.trim()} ONLY`;
};

// --- MAIN REACT COMPONENT ---
export default function UltimateInvoiceGenerator() {
  const previewRef = useRef(null);
  const[logoBase64, setLogoBase64] = useState(null);
  const [data, setData] = useState({
    businessName: "Your Company LLC", businessTRN: "", businessAddress: "", businessContact: "", bankDetails: "",
    clientName: "Client Name", clientTRN: "", clientAddress: "", clientEmail: "",
    invoiceNo: "INV-0001", date: new Date().toISOString().split('T')[0], dueDate: "", 
    currency: "AED", reference: "", paymentTerms: "",
    items:[{ id: Date.now(), name: "", desc: "", qty: 1, rate: 0, vat: 5, discount: 0 }],
    extraCharges: 0, overallDiscount: 0, tdsRate: 0,
    notes: "Thank you for your business.", terms: "Payment due as per terms mentioned above.",
    config: { taxInclusive: false }, manualRounding: null, themeColor: "#2563eb"
  });

  // Calculate live totals
  const totals = useMemo(() => {
    const engine = new InvoiceEngine(data.config);
    return engine.calculate(data);
  }, [data]);

  // Handlers
  const updateField = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const updateItem = (id, field, value) => {
    setData(prev => ({
      ...prev, items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i)
    }));
  };
  const addItem = () => setData(prev => ({ ...prev, items:[...prev.items, { id: Date.now(), name: "", desc: "", qty: 1, rate: 0, vat: 5, discount: 0 }] }));
  const removeItem = (id) => setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoBase64(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const downloadPDF = async () => {
    const canvas = await html2canvas(previewRef.current, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width * ratio, canvas.height * ratio);
    pdf.save(`${data.invoiceNo}.pdf`);
  };

  const generateShareText = () => encodeURIComponent(`Dear ${data.clientName},\n\nPlease find the summary of invoice ${data.invoiceNo} from ${data.businessName}.\nTotal Amount: ${data.currency} ${totals.grandTotal.toFixed(2)}\n\nBest regards,\n${data.businessName}`);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Enterprise VAT Invoice</h1>
            <p className="text-sm text-gray-500 mt-1">Live split-screen editor with financial-grade precision.</p>
          </div>
          <div className="flex gap-2 hidden md:flex">
            <button onClick={downloadPDF} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition">Download PDF</button>
            <a href={`https://wa.me/?text=${generateShareText()}`} target="_blank" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-green-700 transition">WhatsApp</a>
          </div>
        </div>

        {/* --- SPLIT LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: EDITOR */}
          <div className="lg:col-span-7 space-y-6 pb-20">
            
            <Section title="Business Details">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Business Name" value={data.businessName} onChange={e => updateField('businessName', e.target.value)} />
                <Input label="TRN (VAT Number)" value={data.businessTRN} onChange={e => updateField('businessTRN', e.target.value)} />
                <TextArea label="Address" value={data.businessAddress} onChange={e => updateField('businessAddress', e.target.value)} />
                <TextArea label="Contact Info" value={data.businessContact} onChange={e => updateField('businessContact', e.target.value)} />
              </div>
            </Section>

            <Section title="Client Details">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Client Name" value={data.clientName} onChange={e => updateField('clientName', e.target.value)} />
                <Input label="Client TRN" value={data.clientTRN} onChange={e => updateField('clientTRN', e.target.value)} />
                <TextArea label="Client Address" value={data.clientAddress} onChange={e => updateField('clientAddress', e.target.value)} />
                <Input label="Client Email" value={data.clientEmail} onChange={e => updateField('clientEmail', e.target.value)} />
              </div>
            </Section>

            <Section title="Invoice Meta">
              <div className="grid grid-cols-3 gap-4">
                <Input label="Invoice No" value={data.invoiceNo} onChange={e => updateField('invoiceNo', e.target.value)} />
                <Input label="Date" type="date" value={data.date} onChange={e => updateField('date', e.target.value)} />
                <Input label="Due Date" type="date" value={data.dueDate} onChange={e => updateField('dueDate', e.target.value)} />
                <Select label="Currency" value={data.currency} onChange={e => updateField('currency', e.target.value)} options={['AED', 'USD', 'EUR', 'GBP', 'SAR']} />
                <Input label="PO / Reference" value={data.reference} onChange={e => updateField('reference', e.target.value)} />
                <Input label="Payment Terms" value={data.paymentTerms} onChange={e => updateField('paymentTerms', e.target.value)} />
              </div>
            </Section>

            <Section title="Line Items">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left mb-4">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                    <tr>
                      <th className="p-2 w-1/3">Item & Desc</th>
                      <th className="p-2 w-16">Qty</th>
                      <th className="p-2 w-24">Rate</th>
                      <th className="p-2 w-20">Disc Amt</th>
                      <th className="p-2 w-16">VAT %</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">
                          <input className="w-full border rounded p-1 mb-1 font-bold" placeholder="Name" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} />
                          <input className="w-full border rounded p-1 text-xs text-gray-500" placeholder="Description" value={item.desc} onChange={e => updateItem(item.id, 'desc', e.target.value)} />
                        </td>
                        <td className="p-2"><input type="number" className="w-full border rounded p-1 text-center" value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)} /></td>
                        <td className="p-2"><input type="number" className="w-full border rounded p-1 text-right" value={item.rate} onChange={e => updateItem(item.id, 'rate', e.target.value)} /></td>
                        <td className="p-2"><input type="number" className="w-full border rounded p-1 text-right" value={item.discount} onChange={e => updateItem(item.id, 'discount', e.target.value)} /></td>
                        <td className="p-2"><input type="number" className="w-full border rounded p-1 text-center" value={item.vat} onChange={e => updateItem(item.id, 'vat', e.target.value)} /></td>
                        <td className="p-2 text-right">
                          <button onClick={() => removeItem(item.id)} className="text-red-500 font-black hover:bg-red-50 p-1 rounded">X</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={addItem} className="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded hover:bg-blue-100">+ Add Line Item</button>
              </div>
            </Section>

            <Section title="Financial Configuration & Totals">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4 border-r pr-6">
                  <Input label="Extra Charges" type="number" value={data.extraCharges} onChange={e => updateField('extraCharges', e.target.value)} />
                  <Input label="Global Discount (Amount)" type="number" value={data.overallDiscount} onChange={e => updateField('overallDiscount', e.target.value)} />
                  <Input label="TDS Withholding %" type="number" value={data.tdsRate} onChange={e => updateField('tdsRate', e.target.value)} />
                  <label className="flex items-center gap-2 text-sm font-bold bg-gray-50 p-2 rounded border">
                    <input type="checkbox" checked={data.config.taxInclusive} onChange={e => setData(prev => ({...prev, config: {taxInclusive: e.target.checked}}))} />
                    Tax Inclusive Prices
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => updateField('manualRounding', 'up')} className={`flex-1 p-2 border rounded text-xs font-bold ${data.manualRounding === 'up' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Round Up</button>
                    <button onClick={() => updateField('manualRounding', 'down')} className={`flex-1 p-2 border rounded text-xs font-bold ${data.manualRounding === 'down' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Round Down</button>
                    <button onClick={() => updateField('manualRounding', null)} className={`flex-1 p-2 border rounded text-xs font-bold ${!data.manualRounding ? 'bg-gray-800 text-white' : 'bg-white'}`}>Auto</button>
                  </div>
                </div>
                <div className="space-y-4">
                  <Input label="Theme Color" type="color" value={data.themeColor} onChange={e => updateField('themeColor', e.target.value)} />
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Upload Logo</label>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-sm border p-1 rounded bg-white" />
                  </div>
                  <TextArea label="Bank Details" value={data.bankDetails} onChange={e => updateField('bankDetails', e.target.value)} />
                </div>
              </div>
            </Section>

            <Section title="Footer Notes">
              <div className="grid grid-cols-2 gap-4">
                <TextArea label="Invoice Notes" value={data.notes} onChange={e => updateField('notes', e.target.value)} />
                <TextArea label="Terms & Conditions" value={data.terms} onChange={e => updateField('terms', e.target.value)} />
              </div>
            </Section>

            {/* Mobile Action Buttons */}
            <div className="flex flex-col gap-2 md:hidden pt-4">
               <button onClick={downloadPDF} className="bg-blue-600 text-white px-6 py-4 rounded-xl font-bold w-full text-lg shadow-xl">Download PDF</button>
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <div className="bg-white p-3 rounded-t-xl border-b flex justify-between items-center shadow-sm">
                <span className="font-bold text-sm text-gray-600">Live Preview</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">Auto-syncing</span>
              </div>
              
              <div className="overflow-auto shadow-2xl rounded-b-xl border border-gray-200" style={{ maxHeight: 'calc(100vh - 100px)' }}>
                {/* A4 CANVAS */}
                <div ref={previewRef} className="bg-white mx-auto text-gray-800" style={{ width: '210mm', minHeight: '297mm', padding: '15mm', boxSizing: 'border-box' }}>
                  
                  {/* Print Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex-1 pr-4">
                      <h1 style={{ color: data.themeColor }} className="text-3xl font-black uppercase tracking-tight mb-4">Tax Invoice</h1>
                      <div className="text-lg font-bold">{data.businessName || 'Business Name'}</div>
                      <div className="text-xs text-gray-500 whitespace-pre-wrap mt-1">{data.businessAddress}</div>
                      <div className="text-xs text-gray-500 mt-1">{data.businessContact}</div>
                      {data.businessTRN && <div className="text-xs font-bold text-gray-700 mt-1">TRN: {data.businessTRN}</div>}
                    </div>
                    <div className="w-40 text-right">
                      {logoBase64 ? (
                        <img src={logoBase64} alt="Logo" className="max-h-20 ml-auto object-contain" />
                      ) : (
                        <div className="h-16 w-32 ml-auto bg-gray-50 border-2 border-dashed flex items-center justify-center text-[10px] text-gray-400 font-bold">LOGO</div>
                      )}
                      <div className="mt-4 text-xs text-gray-600 text-right space-y-1">
                        <div><span className="font-bold">Invoice No:</span> {data.invoiceNo}</div>
                        <div><span className="font-bold">Date:</span> {data.date}</div>
                        {data.dueDate && <div><span className="font-bold">Due Date:</span> {data.dueDate}</div>}
                        {data.reference && <div><span className="font-bold">PO Ref:</span> {data.reference}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Print Billing */}
                  <div className="flex justify-between mb-8 pb-6 border-b border-gray-100">
                    <div className="w-1/2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Billed To</div>
                      <div className="font-bold text-sm">{data.clientName || 'Client Name'}</div>
                      <div className="text-xs text-gray-500 whitespace-pre-wrap mt-1">{data.clientAddress}</div>
                      <div className="text-xs text-gray-500 mt-1">{data.clientEmail}</div>
                      {data.clientTRN && <div className="text-xs font-bold text-gray-700 mt-1">TRN: {data.clientTRN}</div>}
                    </div>
                    <div className="w-1/3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Payment Details</div>
                      <div className="text-xs text-gray-600"><span className="font-bold">Currency:</span> {data.currency}</div>
                      {data.paymentTerms && <div className="text-xs text-gray-600 mt-1"><span className="font-bold">Terms:</span> {data.paymentTerms}</div>}
                    </div>
                  </div>

                  {/* Print Table */}
                  <table className="w-full text-xs mb-6 border-collapse">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: data.themeColor }}>
                        <th className="py-2 text-left w-2/5 font-bold">Description</th>
                        <th className="py-2 text-center font-bold">Qty</th>
                        <th className="py-2 text-right font-bold">Rate</th>
                        <th className="py-2 text-right font-bold">VAT%</th>
                        <th className="py-2 text-right font-bold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {totals.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3">
                            <div className="font-bold text-gray-800">{item.name}</div>
                            {item.desc && <div className="text-[10px] text-gray-500 mt-1">{item.desc}</div>}
                          </td>
                          <td className="py-3 text-center">{item.qty}</td>
                          <td className="py-3 text-right">{Number(item.rate).toFixed(2)}</td>
                          <td className="py-3 text-right">{item.vat}%</td>
                          <td className="py-3 text-right font-bold">{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Print Totals */}
                  <div className="flex justify-between items-start mb-12">
                    <div className="w-1/2 pr-4">
                       {data.bankDetails && (
                         <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 mb-4 whitespace-pre-wrap border border-gray-100">
                           <span className="font-bold text-gray-800 block mb-1">Bank Details:</span>
                           {data.bankDetails}
                         </div>
                       )}
                    </div>
                    <div className="w-[250px] space-y-2 text-xs">
                      <div className="flex justify-between text-gray-600"><span>Subtotal</span> <span>{totals.subtotal.toFixed(2)}</span></div>
                      {totals.totalLineDiscount > 0 && <div className="flex justify-between text-gray-600"><span>Line Discounts</span> <span>-{totals.totalLineDiscount.toFixed(2)}</span></div>}
                      {totals.taxSummary.map(t => (
                        <div key={t.rate} className="flex justify-between text-gray-600"><span>VAT @ {t.rate}%</span> <span>{t.amt.toFixed(2)}</span></div>
                      ))}
                      {totals.extraCharges > 0 && <div className="flex justify-between text-gray-600"><span>Extra Charges</span> <span>+{totals.extraCharges.toFixed(2)}</span></div>}
                      {totals.overallDiscount > 0 && <div className="flex justify-between text-gray-600"><span>Global Discount</span> <span>-{totals.overallDiscount.toFixed(2)}</span></div>}
                      {totals.tdsAmount > 0 && <div className="flex justify-between text-red-600"><span>TDS Deduction</span> <span>-{totals.tdsAmount.toFixed(2)}</span></div>}
                      {totals.roundingAdj !== 0 && <div className="flex justify-between text-gray-400 italic"><span>Rounding</span> <span>{totals.roundingAdj.toFixed(2)}</span></div>}
                      
                      <div className="flex justify-between items-center pt-3 border-t-2" style={{ borderColor: data.themeColor }}>
                        <span className="font-black text-sm uppercase">Total</span>
                        <span className="font-black text-lg" style={{ color: data.themeColor }}>{data.currency} {totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="text-[9px] text-right font-bold text-gray-400 uppercase tracking-wide mt-1">
                        {numberToWords(totals.grandTotal, data.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Print Footer */}
                  <div className="grid grid-cols-2 gap-8 text-xs text-gray-500 mt-auto pt-8 border-t border-gray-100">
                    <div>
                      {data.notes && <div className="mb-4"><span className="font-bold text-gray-800 block mb-1">Notes:</span><span className="whitespace-pre-wrap">{data.notes}</span></div>}
                      {data.terms && <div><span className="font-bold text-gray-800 block mb-1">Terms & Conditions:</span><span className="whitespace-pre-wrap">{data.terms}</span></div>}
                    </div>
                    <div className="text-right flex flex-col items-end justify-end">
                       <div className="w-40 border-b-2 border-gray-300 mb-2 h-16"></div>
                       <span className="font-bold text-gray-800">Authorized Signatory</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- REUSABLE UI COMPONENTS ---
const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
      <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">{label}</label>
    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition bg-white" {...props} />
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div className="col-span-full md:col-span-1">
    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">{label}</label>
    <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition h-20 resize-none bg-white" {...props} />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">{label}</label>
    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition bg-white" {...props}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);
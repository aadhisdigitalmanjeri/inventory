import React from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck, Phone, Mail, Building, MapPin } from 'lucide-react';

export default function InvoiceModal({ sale, onClose }) {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const salePrice = Number(sale.sale_price) || 0;
  const taxRate = 0.18; // 18% GST example or standard
  const basePrice = Math.round(salePrice / (1 + taxRate));
  const taxAmount = salePrice - basePrice;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Controls (Not printed) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm">Retail Tax Invoice Preview</span>
            <span className="text-xs font-mono bg-slate-800 text-indigo-300 px-2 py-0.5 rounded">
              {sale.invoice_no}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-8 overflow-y-auto bg-white text-slate-900 space-y-6 text-sm">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-950 flex items-center space-x-2">
                <span>AADHIS DIGITAL HUB</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">B2B & B2C Smart Device & Electronics Hub</p>
              <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                <p>Ground Floor, Tech Boulevard, Sector 62</p>
                <p>GSTIN: 07AAECN4810M1Z2 | Support: +91 99990 12345</p>
                <p>Email: billing@aadhisdigitalhub.com</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white text-xs uppercase px-3 py-1 rounded font-bold tracking-wider mb-2">
                ORIGINAL INVOICE
              </span>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-slate-400">Invoice No: </span>
                  <span className="font-bold font-mono text-slate-900">{sale.invoice_no}</span>
                </div>
                <div>
                  <span className="text-slate-400">Date: </span>
                  <span className="font-semibold text-slate-800">{sale.sale_date}</span>
                </div>
                <div>
                  <span className="text-slate-400">Payment: </span>
                  <span className="font-semibold text-indigo-700">{sale.payment_method || 'Paid'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Sourcing Details */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Billed To (Customer):
              </span>
              <p className="font-bold text-base text-slate-900">{sale.sold_to}</p>
              {sale.customer_phone && (
                <p className="text-xs text-slate-600 mt-0.5">Phone: {sale.customer_phone}</p>
              )}
              {sale.customer_email && (
                <p className="text-xs text-slate-600">Email: {sale.customer_email}</p>
              )}
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Origin & Distribution Channel:
              </span>
              <p className="text-xs text-slate-700">
                <span className="font-semibold">Dispatched From: </span>
                {sale.from_source}
              </p>
              <p className="text-xs text-slate-700">
                <span className="font-semibold">Segment: </span>
                B2C Retail Sale
              </p>
              <p className="text-xs text-slate-700">
                <span className="font-semibold">Warranty Period: </span>
                {sale.warranty_months ? `${sale.warranty_months} Months Standard Warranty` : 'Standard'}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-100 text-xs font-bold text-slate-700 uppercase">
                <th className="py-2.5 px-3 border-b border-slate-200">#</th>
                <th className="py-2.5 px-3 border-b border-slate-200">Description & Model</th>
                <th className="py-2.5 px-3 border-b border-slate-200">IMEI / Serial</th>
                <th className="py-2.5 px-3 border-b border-slate-200 text-center">Qty</th>
                <th className="py-2.5 px-3 border-b border-slate-200 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-500">1</td>
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900">{sale.model}</div>
                  <div className="text-[11px] text-slate-500">Handset with certified accessories</div>
                </td>
                <td className="py-3 px-3">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold border border-slate-200">
                    {sale.imei}
                  </span>
                </td>
                <td className="py-3 px-3 text-center font-semibold">1</td>
                <td className="py-3 px-3 text-right font-bold text-slate-900">
                  ₹{salePrice.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Pricing Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount (Excl. GST):</span>
                <span>₹{basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18% Included):</span>
                <span>₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-300 pt-2 flex justify-between font-black text-base text-slate-950">
                <span>Total Amount:</span>
                <span className="text-indigo-600">₹{salePrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Warranty Terms & Verification Stamp */}
          <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 grid grid-cols-2 gap-4">
            <div>
              <span className="font-bold text-slate-700 block mb-1">Warranty & Return Terms</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>Valid against manufacturer defects for {sale.warranty_months || 12} months.</li>
                <li>Physical or liquid damage is strictly excluded.</li>
                <li>Original IMEI sticker/bill required for service claims.</li>
              </ul>
            </div>
            <div className="text-right flex flex-col justify-end items-end">
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <span className="text-[11px] font-bold text-slate-700">Authorized Signatory</span>
              <span className="text-[10px] text-slate-400">Aadhis Digital Hub</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { X, Printer } from 'lucide-react';

export default function InvoiceModal({ sale, onClose }) {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const salePrice = Number(sale.sale_price) || 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
        {/* Modal Controls (Not printed) */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs sm:text-sm">Invoice Preview</span>
            <span className="text-[11px] sm:text-xs font-mono bg-slate-800 text-indigo-300 px-2 py-0.5 rounded">
              {sale.invoice_no}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-xl active:scale-90 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container (Scrollable) */}
        <div id="printable-invoice" className="p-4 sm:p-8 overflow-y-auto bg-white text-slate-900 space-y-5 sm:space-y-6 text-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 flex items-center space-x-2">
                <span>AADHIS DIGITAL HUB</span>
              </div>
              <p className="text-xs text-slate-700 font-bold tracking-wide mt-0.5">
                MOBILES | ACCESSORIES | SALES &amp; SERVICE
              </p>
              <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                <p className="font-medium">Jaseela Junction, Manjeri</p>
                <p className="font-semibold text-slate-800">Phone: 9048504040</p>
              </div>
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
              <span className="inline-block bg-slate-900 text-white text-[10px] sm:text-xs uppercase px-2.5 py-1 rounded font-bold tracking-wider mb-2">
                ORIGINAL INVOICE
              </span>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-slate-400">Invoice: </span>
                  <span className="font-bold font-mono text-slate-900">{sale.invoice_no}</span>
                </div>
                <div>
                  <span className="text-slate-400">Date: </span>
                  <span className="font-semibold text-slate-800">{sale.sale_date}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Billed To (Customer):
            </span>
            <p className="font-bold text-sm sm:text-base text-slate-900">{sale.sold_to}</p>
            {sale.customer_phone && (
              <p className="text-xs text-slate-600 mt-0.5 font-medium">Phone: {sale.customer_phone}</p>
            )}
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden text-xs">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 uppercase">
                  <th className="py-2.5 px-3 border-b border-slate-200">Item</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">IMEI / Serial</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{sale.model}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {sale.imei}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    ₹{salePrice.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pricing Total */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-64 border-t-2 border-slate-900 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-sm text-slate-900">Total Amount:</span>
              <span className="font-black text-lg sm:text-xl text-indigo-700">₹{salePrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


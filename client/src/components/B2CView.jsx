import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Edit2, 
  Trash2, 
  Phone, 
  FileText, 
  TrendingUp, 
  Smartphone,
  User,
  ArrowRight
} from 'lucide-react';

export default function B2CView({ 
  items, 
  onRefresh, 
  onAddNew, 
  onEdit, 
  onDelete, 
  onViewInvoice, 
  searchTerm, 
  setSearchTerm 
}) {
  const [copiedImei, setCopiedImei] = useState(null);

  const handleCopyImei = (imei) => {
    navigator.clipboard.writeText(imei);
    setCopiedImei(imei);
    setTimeout(() => setCopiedImei(null), 2000);
  };

  const handleExportCSV = () => {
    if (!items || items.length === 0) return;
    const headers = ['ID', 'From (Source)', 'Model', 'IMEI', 'Sold To (Customer)', 'Customer Phone', 'Sale Date', 'Sale Price', 'Invoice No'];
    const rows = items.map(s => {
      return [
        s.id,
        `"${(s.from_source || '').replace(/"/g, '""')}"`,
        `"${(s.model || '').replace(/"/g, '""')}"`,
        `'${s.imei}`,
        `"${(s.sold_to || '').replace(/"/g, '""')}"`,
        `"${(s.customer_phone || '').replace(/"/g, '""')}"`,
        s.sale_date,
        s.sale_price,
        `"${(s.invoice_no || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `b2c_sales_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">B2C Retail Sales</h2>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold">
              Segment 2: Retail
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliveries to customers: From (Source), Model, IMEI, and To (Customer).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition shadow-2xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onAddNew}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-md shadow-emerald-100 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record Retail Sale</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Customer, Phone, IMEI, Model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm sm:text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
          Showing <span className="font-bold text-slate-900">{items.length}</span> sales
        </div>
      </div>

      {/* 📱 MOBILE VIEW: Responsive Cards (Visible on screens < 768px) */}
      <div className="block md:hidden space-y-3">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No sales recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">Tap "+ Record Retail Sale" above to log a transaction.</p>
          </div>
        ) : (
          items.map((sale) => {
            const margin = sale.purchase_price !== null && sale.purchase_price !== undefined
              ? (Number(sale.sale_price) - Number(sale.purchase_price))
              : null;
            const marginPercent = margin !== null && Number(sale.purchase_price) > 0
              ? ((margin / Number(sale.purchase_price)) * 100).toFixed(0)
              : null;

            return (
              <div key={sale.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                {/* Header: Model & Sale Price */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm leading-snug">
                      {sale.model}
                    </div>
                    <span className="text-[10px] text-slate-400">Dispatched from: {sale.from_source}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-emerald-700 text-base block">
                      ₹{(Number(sale.sale_price) || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* IMEI Bar */}
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-xs font-bold text-slate-800 truncate">
                      {sale.imei}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyImei(sale.imei)}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600 hover:text-emerald-600 active:scale-90 transition flex items-center space-x-1"
                  >
                    {copiedImei === sale.imei ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Customer Details & Date */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sold To</span>
                    <div className="font-semibold text-slate-900 flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{sale.sold_to}</span>
                    </div>
                    {sale.customer_phone && (
                      <a 
                        href={`tel:${sale.customer_phone}`}
                        className="text-[11px] text-indigo-600 font-medium flex items-center space-x-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{sale.customer_phone}</span>
                      </a>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sale Date</span>
                    <span className="text-xs font-semibold text-slate-800 block mt-0.5">{sale.sale_date}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewInvoice(sale)}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 active:scale-95 transition border border-emerald-200"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Invoice: {sale.invoice_no}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEdit(sale)}
                      title="Edit"
                      className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition active:scale-90"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(sale.id)}
                      title="Delete"
                      className="p-2 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-xl transition active:scale-90"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 💻 DESKTOP VIEW: Clean Table (Visible on screens >= 768px) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">From (Source)</th>
                <th className="py-3 px-4">Device Model</th>
                <th className="py-3 px-4">IMEI / Serial</th>
                <th className="py-3 px-4">To (Customer)</th>
                <th className="py-3 px-4">Sale Date</th>
                <th className="py-3 px-4">Sale Price</th>
                <th className="py-3 px-4 text-center">Invoice</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No B2C sales recorded yet.</p>
                    <p className="text-xs text-slate-400 mt-1">You can sell directly from B2B inventory or click "Record Retail Sale" above.</p>
                  </td>
                </tr>
              ) : (
                items.map((sale) => {
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{sale.from_source}</span>
                        <span className="text-[10px] text-slate-400">Sourced Origin</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {sale.model}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center space-x-1.5 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          <span className="font-mono text-xs font-bold text-slate-800">{sale.imei}</span>
                          <button
                            onClick={() => handleCopyImei(sale.imei)}
                            title="Copy IMEI"
                            className="text-slate-400 hover:text-emerald-600 transition"
                          >
                            {copiedImei === sale.imei ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sale.sold_to}</div>
                        {sale.customer_phone && (
                          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{sale.customer_phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {sale.sale_date}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        ₹{(Number(sale.sale_price) || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onViewInvoice(sale)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                          <Printer className="w-3 h-3" />
                          <span className="font-mono text-[11px]">{sale.invoice_no}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onEdit(sale)}
                            title="Edit"
                            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(sale.id)}
                            title="Delete"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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
  ExternalLink 
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
    const headers = ['ID', 'From (Source)', 'Model', 'IMEI', 'Sold To (Customer)', 'Customer Phone', 'Sale Date', 'Sale Price', 'Cost Price', 'Margin', 'Invoice No', 'Payment Method'];
    const rows = items.map(s => {
      const margin = s.purchase_price ? (s.sale_price - s.purchase_price) : '';
      return [
        s.id,
        `"${(s.from_source || '').replace(/"/g, '""')}"`,
        `"${(s.model || '').replace(/"/g, '""')}"`,
        `'${s.imei}`,
        `"${(s.sold_to || '').replace(/"/g, '""')}"`,
        `"${(s.customer_phone || '').replace(/"/g, '""')}"`,
        s.sale_date,
        s.sale_price,
        s.purchase_price || '',
        margin,
        `"${(s.invoice_no || '').replace(/"/g, '""')}"`,
        `"${(s.payment_method || '').replace(/"/g, '""')}"`
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
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">B2C Retail Sales & Outward Dispatches</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Segment 2: Retail Customer Sales
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Record customer deliveries with From (Stock Source), Model, IMEI, and To (End Customer).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onAddNew}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-md shadow-emerald-100"
          >
            <Plus className="w-4 h-4" />
            <span>Record Direct B2C Sale</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Customer, Phone, IMEI, Model, or Invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{items.length}</span> recorded sales
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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
                <th className="py-3 px-4">Margin / Profit</th>
                <th className="py-3 px-4 text-center">Invoice</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No B2C sales recorded yet.</p>
                    <p className="text-xs text-slate-400 mt-1">You can sell directly from B2B inventory or click "Record Direct B2C Sale" above.</p>
                  </td>
                </tr>
              ) : (
                items.map((sale) => {
                  const margin = sale.purchase_price !== null && sale.purchase_price !== undefined
                    ? (sale.sale_price - sale.purchase_price)
                    : null;
                  const marginPercent = margin !== null && sale.purchase_price > 0
                    ? ((margin / sale.purchase_price) * 100).toFixed(0)
                    : null;

                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/80 transition">
                      {/* From Source */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{sale.from_source}</span>
                        <span className="text-[10px] text-slate-400">Sourced Origin</span>
                      </td>

                      {/* Model */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {sale.model}
                      </td>

                      {/* IMEI */}
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

                      {/* Sold To (Customer) */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sale.sold_to}</div>
                        {sale.customer_phone && (
                          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{sale.customer_phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Sale Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {sale.sale_date}
                      </td>

                      {/* Sale Price */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        ₹{(Number(sale.sale_price) || 0).toLocaleString()}
                        <span className="block text-[10px] font-normal text-slate-400">
                          {sale.payment_method}
                        </span>
                      </td>

                      {/* Gross Profit Margin */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {margin !== null ? (
                          <div>
                            <span className={`font-bold ${margin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              +₹{margin.toLocaleString()}
                            </span>
                            <span className="ml-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1 rounded">
                              {marginPercent}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Direct Retail</span>
                        )}
                      </td>

                      {/* Invoice Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onViewInvoice(sale)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                          <Printer className="w-3 h-3" />
                          <span className="font-mono text-[11px]">{sale.invoice_no}</span>
                        </button>
                      </td>

                      {/* Actions */}
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

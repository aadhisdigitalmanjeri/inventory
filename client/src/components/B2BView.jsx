import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  ArrowRight, 
  Download, 
  Copy, 
  Check, 
  Edit2, 
  Trash2, 
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  Layers,
  Smartphone,
  Tag
} from 'lucide-react';

export default function B2BView({ 
  items, 
  onRefresh, 
  onAddNew, 
  onEdit, 
  onDelete, 
  onTransferToB2C, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter 
}) {
  const [copiedImei, setCopiedImei] = useState(null);

  const handleCopyImei = (imei) => {
    navigator.clipboard.writeText(imei);
    setCopiedImei(imei);
    setTimeout(() => setCopiedImei(null), 2000);
  };

  const handleExportCSV = () => {
    if (!items || items.length === 0) return;
    const headers = ['ID', 'Purchased From', 'Model', 'IMEI', 'Purchase Date', 'Purchase Price', 'Status', 'Invoice No', 'Notes'];
    const rows = items.map(i => [
      i.id,
      `"${(i.purchased_from || '').replace(/"/g, '""')}"`,
      `"${(i.model || '').replace(/"/g, '""')}"`,
      `'${i.imei}`,
      i.purchase_date,
      i.purchase_price,
      i.status,
      `"${(i.invoice_no || '').replace(/"/g, '""')}"`,
      `"${(i.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `b2b_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inStockCount = items.filter(i => i.status === 'In Stock').length;
  const soldCount = items.filter(i => i.status === 'Sold to B2C').length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">B2B Inventory Management</h2>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold">
              Segment 1: Inward
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track inward stock: Purchased From, Model, and IMEI.
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
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-100 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Inward Stock</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Vendor, Model, IMEI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm sm:text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Status Filter Tabs (Scrollable on small devices) */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 text-xs scrollbar-none">
          {['All', 'In Stock', 'Sold to B2C', 'Returned'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition active:scale-95 ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 bg-slate-50 border border-slate-200 sm:border-transparent'
              }`}
            >
              {st}
              {st === 'In Stock' && ` (${inStockCount})`}
              {st === 'Sold to B2C' && ` (${soldCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* 📱 MOBILE VIEW: Responsive Cards (Visible on screens < 768px) */}
      <div className="block md:hidden space-y-3">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No items found.</p>
            <p className="text-xs text-slate-400 mt-1">Tap "+ Add Inward Stock" above to record a device.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              {/* Card Header: Model & Status Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-slate-900 text-sm leading-snug">
                  {item.model}
                </div>
                <span
                  className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'In Stock'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'Sold to B2C'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* IMEI Pill & Copy Button */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-xs font-bold text-slate-800 truncate">
                    {item.imei}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyImei(item.imei)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600 hover:text-indigo-600 active:scale-90 transition flex items-center space-x-1"
                >
                  {copiedImei === item.imei ? (
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

              {/* Details Grid: Vendor, Date, Cost */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Purchased From</span>
                  <span className="font-semibold text-slate-800 truncate block">{item.purchased_from}</span>
                  {item.invoice_no && (
                    <span className="text-[10px] text-slate-500 font-mono">Ref: {item.invoice_no}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cost Price</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{(Number(item.purchase_price) || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{item.purchase_date}</span>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {item.status === 'In Stock' ? (
                  <button
                    onClick={() => onTransferToB2C(item)}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition shadow-sm"
                  >
                    <span>⚡ Sell to B2C Customer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic">Dispatched to retail</span>
                )}

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onEdit(item)}
                    title="Edit"
                    className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition active:scale-90"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    title="Delete"
                    className="p-2 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-xl transition active:scale-90"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 💻 DESKTOP VIEW: Clean Table (Visible on screens >= 768px) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Purchased From (Vendor)</th>
                <th className="py-3 px-4">Device Model</th>
                <th className="py-3 px-4">IMEI / Serial</th>
                <th className="py-3 px-4">Purchase Date</th>
                <th className="py-3 px-4">Cost Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">One-Click Dispatch</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No B2B inventory items match your filter.</p>
                    <p className="text-xs text-slate-400 mt-1">Click "Add Inward Stock" above to record inward stock.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.purchased_from}</div>
                      {item.invoice_no && (
                        <span className="text-[10px] text-slate-500 block font-mono">
                          Ref: {item.invoice_no}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.model}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center space-x-1.5 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        <span className="font-mono text-xs font-bold text-slate-800">{item.imei}</span>
                        <button
                          onClick={() => handleCopyImei(item.imei)}
                          title="Copy IMEI"
                          className="text-slate-400 hover:text-indigo-600 transition"
                        >
                          {copiedImei === item.imei ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {item.purchase_date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      ₹{(Number(item.purchase_price) || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'In Stock'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Sold to B2C'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.status === 'In Stock' ? (
                        <button
                          onClick={() => onTransferToB2C(item)}
                          className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition border border-indigo-200 shadow-2xs"
                        >
                          <span>Sell to B2C</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Dispatched</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onEdit(item)}
                          title="Edit"
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          title="Delete"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

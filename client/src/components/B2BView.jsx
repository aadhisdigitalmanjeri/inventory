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
  Layers
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
      `'${i.imei}`, // leading quote prevents excel exponential formatting
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
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">B2B Inventory Management</h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Segment 1: Inward Bulk Sourcing
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track inward device lots purchased from vendors with exact Model, IMEI/Serial number, and cost.
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
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-100"
          >
            <Plus className="w-4 h-4" />
            <span>Add B2B Purchase</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Vendor, Model, IMEI, or Invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto text-xs">
          {['All', 'In Stock', 'Sold to B2C', 'Returned'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
              {st === 'In Stock' && ` (${inStockCount})`}
              {st === 'Sold to B2C' && ` (${soldCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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
                    <p className="text-xs text-slate-400 mt-1">Click "Add B2B Purchase" above to record inward stock.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    {/* Purchased From */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.purchased_from}</div>
                      {item.invoice_no && (
                        <span className="text-[10px] text-slate-500 block font-mono">
                          Ref: {item.invoice_no}
                        </span>
                      )}
                    </td>

                    {/* Model */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.model}
                    </td>

                    {/* IMEI */}
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

                    {/* Purchase Date */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {item.purchase_date}
                    </td>

                    {/* Purchase Price */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      ₹{(Number(item.purchase_price) || 0).toLocaleString()}
                    </td>

                    {/* Status Badge */}
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

                    {/* One-Click Transfer to B2C */}
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

                    {/* Actions */}
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

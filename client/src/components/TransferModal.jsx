import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, DollarSign, Calendar, User, Phone, FileText, CheckCircle2 } from 'lucide-react';

export default function TransferModal({ item, onClose, onTransferSuccess }) {
  const [formData, setFormData] = useState({
    sold_to: '',
    customer_phone: '',
    sale_date: new Date().toISOString().split('T')[0],
    sale_price: item ? Math.round(item.purchase_price * 1.15) : '',
    payment_method: 'UPI / Bank Transfer',
    warranty_months: 12,
    invoice_no: `INV-B2C-${Date.now().toString().slice(-6)}`,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sold_to || !formData.sale_date || !formData.sale_price) {
      setError('Please provide Customer Name, Sale Date, and Sale Price.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onTransferSuccess(item.id, formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-indigo-500/30 text-indigo-200 text-xs px-2.5 py-0.5 rounded-full font-medium mb-1">
              <span>One-Click Transfer</span>
              <ArrowRight className="w-3 h-3" />
              <span>B2B to B2C</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold">Sell Device to Customer</h3>
            <p className="text-[11px] sm:text-xs text-indigo-200">Dispatch directly from inward B2B stock</p>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white p-2 rounded-xl hover:bg-white/10 active:scale-90 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Info Summary */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shrink-0">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Model</span>
            <span className="font-bold text-slate-800 truncate block">{item.model}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">IMEI</span>
            <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-700 block truncate">
              {item.imei}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Purchased From</span>
            <span className="text-slate-700 font-medium truncate block">{item.purchased_from}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Cost Price</span>
            <span className="text-slate-900 font-bold">₹{purchasePrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name (Sold To) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.sold_to}
                  onChange={(e) => setFormData({ ...formData, sold_to: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Sale Date & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sale Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <input
                  type="date"
                  required
                  value={formData.sale_date}
                  onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

          </div>

          {/* Sale Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sale Price (₹) *
            </label>
            <div className="relative">
              <span className="text-sm font-bold text-slate-500 absolute left-3 top-2.5 sm:top-2">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                className="w-full pl-7 pr-3 py-2 text-base sm:text-sm font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-900"
              />
            </div>
          </div>

          {/* Warranty & Invoice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">


            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warranty (Months)
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <input
                  type="number"
                  min="0"
                  value={formData.warranty_months}
                  onChange={(e) => setFormData({ ...formData, warranty_months: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Number
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <input
                  type="text"
                  value={formData.invoice_no}
                  onChange={(e) => setFormData({ ...formData, invoice_no: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks / Accessories
            </label>
            <input
              type="text"
              placeholder="e.g. Box & charger handed over"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Buttons Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? (
                <span>Transferring...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Sale</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

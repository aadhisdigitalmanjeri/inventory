import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, DollarSign, Calendar, User, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';

export default function TransferModal({ item, onClose, onTransferSuccess }) {
  const [formData, setFormData] = useState({
    sold_to: '',
    customer_phone: '',
    customer_email: '',
    sale_date: new Date().toISOString().split('T')[0],
    sale_price: item ? Math.round(item.purchase_price * 1.15) : '', // suggested 15% margin default
    payment_method: 'UPI / Bank Transfer',
    warranty_months: 12,
    invoice_no: `INV-B2C-${Date.now().toString().slice(-6)}`,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!item) return null;

  const purchasePrice = Number(item.purchase_price) || 0;
  const currentSalePrice = Number(formData.sale_price) || 0;
  const profit = currentSalePrice - purchasePrice;
  const profitPercent = purchasePrice > 0 ? ((profit / purchasePrice) * 100).toFixed(1) : 0;

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-indigo-500/30 text-indigo-200 text-xs px-2.5 py-0.5 rounded-full font-medium mb-1">
              <span>One-Click Transfer</span>
              <ArrowRight className="w-3 h-3" />
              <span>B2B to B2C</span>
            </div>
            <h3 className="text-lg font-bold">Sell Device to End Customer</h3>
            <p className="text-xs text-indigo-200">Dispatch directly from inward B2B stock to consumer invoice</p>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Information Summary Card */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Device / Model</span>
            <span className="font-bold text-slate-800">{item.model}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">IMEI / Serial</span>
            <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-700">
              {item.imei}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Purchased From</span>
            <span className="text-slate-700 font-medium">{item.purchased_from}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Cost Price</span>
            <span className="text-slate-900 font-bold">₹{purchasePrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Transfer Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sold To (Customer Name) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.sold_to}
                  onChange={(e) => setFormData({ ...formData, sold_to: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Customer Email & Sale Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="e.g. customer@example.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sale Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={formData.sale_date}
                  onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Sale Price & Profit Indicator */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-indigo-900 mb-1">
                  Sale Price (₹) *
                </label>
                <div className="relative">
                  <span className="text-sm font-bold text-slate-500 absolute left-3 top-2">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    className="w-full pl-7 pr-3 py-2 text-sm font-bold bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-indigo-950"
                  />
                </div>
              </div>

              {/* Real-time Margin & Profit */}
              <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                <div className="text-xs text-slate-500">Gross Margin & Profit</div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-base font-extrabold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ₹{profit.toLocaleString()}
                  </span>
                  <span className={`text-xs font-bold px-1.5 py-0.2 rounded ${profit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {profitPercent}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Cost: ₹{purchasePrice.toLocaleString()} → Selling: ₹{currentSalePrice.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method, Warranty, Invoice */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="UPI / Bank Transfer">UPI / Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Consumer Finance / EMI">Finance / EMI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warranty (Months)
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0"
                  value={formData.warranty_months}
                  onChange={(e) => setFormData({ ...formData, warranty_months: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Number
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.invoice_no}
                  onChange={(e) => setFormData({ ...formData, invoice_no: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks / Accessories Included
            </label>
            <input
              type="text"
              placeholder="e.g. Box & charger handed over, screen guard applied"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? (
                <span>Transferring...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Sale & Transfer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

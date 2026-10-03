import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Smartphone, Hash, Calendar, DollarSign, User, Phone, Mail, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function B2CModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    from_source: '',
    model: '',
    imei: '',
    sold_to: '',
    customer_phone: '',
    customer_email: '',
    sale_date: new Date().toISOString().split('T')[0],
    sale_price: '',
    payment_method: 'UPI / Bank Transfer',
    warranty_months: 12,
    invoice_no: `INV-B2C-${Date.now().toString().slice(-6)}`,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        from_source: initialData.from_source || '',
        model: initialData.model || '',
        imei: initialData.imei || '',
        sold_to: initialData.sold_to || '',
        customer_phone: initialData.customer_phone || '',
        customer_email: initialData.customer_email || '',
        sale_date: initialData.sale_date || new Date().toISOString().split('T')[0],
        sale_price: initialData.sale_price || '',
        payment_method: initialData.payment_method || 'UPI / Bank Transfer',
        warranty_months: initialData.warranty_months !== undefined ? initialData.warranty_months : 12,
        invoice_no: initialData.invoice_no || `INV-B2C-${Date.now().toString().slice(-6)}`,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        from_source: '',
        model: '',
        imei: '',
        sold_to: '',
        customer_phone: '',
        customer_email: '',
        sale_date: new Date().toISOString().split('T')[0],
        sale_price: '',
        payment_method: 'UPI / Bank Transfer',
        warranty_months: 12,
        invoice_no: `INV-B2C-${Date.now().toString().slice(-6)}`,
        notes: '',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.from_source || !formData.model || !formData.imei || !formData.sold_to || !formData.sale_date) {
      setError('Please fill in Source (From), Model, IMEI, Customer Name (To), and Sale Date.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base">
              {initialData ? 'Edit B2C Sale Record' : 'Record Direct B2C Retail Sale'}
            </h3>
          </div>
          <button onClick={onClose} className="text-emerald-300 hover:text-white p-2 rounded-xl active:scale-90 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Segment Fields: From (Source) & Sold To (Customer) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                From (Source / Vendor / Branch) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Stock, Main Warehouse"
                value={formData.from_source}
                onChange={(e) => setFormData({ ...formData, from_source: e.target.value })}
                className="w-full px-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                To (Customer Name) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={formData.sold_to}
                  onChange={(e) => setFormData({ ...formData, sold_to: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Model & IMEI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Device Model *
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 15 Pro 128GB"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                IMEI / Serial Number *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 359284102948172"
                  value={formData.imei}
                  onChange={(e) => setFormData({ ...formData, imei: e.target.value.trim() })}
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Customer Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <input
                  type="email"
                  placeholder="e.g. priya@example.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sale Price (₹)
              </label>
              <div className="relative">
                <span className="text-sm font-bold text-slate-400 absolute left-3 top-2.5 sm:top-2">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 text-base sm:text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
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
                className="w-full px-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
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
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <input
                  type="number"
                  min="0"
                  value={formData.warranty_months}
                  onChange={(e) => setFormData({ ...formData, warranty_months: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Screen guard installed"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
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
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl transition shadow-md shadow-emerald-200 disabled:opacity-50"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{initialData ? 'Update Record' : 'Record Sale'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

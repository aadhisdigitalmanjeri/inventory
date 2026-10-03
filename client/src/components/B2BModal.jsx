import React, { useState, useEffect } from 'react';
import { X, Building2, Smartphone, Hash, Calendar, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

export default function B2BModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    purchased_from: '',
    model: '',
    imei: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: '',
    status: 'In Stock',
    invoice_no: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        purchased_from: initialData.purchased_from || '',
        model: initialData.model || '',
        imei: initialData.imei || '',
        purchase_date: initialData.purchase_date || new Date().toISOString().split('T')[0],
        purchase_price: initialData.purchase_price || '',
        status: initialData.status || 'In Stock',
        invoice_no: initialData.invoice_no || '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        purchased_from: '',
        model: '',
        imei: '',
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_price: '',
        status: 'In Stock',
        invoice_no: '',
        notes: '',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.purchased_from || !formData.model || !formData.imei || !formData.purchase_date) {
      setError('Please fill in Purchased From, Model, IMEI, and Purchase Date.');
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
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm sm:text-base">
              {initialData ? 'Edit B2B Stock Item' : 'New B2B Inward Purchase'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl active:scale-90 transition">
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

          {/* Purchased From */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Purchased From (Vendor / Wholesaler) *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g. Apex Distributors Ltd"
                value={formData.purchased_from}
                onChange={(e) => setFormData({ ...formData, purchased_from: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Device Model & Specs *
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g. iPhone 15 Pro 128GB"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* IMEI / Serial */}
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
                className="w-full pl-9 pr-3 py-2 text-base sm:text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Purchase Date & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchase Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <input
                  type="date"
                  required
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost Price (₹)
              </label>
              <div className="relative">
                <span className="text-sm font-bold text-slate-400 absolute left-3 top-2.5 sm:top-2">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Status & Vendor Invoice No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="In Stock">In Stock (Available)</option>
                <option value="Sold to B2C">Sold to B2C</option>
                <option value="Returned">Returned / RMA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor Bill / Invoice Ref
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. APX-9821"
                  value={formData.invoice_no}
                  onChange={(e) => setFormData({ ...formData, invoice_no: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Sealed box, batch 1 lot"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{initialData ? 'Update Item' : 'Add Stock'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

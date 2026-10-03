import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Smartphone, 
  Building2, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  FileText,
  Printer
} from 'lucide-react';
import { api } from '../services/api';

export default function ImeiTrackerView({ 
  initialImei = '', 
  onTransferItem, 
  onViewInvoice 
}) {
  const [searchImei, setSearchImei] = useState(initialImei);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialImei) {
      setSearchImei(initialImei);
      performSearch(initialImei);
    }
  }, [initialImei]);

  const performSearch = async (imeiToSearch) => {
    if (!imeiToSearch || !imeiToSearch.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.lookupImei(imeiToSearch.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'IMEI not found in inventory');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchImei);
  };

  const sampleImeis = [
    { imei: '359284102948172', label: 'Sold Device (B2B → B2C)' },
    { imei: '354928109384721', label: 'In Stock Device' },
    { imei: '862093849102834', label: 'OnePlus 12 (In Stock)' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto py-2 sm:py-4">
      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs text-center space-y-3 sm:space-y-4">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Search className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Device IMEI Lifecycle Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Track end-to-end chain of custody: procurement vendor, warehouse status, and customer delivery.
          </p>
        </div>

        {/* Input Field */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-1">
            <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 sm:top-3" />
            <input
              type="text"
              placeholder="Enter 15-digit IMEI..."
              value={searchImei}
              onChange={(e) => setSearchImei(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-base sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track Device'}
          </button>
        </form>

        {/* Sample Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium w-full sm:w-auto mb-1 sm:mb-0">Quick test:</span>
          {sampleImeis.map((s) => (
            <button
              key={s.imei}
              type="button"
              onClick={() => {
                setSearchImei(s.imei);
                performSearch(s.imei);
              }}
              className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-mono transition border border-slate-200"
            >
              {s.imei}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <span className="font-bold block">No Record Found</span>
            <p className="text-xs text-rose-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Lifecycle Result View */}
      {result && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in zoom-in-98 duration-200">
          {/* Status Header Badge */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Device Status</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  result.status.includes('Sold')
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {result.status}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{result.model}</h3>
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                IMEI: <strong className="text-slate-800">{result.imei}</strong>
              </div>
            </div>
          </div>

          {/* Timeline Visual Cards */}
          <div className="relative border-l-2 border-indigo-200 ml-4 sm:ml-6 pl-5 sm:pl-8 space-y-6 sm:space-y-8">
            {/* Step 1: B2B Sourcing */}
            <div className="relative">
              <div className="absolute -left-[31px] sm:-left-[43px] top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-md border border-indigo-100">
                      Step 1 • Inward Sourcing
                    </span>
                    <span className="text-xs text-slate-400">B2B</span>
                  </div>
                  {result.b2b && (
                    <span className="text-xs text-slate-500 font-medium">
                      Date: <strong className="text-slate-700">{result.b2b.purchase_date}</strong>
                    </span>
                  )}
                </div>

                {result.b2b ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Purchased From</span>
                      <span className="font-bold text-slate-900 text-sm truncate block">{result.b2b.purchased_from}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Cost Price</span>
                      <span className="font-bold text-slate-900 text-sm">
                        ₹{(Number(result.b2b.purchase_price) || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Vendor Invoice #</span>
                      <span className="font-mono font-bold text-slate-700 text-sm">
                        {result.b2b.invoice_no || 'N/A'}
                      </span>
                    </div>
                    {result.b2b.notes && (
                      <div className="sm:col-span-3 text-[11px] text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                        <strong>Notes: </strong>{result.b2b.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    This unit was entered directly into retail sales without an existing B2B procurement record.
                  </p>
                )}

                {/* If still In Stock, show one-click transfer button right here */}
                {result.b2b && result.b2b.status === 'In Stock' && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100">
                    <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Ready in stock for customer dispatch</span>
                    </span>
                    <button
                      onClick={() => onTransferItem(result.b2b)}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition"
                    >
                      <span>⚡ Sell to B2C Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: B2C Fulfillment */}
            <div className="relative">
              <div className={`absolute -left-[31px] sm:-left-[43px] top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white flex items-center justify-center shadow-md ${
                result.b2c ? 'bg-emerald-600' : 'bg-slate-300'
              }`}>
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                      result.b2c
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      Step 2 • Outward Retail Sale
                    </span>
                    <span className="text-xs text-slate-400">B2C</span>
                  </div>
                  {result.b2c && (
                    <span className="text-xs text-slate-500 font-medium">
                      Date: <strong className="text-slate-700">{result.b2c.sale_date}</strong>
                    </span>
                  )}
                </div>

                {result.b2c ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Sold To</span>
                        <span className="font-bold text-slate-900 text-sm truncate block">{result.b2c.sold_to}</span>
                        {result.b2c.customer_phone && (
                          <span className="text-[11px] text-slate-500 block">{result.b2c.customer_phone}</span>
                        )}
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Sale Price</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          ₹{(Number(result.b2c.sale_price) || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Retail Invoice</span>
                        <span className="font-mono font-bold text-slate-700 text-sm">
                          {result.b2c.invoice_no}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Warranty: {result.b2c.warranty_months} Mo
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        Dispatched from: <strong className="text-slate-700">{result.b2c.from_source}</strong>
                      </span>
                      <button
                        onClick={() => onViewInvoice(result.b2c)}
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 border border-emerald-200 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Invoice</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-3 text-center text-slate-400 text-xs">
                    <p className="font-medium text-slate-600">Not yet sold to a B2C customer.</p>
                    <p className="mt-0.5 text-slate-400">Device is currently in stock ready for transfer.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

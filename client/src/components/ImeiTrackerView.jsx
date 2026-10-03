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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Search className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Device IMEI Lifecycle Tracker
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Search any IMEI or Serial number to track complete chain of custody: procurement vendor, storage status, and retail customer delivery.
          </p>
        </div>

        {/* Input Field */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Enter 15-digit IMEI number (e.g. 359284102948172)..."
              value={searchImei}
              onChange={(e) => setSearchImei(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track Device'}
          </button>
        </form>

        {/* Sample Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
          <span className="text-slate-400 font-medium">Quick examples:</span>
          {sampleImeis.map((s) => (
            <button
              key={s.imei}
              type="button"
              onClick={() => {
                setSearchImei(s.imei);
                performSearch(s.imei);
              }}
              className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-mono transition border border-slate-200"
            >
              {s.imei} ({s.label})
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <span className="font-bold block">No Record Found</span>
            <p className="text-xs text-rose-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Lifecycle Result View */}
      {result && (
        <div className="space-y-6 animate-in fade-in zoom-in-98 duration-200">
          {/* Status Header Badge */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Device Model</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  result.status.includes('Sold')
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {result.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{result.model}</h3>
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                IMEI: <strong className="text-slate-800">{result.imei}</strong>
              </div>
            </div>

            {/* Profit Margin if Sold */}
            {result.margin !== null && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-right">
                <span className="text-xs text-emerald-700 font-semibold block">Realized Profit Margin</span>
                <div className="flex items-baseline space-x-1.5 justify-end mt-0.5">
                  <span className="text-lg font-extrabold text-emerald-800">
                    +₹{result.margin.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold bg-emerald-200/60 text-emerald-900 px-1.5 py-0.5 rounded">
                    {result.marginPercent}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Visual Cards */}
          <div className="relative border-l-2 border-indigo-200 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
            {/* Step 1: B2B Sourcing */}
            <div className="relative">
              <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Building2 className="w-4 h-4" />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-md border border-indigo-100">
                      Step 1 • Inward B2B Sourcing
                    </span>
                    <span className="text-xs text-slate-400">Procurement</span>
                  </div>
                  {result.b2b && (
                    <span className="text-xs text-slate-500 font-medium">
                      Date: <strong className="text-slate-700">{result.b2b.purchase_date}</strong>
                    </span>
                  )}
                </div>

                {result.b2b ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Purchased From</span>
                      <span className="font-bold text-slate-900 text-sm">{result.b2b.purchased_from}</span>
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
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready in warehouse for customer dispatch</span>
                    </span>
                    <button
                      onClick={() => onTransferItem(result.b2b)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                      <span>Sell to B2C Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: B2C Fulfillment */}
            <div className="relative">
              <div className={`absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full text-white flex items-center justify-center shadow-md ${
                result.b2c ? 'bg-emerald-600' : 'bg-slate-300'
              }`}>
                <ShoppingBag className="w-4 h-4" />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                      result.b2c
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      Step 2 • Outward B2C Fulfillment
                    </span>
                    <span className="text-xs text-slate-400">Retail Sale</span>
                  </div>
                  {result.b2c && (
                    <span className="text-xs text-slate-500 font-medium">
                      Sale Date: <strong className="text-slate-700">{result.b2c.sale_date}</strong>
                    </span>
                  )}
                </div>

                {result.b2c ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Sold To (Customer)</span>
                        <span className="font-bold text-slate-900 text-sm">{result.b2c.sold_to}</span>
                        {result.b2c.customer_phone && (
                          <span className="text-[11px] text-slate-500 block">{result.b2c.customer_phone}</span>
                        )}
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Sale Price</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          ₹{(Number(result.b2c.sale_price) || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{result.b2c.payment_method}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Retail Invoice</span>
                        <span className="font-mono font-bold text-slate-700 text-sm">
                          {result.b2c.invoice_no}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Warranty: {result.b2c.warranty_months} Months
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        Dispatched from: <strong className="text-slate-700">{result.b2c.from_source}</strong>
                      </span>
                      <button
                        onClick={() => onViewInvoice(result.b2c)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Customer Invoice</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-slate-400 text-xs">
                    <p className="font-medium text-slate-600">Device has not yet been sold to a B2C customer.</p>
                    <p className="mt-0.5 text-slate-400">It is currently resting in B2B stock ready for transfer.</p>
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

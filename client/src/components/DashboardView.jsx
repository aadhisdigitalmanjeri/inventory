import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  Building2, 
  ShoppingBag, 
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export default function DashboardView({ 
  onNavigate, 
  onOpenTransfer, 
  onOpenNewB2B, 
  onOpenNewB2C, 
  onSearchImei 
}) {
  const [quickImei, setQuickImei] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (imeiToLookup) => {
    const imei = (imeiToLookup || quickImei).trim();
    if (!imei) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.lookupImei(imei);
      setSearchResult(data);
    } catch (err) {
      setError(err.message || 'IMEI not found in inventory records');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(quickImei);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Centered Clean Instant Device IMEI Lookup */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs text-center space-y-5">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Search className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Instant Device IMEI Lookup
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Search any IMEI or Serial number to instantly verify vendor sourcing, current warehouse status, and customer dispatch details.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex gap-2 pt-2">
          <div className="relative flex-1">
            <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Enter 15-digit IMEI or Serial Number..."
              value={quickImei}
              onChange={(e) => setQuickImei(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-100 flex items-center space-x-1.5 disabled:opacity-50"
          >
            <span>{loading ? 'Searching...' : 'Search IMEI'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Sample Quick IMEIs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Quick Test IMEIs:</span>
          <button
            type="button"
            onClick={() => {
              setQuickImei('359284102948172');
              handleSearch('359284102948172');
            }}
            className="font-mono bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-xs transition"
          >
            359284102948172 (Sold)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuickImei('354928109384721');
              handleSearch('354928109384721');
            }}
            className="font-mono bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-xs transition"
          >
            354928109384721 (In Stock)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuickImei('862093849102834');
              handleSearch('862093849102834');
            }}
            className="font-mono bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-xs transition"
          >
            862093849102834 (In Stock)
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          onClick={() => onNavigate('b2b')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition cursor-pointer flex items-center space-x-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition flex items-center justify-between">
              <span>B2B Inventory Management</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Purchased From, Model, IMEI & Inward Stock
            </p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('b2c')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition cursor-pointer flex items-center space-x-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition flex items-center justify-between">
              <span>B2C Sales Management</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              From, Model, IMEI, Sold To & Customer Invoices
            </p>
          </div>
        </div>
      </div>

      {/* Error Feedback */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* Instant Search Result Card */}
      {searchResult && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 animate-in fade-in zoom-in-98 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Device Status</div>
              <h3 className="text-base font-bold text-slate-900">{searchResult.model}</h3>
              <div className="text-xs font-mono text-slate-500">IMEI: {searchResult.imei}</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              searchResult.status.includes('Sold')
                ? 'bg-purple-100 text-purple-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {searchResult.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* B2B Sourcing Box */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 border border-slate-100">
              <span className="font-bold text-slate-700 block text-xs">B2B Procurement (Inward)</span>
              {searchResult.b2b ? (
                <>
                  <div className="text-slate-600">
                    <span className="text-slate-400">Purchased From: </span>
                    <strong className="text-slate-900">{searchResult.b2b.purchased_from}</strong>
                  </div>
                  <div className="text-slate-600">
                    <span className="text-slate-400">Date: </span>
                    <span>{searchResult.b2b.purchase_date}</span>
                  </div>
                  <div className="text-slate-600">
                    <span className="text-slate-400">Cost: </span>
                    <strong className="text-slate-900">₹{(Number(searchResult.b2b.purchase_price) || 0).toLocaleString()}</strong>
                  </div>
                  {searchResult.b2b.status === 'In Stock' && (
                    <div className="pt-2">
                      <button
                        onClick={() => onOpenTransfer(searchResult.b2b)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                      >
                        Sell to B2C Now →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-400 italic">No inward B2B procurement record linked.</div>
              )}
            </div>

            {/* B2C Sales Box */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 border border-slate-100">
              <span className="font-bold text-slate-700 block text-xs">B2C Retail Sale (Outward)</span>
              {searchResult.b2c ? (
                <>
                  <div className="text-slate-600">
                    <span className="text-slate-400">Sold To: </span>
                    <strong className="text-slate-900">{searchResult.b2c.sold_to}</strong>
                  </div>
                  <div className="text-slate-600">
                    <span className="text-slate-400">Date: </span>
                    <span>{searchResult.b2c.sale_date}</span>
                  </div>
                  <div className="text-slate-600">
                    <span className="text-slate-400">Sale Price: </span>
                    <strong className="text-emerald-700">₹{(Number(searchResult.b2c.sale_price) || 0).toLocaleString()}</strong>
                  </div>
                  <div className="text-slate-600">
                    <span className="text-slate-400">Invoice: </span>
                    <span className="font-mono">{searchResult.b2c.invoice_no}</span>
                  </div>
                </>
              ) : (
                <div className="text-slate-400 italic">Device is currently in stock (Not yet sold to B2C).</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

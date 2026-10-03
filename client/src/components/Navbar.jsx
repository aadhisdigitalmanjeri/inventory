import React from 'react';
import { LayoutDashboard, Building2, ShoppingBag, Search, Plus, Layers } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenNewB2B, onOpenNewB2C }) {
  const navItems = [
    { id: 'dashboard', label: 'Lookup', icon: LayoutDashboard },
    { id: 'b2b', label: 'B2B Stock', icon: Building2 },
    { id: 'b2c', label: 'B2C Sales', icon: ShoppingBag },
    { id: 'imei', label: 'IMEI Track', icon: Search },
  ];

  return (
    <>
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Brand */}
            <div 
              className="flex items-center space-x-2.5 cursor-pointer active:scale-95 transition" 
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight truncate">
                    Aadhis Digital Hub
                  </span>
                  <span className="hidden sm:inline-block bg-indigo-50 text-indigo-700 text-[11px] px-2 py-0.5 rounded-full font-semibold border border-indigo-100">
                    B2B & B2C
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Two-Segment Stock & Device Manager</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.id === 'dashboard' ? 'Dashboard' : item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                onClick={onOpenNewB2B}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition shadow-2xs"
                title="Add B2B Inward Stock"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Add</span>
                <span>B2B</span>
              </button>
              <button
                onClick={onOpenNewB2C}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition shadow-2xs"
                title="Add B2C Retail Sale"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Add</span>
                <span>B2C</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Bottom Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 shadow-lg shadow-slate-900/10">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition active:scale-90 ${
                  isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-lg transition ${isActive ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

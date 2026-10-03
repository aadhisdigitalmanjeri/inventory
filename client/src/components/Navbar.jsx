import React from 'react';
import { LayoutDashboard, Building2, ShoppingBag, Search, Plus, Layers } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenNewB2B, onOpenNewB2C }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'b2b', label: 'B2B Inventory', icon: Building2, badge: 'Procurement' },
    { id: 'b2c', label: 'B2C Sales', icon: ShoppingBag, badge: 'Retail' },
    { id: 'imei', label: 'IMEI Lifecycle Tracker', icon: Search, badge: 'Track' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Aadhis Digital Hub</span>
                <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold border border-indigo-100">
                  B2B & B2C
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Two-Segment Stock & Device IMEI Manager</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenNewB2B}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add B2B</span>
            </button>
            <button
              onClick={onOpenNewB2C}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add B2C</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs */}
      <div className="md:hidden flex border-t border-slate-100 overflow-x-auto px-2 py-1.5 bg-slate-50/50 space-x-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}

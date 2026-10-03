import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import B2BView from './components/B2BView';
import B2CView from './components/B2CView';
import ImeiTrackerView from './components/ImeiTrackerView';
import TransferModal from './components/TransferModal';
import InvoiceModal from './components/InvoiceModal';
import B2BModal from './components/B2BModal';
import B2CModal from './components/B2CModal';
import { api } from './services/api';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [b2bItems, setB2bItems] = useState([]);
  const [b2cItems, setB2cItems] = useState([]);

  // Filters & Search
  const [searchTermB2B, setSearchTermB2B] = useState('');
  const [statusFilterB2B, setStatusFilterB2B] = useState('All');
  const [searchTermB2C, setSearchTermB2C] = useState('');
  const [trackerImei, setTrackerImei] = useState('');

  // Modals
  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
  const [editingB2B, setEditingB2B] = useState(null);

  const [isB2CModalOpen, setIsB2CModalOpen] = useState(false);
  const [editingB2C, setEditingB2C] = useState(null);

  const [transferItem, setTransferItem] = useState(null);
  const [invoiceSale, setInvoiceSale] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch all core data
  const loadData = async () => {
    try {
      const [statsData, b2bData, b2cData] = await Promise.all([
        api.getStats(),
        api.getB2B(searchTermB2B, statusFilterB2B),
        api.getB2C(searchTermB2C)
      ]);
      setStats(statsData);
      setB2bItems(b2bData);
      setB2cItems(b2cData);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTermB2B, statusFilterB2B, searchTermB2C]);

  // B2B Actions (Optimistic & Instant)
  const handleSaveB2B = async (formData) => {
    if (editingB2B) {
      // Optimistic update
      const updatedItem = { ...editingB2B, ...formData };
      setB2bItems(prev => prev.map(item => item.id === editingB2B.id ? updatedItem : item));
      showToast('B2B item updated successfully!');
      try {
        const saved = await api.updateB2B(editingB2B.id, formData);
        setB2bItems(prev => prev.map(item => item.id === editingB2B.id ? saved : item));
        api.getStats().then(setStats).catch(console.error);
      } catch (err) {
        showToast(err.message, 'error');
        loadData();
      }
    } else {
      // Temporary optimistic item
      const tempId = Date.now();
      const optimisticItem = { id: tempId, ...formData, created_at: new Date().toISOString() };
      setB2bItems(prev => [optimisticItem, ...prev]);
      showToast('New item added to B2B inventory!');
      try {
        const created = await api.createB2B(formData);
        setB2bItems(prev => prev.map(item => item.id === tempId ? created : item));
        api.getStats().then(setStats).catch(console.error);
      } catch (err) {
        showToast(err.message, 'error');
        loadData();
      }
    }
  };

  const handleDeleteB2B = async (id) => {
    if (window.confirm('Are you sure you want to delete this B2B inventory record?')) {
      const prevList = [...b2bItems];
      // Instant optimistic removal from UI
      setB2bItems(prev => prev.filter(item => item.id !== id));
      showToast('B2B item removed.');
      try {
        await api.deleteB2B(id);
        api.getStats().then(setStats).catch(console.error);
      } catch (err) {
        showToast(err.message, 'error');
        setB2bItems(prevList);
      }
    }
  };

  // One-Click Transfer Action (Optimistic & Instant)
  const handleTransferToB2C = async (id, transferData) => {
    // Optimistically update B2B status to 'Sold to B2C'
    setB2bItems(prev => prev.map(item => item.id === id ? { ...item, status: 'Sold to B2C' } : item));
    showToast('Device successfully sold and transferred to B2C!');
    try {
      const res = await api.transferToB2C(id, transferData);
      if (res && res.b2c) {
        setB2cItems(prev => [res.b2c, ...prev]);
      }
      api.getStats().then(setStats).catch(console.error);
    } catch (err) {
      showToast(err.message, 'error');
      loadData();
    }
  };

  // B2C Actions (Optimistic & Instant)
  const handleSaveB2C = async (formData) => {
    if (editingB2C) {
      const updatedSale = { ...editingB2C, ...formData };
      setB2cItems(prev => prev.map(s => s.id === editingB2C.id ? updatedSale : s));
      showToast('B2C sale updated successfully!');
      try {
        const saved = await api.updateB2C(editingB2C.id, formData);
        setB2cItems(prev => prev.map(s => s.id === editingB2C.id ? saved : s));
        api.getStats().then(setStats).catch(console.error);
      } catch (err) {
        showToast(err.message, 'error');
        loadData();
      }
    } else {
      const tempId = Date.now();
      const optimisticSale = { id: tempId, ...formData, created_at: new Date().toISOString() };
      setB2cItems(prev => [optimisticSale, ...prev]);
      // If IMEI matched in B2B, optimistically mark B2B as sold
      if (formData.imei) {
        setB2bItems(prev => prev.map(item => item.imei === formData.imei.trim() ? { ...item, status: 'Sold to B2C' } : item));
      }
      showToast('New B2C retail sale recorded!');
      try {
        const created = await api.createB2C(formData);
        setB2cItems(prev => prev.map(s => s.id === tempId ? created : s));
        api.getStats().then(setStats).catch(console.error);
      } catch (err) {
        showToast(err.message, 'error');
        loadData();
      }
    }
  };

  const handleDeleteB2C = async (id) => {
    if (window.confirm('Delete this B2C sale record? If sourced from B2B, its stock status will be restored.')) {
      const prevB2C = [...b2cItems];
      const targetSale = b2cItems.find(s => s.id === id);
      // Instant UI removal
      setB2cItems(prev => prev.filter(s => s.id !== id));
      if (targetSale && targetSale.imei) {
        setB2bItems(prev => prev.map(item => item.imei === targetSale.imei ? { ...item, status: 'In Stock' } : item));
      }
      showToast('B2C record deleted and stock status restored.');
      try {
        await api.deleteB2C(id);
        api.getStats().then(setStats).catch(console.error);
      } catch (err) {
        showToast(err.message, 'error');
        setB2cItems(prevB2C);
        loadData();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast popup */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-4 duration-200">
          <div
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold text-white ${
              toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewB2B={() => {
          setEditingB2B(null);
          setIsB2BModalOpen(true);
        }}
        onOpenNewB2C={() => {
          setEditingB2C(null);
          setIsB2CModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-24 md:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenTransfer={(item) => setTransferItem(item)}
            onOpenNewB2B={() => {
              setEditingB2B(null);
              setIsB2BModalOpen(true);
            }}
            onOpenNewB2C={() => {
              setEditingB2C(null);
              setIsB2CModalOpen(true);
            }}
            onSearchImei={(imei) => {
              setTrackerImei(imei);
              setActiveTab('imei');
            }}
          />
        )}

        {activeTab === 'b2b' && (
          <B2BView
            items={b2bItems}
            onRefresh={loadData}
            onAddNew={() => {
              setEditingB2B(null);
              setIsB2BModalOpen(true);
            }}
            onEdit={(item) => {
              setEditingB2B(item);
              setIsB2BModalOpen(true);
            }}
            onDelete={handleDeleteB2B}
            onTransferToB2C={(item) => setTransferItem(item)}
            searchTerm={searchTermB2B}
            setSearchTerm={setSearchTermB2B}
            statusFilter={statusFilterB2B}
            setStatusFilter={setStatusFilterB2B}
          />
        )}

        {activeTab === 'b2c' && (
          <B2CView
            items={b2cItems}
            onRefresh={loadData}
            onAddNew={() => {
              setEditingB2C(null);
              setIsB2CModalOpen(true);
            }}
            onEdit={(item) => {
              setEditingB2C(item);
              setIsB2CModalOpen(true);
            }}
            onDelete={handleDeleteB2C}
            onViewInvoice={(sale) => setInvoiceSale(sale)}
            searchTerm={searchTermB2C}
            setSearchTerm={setSearchTermB2C}
          />
        )}

        {activeTab === 'imei' && (
          <ImeiTrackerView
            initialImei={trackerImei}
            onTransferItem={(item) => setTransferItem(item)}
            onViewInvoice={(sale) => setInvoiceSale(sale)}
          />
        )}
      </main>

      {/* Footer (Desktop only) */}
      <footer className="hidden md:block border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <span>Aadhis Digital Hub &copy; 2026. All rights reserved.</span>
        </div>
      </footer>

      {/* Modals */}
      <B2BModal
        isOpen={isB2BModalOpen}
        onClose={() => setIsB2BModalOpen(false)}
        onSave={handleSaveB2B}
        initialData={editingB2B}
      />

      <B2CModal
        isOpen={isB2CModalOpen}
        onClose={() => setIsB2CModalOpen(false)}
        onSave={handleSaveB2C}
        initialData={editingB2C}
      />

      {transferItem && (
        <TransferModal
          item={transferItem}
          onClose={() => setTransferItem(null)}
          onTransferSuccess={handleTransferToB2C}
        />
      )}

      {invoiceSale && (
        <InvoiceModal
          sale={invoiceSale}
          onClose={() => setInvoiceSale(null)}
        />
      )}
    </div>
  );
}

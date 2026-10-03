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

  // B2B Actions
  const handleSaveB2B = async (formData) => {
    if (editingB2B) {
      await api.updateB2B(editingB2B.id, formData);
      showToast('B2B item updated successfully!');
    } else {
      await api.createB2B(formData);
      showToast('New item added to B2B inventory!');
    }
    loadData();
  };

  const handleDeleteB2B = async (id) => {
    if (window.confirm('Are you sure you want to delete this B2B inventory record?')) {
      try {
        await api.deleteB2B(id);
        showToast('B2B item removed.');
        loadData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  // One-Click Transfer Action
  const handleTransferToB2C = async (id, transferData) => {
    await api.transferToB2C(id, transferData);
    showToast('Device successfully sold and transferred to B2C!');
    loadData();
  };

  // B2C Actions
  const handleSaveB2C = async (formData) => {
    if (editingB2C) {
      await api.updateB2C(editingB2C.id, formData);
      showToast('B2C sale updated successfully!');
    } else {
      await api.createB2C(formData);
      showToast('New B2C retail sale recorded!');
    }
    loadData();
  };

  const handleDeleteB2C = async (id) => {
    if (window.confirm('Delete this B2C sale record? If sourced from B2B, its stock status will be restored.')) {
      try {
        await api.deleteB2C(id);
        showToast('B2C record deleted and stock status restored.');
        loadData();
      } catch (err) {
        showToast(err.message, 'error');
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
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Aadhis Digital Hub &copy; 2026. All rights reserved.</span>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>B2B Procurement: Purchased From, Model, IMEI</span>
            <span>•</span>
            <span>B2C Retail: From, Model, IMEI, To</span>
          </div>
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

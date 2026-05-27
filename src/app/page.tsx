'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Users, 
  CheckCircle2, 
  Clock, 
  Flame,
  UserCheck,
  LayoutDashboard,
  Heart,
  X,
  Sun,
  Moon,
  LogOut,
  Upload
} from 'lucide-react';
import BeneficiaryCard from '@/components/BeneficiaryCard';
import DistributionModal from '@/components/DistributionModal';
import BeneficiaryFormModal from '@/components/BeneficiaryFormModal';
import PinScreen from '@/components/PinScreen';
import BulkImportModal from '@/components/BulkImportModal';

// Helper function to auto-generate the next sequential token number
const generateNextToken = (list: any[]): string => {
  if (list.length === 0) return 'Q-001';
  
  const numericTokens = list
    .map(b => {
      const match = b.tokenNumber.match(/^Q-(\d+)$/i);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num): num is number => num !== null);
    
  if (numericTokens.length === 0) {
    return `Q-${String(list.length + 1).padStart(3, '0')}`;
  }
  
  const maxToken = Math.max(...numericTokens);
  const nextTokenNum = maxToken + 1;
  return `Q-${String(nextTokenNum).padStart(3, '0')}`;
};

export default function Home() {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'distributed'>('all');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDistributeOpen, setIsDistributeOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const [defaultToken, setDefaultToken] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Security Auth states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Dynamic Toasts State
  interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
  }
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Confirmation Overlays State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState<boolean>(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Load and apply theme & check Auth status on client load
  useEffect(() => {
    // Theme load
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const activeTheme = savedTheme || systemTheme;
    setTheme(activeTheme);
    document.documentElement.classList.toggle('dark', activeTheme === 'dark');

    // Auth status load
    const authStatus = sessionStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    setIsCheckingAuth(false);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setConfirmLogoutOpen(true);
  };

  const handleLogoutConfirm = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    setConfirmLogoutOpen(false);
    showToast('সফলভাবে সিস্টেমটি লক করা হয়েছে।', 'info');
  };

  const handleBulkSuccess = (message: string) => {
    showToast(message, 'success');
    fetchBeneficiaries();
  };

  // Calculate statistics
  const totalCount = beneficiaries.length;
  const distributedCount = beneficiaries.filter(b => b.isDistributed).length;
  const pendingCount = totalCount - distributedCount;

  // Fetch all beneficiaries
  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/beneficiaries');
      const data = await res.json();
      if (data.success) {
        setBeneficiaries(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  // Filter logic
  const filteredBeneficiaries = beneficiaries.filter(b => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      b.name.toLowerCase().includes(searchLower) ||
      b.tokenNumber.toLowerCase().includes(searchLower) ||
      (b.phone && b.phone.includes(searchQuery)) ||
      (b.address && b.address.toLowerCase().includes(searchLower));

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && !b.isDistributed;
    if (activeTab === 'distributed') return matchesSearch && b.isDistributed;
    return matchesSearch;
  });

  // Action: Add or Edit
  const handleSave = async (formData: any) => {
    try {
      const url = selectedBeneficiary 
        ? `/api/beneficiaries/${selectedBeneficiary._id}` 
        : '/api/beneficiaries';
      const method = selectedBeneficiary ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (result.success) {
        showToast(
          selectedBeneficiary 
            ? 'তথ্য সফলভাবে সংশোধন করা হয়েছে।' 
            : 'নতুন পরিবার সফলভাবে যোগ করা হয়েছে।', 
          'success'
        );
        await fetchBeneficiaries();
        return true;
      } else {
        showToast(result.error || 'সংরক্ষণ করতে ব্যর্থ হয়েছে।', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error saving beneficiary:', error);
      showToast('সার্ভার কানেকশন ত্রুটি!', 'error');
      return false;
    }
  };

  // Action: Delete family trigger
  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  // Actual Delete execution
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    try {
      const res = await fetch(`/api/beneficiaries/${confirmDeleteId}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        showToast('পরিবারটি সফলভাবে তালিকা থেকে বাদ দেওয়া হয়েছে।', 'info');
        await fetchBeneficiaries();
      } else {
        showToast('বাদ দিতে ব্যর্থ হয়েছে।', 'error');
      }
    } catch (error) {
      console.error('Error deleting beneficiary:', error);
      showToast('সার্ভার কানেকশন ত্রুটি!', 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // Action: Mark Distributed
  const handleOpenDistribute = (beneficiary: any) => {
    setSelectedBeneficiary(beneficiary);
    setIsDistributeOpen(true);
  };

  const handleConfirmDistribution = async (receivedBy: 'self' | 'other', receiverName?: string) => {
    if (!selectedBeneficiary) return;
    try {
      const res = await fetch(`/api/beneficiaries/${selectedBeneficiary._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDistributed: true,
          distributedAt: new Date().toISOString(),
          receivedBy,
          receiverName: receivedBy === 'other' ? receiverName : '',
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast('গোশত বিতরণ সফলভাবে সম্পন্ন চিহ্নিত করা হয়েছে।', 'success');
        await fetchBeneficiaries();
      } else {
        showToast('বিতরণ সম্পন্ন চিহ্নিত করতে ব্যর্থ হয়েছে।', 'error');
      }
    } catch (error) {
      console.error('Error distributing meat:', error);
      showToast('সার্ভার কানেকশন ত্রুটি!', 'error');
    }
  };

  // Action: Reset back to Pending
  const handleResetStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/beneficiaries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDistributed: false,
          distributedAt: null,
          receivedBy: 'self',
          receiverName: '',
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast('বিতরণ পুনরায় অপেক্ষমান তালিকায় পাঠানো হয়েছে।', 'info');
        await fetchBeneficiaries();
      } else {
        showToast('অবিতরণ চিহ্নিত করতে ব্যর্থ হয়েছে।', 'error');
      }
    } catch (error) {
      console.error('Error resetting status:', error);
      showToast('সার্ভার কানেকশন ত্রুটি!', 'error');
    }
  };

  const handleOpenAdd = () => {
    setSelectedBeneficiary(null);
    const nextToken = generateNextToken(beneficiaries);
    setDefaultToken(nextToken);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (beneficiary: any) => {
    setSelectedBeneficiary(beneficiary);
    setIsFormOpen(true);
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PinScreen onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Top Header */}
      <header className="sticky top-0 z-40 glass-header px-4 py-4.5 transition-all">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                গোশত বিতরণ ট্র্যাকার
              </h1>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                পবিত্র ঈদ-উল-আযহা
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkOpen(true)}
              className="p-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-secondary cursor-pointer transition-all flex items-center justify-center shrink-0 shadow-xs"
              title="বাল্ক ইম্পোর্ট"
            >
              <Upload className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-secondary cursor-pointer transition-all flex items-center justify-center shrink-0 shadow-xs"
              title={theme === 'light' ? 'ডার্ক মোড' : 'লাইট মোড'}
            >
              {theme === 'light' ? (
                <Moon className="w-4.5 h-4.5 text-slate-700" />
              ) : (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-border bg-card text-destructive hover:bg-destructive/10 cursor-pointer transition-all flex items-center justify-center shrink-0 shadow-xs"
              title="লগ আউট করুন"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full mx-auto max-w-2xl px-4 pt-4 flex-1 flex flex-col gap-4 overflow-y-auto pb-24 scroll-smooth">
        
        {/* Statistics Cards */}
        <section className="grid grid-cols-3 gap-3">
          {/* Card: Total */}
          <div className="bg-card border border-border rounded-2xl p-3.5 flex flex-col gap-1 items-center justify-center text-center shadow-xs">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">মোট পরিবার</span>
            <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">{totalCount}</span>
          </div>

          {/* Card: Distributed */}
          <div className="bg-card border border-border rounded-2xl p-3.5 flex flex-col gap-1 items-center justify-center text-center shadow-xs">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">বিতরণ সম্পন্ন</span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{distributedCount}</span>
          </div>

          {/* Card: Pending */}
          <div className="bg-card border border-border rounded-2xl p-3.5 flex flex-col gap-1 items-center justify-center text-center shadow-xs">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 animate-pulse">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">অপেক্ষমান</span>
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{pendingCount}</span>
          </div>
        </section>

        {/* Search Bar */}
        <section className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, টোকেন বা মোবাইল নম্বর দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl border border-border bg-card text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </section>

        {/* Tab Filters */}
        <section className="flex bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-border/80">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-card text-slate-900 dark:text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            সব পরিবার ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            অবিতরণকৃত ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('distributed')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'distributed'
                ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            বিতরণকৃত ({distributedCount})
          </button>
        </section>

        {/* Families List Card Render */}
        <section className="flex-1 flex flex-col gap-3">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
              <span className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-muted-foreground">ডাটা লোড করা হচ্ছে...</p>
            </div>
          ) : filteredBeneficiaries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredBeneficiaries.map((beneficiary) => (
                <BeneficiaryCard
                  key={beneficiary._id}
                  beneficiary={beneficiary}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  onMarkDistributed={handleOpenDistribute}
                  onResetStatus={handleResetStatus}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 border border-dashed border-border bg-card/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center py-16 gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg">কোন পরিবার পাওয়া যায়নি</h3>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                অনুগ্রহ করে সার্চ কোয়েরি পরিবর্তন করুন অথবা নতুন পরিবার যুক্ত করুন।
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-2 text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> নতুন পরিবার যুক্ত করুন
              </button>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border mt-6 w-full">
          <p className="flex items-center justify-center gap-1">
            ক্লিন ও মিনিমাল ট্র্যাকিং সিস্টেম | ঈদ মোবারক
            <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
          </p>
        </footer>
      </main>

      {/* Floating Action Add Button */}
      <button
        onClick={handleOpenAdd}
        className="absolute bottom-6 right-6 p-4 rounded-full bg-primary hover:opacity-95 text-primary-foreground shadow-lg shadow-emerald-500/20 flex items-center justify-center cursor-pointer transition-transform duration-200 active:scale-95 z-35"
        title="নতুন পরিবার যোগ করুন"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <DistributionModal
        isOpen={isDistributeOpen}
        beneficiary={selectedBeneficiary}
        onClose={() => setIsDistributeOpen(false)}
        onConfirm={handleConfirmDistribution}
      />

      <BeneficiaryFormModal
        isOpen={isFormOpen}
        beneficiary={selectedBeneficiary}
        defaultToken={defaultToken}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
      />

      <BulkImportModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onSuccess={handleBulkSuccess}
      />

      {/* Dynamic Toasts Container Overlay */}
      <div className="absolute top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center justify-between gap-3 pointer-events-auto animate-slideIn transition-all ${
              t.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-700 dark:bg-emerald-500'
                : t.type === 'error'
                ? 'bg-destructive text-white border-destructive'
                : 'bg-slate-800 text-white border-slate-900 dark:bg-slate-700'
            }`}
          >
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className="hover:opacity-85 transition-opacity cursor-pointer p-0.5"
            >
              <X className="w-4 h-4 shrink-0" />
            </button>
          </div>
        ))}
      </div>

      {/* Custom Confirmation Modals Overlay */}
      {(confirmDeleteId || confirmLogoutOpen) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-[280px] bg-card border border-border rounded-2xl shadow-xl p-5 flex flex-col items-center text-center gap-4 animate-scaleIn">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">আপনি কি নিশ্চিত?</h4>
            <p className="text-xs text-muted-foreground leading-normal">
              {confirmDeleteId 
                ? 'এই পরিবারটি গোশত বিতরণের তালিকা থেকে স্থায়ীভাবে বাদ দেওয়া হবে।'
                : 'গোশত বিতরণ ট্র্যাকার সিস্টেমটি লক করে প্রস্থান করতে চান?'}
            </p>
            <div className="flex gap-2.5 w-full mt-1">
              <button
                onClick={() => {
                  setConfirmDeleteId(null);
                  setConfirmLogoutOpen(false);
                }}
                className="flex-1 py-2 rounded-xl border border-border hover:bg-secondary text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDeleteId ? handleDeleteConfirm : handleLogoutConfirm}
                className="flex-1 py-2 rounded-xl bg-destructive text-destructive-foreground font-bold text-xs hover:opacity-95 transition-opacity cursor-pointer shadow-sm shadow-red-500/10"
              >
                নিশ্চিত
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

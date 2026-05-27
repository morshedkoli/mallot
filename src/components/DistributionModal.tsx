import React, { useState, useEffect } from 'react';
import { User, Users, Check, X } from 'lucide-react';

interface DistributionModalProps {
  isOpen: boolean;
  beneficiary: any;
  onClose: () => void;
  onConfirm: (receivedBy: 'self' | 'other', receiverName?: string) => void;
}

export default function DistributionModal({
  isOpen,
  beneficiary,
  onClose,
  onConfirm,
}: DistributionModalProps) {
  const [receivedBy, setReceivedBy] = useState<'self' | 'other'>('self');
  const [receiverName, setReceiverName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReceivedBy('self');
      setReceiverName('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !beneficiary) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (receivedBy === 'other' && !receiverName.trim()) {
      setError('প্রতিনিধির নাম লেখা আবশ্যক।');
      return;
    }
    onConfirm(receivedBy, receivedBy === 'self' ? '' : receiverName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-card border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-xl z-10 p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto transition-transform duration-300">
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden mb-1" />

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">গোশত বিতরণ নিশ্চিতকরণ</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              টোকেন: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{beneficiary.tokenNumber}</span> | প্রধান: {beneficiary.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-secondary hover:bg-slate-200 dark:hover:bg-slate-800 text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
              গোশত কে গ্রহণ করছেন?
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setReceivedBy('self');
                  setError('');
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  receivedBy === 'self'
                    ? 'border-primary bg-emerald-50/20 dark:bg-emerald-950/20 text-primary shadow-xs'
                    : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                }`}
              >
                <User className="w-5 h-5 mb-1.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-sm">নিজে</span>
                <span className="text-[10px] leading-tight mt-0.5 opacity-80">পরিবার প্রধান</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setReceivedBy('other');
                  setError('');
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  receivedBy === 'other'
                    ? 'border-primary bg-emerald-50/20 dark:bg-emerald-950/20 text-primary shadow-xs'
                    : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Users className="w-5 h-5 mb-1.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-sm">অন্য কেউ</span>
                <span className="text-[10px] leading-tight mt-0.5 opacity-80">প্রতিনিধি/সদস্য</span>
              </button>
            </div>
          </div>

          {receivedBy === 'other' && (
            <div className="space-y-1.5 transition-all">
              <label htmlFor="receiverName" className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                প্রতিনিধির নাম ও সম্পর্ক লিখুন
              </label>
              <input
                type="text"
                id="receiverName"
                value={receiverName}
                onChange={(e) => {
                  setReceiverName(e.target.value);
                  setError('');
                }}
                placeholder="যেমন: রহিম (ছেলে), ফাতেমা (স্ত্রী)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                autoFocus
              />
              {error && <p className="text-xs text-destructive font-semibold mt-1">{error}</p>}
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border hover:bg-secondary text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
            >
              <Check className="w-4 h-4" />
              বিতরণ নিশ্চিত
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

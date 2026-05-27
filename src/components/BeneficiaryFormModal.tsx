import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface BeneficiaryFormModalProps {
  isOpen: boolean;
  beneficiary?: any;
  defaultToken?: string;
  onClose: () => void;
  onSave: (data: any) => Promise<boolean>;
}

export default function BeneficiaryFormModal({
  isOpen,
  beneficiary,
  defaultToken = '',
  onClose,
  onSave,
}: BeneficiaryFormModalProps) {
  const [name, setName] = useState('');
  const [tokenNumber, setTokenNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (beneficiary) {
        setName(beneficiary.name || '');
        setTokenNumber(beneficiary.tokenNumber || '');
        setPhone(beneficiary.phone || '');
        setAddress(beneficiary.address || '');
        setNotes(beneficiary.notes || '');
      } else {
        setName('');
        setTokenNumber(defaultToken);
        setPhone('');
        setAddress('');
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, beneficiary, defaultToken]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('পরিবার প্রধানের নাম দেওয়া আবশ্যক।');
      return;
    }
    if (!tokenNumber.trim()) {
      setError('টোকেন নম্বর দেওয়া আবশ্যক।');
      return;
    }

    setLoading(true);
    const success = await onSave({
      name: name.trim(),
      tokenNumber: tokenNumber.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim(),
    });
    setLoading(false);

    if (success) {
      onClose();
    } else {
      setError('সংরক্ষণ করতে ব্যর্থ হয়েছে। অনুগ্রহ করে ইউনিক টোকেন নম্বর নিশ্চিত করুন।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-card border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-xl z-10 p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden mb-1" />

        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {beneficiary ? 'তথ্য সংশোধন করুন' : 'নতুন পরিবার যোগ করুন'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-secondary hover:bg-slate-200 dark:hover:bg-slate-800 text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              পরিবার প্রধানের নাম <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: মোঃ আব্দুর রহমান"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="tokenNumber" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              টোকেন নম্বর <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="tokenNumber"
              value={tokenNumber}
              onChange={(e) => setTokenNumber(e.target.value)}
              placeholder="যেমন: Q-011"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              মোবাইল নম্বর (ঐচ্ছিক)
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="যেমন: 01711223344"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="address" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              ঠিকানা / এলাকা (ঐচ্ছিক)
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="যেমন: দক্ষিণ পাড়া"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="notes" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              মন্তব্য (ঐচ্ছিক)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="অতিরিক্ত তথ্য বা নোট..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border hover:bg-secondary text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              disabled={loading}
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
              disabled={loading}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  সংরক্ষণ করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

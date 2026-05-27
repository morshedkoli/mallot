import React, { useState } from 'react';
import { X, Copy, Check, Upload } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const sampleJson = `[
  {
    "name": "মোঃ আব্দুর রহমান",
    "tokenNumber": "Q-011",
    "phone": "01711223344",
    "address": "দক্ষিণ পাড়া",
    "notes": "বিশেষ সাহায্য প্রয়োজন"
  },
  {
    "name": "মোসাঃ ফাতেমা বেগম",
    "tokenNumber": "Q-012",
    "phone": "01822334455",
    "address": "উত্তর পাড়া"
  }
]`;

export default function BulkImportModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkImportModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCopySample = () => {
    navigator.clipboard.writeText(sampleJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!jsonText.trim()) {
      setError('অনুগ্রহ করে JSON টেক্সট প্রবেশ করুন।');
      return;
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (err) {
      setError('ভুল JSON ফরম্যাট! অনুগ্রহ করে JSON সিনট্যাক্স চেক করুন।');
      return;
    }

    if (!Array.isArray(parsedData)) {
      setError('JSON অবশ্যই একটি Array (তালিকা) হতে হবে।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      });

      const result = await res.json();
      if (result.success) {
        onSuccess(result.message || 'বাল্ক ইম্পোর্ট সফল হয়েছে!');
        setJsonText('');
        onClose();
      } else {
        setError(result.error || 'ইম্পোর্ট করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.error(err);
      setError('সার্ভার কানেকশন ত্রুটি!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-card border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-xl z-10 p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden mb-1" />

        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">বাল্ক পরিবার ইম্পোর্ট</h3>
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

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">নমুনা JSON ফরম্যাট:</span>
              <button
                type="button"
                onClick={handleCopySample}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500 animate-pulse" /> : <Copy className="w-3 h-3" />}
                {copied ? 'কপি হয়েছে!' : 'ফরম্যাট কপি করুন'}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border text-[10px] font-mono text-slate-600 dark:text-slate-300 overflow-x-auto max-h-32 select-all leading-relaxed">
              {sampleJson}
            </pre>
          </div>

          <div className="space-y-1">
            <label htmlFor="jsonInput" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              আপনার JSON অবজেক্টটি এখানে পেস্ট করুন:
            </label>
            <textarea
              id="jsonInput"
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setError('');
              }}
              placeholder="[...] অবজেক্টটি এখানে পেস্ট করুন..."
              rows={6}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
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
                  <Upload className="w-4 h-4" />
                  ইম্পোর্ট করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

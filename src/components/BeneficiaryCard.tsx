import React from 'react';
import { Phone, MapPin, CheckCircle2, Clock, Edit3, Trash2, User } from 'lucide-react';

interface BeneficiaryCardProps {
  beneficiary: any;
  onEdit: (beneficiary: any) => void;
  onDelete: (id: string) => void;
  onMarkDistributed: (beneficiary: any) => void;
  onResetStatus: (id: string) => void;
}

export default function BeneficiaryCard({
  beneficiary,
  onEdit,
  onDelete,
  onMarkDistributed,
  onResetStatus,
}: BeneficiaryCardProps) {
  const {
    _id,
    name,
    tokenNumber,
    phone,
    address,
    isDistributed,
    distributedAt,
    receivedBy,
    receiverName,
    notes,
  } = beneficiary;

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div
      className={`card-appear relative overflow-hidden rounded-2xl border p-5 bg-card text-card-foreground transition-all duration-300 ${
        isDistributed
          ? 'border-emerald-500/30 bg-emerald-50/5 dark:bg-emerald-950/5 shadow-sm'
          : 'border-border'
      }`}
    >
      {isDistributed && (
        <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-xs ${
            isDistributed
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-secondary text-secondary-foreground border border-border'
          }`}
        >
          {tokenNumber}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(beneficiary)}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="সম্পাদনা করুন"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(_id)}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="মুছে ফেলুন"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2.5 mb-3.5">
        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 shrink-0 mt-0.5">
          <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg leading-snug">{name}</h3>
          <span className="text-xs text-muted-foreground">পরিবার প্রধান</span>
        </div>
      </div>

      <div className="space-y-1.5 mb-5 pl-1">
        {phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <a href={`tel:${phone}`} className="hover:text-primary transition-colors hover:underline">
              {phone}
            </a>
          </div>
        )}
        {address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{address}</span>
          </div>
        )}
        {notes && (
          <div className="mt-2 text-xs italic bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-muted-foreground">
            {notes}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
        {isDistributed ? (
          <div className="flex flex-col gap-0.5 max-w-[65%]">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="text-sm font-semibold">বিতরণ সম্পন্ন</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3 shrink-0" />
              <span>সময়: {formatTime(distributedAt)}</span>
            </div>
            <div className="text-xs font-medium truncate mt-1 text-slate-600 dark:text-slate-300">
              গ্রহীতা:{' '}
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {receivedBy === 'self' ? 'নিজে' : `অন্য কেউ (${receiverName})`}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse" />
            <span className="text-xs font-semibold">অপেক্ষমান</span>
          </div>
        )}

        {isDistributed ? (
          <button
            onClick={() => onResetStatus(_id)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2.5 py-1.5 rounded-lg border border-border bg-transparent hover:bg-secondary transition-colors cursor-pointer"
          >
            অবিতরণ করুন
          </button>
        ) : (
          <button
            onClick={() => onMarkDistributed(beneficiary)}
            className="inline-flex items-center gap-1 text-xs font-semibold bg-primary hover:opacity-90 text-primary-foreground px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-sm shadow-emerald-500/10"
          >
            বিতরণ সম্পন্ন
          </button>
        )}
      </div>
    </div>
  );
}

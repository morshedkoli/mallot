import React, { useState, useEffect } from 'react';
import { Lock, Delete, ShieldAlert } from 'lucide-react';

interface PinScreenProps {
  onSuccess: () => void;
}

export default function PinScreen({ onSuccess }: PinScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    if (pin.length >= 4) return;
    setError(false);
    setPin(prev => prev + num);
  };

  const handleBackspace = () => {
    setError(false);
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError(false);
    setPin('');
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === '2580') {
        onSuccess();
      } else {
        setShake(true);
        setError(true);
        const timer = setTimeout(() => {
          setShake(false);
          setPin('');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [pin, onSuccess]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background px-6 text-foreground transition-all duration-300">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        
        {/* Lock Screen Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-primary border border-emerald-500/20 shadow-lg shadow-emerald-500/5 mb-1">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">গোশত বিতরণ ট্র্যাকার</h2>
          <p className="text-xs text-slate-500 max-w-xs leading-normal">
            নিরাপত্তা নিশ্চিত করতে ৪ ডিজিটের পিন কোড প্রবেশ করুন
          </p>
        </div>

        {/* Dynamic Dot Indicators */}
        <div className={`flex gap-4.5 justify-center py-2 ${shake ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                index < pin.length
                  ? error
                    ? 'bg-destructive border-destructive scale-110'
                    : 'bg-primary border-primary scale-110 shadow-sm shadow-emerald-500/20'
                  : error
                  ? 'border-destructive/40'
                  : 'border-slate-300 dark:border-slate-700 bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Error Alert Message Area */}
        <div className="h-6 flex items-center justify-center">
          {error && (
            <div className="flex items-center gap-1 text-xs font-bold text-destructive animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>ভুল পিন কোড! পুনরায় চেষ্টা করুন।</span>
            </div>
          )}
        </div>

        {/* Numeric Lockpad Buttons */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full max-w-[270px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-xl font-bold font-mono text-slate-800 dark:text-slate-200 hover:bg-secondary active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              {num}
            </button>
          ))}
          
          <button
            type="button"
            onClick={handleClear}
            className="w-16 h-16 rounded-full bg-transparent flex items-center justify-center text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            মুছুন
          </button>
          
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-xl font-bold font-mono text-slate-800 dark:text-slate-200 hover:bg-secondary active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            0
          </button>
          
          <button
            type="button"
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full bg-transparent flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            title="ব্যাকস্পেস"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

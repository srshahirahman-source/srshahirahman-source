import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { exportAllDataAsJSON, importAllDataFromJSON, resetAllDataToDefault } from '../utils/storage';
import { ConfirmModal } from './ConfirmModal';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReloaded: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  onDataReloaded,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `amader_mess_backup_${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'success', text: 'ডেটা ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে।' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importAllDataFromJSON(content);
        if (success) {
          setStatusMessage({ type: 'success', text: 'ব্যাকআপ থেকে সকল ডেটা সফলভাবে রিস্টোর হয়েছে!' });
          onDataReloaded();
        } else {
          setStatusMessage({ type: 'error', text: 'ভুল ফাইল ফরম্যাট! দয়া করে সঠিক JSON ব্যাকআপ ফাইল নির্বাচন করুন।' });
        }
      }
    };
    reader.readAsText(file);
  };

  const confirmResetAction = () => {
    resetAllDataToDefault();
    onDataReloaded();
    setStatusMessage({ type: 'success', text: 'সব ডেটা প্রাথমিক অবস্থায় রিসেট করা হয়েছে।' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ডেটা ব্যাকআপ ও রিস্টোর
              </h3>
              <p className="text-xs text-slate-500">
                ১০০% অফলাইন লোকাল ডিভাইস স্টোরেজ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`my-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="space-y-3 py-3">
          {/* Download Backup */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800">
                ব্যাকআপ ফাইল ডাউনলোড করুন
              </div>
              <div className="text-[11px] text-slate-500">
                সব মিল, খরচ, বিল ও ব্যালেন্স JSON ফাইলে সেভ করুন
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shrink-0 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডাউনলোড</span>
            </button>
          </div>

          {/* Upload Restore */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800">
                ফাইল থেকে রিস্টোর করুন
              </div>
              <div className="text-[11px] text-slate-500">
                আগের ব্যাকআপ ফাইল আপলোড করে ডেটা ফিরিয়ে আনুন
              </div>
            </div>
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-orange-400" />
              <span>ফাইল বাছুন</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset to Default */}
          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-rose-900">
                প্রাথমিক ডেমো ডেটায় রিসেট
              </div>
              <div className="text-[11px] text-rose-700/80">
                সকল এন্ট্রি মুছে মূল ডেমো অবস্থায় ফিরবে
              </div>
            </div>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="সব ডেটা রিসেট করবেন?"
        message="আপনি কি নিশ্চিত যে সব ডেটা রিসেট করতে চান? আপনার বর্তমান সমস্ত মেম্বার, মিল ও খরচের ডেটা মুছে প্রাথমিক ডেমো অবস্থায় ফিরে যাবে।"
        confirmText="হ্যাঁ, রিসেট করুন"
        cancelText="বাতিল"
        isDestructive={true}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          setIsResetConfirmOpen(false);
          confirmResetAction();
        }}
      />
    </div>
  );
};

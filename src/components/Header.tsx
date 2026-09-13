import React, { useState, useMemo } from 'react';
import { 
  Share2, 
  Smartphone, 
  Monitor, 
  Database, 
  Calendar,
  CheckCircle2,
  Edit2,
  Check
} from 'lucide-react';
import { formatMonthName } from '../utils/bengali';

interface HeaderProps {
  messName: string;
  onUpdateMessName: (name: string) => void;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenShareModal: () => void;
  onOpenBackupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  messName,
  onUpdateMessName,
  selectedMonth,
  onSelectMonth,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenShareModal,
  onOpenBackupModal,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(messName);

  const months = useMemo(() => {
    const now = new Date();
    const list: string[] = [];
    for (let offset = -4; offset <= 4; offset++) {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!list.includes(ym)) list.push(ym);
    }
    if (selectedMonth && !list.includes(selectedMonth)) {
      list.push(selectedMonth);
      list.sort();
    }
    return list;
  }, [selectedMonth]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateMessName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Left: App Title & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-bold text-xl shrink-0">
              মেস
            </div>

            <div>
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-slate-800 text-white text-base sm:text-lg font-bold px-2 py-0.5 rounded border border-orange-500 focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 text-green-400 hover:text-green-300"
                    title="সংরক্ষণ করুন"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                    {messName}
                  </h1>
                  <button
                    onClick={() => {
                      setTempName(messName);
                      setIsEditingName(true);
                    }}
                    className="text-slate-400 hover:text-orange-400 p-0.5 transition-colors opacity-70 group-hover:opacity-100"
                    title="মেসের নাম পরিবর্তন করুন"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> ১০০% অফলাইন ও নিরাপদ
                </span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="hidden sm:inline text-slate-400">মেস ও মিল ম্যানেজার</span>
              </div>
            </div>
          </div>

          {/* Right: Controls & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Month Selector */}
            <div className="relative">
              <label htmlFor="month-select" className="sr-only">হিসাবের মাস নির্বাচন করুন</label>
              <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium hover:border-orange-500/60 transition-colors">
                <Calendar className="w-3.5 h-3.5 text-orange-400 mr-1.5 shrink-0" />
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => onSelectMonth(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
                >
                  {months.map((m) => (
                    <option key={m} value={m} className="bg-slate-900 text-white">
                      {formatMonthName(m)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Share Report Button */}
            <button
              id="share-report-header-btn"
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-orange-600/30"
              title="হিসাব কপি ও হোয়াটসঅ্যাপে শেয়ার করুন"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">রিপোর্ট শেয়ার</span>
            </button>

            {/* Backup / Restore Button */}
            <button
              id="backup-data-header-btn"
              onClick={onOpenBackupModal}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="ডেটা ব্যাকআপ ও রিস্টোর"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Frame View Toggle (Mobile vs Fluid) */}
            <button
              id="toggle-frame-btn"
              onClick={onToggleMobileFrame}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 hidden sm:flex"
              title={isMobileFrame ? 'ফুলস্ক্রিন ভিউতে যান' : 'মোবাইল ফ্রেম ভিউ দেখুন'}
            >
              {isMobileFrame ? (
                <Monitor className="w-4 h-4 text-orange-400" />
              ) : (
                <Smartphone className="w-4 h-4 text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

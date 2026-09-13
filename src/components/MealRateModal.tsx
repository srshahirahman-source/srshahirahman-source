import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Check, Calculator, Info, Zap } from 'lucide-react';
import { MessSettings } from '../types';
import { formatTaka, toBnNum, parseBnFloat } from '../utils/bengali';

interface MealRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: MessSettings;
  autoCalculatedRate: number;
  totalMarketCost: number;
  totalMeals: number;
  onUpdateSettings: (newSettings: MessSettings) => void;
}

export const MealRateModal: React.FC<MealRateModalProps> = ({
  isOpen,
  onClose,
  settings,
  autoCalculatedRate,
  totalMarketCost,
  totalMeals,
  onUpdateSettings,
}) => {
  const [mode, setMode] = useState<'fixed' | 'auto'>(settings.mealRateMode);
  const [rateInput, setRateInput] = useState(settings.fixedMealRate.toString());
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setMode(settings.mealRateMode);
    setRateInput(settings.fixedMealRate.toString());
    setErrorMessage('');
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'fixed') {
      const parsedRate = parseBnFloat(rateInput);
      if (parsedRate <= 0) {
        setErrorMessage('দয়া করে সঠিক মিল রেট লিখুন (যেমন: ৫০)');
        return;
      }
      onUpdateSettings({
        mealRateMode: 'fixed',
        fixedMealRate: parsedRate,
      });
    } else {
      onUpdateSettings({
        mealRateMode: 'auto',
        fixedMealRate: parseBnFloat(rateInput) || settings.fixedMealRate || 50,
      });
    }

    onClose();
  };

  const currentPreviewRate =
    mode === 'fixed'
      ? parseBnFloat(rateInput) || 0
      : autoCalculatedRate || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                মিল রেট নির্ধারণ করুন
              </h3>
              <p className="text-xs text-slate-500">
                নির্ধারিত মিল রেট অনুযায়ী মেম্বারদের জমা টাকা থেকে কর্তন হবে
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

        <form onSubmit={handleSave} className="space-y-4 pt-4">
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              মিল রেটের হিসাব পদ্ধতি বেছে নিন:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('fixed')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  mode === 'fixed'
                    ? 'border-orange-500 bg-orange-50/70 text-orange-950 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs sm:text-sm">নির্দিষ্ট মিল রেট</span>
                  <Zap className={`w-4 h-4 ${mode === 'fixed' ? 'text-orange-600' : 'text-slate-400'}`} />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  ম্যানেজার বা মেস কর্তৃক আগে থেকেই ঠিক করা মিল রেট (যেমন: ৫০ ৳)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('auto')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  mode === 'auto'
                    ? 'border-orange-500 bg-orange-50/70 text-orange-950 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs sm:text-sm">স্বয়ংক্রিয় বাজার রেট</span>
                  <Calculator className={`w-4 h-4 ${mode === 'auto' ? 'text-orange-600' : 'text-slate-400'}`} />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  মোট বাজার খরচ ÷ মোট মিল সংখ্যা = লাইভ ডায়নামিক রেট
                </p>
              </button>
            </div>
          </div>

          {/* Fixed Rate Input & Quick chips */}
          {mode === 'fixed' ? (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  প্রতি মিলের রেট লিখুন (টাকায়)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">
                    ৳
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rateInput}
                    onChange={(e) => {
                      setRateInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="যেমন: ৫০"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-base font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    autoFocus
                  />
                </div>
                {errorMessage && (
                  <div className="text-xs font-medium text-rose-600 mt-1">
                    {errorMessage}
                  </div>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <div className="text-[11px] text-slate-500 mb-1.5 font-medium">দ্রুত রেট নির্বাচন:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['৪০', '৪৫', '৪৮', '৫০', '৫৫', '৬০', '৬৫'].map((chip) => (
                    <button
                      type="button"
                      key={chip}
                      onClick={() => setRateInput(chip)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                        rateInput === chip
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {chip} ৳
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900">বর্তমান বাজার থেকে হিসাবকৃত রেট:</span>
                <span className="text-base font-extrabold text-sky-700">
                  {formatTaka(autoCalculatedRate.toFixed(2))}
                </span>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                মোট বাজার খরচ {formatTaka(totalMarketCost)} ÷ মোট মিল {toBnNum(totalMeals)} টি
              </div>
            </div>
          )}

          {/* Educational Calculation Formula Preview */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>টাকা জমা থেকে কর্তনের হিসাব যেভাবে কাজ করবে:</span>
            </div>
            <div className="text-xs text-amber-950/90 leading-relaxed">
              সক্রিয় মিল রেট: <span className="font-bold text-orange-700">{formatTaka(currentPreviewRate.toFixed(2))}</span> / মিল।
              <br />
              উদাহরণস্বরূপ, কারো যদি <strong>৩০টি মিল</strong> হয়, তবে তার মিল খরচ হবে{' '}
              <strong>{formatTaka((currentPreviewRate * 30).toFixed(0))}</strong>।
              এই টাকা তার মেস ফান্ডে <strong>মোট জমা থেকে স্বয়ংক্রিয়ভাবে কেটে নেওয়া হবে</strong> এবং অবশিষ্ট ব্যালেন্স প্রদর্শিত হবে।
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>মিল রেট নিশ্চিত করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

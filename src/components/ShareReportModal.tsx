import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Send, 
  FileText, 
  Printer, 
  Share2 
} from 'lucide-react';
import { MessSummary, MemberCalculation } from '../types';
import { formatTaka, toBnNum, formatMeals, formatMonthName } from '../utils/bengali';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  messName: string;
  selectedMonth: string;
  summary: MessSummary;
  memberCalculations: MemberCalculation[];
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  isOpen,
  onClose,
  messName,
  selectedMonth,
  summary,
  memberCalculations,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate plain text report formatted nicely for WhatsApp / Messenger
  const generateTextReport = () => {
    const monthName = formatMonthName(selectedMonth);

    let report = `🏠 *${messName}* — মাসিক মিল ও হিসাব বিবরণী\n`;
    report += `📅 হিসাবের মাস: ${monthName}\n`;
    report += `═════════════════════════════\n\n`;

    report += `📊 *মেসের সারসংক্ষেপ:*\n`;
    report += `• মোট বাজার খরচ: ${formatTaka(summary.totalMarketCost)}\n`;
    report += `• মোট মিল সংখ্যা: ${formatMeals(summary.totalMeals)} টি\n`;
    report += `• বর্তমান মিল রেট: ${formatTaka(summary.mealRate.toFixed(2))} / মিল\n`;
    report += `• মোট ইউটিলিটি বিল: ${formatTaka(summary.totalUtilities)} (জনপ্রতি: ${formatTaka(summary.utilitySharePerMember.toFixed(0))})\n`;
    report += `• ফান্ডে মোট জমা: ${formatTaka(summary.totalDeposits)}\n`;
    report += `• মেস ফান্ড উদ্বৃত্ত: ${formatTaka(summary.messFundBalance)}\n\n`;

    report += `═════════════════════════════\n`;
    report += `👥 *সদস্যদের হিসাব বিবরণী (ব্যালেন্স):*\n`;

    memberCalculations.forEach((m, idx) => {
      const isAdvance = m.status === 'advance';
      const isDue = m.status === 'due';
      const statusText = isAdvance
        ? `+${formatTaka(m.netBalance.toFixed(0))} (ফেরত পাবে)`
        : isDue
        ? `${formatTaka(m.netBalance.toFixed(0))} (বকেয়া দিতে হবে)`
        : `৳ ০ (সমান সমান)`;

      report += `\n${toBnNum(idx + 1)}. *${m.memberName}*\n`;
      report += `   - মোট মিল: ${formatMeals(m.totalMeals)} টি (মিল বাবদ: ${formatTaka(m.mealCost.toFixed(0))})\n`;
      report += `   - ইউটিলিটি ভাগ: ${formatTaka(m.utilityShare.toFixed(0))}\n`;
      report += `   - মোট কর্তন: ${formatTaka(m.totalCost.toFixed(0))}\n`;
      report += `   - মোট জমা দিয়েছে: ${formatTaka(m.totalDeposit)}\n`;
      report += `   👉 *চূড়ান্ত ব্যালেন্স: ${statusText}*\n`;
    });

    report += `\n═════════════════════════════\n`;
    report += `📌 হিসাব সংরক্ষিত ও প্রস্তুত: আমাদের মেস (Amader Mess) অ্যাপ`;

    return report;
  };

  const reportText = generateTextReport();

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(reportText)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                মাসিক হিসাব বিবরণী শেয়ার
              </h3>
              <p className="text-xs text-slate-500">
                হোয়াটসঅ্যাপ বা মেসেঞ্জারে মেসেজের জন্য প্রস্তুত
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

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 my-3 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-orange-400" />
                <span>টেক্সট কপি</span>
              </>
            )}
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span>হোয়াটসঅ্যাপ</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors border border-slate-200"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট / PDF</span>
          </button>
        </div>

        {/* Formatted Report Preview Box */}
        <div className="flex-1 overflow-y-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-4 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap select-all">
          {reportText}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>মেম্বার সংখ্যা: {toBnNum(memberCalculations.length)} জন</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

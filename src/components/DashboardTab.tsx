import React from 'react';
import { 
  TrendingUp, 
  Utensils, 
  ShoppingBag, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle, 
  CalendarDays,
  FileText,
  UserCheck,
  Receipt
} from 'lucide-react';
import { MessSummary, MemberCalculation, MarketExpense, Member } from '../types';
import { formatTaka, toBnNum, formatMeals, formatBengaliDate, formatMonthName } from '../utils/bengali';
import { AppTab } from './BottomNav';

interface DashboardTabProps {
  summary: MessSummary;
  memberCalculations: MemberCalculation[];
  recentExpenses: MarketExpense[];
  members: Member[];
  selectedMonth: string;
  onNavigateTab: (tab: AppTab) => void;
  onOpenShareModal: () => void;
  onOpenMealRateModal?: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  summary,
  memberCalculations,
  recentExpenses,
  members,
  selectedMonth,
  onNavigateTab,
  onOpenShareModal,
  onOpenMealRateModal,
}) => {
  // Members who will receive money back (Advance/Refundable)
  const advanceMembers = memberCalculations.filter((m) => m.status === 'advance');
  // Members who owe money (Due/Payable)
  const dueMembers = memberCalculations.filter((m) => m.status === 'due');

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || 'সদস্য';
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Month Banner */}
      <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-3.5 px-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">চলতি হিসাবের মাস</div>
            <div className="text-sm sm:text-base font-bold text-slate-900">
              {formatMonthName(selectedMonth)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMealRateModal && (
            <button
              onClick={onOpenMealRateModal}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
              <span>মিল রেট সেটিংস</span>
            </button>
          )}

          <button
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl border border-orange-200/60 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>হিসাব বিবরণী</span>
          </button>
        </div>
      </div>

      {/* Empty members helper banner */}
      {members.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center font-bold shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">মেসে কোনো সদস্য যোগ করা হয়নি</div>
              <div className="text-xs text-amber-700">মিল, বাজার ও জমা খরচের নিখুঁত হিসাবের জন্য মেম্বার যুক্ত করুন</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('members')}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
          >
            + সদস্য যুক্ত করুন
          </button>
        </div>
      )}

      {/* Hero Highlight Card: Current Calculated Meal Rate */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-5 sm:p-6 shadow-xl border border-slate-700/60">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold border border-orange-500/30">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  {summary.mealRateMode === 'fixed' ? 'নির্ধারিত মিল রেট' : 'স্বয়ংক্রিয় বাজার মিল রেট'}
                </span>
              </div>
              {onOpenMealRateModal && (
                <button
                  onClick={onOpenMealRateModal}
                  className="text-xs text-orange-400 hover:text-orange-300 underline font-medium"
                >
                  (পরিবর্তন করুন)
                </button>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                {formatTaka(summary.mealRate.toFixed(2))}
              </span>
              <span className="text-xs sm:text-sm text-slate-400 font-medium">/ প্রতিটি মিল</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {summary.mealRateMode === 'fixed'
                ? `নির্ধারিত রেট: ${formatTaka(summary.mealRate.toFixed(2))} (বাজার অনুযায়ী আনুপাতিক রেট: ${formatTaka(summary.autoCalculatedMealRate.toFixed(2))})`
                : `সূত্র: মোট বাজার খরচ (${formatTaka(summary.totalMarketCost)}) ÷ মোট মিল সংখ্যা (${formatMeals(summary.totalMeals)} টি)`}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/80">
            <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-slate-700/80 text-center flex-1 sm:flex-initial">
              <div className="text-[11px] text-slate-400 font-medium">মেস ফান্ড ব্যালেন্স</div>
              <div className={`text-base sm:text-lg font-bold mt-0.5 ${summary.messFundBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatTaka(summary.messFundBalance)}
              </div>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-slate-700/80 text-center flex-1 sm:flex-initial">
              <div className="text-[11px] text-slate-400 font-medium">সদস্য সংখ্যা</div>
              <div className="text-base sm:text-lg font-bold text-amber-400 mt-0.5">
                {toBnNum(summary.memberCount)} জন
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Key Metric Cards (Market, Meals, Utilities, Deposits) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Market Cost */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-orange-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">মোট বাজার খরচ</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900">
            {formatTaka(summary.totalMarketCost)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>দৈনিক বাজার বাবদ মোট</span>
          </div>
        </div>

        {/* Total Meals */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-orange-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">মোট মিল সংখ্যা</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900">
            {formatMeals(summary.totalMeals)} <span className="text-xs font-normal text-slate-500">টি</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            সকাল, দুপুর, রাত ও মেহমান
          </div>
        </div>

        {/* Total Shared Utilities */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-orange-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">মোট ইউটিলিটি বিল</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900">
            {formatTaka(summary.totalUtilities)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            জনপ্রতি: {formatTaka(summary.utilitySharePerMember.toFixed(0))}
          </div>
        </div>

        {/* Total Deposits */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-orange-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">মোট মেম্বার জমা</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900">
            {formatTaka(summary.totalDeposits)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            ফান্ডে সংরক্ষিত
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <button
          onClick={() => onNavigateTab('meals')}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-3 sm:py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl shadow-sm transition-all font-semibold text-xs sm:text-sm text-center"
        >
          <PlusCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
          <span>মিল এন্ট্রি দিন</span>
        </button>

        <button
          onClick={() => onNavigateTab('market')}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-3 sm:py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-sm transition-all font-semibold text-xs sm:text-sm text-center"
        >
          <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 text-orange-400" />
          <span>বাজার খরচ যোগ</span>
        </button>

        <button
          onClick={() => onNavigateTab('balance')}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-3 sm:py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl shadow-sm transition-all font-semibold text-xs sm:text-sm text-center"
        >
          <Wallet className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
          <span>টাকা জমা দিন</span>
        </button>
      </div>

      {/* Feature 1 Requirement: Quick Balance Status (Who owes money & who gets money back) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Advance / Refundable List (Green) */}
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="bg-emerald-50/80 px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-emerald-900">
                টাকা ফেরত পাবে (পাওনাদার)
              </h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-800">
              {toBnNum(advanceMembers.length)} জন
            </span>
          </div>

          <div className="p-3 divide-y divide-slate-100">
            {advanceMembers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                বর্তমানে কারো জমা উদ্বৃত্ত নেই
              </div>
            ) : (
              advanceMembers.map((m) => (
                <div key={m.memberId} className="py-2.5 px-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{m.memberName}</div>
                    <div className="text-xs text-slate-500">
                      মিল: {formatMeals(m.totalMeals)} | জমা: {formatTaka(m.totalDeposit)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                      +{formatTaka(m.netBalance.toFixed(0))}
                    </span>
                    <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">ফেরত পাবে</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Due / Payable List (Red) */}
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="bg-rose-50/80 px-4 py-3 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-rose-900">
                বকেয়া জমা দিতে হবে (দেনাদার)
              </h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-200/70 text-rose-800">
              {toBnNum(dueMembers.length)} জন
            </span>
          </div>

          <div className="p-3 divide-y divide-slate-100">
            {dueMembers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                সবার হিসাব ক্লিয়ার! কোনো বকেয়া নেই।
              </div>
            ) : (
              dueMembers.map((m) => (
                <div key={m.memberId} className="py-2.5 px-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{m.memberName}</div>
                    <div className="text-xs text-slate-500">
                      মিল: {formatMeals(m.totalMeals)} | খরচ: {formatTaka(m.totalCost.toFixed(0))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60">
                      {formatTaka(m.netBalance.toFixed(0))}
                    </span>
                    <div className="text-[10px] text-rose-700 mt-0.5 font-medium">বকেয়া দিতে হবে</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Grocery Market Purchases */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-orange-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              সাম্প্রতিক বাজার খরচ
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('market')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700"
          >
            সব দেখুন ({toBnNum(recentExpenses.length)}) →
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            এখনো কোনো বাজার খরচ যোগ করা হয়নি
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentExpenses.slice(0, 3).map((exp) => (
              <div key={exp.id} className="py-2.5 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>{getMemberName(exp.memberId)}</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      • {formatBengaliDate(exp.date)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 line-clamp-1">
                    {exp.items}
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-900 shrink-0">
                  {formatTaka(exp.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

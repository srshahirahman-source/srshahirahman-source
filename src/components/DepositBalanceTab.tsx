import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  User, 
  Trash2, 
  FileSpreadsheet, 
  X,
  Check,
  CreditCard,
  TrendingUp,
  Sliders,
  CheckCircle2,
  MinusCircle,
  PlusCircle
} from 'lucide-react';
import { Member, Deposit, MemberCalculation, MessSummary } from '../types';
import { formatTaka, toBnNum, formatMeals, formatBengaliDate, formatMonthName, parseBnFloat } from '../utils/bengali';
import { ConfirmModal } from './ConfirmModal';

interface DepositBalanceTabProps {
  members: Member[];
  deposits: Deposit[];
  summary: MessSummary;
  memberCalculations: MemberCalculation[];
  selectedMonth: string;
  onAddDeposit: (deposit: Omit<Deposit, 'id'>) => void;
  onDeleteDeposit: (id: string) => void;
  onOpenMealRateModal?: () => void;
  onSelectMonth?: (month: string) => void;
  onAddNewMember?: (name: string) => string;
  onNavigateTab?: (tab: string) => void;
}

export const DepositBalanceTab: React.FC<DepositBalanceTabProps> = ({
  members,
  deposits,
  summary,
  memberCalculations,
  selectedMonth,
  onAddDeposit,
  onDeleteDeposit,
  onOpenMealRateModal,
  onSelectMonth,
  onAddNewMember,
  onNavigateTab,
}) => {
  const [subTab, setSubTab] = useState<'balanceSheet' | 'deposits'>('balanceSheet');
  const [depositFilter, setDepositFilter] = useState<'currentMonth' | 'all'>('currentMonth');

  // Filter deposits for selected month or show all
  const monthDeposits = deposits.filter((d) => d.date.startsWith(selectedMonth));
  const displayedDeposits = depositFilter === 'currentMonth' ? monthDeposits : deposits;

  // Deposit Modal State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositMemberId, setDepositMemberId] = useState(members[0]?.id || '__new__');
  const [newMemberInputName, setNewMemberInputName] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(
    new Date().toISOString().split('T')[0].startsWith(selectedMonth)
      ? new Date().toISOString().split('T')[0]
      : `${selectedMonth}-01`
  );
  const [depositNote, setDepositNote] = useState('');
  const [depositError, setDepositError] = useState('');

  // Confirm delete modal state
  const [depositToDelete, setDepositToDelete] = useState<Deposit | null>(null);

  // Success feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAddDepositModal = (initialMemberId?: string) => {
    if (initialMemberId) {
      setDepositMemberId(initialMemberId);
    } else if (members.length > 0) {
      setDepositMemberId(members[0].id);
    } else {
      setDepositMemberId('__new__');
    }
    setNewMemberInputName('');
    setDepositAmount('');
    setDepositDate(
      new Date().toISOString().split('T')[0].startsWith(selectedMonth)
        ? new Date().toISOString().split('T')[0]
        : `${selectedMonth}-01`
    );
    setDepositNote('');
    setDepositError('');
    setIsDepositModalOpen(true);
  };

  const handleSaveDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    const amount = parseBnFloat(depositAmount);
    if (amount <= 0) {
      setDepositError('দয়া করে সঠিক জমার টাকার পরিমাণ লিখুন (যেমন: ২০০০ বা 2000)');
      return;
    }

    let effectiveMemberId = depositMemberId;
    if (effectiveMemberId === '__new__' || members.length === 0) {
      if (!newMemberInputName.trim()) {
        setDepositError('দয়া করে সদস্যের নাম লিখুন');
        return;
      }
      if (onAddNewMember) {
        effectiveMemberId = onAddNewMember(newMemberInputName.trim());
      }
    }

    if (!effectiveMemberId || effectiveMemberId === '__new__') {
      setDepositError('দয়া করে একজন মেম্বার নির্বাচন করুন অথবা নতুন নাম লিখুন');
      return;
    }

    onAddDeposit({
      memberId: effectiveMemberId,
      amount,
      date: depositDate,
      note: depositNote.trim() || 'মেস ফান্ডে জমা',
    });

    const depMonth = depositDate.substring(0, 7);
    if (onSelectMonth && depMonth !== selectedMonth) {
      onSelectMonth(depMonth);
    }

    setIsDepositModalOpen(false);
    showToast(`৳ ${toBnNum(amount)} জমা সফলভাবে সংরক্ষণ করা হয়েছে!`);
  };

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || 'সদস্য';
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Toast */}
      {toastMessage && (
        <div className="bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Sub-tab switcher */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <button
          onClick={() => setSubTab('balanceSheet')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            subTab === 'balanceSheet'
              ? 'bg-slate-900 text-white shadow-md shadow-slate-900/30'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>জমা ও কর্তন ব্যালেন্স শিট</span>
        </button>

        <button
          onClick={() => setSubTab('deposits')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            subTab === 'deposits'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/30'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>জমার তালিকা ({formatTaka(summary.totalDeposits)})</span>
        </button>
      </div>

      {subTab === 'balanceSheet' ? (
        /* 1. MEMBER BALANCE SHEET */
        <div className="space-y-4">
          {/* Summary Banner with Meal Rate Controller */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-slate-700/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/80">
              <div>
                <div className="text-xs text-orange-400 font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>মিল রেট অনুযায়ী জমা থেকে স্বয়ংক্রিয় কর্তন</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-white mt-1">
                  সক্রিয় মিল রেট:{' '}
                  <span className="text-orange-400 font-extrabold text-base sm:text-lg">
                    {formatTaka(summary.mealRate.toFixed(2))}
                  </span>{' '}
                  <span className="text-xs font-normal text-slate-400">
                    ({summary.mealRateMode === 'fixed' ? 'নির্ধারিত রেট' : 'স্বয়ংক্রিয় বাজার রেট'})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {onOpenMealRateModal && (
                  <button
                    onClick={onOpenMealRateModal}
                    className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>মিল রেট পরিবর্তন</span>
                  </button>
                )}

                <button
                  onClick={() => openAddDepositModal()}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>টাকা জমা এন্ট্রি</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 text-xs">
              <div>
                <div className="text-slate-400 text-[11px]">মেস ফান্ড মোট জমা:</div>
                <div className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">
                  {formatTaka(summary.totalDeposits)}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">ইউটিলিটি জনপ্রতি:</div>
                <div className="text-sm sm:text-base font-bold text-amber-300 mt-0.5">
                  {formatTaka(summary.utilitySharePerMember.toFixed(0))}
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-slate-400 text-[11px]">হিসাব পদ্ধতি:</div>
                <div className="text-slate-200 text-[11px] mt-0.5 leading-snug">
                  মোট জমা - (মিল × রেট) - ইউটিলিটি = ব্যালেন্স
                </div>
              </div>
            </div>
          </div>

          {/* Member Balance Cards */}
          <div className="space-y-3">
            {memberCalculations.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center text-slate-500 border border-slate-200/90 shadow-sm space-y-3">
                <p className="text-sm font-medium">মেসে বর্তমানে কোনো সদস্য তালিকাভুক্ত নেই।</p>
                <button
                  type="button"
                  onClick={() => (onNavigateTab ? onNavigateTab('members') : openAddDepositModal())}
                  className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>সদস্য যোগ করুন</span>
                </button>
              </div>
            ) : (
              memberCalculations.map((m) => {
              const isAdvance = m.status === 'advance';
              const isDue = m.status === 'due';

              return (
                <div
                  key={m.memberId}
                  className={`bg-white rounded-2xl border p-4 shadow-sm transition-all ${
                    isAdvance
                      ? 'border-emerald-200/90 hover:border-emerald-300'
                      : isDue
                      ? 'border-rose-200/90 hover:border-rose-300'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900">
                          {m.memberName}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            isAdvance
                              ? 'bg-emerald-100 text-emerald-800'
                              : isDue
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isAdvance ? (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5" /> ফেরত পাবে
                            </>
                          ) : isDue ? (
                            <>
                              <ArrowDownRight className="w-3.5 h-3.5" /> বকেয়া দিতে হবে
                            </>
                          ) : (
                            'সমান সমান'
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {m.roomOrNote || m.phone}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <div
                          className={`text-lg sm:text-xl font-black ${
                            isAdvance
                              ? 'text-emerald-600'
                              : isDue
                              ? 'text-rose-600'
                              : 'text-slate-700'
                          }`}
                        >
                          {isAdvance && '+'}
                          {formatTaka(m.netBalance.toFixed(0))}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {isAdvance ? 'অবশিষ্ট ব্যালেন্স' : 'বকেয়া টাকা'}
                        </div>
                      </div>

                      <button
                        onClick={() => openAddDepositModal(m.memberId)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors"
                        title="এই সদস্যের জমা যোগ করুন"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Explicit Deduction Breakdown */}
                  <div className="mt-3 bg-slate-50/90 rounded-xl p-3 border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1">
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>সদস্যের মোট জমা টাকা (Deposit):</span>
                      </span>
                      <span className="font-bold text-emerald-700 text-sm">
                        +{formatTaka(m.totalDeposit)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <MinusCircle className="w-3.5 h-3.5 text-orange-500" />
                        <span>
                          মিল বাবদ কর্তন ({formatMeals(m.totalMeals)} মিল × {formatTaka(m.mealRate.toFixed(1))}):
                        </span>
                      </span>
                      <span className="font-bold text-orange-600">
                        -{formatTaka(m.mealCost.toFixed(0))}
                      </span>
                    </div>

                    {m.utilityShare > 0 && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1">
                          <MinusCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>ইউটিলিটি ও বাসা ভাড়া কর্তন:</span>
                        </span>
                        <span className="font-bold text-amber-600">
                          -{formatTaka(m.utilityShare.toFixed(0))}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between font-bold">
                      <span className="text-slate-800">
                        জমা থেকে মোট কর্তনের পর চূড়ান্ত ব্যালেন্স:
                      </span>
                      <span
                        className={`text-sm ${
                          isAdvance ? 'text-emerald-700 font-extrabold' : isDue ? 'text-rose-700 font-extrabold' : 'text-slate-700'
                        }`}
                      >
                        {isAdvance
                          ? `+${formatTaka(m.netBalance.toFixed(0))} (ফেরত পাবে)`
                          : isDue
                          ? `-${formatTaka(Math.abs(m.netBalance).toFixed(0))} (দিতে হবে)`
                          : '০ ৳ (পরিশোধিত)'}
                      </span>
                    </div>
                  </div>

                  {/* Meal Counts Sub-details */}
                  <div className="flex items-center justify-between pt-2.5 text-[11px] text-slate-500 px-1">
                    <span>
                      সকাল: {toBnNum(m.breakfastCount)} | দুপুর: {toBnNum(m.lunchCount)} | রাত: {toBnNum(m.dinnerCount)}
                      {m.guestMealCount > 0 && ` | গেস্ট: ${toBnNum(m.guestMealCount)}`}
                    </span>
                    <span>
                      মোট মিল: <strong className="text-slate-800">{formatMeals(m.totalMeals)} টি</strong>
                    </span>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      ) : (
        /* 2. DEPOSITS LIST & MANAGEMENT */
        <div className="space-y-4">
          {/* Banner */}
          <div className="bg-emerald-800 text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-emerald-200 font-medium">
                {depositFilter === 'currentMonth' ? `${formatMonthName(selectedMonth)} মাসের` : 'সকল'} মোট মেম্বার জমা
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold mt-0.5">
                {formatTaka(
                  depositFilter === 'currentMonth'
                    ? summary.totalDeposits
                    : deposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
                )}
              </div>
              <div className="text-xs text-emerald-200/90 mt-0.5">
                মোট {toBnNum(displayedDeposits.length)} টি ডিপোজিট এন্ট্রি
              </div>
            </div>

            <button
              onClick={() => openAddDepositModal()}
              className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন জমা লিখুন</span>
            </button>
          </div>

          {/* Month / All Filter Switcher */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDepositFilter('currentMonth')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                depositFilter === 'currentMonth'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              চলতি মাস ({formatMonthName(selectedMonth)})
            </button>
            <button
              type="button"
              onClick={() => setDepositFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                depositFilter === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              সব মাসের জমা ({toBnNum(deposits.length)} টি)
            </button>
          </div>

          {/* Deposits List */}
          <div className="space-y-3">
            {displayedDeposits.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center text-slate-400 border border-slate-200">
                {depositFilter === 'currentMonth'
                  ? 'এই মাসে এখনো কোনো মেম্বার জমা এন্ট্রি করা হয়নি।'
                  : 'এখনো কোনো মেম্বার জমা এন্ট্রি করা হয়নি।'}
              </div>
            ) : (
              displayedDeposits.map((dep) => (
                <div
                  key={dep.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        <User className="w-3 h-3 text-slate-500" />
                        {getMemberName(dep.memberId)}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatBengaliDate(dep.date)}
                      </span>
                    </div>

                    {dep.note && (
                      <div className="text-xs text-slate-600">
                        {dep.note}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div className="text-base sm:text-lg font-bold text-emerald-600">
                      +{formatTaka(dep.amount)}
                    </div>

                    <button
                      onClick={() => setDepositToDelete(dep)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD MEMBER DEPOSIT */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>মেস ফান্ডে টাকা জমা</span>
              </h3>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDeposit} className="space-y-4 pt-4">
              {/* Member Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  টাকা জমাদানকারী সদস্য
                </label>
                {members.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={depositMemberId}
                      onChange={(e) => setDepositMemberId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                      required
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                      <option value="__new__">+ নতুন সদস্যের নাম লিখুন</option>
                    </select>

                    {depositMemberId === '__new__' && (
                      <input
                        type="text"
                        value={newMemberInputName}
                        onChange={(e) => setNewMemberInputName(e.target.value)}
                        placeholder="নতুন সদস্যের নাম লিখুন"
                        className="w-full bg-slate-50 border border-emerald-400 rounded-xl p-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                        required
                        autoFocus
                      />
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={newMemberInputName}
                      onChange={(e) => setNewMemberInputName(e.target.value)}
                      placeholder="টাকা জমাদানকারী সদস্যের নাম লিখুন"
                      className="w-full bg-slate-50 border border-emerald-400 rounded-xl p-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                      required
                      autoFocus
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      সদস্য স্বয়ংক্রিয়ভাবে মেসে যোগ হয়ে যাবে
                    </span>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  জমার পরিমাণ (৳)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ৳
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={depositAmount}
                    onChange={(e) => {
                      setDepositAmount(e.target.value);
                      setDepositError('');
                    }}
                    placeholder="যেমন: ৩,৫০০ বা 3500"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                    required
                    autoFocus
                  />
                </div>
                {depositError && (
                  <div className="text-xs text-rose-600 font-medium mt-1">
                    {depositError}
                  </div>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  জমার তারিখ
                </label>
                <input
                  type="date"
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বিবরণ / নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  placeholder="যেমন: বিকাশ / ক্যাশ / ব্যাংক ট্রান্সফার"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-colors"
                >
                  জমা সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Deposit Modal */}
      <ConfirmModal
        isOpen={Boolean(depositToDelete)}
        title="জমা রেকর্ড মুছে ফেলুন"
        message={`আপনি কি এই জমার রেকর্ডটি মুছে ফেলতে চান?\n\nমেম্বার: ${depositToDelete ? getMemberName(depositToDelete.memberId) : ''}\nপরিমাণ: ${formatTaka(depositToDelete?.amount || 0)}`}
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        isDestructive={true}
        onClose={() => setDepositToDelete(null)}
        onConfirm={() => {
          if (depositToDelete) {
            onDeleteDeposit(depositToDelete.id);
            setDepositToDelete(null);
            showToast('জমা রেকর্ড সফলভাবে মুছে ফেলা হয়েছে!');
          }
        }}
      />
    </div>
  );
};

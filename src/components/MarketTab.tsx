import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Receipt, 
  Plus, 
  Calendar, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Clock, 
  User, 
  X,
  Check,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { MarketExpense, UtilityBill, Member, UtilityCategory } from '../types';
import { formatTaka, toBnNum, formatBengaliDate, formatMonthName, parseBnFloat } from '../utils/bengali';
import { ConfirmModal } from './ConfirmModal';

interface MarketTabProps {
  members: Member[];
  expenses: MarketExpense[];
  utilities: UtilityBill[];
  selectedMonth: string;
  onAddExpense: (expense: Omit<MarketExpense, 'id'>) => void;
  onUpdateExpense: (expense: MarketExpense) => void;
  onDeleteExpense: (id: string) => void;
  onAddUtility: (utility: Omit<UtilityBill, 'id'>) => void;
  onUpdateUtility: (utility: UtilityBill) => void;
  onDeleteUtility: (id: string) => void;
  onSelectMonth?: (month: string) => void;
}

export const MarketTab: React.FC<MarketTabProps> = ({
  members,
  expenses,
  utilities,
  selectedMonth,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onAddUtility,
  onUpdateUtility,
  onDeleteUtility,
  onSelectMonth,
}) => {
  const [subTab, setSubTab] = useState<'bazar' | 'utility'>('bazar');
  const [expenseFilter, setExpenseFilter] = useState<'currentMonth' | 'all'>('currentMonth');
  const [utilityFilter, setUtilityFilter] = useState<'currentMonth' | 'all'>('currentMonth');

  // Filter for selected month or show all
  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const displayedExpenses = expenseFilter === 'currentMonth' ? monthExpenses : expenses;

  const monthUtilities = utilities.filter((u) => u.month === selectedMonth);
  const displayedUtilities = utilityFilter === 'currentMonth' ? monthUtilities : utilities;

  const totalMarketCost = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalUtilitiesCost = monthUtilities.reduce((sum, u) => sum + (Number(u.amount) || 0), 0);
  const activeMembersCount = Math.max(members.filter((m) => m.active).length, 1);
  const perHeadUtility = totalUtilitiesCost / activeMembersCount;

  // Expense Modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<MarketExpense | null>(null);
  const [expenseMemberId, setExpenseMemberId] = useState(members[0]?.id || 'general');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseItems, setExpenseItems] = useState('');
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseError, setExpenseError] = useState('');

  // Utility Modal state
  const [isUtilityModalOpen, setIsUtilityModalOpen] = useState(false);
  const [editingUtility, setEditingUtility] = useState<UtilityBill | null>(null);
  const [utilityTitle, setUtilityTitle] = useState('বাসা ভাড়া (রুম ও ফ্ল্যাট)');
  const [utilityCategory, setUtilityCategory] = useState<UtilityCategory>('rent');
  const [utilityAmount, setUtilityAmount] = useState('');
  const [utilityIsPaid, setUtilityIsPaid] = useState(true);
  const [utilityNote, setUtilityNote] = useState('');
  const [utilityError, setUtilityError] = useState('');

  // Confirmation deletion modal states
  const [expenseToDelete, setExpenseToDelete] = useState<MarketExpense | null>(null);
  const [utilityToDelete, setUtilityToDelete] = useState<UtilityBill | null>(null);

  // Success toast message
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  const openAddExpenseModal = () => {
    setEditingExpense(null);
    setExpenseMemberId(members.length > 0 ? members[0].id : 'general');
    setExpenseAmount('');
    setExpenseDate(
      new Date().toISOString().split('T')[0].startsWith(selectedMonth)
        ? new Date().toISOString().split('T')[0]
        : `${selectedMonth}-01`
    );
    setExpenseItems('');
    setExpenseNote('');
    setExpenseError('');
    setIsExpenseModalOpen(true);
  };

  const openEditExpenseModal = (exp: MarketExpense) => {
    setEditingExpense(exp);
    setExpenseMemberId(exp.memberId);
    setExpenseAmount(exp.amount.toString());
    setExpenseDate(exp.date);
    setExpenseItems(exp.items);
    setExpenseNote(exp.note || '');
    setExpenseError('');
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError('');
    const amount = parseBnFloat(expenseAmount);
    if (amount <= 0) {
      setExpenseError('দয়া করে সঠিক টাকার পরিমাণ লিখুন (যেমন: ১,৪৫০ বা 1450)');
      return;
    }

    const itemsText = expenseItems.trim() || 'দৈনিক মেস বাজার সামগ্রী';
    const effectiveMemberId = expenseMemberId || (members[0] ? members[0].id : 'general');

    if (editingExpense) {
      onUpdateExpense({
        ...editingExpense,
        memberId: effectiveMemberId,
        amount,
        date: expenseDate,
        items: itemsText,
        note: expenseNote.trim(),
      });
      showToast('বাজার খরচ সফলভাবে আপডেট করা হয়েছে!');
    } else {
      onAddExpense({
        memberId: effectiveMemberId,
        amount,
        date: expenseDate,
        items: itemsText,
        note: expenseNote.trim(),
      });
      showToast('নতুন বাজার খরচ সফলভাবে যুক্ত হয়েছে!');
    }

    const expMonth = expenseDate.substring(0, 7);
    if (onSelectMonth && expMonth !== selectedMonth) {
      onSelectMonth(expMonth);
    }

    setIsExpenseModalOpen(false);
  };

  const openAddUtilityModal = () => {
    setEditingUtility(null);
    setUtilityTitle('বাসা ভাড়া (রুম ও ফ্ল্যাট)');
    setUtilityCategory('rent');
    setUtilityAmount('');
    setUtilityIsPaid(true);
    setUtilityNote('');
    setUtilityError('');
    setIsUtilityModalOpen(true);
  };

  const openEditUtilityModal = (u: UtilityBill) => {
    setEditingUtility(u);
    setUtilityTitle(u.title);
    setUtilityCategory(u.category);
    setUtilityAmount(u.amount.toString());
    setUtilityIsPaid(u.isPaid);
    setUtilityNote(u.note || '');
    setUtilityError('');
    setIsUtilityModalOpen(true);
  };

  const handleSaveUtility = (e: React.FormEvent) => {
    e.preventDefault();
    setUtilityError('');
    const amount = parseBnFloat(utilityAmount);
    if (amount <= 0) {
      setUtilityError('দয়া করে সঠিক বিলের টাকার পরিমাণ লিখুন (যেমন: ৪,০০০ বা 4000)');
      return;
    }

    if (!utilityTitle.trim()) {
      setUtilityError('দয়া করে বিলের শিরোনাম লিখুন');
      return;
    }

    if (editingUtility) {
      onUpdateUtility({
        ...editingUtility,
        title: utilityTitle.trim(),
        category: utilityCategory,
        amount,
        month: selectedMonth,
        isPaid: utilityIsPaid,
        note: utilityNote.trim(),
      });
      showToast('ইউটিলিটি বিল সফলভাবে আপডেট করা হয়েছে!');
    } else {
      onAddUtility({
        title: utilityTitle.trim(),
        category: utilityCategory,
        amount,
        month: selectedMonth,
        isPaid: utilityIsPaid,
        note: utilityNote.trim(),
      });
      showToast('নতুন ইউটিলিটি বিল সফলভাবে যুক্ত হয়েছে!');
    }

    setIsUtilityModalOpen(false);
  };

  const getMemberName = (id: string) => {
    if (id === 'general' || id === 'mess_manager') return 'সাধারণ মেস বাজার';
    const found = members.find((m) => m.id === id);
    return found ? found.name : 'মেস সদস্য';
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Success Toast banner */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* Sub-tab Switcher */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <button
          onClick={() => setSubTab('bazar')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            subTab === 'bazar'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>দৈনিক বাজার ({toBnNum(monthExpenses.length)})</span>
        </button>

        <button
          onClick={() => setSubTab('utility')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            subTab === 'utility'
              ? 'bg-slate-900 text-white shadow-md shadow-slate-900/30'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>শেয়ার্ড বিল ও ভাড়া ({toBnNum(monthUtilities.length)})</span>
        </button>
      </div>

      {subTab === 'bazar' ? (
        /* SECTION 1: DAILY BAZAR EXPENSES */
        <div className="space-y-4">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-orange-100 font-semibold">
                {expenseFilter === 'currentMonth' ? `${formatMonthName(selectedMonth)} মাসের` : 'সকল'} মোট বাজার খরচ
              </div>
              <div className="text-2xl sm:text-3xl font-black mt-0.5">
                {formatTaka(
                  expenseFilter === 'currentMonth'
                    ? totalMarketCost
                    : expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
                )}
              </div>
              <div className="text-xs text-orange-100 mt-1">
                মোট বাজার এন্ট্রি: {toBnNum(displayedExpenses.length)} টি
              </div>
            </div>

            <button
              onClick={openAddExpenseModal}
              className="flex items-center gap-1.5 bg-white text-orange-700 hover:bg-orange-50 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন বাজার খরচ যোগ করুন</span>
            </button>
          </div>

          {/* Month / All Filter Switcher */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpenseFilter('currentMonth')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                expenseFilter === 'currentMonth'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              চলতি মাস ({formatMonthName(selectedMonth)})
            </button>
            <button
              type="button"
              onClick={() => setExpenseFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                expenseFilter === 'all'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              সব বাজার খরচ ({toBnNum(expenses.length)} টি)
            </button>
          </div>

          {/* Expenses List */}
          <div className="space-y-3">
            {displayedExpenses.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center text-slate-400 border border-slate-200">
                <p className="mb-2">
                  {expenseFilter === 'currentMonth'
                    ? 'এই মাসে এখনো কোনো বাজার খরচ যোগ করা হয়নি।'
                    : 'এখনো কোনো বাজার খরচ যোগ করা হয়নি।'}
                </p>
                <button
                  onClick={openAddExpenseModal}
                  className="inline-flex items-center gap-1 text-xs text-orange-600 font-bold hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>প্রথম বাজার খরচ যোগ করুন</span>
                </button>
              </div>
            ) : (
              displayedExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:border-orange-300 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        <User className="w-3 h-3 text-slate-500" />
                        {getMemberName(exp.memberId)}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatBengaliDate(exp.date)}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-800 leading-snug">
                      {exp.items}
                    </div>

                    {exp.note && (
                      <div className="text-xs text-slate-500 italic">
                        নোট: {exp.note}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <div className="text-base sm:text-lg font-bold text-orange-600">
                      {formatTaka(exp.amount)}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditExpenseModal(exp)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="সম্পাদন করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setExpenseToDelete(exp)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* SECTION 2: SHARED UTILITY BILLS */
        <div className="space-y-4">
          {/* Utilities Summary Card */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-slate-300 font-semibold">
                চলতি মাসের শেয়ার্ড ইউটিলিটি খরচ ({formatMonthName(selectedMonth)})
              </div>
              <div className="text-2xl sm:text-3xl font-black mt-0.5">
                {formatTaka(totalUtilitiesCost)}
              </div>
              <div className="text-xs text-amber-300 font-medium mt-1">
                জনপ্রতি ভাগ: {formatTaka(perHeadUtility.toFixed(0))} ({toBnNum(activeMembersCount)} জন সক্রিয় সদস্য)
              </div>
            </div>

            <button
              onClick={openAddUtilityModal}
              className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন বিল যুক্ত করুন</span>
            </button>
          </div>

          {/* Utilities List */}
          <div className="space-y-3">
            {monthUtilities.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center text-slate-400 border border-slate-200">
                <p className="mb-2">এই মাসে এখনো কোনো ইউটিলিটি বিল যোগ করা হয়নি।</p>
                <button
                  onClick={openAddUtilityModal}
                  className="inline-flex items-center gap-1 text-xs text-slate-800 font-bold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>বাড়ি ভাড়া বা বিল যুক্ত করুন</span>
                </button>
              </div>
            ) : (
              monthUtilities.map((u) => (
                <div
                  key={u.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {u.title}
                      </h4>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          u.isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {u.isPaid ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> পরিশোধিত
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" /> বকেয়া আছে
                          </>
                        )}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      সদস্যপ্রতি পড়বে: <strong className="text-slate-800">{formatTaka((u.amount / activeMembersCount).toFixed(0))}</strong>
                      {u.note && <span> • {u.note}</span>}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div className="text-base sm:text-lg font-bold text-slate-900">
                      {formatTaka(u.amount)}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditUtilityModal(u)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="সম্পাদন করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setUtilityToDelete(u)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT DAILY BAZAR EXPENSE */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                <span>{editingExpense ? 'বাজার খরচ পরিবর্তন' : 'নতুন বাজার খরচ এন্ট্রি'}</span>
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 pt-4">
              {/* Member who shopped */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  কে বাজার করেছে?
                </label>
                <select
                  value={expenseMemberId}
                  onChange={(e) => setExpenseMemberId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-orange-500"
                  required
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                  <option value="general">সাধারণ মেস বাজার / ম্যানেজার</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  টাকার পরিমাণ (৳)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ৳
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={expenseAmount}
                    onChange={(e) => {
                      setExpenseAmount(e.target.value);
                      setExpenseError('');
                    }}
                    placeholder="যেমন: ১৪৫০ বা 1450"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                    required
                    autoFocus
                  />
                </div>
                {expenseError && (
                  <div className="text-xs text-rose-600 font-medium mt-1">
                    {expenseError}
                  </div>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বাজারের তারিখ
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              {/* Items List */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বাজার করা সামগ্রীর বিবরণ
                </label>
                <textarea
                  rows={2}
                  value={expenseItems}
                  onChange={(e) => setExpenseItems(e.target.value)}
                  placeholder="যেমন: চাল ৫ কেজি, ডাল ১ কেজি, মুরগি, সয়াবিন তেল, আলু, কাঁচামরিচ..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  অতিরিক্ত নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={expenseNote}
                  onChange={(e) => setExpenseNote(e.target.value)}
                  placeholder="যেমন: মেস ফান্ড থেকে পরিশোধ / শুক্রবার স্পেশাল"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md transition-colors"
                >
                  {editingExpense ? 'আপডেট করুন' : 'খরচ সংরক্ষণ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SHARED UTILITY BILL */}
      {isUtilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-slate-800" />
                <span>{editingUtility ? 'বিল পরিবর্তন' : 'নতুন শেয়ার্ড ইউটিলিটি বিল'}</span>
              </h3>
              <button
                onClick={() => setIsUtilityModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUtility} className="space-y-4 pt-4">
              {/* Category Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বিলের ধরন / দ্রুত নির্বাচন
                </label>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {[
                    { label: 'বাসা ভাড়া', cat: 'rent' as UtilityCategory, title: 'বাসা ভাড়া (রুম ও ফ্ল্যাট)' },
                    { label: 'বিদ্যুৎ বিল', cat: 'electricity' as UtilityCategory, title: 'বিদ্যুৎ বিল' },
                    { label: 'গ্যাস বিল', cat: 'gas' as UtilityCategory, title: 'গ্যাস সিলিন্ডার বিল' },
                    { label: 'ওয়াইফাই', cat: 'wifi' as UtilityCategory, title: 'ওয়াইফাই ইন্টারনেট বিল' },
                    { label: 'খালা / কুক', cat: 'cook' as UtilityCategory, title: 'খালা / কুকের বেতন' },
                    { label: 'অন্যান্য বিল', cat: 'other' as UtilityCategory, title: 'অন্যান্য খরচ' },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() => {
                        setUtilityCategory(p.cat);
                        setUtilityTitle(p.title);
                      }}
                      className={`text-xs py-1.5 px-2 rounded-lg font-medium transition-colors border ${
                        utilityCategory === p.cat
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={utilityTitle}
                  onChange={(e) => {
                    setUtilityTitle(e.target.value);
                    setUtilityError('');
                  }}
                  placeholder="বিলের শিরোনাম"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মোট টাকার পরিমাণ (৳)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ৳
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={utilityAmount}
                    onChange={(e) => {
                      setUtilityAmount(e.target.value);
                      setUtilityError('');
                    }}
                    placeholder="যেমন: ১৬০০০ বা 16000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                    required
                    autoFocus
                  />
                </div>
                {utilityError && (
                  <div className="text-xs text-rose-600 font-medium mt-1">
                    {utilityError}
                  </div>
                )}
                <div className="text-[11px] text-slate-500 mt-1">
                  এই বিলটি মেসের সব সক্রিয় সদস্যদের ({toBnNum(activeMembersCount)} জন) মধ্যে সমানভাবে ভাগ হবে।
                </div>
              </div>

              {/* Paid Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-800">
                  বিল কি পরিশোধ করা হয়েছে?
                </span>
                <button
                  type="button"
                  onClick={() => setUtilityIsPaid(!utilityIsPaid)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    utilityIsPaid
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {utilityIsPaid ? 'পরিশোধিত (পেইড)' : 'বকেয়া আছে'}
                </button>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={utilityNote}
                  onChange={(e) => setUtilityNote(e.target.value)}
                  placeholder="যেমন: মালিকের বিকাশে প্রেরিত / সেপ্টেম্বরের বিল"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUtilityModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-colors"
                >
                  {editingUtility ? 'আপডেট করুন' : 'বিল সংরক্ষণ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Expense */}
      <ConfirmModal
        isOpen={Boolean(expenseToDelete)}
        title="বাজার খরচ মুছে ফেলুন"
        message={`আপনি কি এই বাজার খরচটি মুছে ফেলতে চান?\n\nবিবরণ: ${expenseToDelete?.items || ''}\nপরিমাণ: ${formatTaka(expenseToDelete?.amount || 0)}`}
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        isDestructive={true}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={() => {
          if (expenseToDelete) {
            onDeleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
            showToast('বাজার খরচ সফলভাবে মুছে ফেলা হয়েছে!');
          }
        }}
      />

      {/* Confirmation Modal: Delete Utility */}
      <ConfirmModal
        isOpen={Boolean(utilityToDelete)}
        title="ইউটিলিটি বিল মুছে ফেলুন"
        message={`আপনি কি এই বিলটি মুছে ফেলতে চান?\n\nবিলের নাম: ${utilityToDelete?.title || ''}\nপরিমাণ: ${formatTaka(utilityToDelete?.amount || 0)}`}
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        isDestructive={true}
        onClose={() => setUtilityToDelete(null)}
        onConfirm={() => {
          if (utilityToDelete) {
            onDeleteUtility(utilityToDelete.id);
            setUtilityToDelete(null);
            showToast('ইউটিলিটি বিল সফলভাবে মুছে ফেলা হয়েছে!');
          }
        }}
      />
    </div>
  );
};

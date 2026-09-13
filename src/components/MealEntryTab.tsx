import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Utensils, 
  Sparkles, 
  Check, 
  Clock, 
  CalendarRange, 
  ListFilter,
  Sunrise,
  Sun,
  Moon,
  Ban,
  CheckCircle2,
  Users,
  AlertCircle
} from 'lucide-react';
import { Member, MealEntry } from '../types';
import { toBnNum, formatMeals, formatBengaliDate, formatMonthName } from '../utils/bengali';

interface MealEntryTabProps {
  members: Member[];
  meals: MealEntry[];
  selectedMonth: string;
  onSaveMeal: (meal: Omit<MealEntry, 'id'> & { id?: string }) => void;
  onBulkSaveMeals: (mealsToSave: (Omit<MealEntry, 'id'> & { id?: string })[]) => void;
  onCancelMeal?: (memberId: string, date: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const MealEntryTab: React.FC<MealEntryTabProps> = ({
  members,
  meals,
  selectedMonth,
  onSaveMeal,
  onBulkSaveMeals,
  onCancelMeal,
  onNavigateTab,
}) => {
  // Default to today if within selected month, else 1st of month
  const todayStr = new Date().toISOString().split('T')[0];
  const initialDate = todayStr.startsWith(selectedMonth)
    ? todayStr
    : `${selectedMonth}-01`;

  const [currentDate, setCurrentDate] = useState<string>(initialDate);
  const [viewMode, setViewMode] = useState<'daily' | 'mealTimes' | 'monthly'>('daily');
  const [timeSubMode, setTimeSubMode] = useState<'dailyTime' | 'monthSummary'>('dailyTime');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Active members
  const activeMembers = useMemo(() => members.filter((m) => m.active), [members]);

  // Days in selected month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Navigation helpers for dates
  const handlePrevDay = () => {
    const cur = new Date(currentDate);
    cur.setDate(cur.getDate() - 1);
    const prevStr = cur.toISOString().split('T')[0];
    if (prevStr.startsWith(selectedMonth)) {
      setCurrentDate(prevStr);
    }
  };

  const handleNextDay = () => {
    const cur = new Date(currentDate);
    cur.setDate(cur.getDate() + 1);
    const nextStr = cur.toISOString().split('T')[0];
    if (nextStr.startsWith(selectedMonth)) {
      setCurrentDate(nextStr);
    }
  };

  // Find existing meal entry for member & date
  const getMealForMember = (memberId: string, date: string): MealEntry => {
    const found = meals.find((m) => m.memberId === memberId && m.date === date);
    return (
      found || {
        id: '',
        memberId,
        date,
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        guestMeals: 0,
      }
    );
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleUpdateMeal = (
    memberId: string,
    field: 'breakfast' | 'lunch' | 'dinner' | 'guestMeals',
    value: number
  ) => {
    const current = getMealForMember(memberId, currentDate);
    const updated = {
      ...current,
      memberId,
      date: currentDate,
      [field]: Math.max(0, Math.round(value * 10) / 10),
    };
    onSaveMeal(updated);
    triggerToast('মিল আপডেট সংরক্ষিত হয়েছে');
  };

  // 1-Click Cancel all meals for a member for today
  const handleCancelMemberMeal = (memberId: string, memberName: string) => {
    if (onCancelMeal) {
      onCancelMeal(memberId, currentDate);
    } else {
      onSaveMeal({
        memberId,
        date: currentDate,
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        guestMeals: 0,
      });
    }
    triggerToast(`${memberName}-এর আজকের মিল বাতিল করা হয়েছে`);
  };

  // 1-Click Re-enable meal for a member for today
  const handleQuickEnableMeal = (memberId: string, memberName: string) => {
    const current = getMealForMember(memberId, currentDate);
    onSaveMeal({
      ...current,
      memberId,
      date: currentDate,
      breakfast: 0,
      lunch: 1,
      dinner: 1,
    });
    triggerToast(`${memberName}-এর মিল চালু করা হয়েছে (দুপুর ১ + রাত ১)`);
  };

  // Bulk presets for today
  const handleApplyPresetToAll = (presetType: 'standard' | 'full' | 'zero') => {
    const bulkList = activeMembers.map((member) => {
      const existing = getMealForMember(member.id, currentDate);
      if (presetType === 'standard') {
        // Breakfast 0, Lunch 1, Dinner 1
        return {
          ...existing,
          memberId: member.id,
          date: currentDate,
          breakfast: 0,
          lunch: 1,
          dinner: 1,
          guestMeals: existing.guestMeals || 0,
        };
      } else if (presetType === 'full') {
        // Breakfast 1, Lunch 1, Dinner 1
        return {
          ...existing,
          memberId: member.id,
          date: currentDate,
          breakfast: 1,
          lunch: 1,
          dinner: 1,
          guestMeals: existing.guestMeals || 0,
        };
      } else {
        // Zero all (Cancel for all members)
        return {
          ...existing,
          memberId: member.id,
          date: currentDate,
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          guestMeals: 0,
        };
      }
    });

    onBulkSaveMeals(bulkList);
    if (presetType === 'zero') {
      triggerToast('সবার মিল আজকের জন্য বাতিল (০) করা হয়েছে!');
    } else {
      triggerToast('সবার মিল সফলভাবে আপডেট হয়েছে!');
    }
  };

  // Current day total meals
  const currentDayMeals = activeMembers.reduce((sum, m) => {
    const entry = getMealForMember(m.id, currentDate);
    return sum + (entry.breakfast + entry.lunch + entry.dinner + entry.guestMeals);
  }, 0);

  // Time-wise breakdowns for currentDate
  const timeBreakdown = useMemo(() => {
    const breakfastEaters: { member: Member; amount: number }[] = [];
    const breakfastNonEaters: Member[] = [];
    let totalBreakfast = 0;

    const lunchEaters: { member: Member; amount: number }[] = [];
    const lunchNonEaters: Member[] = [];
    let totalLunch = 0;

    const dinnerEaters: { member: Member; amount: number }[] = [];
    const dinnerNonEaters: Member[] = [];
    let totalDinner = 0;

    const guestEaters: { member: Member; amount: number }[] = [];
    let totalGuest = 0;

    activeMembers.forEach((member) => {
      const entry = getMealForMember(member.id, currentDate);

      // Breakfast
      if (entry.breakfast > 0) {
        breakfastEaters.push({ member, amount: entry.breakfast });
        totalBreakfast += entry.breakfast;
      } else {
        breakfastNonEaters.push(member);
      }

      // Lunch
      if (entry.lunch > 0) {
        lunchEaters.push({ member, amount: entry.lunch });
        totalLunch += entry.lunch;
      } else {
        lunchNonEaters.push(member);
      }

      // Dinner
      if (entry.dinner > 0) {
        dinnerEaters.push({ member, amount: entry.dinner });
        totalDinner += entry.dinner;
      } else {
        dinnerNonEaters.push(member);
      }

      // Guest
      if (entry.guestMeals > 0) {
        guestEaters.push({ member, amount: entry.guestMeals });
        totalGuest += entry.guestMeals;
      }
    });

    return {
      breakfast: { eaters: breakfastEaters, nonEaters: breakfastNonEaters, total: totalBreakfast },
      lunch: { eaters: lunchEaters, nonEaters: lunchNonEaters, total: totalLunch },
      dinner: { eaters: dinnerEaters, nonEaters: dinnerNonEaters, total: totalDinner },
      guest: { eaters: guestEaters, total: totalGuest },
      dayGrandTotal: totalBreakfast + totalLunch + totalDinner + totalGuest,
    };
  }, [activeMembers, meals, currentDate]);

  // Monthly summary by meal time for each member
  const monthTimeSummary = useMemo(() => {
    const memberIdSet = new Set(activeMembers.map((m) => m.id));
    const monthMeals = meals.filter(
      (m) => m.date.startsWith(selectedMonth) && memberIdSet.has(m.memberId)
    );

    return activeMembers.map((member) => {
      let b = 0;
      let l = 0;
      let d = 0;
      let g = 0;
      let zeroDays = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const dStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
        const entry = monthMeals.find((m) => m.memberId === member.id && m.date === dStr);
        const dayTotal = (entry?.breakfast || 0) + (entry?.lunch || 0) + (entry?.dinner || 0) + (entry?.guestMeals || 0);
        if (entry) {
          b += Number(entry.breakfast) || 0;
          l += Number(entry.lunch) || 0;
          d += Number(entry.dinner) || 0;
          g += Number(entry.guestMeals) || 0;
        }
        if (dayTotal === 0) {
          zeroDays += 1;
        }
      }

      return {
        member,
        breakfast: b,
        lunch: l,
        dinner: d,
        guest: g,
        total: b + l + d + g,
        zeroDays,
      };
    });
  }, [activeMembers, meals, selectedMonth, daysInMonth]);

  return (
    <div className="space-y-4 pb-8">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg border border-orange-500/40 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-green-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Controls: 3-Way Mode Switcher (Daily vs Time Breakdown vs Monthly Sheet) */}
      <div className="flex items-center justify-between bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 shadow-sm flex-wrap gap-2">
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-100 rounded-xl flex-wrap">
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>দৈনিক এন্ট্রি</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('mealTimes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              viewMode === 'mealTimes'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>কে কোন সময়ের মিল দিয়েছে</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('monthly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              viewMode === 'monthly'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>মাসিক মিল শিট</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium px-2">
          মাস: <span className="font-bold text-slate-800">{formatMonthName(selectedMonth)}</span>
        </div>
      </div>

      {/* VIEW 1: DAILY ENTRY */}
      {viewMode === 'daily' && (
        <>
          {/* Date Selector Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 disabled:opacity-40 cursor-pointer"
              title="আগের দিন"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="text-xs text-orange-400 font-medium flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>তারিখ নির্বাচন</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                {formatBengaliDate(currentDate)}
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                আজকের মোট মিল: <span className="text-orange-400 font-bold">{formatMeals(currentDayMeals)}</span> টি
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 disabled:opacity-40 cursor-pointer"
              title="পরের দিন"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Preset Actions */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>এক ক্লিকে সবার মিল:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleApplyPresetToAll('standard')}
                className="text-xs px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold border border-orange-200 transition-colors cursor-pointer"
              >
                দুপুর ১ + রাত ১
              </button>
              <button
                type="button"
                onClick={() => handleApplyPresetToAll('full')}
                className="text-xs px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold border border-sky-200 transition-colors cursor-pointer"
              >
                সকাল ১ + দুপুর ১ + রাত ১
              </button>
              <button
                type="button"
                onClick={() => handleApplyPresetToAll('zero')}
                className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                title="সবার আজকের মিল বাতিল করুন"
              >
                <Ban className="w-3 h-3" />
                <span>সবার মিল বাতিল (০)</span>
              </button>
            </div>
          </div>

          {/* Member Meal Cards List */}
          <div className="space-y-3">
            {activeMembers.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center text-slate-500 border border-slate-200 space-y-3">
                <p className="font-medium text-sm">কোনো সক্রিয় সদস্য পাওয়া যায়নি। প্রথমে মেম্বার যোগ করুন।</p>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('members')}
                    className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <span>+ মেম্বার যোগ করুন</span>
                  </button>
                )}
              </div>
            ) : (
              activeMembers.map((member) => {
                const meal = getMealForMember(member.id, currentDate);
                const dayTotal = meal.breakfast + meal.lunch + meal.dinner + meal.guestMeals;

                return (
                  <div
                    key={member.id}
                    className={`bg-white rounded-2xl border transition-all p-4 shadow-sm ${
                      dayTotal === 0
                        ? 'border-slate-200 bg-slate-50/40'
                        : 'border-slate-200/90 hover:border-orange-300/80'
                    }`}
                  >
                    {/* Card Header with Member Name & 1-Click Cancel / Enable */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          <span>{member.name}</span>
                          {dayTotal === 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                              মিল বাতিল
                            </span>
                          )}
                        </h4>
                        <div className="text-[11px] text-slate-400">
                          {member.roomOrNote || member.phone || 'রুম / ফোন নম্বর নেই'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {dayTotal > 0 ? (
                          <>
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 text-orange-700 font-extrabold text-sm border border-orange-200/60">
                              <Utensils className="w-3.5 h-3.5 text-orange-600" />
                              <span>{formatMeals(dayTotal)} টি</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCancelMemberMeal(member.id, member.name)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                              title="আজকের সকল মিল বাতিল করুন (০)"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>মিল বাতিল (০)</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-slate-400 font-medium italic">
                              ০ মিল
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickEnableMeal(member.id, member.name)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
                              title="মিল চালু করুন (দুপুর ১ + রাত ১)"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>মিল চালু (১+১)</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Meal Counters: Breakfast, Lunch, Dinner, Guest Meals */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                      {/* Breakfast (সকাল) */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1.5">
                          <span className="flex items-center gap-1">
                            <Sunrise className="w-3 h-3 text-amber-500" />
                            <span>সকাল</span>
                          </span>
                          <span className={`font-bold ${meal.breakfast > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                            {toBnNum(meal.breakfast)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateMeal(member.id, 'breakfast', meal.breakfast - 0.5)}
                            disabled={meal.breakfast <= 0}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm disabled:opacity-30 hover:bg-slate-100 cursor-pointer"
                          >
                            -
                          </button>
                          <div className="flex gap-1">
                            {[0, 0.5, 1].map((v) => (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleUpdateMeal(member.id, 'breakfast', v)}
                                className={`text-[11px] px-1.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                                  meal.breakfast === v
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {v === 0 ? '০' : toBnNum(v)}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUpdateMeal(member.id, 'breakfast', meal.breakfast + 0.5)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm hover:bg-slate-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Lunch (দুপুর) */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1.5">
                          <span className="flex items-center gap-1">
                            <Sun className="w-3 h-3 text-amber-600" />
                            <span>দুপুর</span>
                          </span>
                          <span className={`font-bold ${meal.lunch > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                            {toBnNum(meal.lunch)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateMeal(member.id, 'lunch', meal.lunch - 0.5)}
                            disabled={meal.lunch <= 0}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm disabled:opacity-30 hover:bg-slate-100 cursor-pointer"
                          >
                            -
                          </button>
                          <div className="flex gap-1">
                            {[0, 1, 1.5].map((v) => (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleUpdateMeal(member.id, 'lunch', v)}
                                className={`text-[11px] px-1.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                                  meal.lunch === v
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {v === 0 ? '০' : toBnNum(v)}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUpdateMeal(member.id, 'lunch', meal.lunch + 0.5)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm hover:bg-slate-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Dinner (রাত) */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1.5">
                          <span className="flex items-center gap-1">
                            <Moon className="w-3 h-3 text-indigo-500" />
                            <span>রাত</span>
                          </span>
                          <span className={`font-bold ${meal.dinner > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                            {toBnNum(meal.dinner)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateMeal(member.id, 'dinner', meal.dinner - 0.5)}
                            disabled={meal.dinner <= 0}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm disabled:opacity-30 hover:bg-slate-100 cursor-pointer"
                          >
                            -
                          </button>
                          <div className="flex gap-1">
                            {[0, 1, 1.5].map((v) => (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleUpdateMeal(member.id, 'dinner', v)}
                                className={`text-[11px] px-1.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                                  meal.dinner === v
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {v === 0 ? '০' : toBnNum(v)}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUpdateMeal(member.id, 'dinner', meal.dinner + 0.5)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm hover:bg-slate-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Guest Meals (মেহমান মিল) */}
                      <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
                        <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1.5">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-amber-600" />
                            <span>মেহমান</span>
                          </span>
                          <span className={`font-bold ${meal.guestMeals > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                            {toBnNum(meal.guestMeals)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateMeal(member.id, 'guestMeals', meal.guestMeals - 1)}
                            disabled={meal.guestMeals <= 0}
                            className="w-7 h-7 rounded-lg bg-white border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-sm disabled:opacity-30 hover:bg-amber-100 cursor-pointer"
                          >
                            -
                          </button>
                          <div className="flex gap-1">
                            {[0, 1, 2].map((v) => (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleUpdateMeal(member.id, 'guestMeals', v)}
                                className={`text-[11px] px-1.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                                  meal.guestMeals === v
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-100'
                                }`}
                              >
                                {v === 0 ? '০' : toBnNum(v)}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUpdateMeal(member.id, 'guestMeals', meal.guestMeals + 1)}
                            className="w-7 h-7 rounded-lg bg-white border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-sm hover:bg-amber-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* VIEW 2: MEAL TIMES BREAKDOWN (কে কোন সময়ের মিল দিয়েছে) */}
      {viewMode === 'mealTimes' && (
        <div className="space-y-4">
          {/* Sub Switcher: Specific Date vs Whole Month */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTimeSubMode('dailyTime')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeSubMode === 'dailyTime'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              আজকের / তারিখ অনুযায়ী
            </button>
            <button
              type="button"
              onClick={() => setTimeSubMode('monthSummary')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeSubMode === 'monthSummary'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              পুরো মাসের সময়ভিত্তিক বিবরণী
            </button>
          </div>

          {timeSubMode === 'dailyTime' ? (
            <>
              {/* Date Header for Times View */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevDay}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 cursor-pointer"
                  title="আগের দিন"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <div className="text-xs text-orange-400 font-semibold flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>সময়ের তালিকা</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                    {formatBengaliDate(currentDate)}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    মোট মিল: <span className="text-orange-400 font-bold">{formatMeals(timeBreakdown.dayGrandTotal)}</span> টি
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextDay}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 cursor-pointer"
                  title="পরের দিন"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Time Slots Cards */}
              <div className="space-y-3">
                {/* 1. Morning / Breakfast */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Sunrise className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">সকালের নাস্তা (Breakfast)</h4>
                        <div className="text-[11px] text-slate-500">
                          {toBnNum(timeBreakdown.breakfast.eaters.length)} জন মিল দিয়েছে
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-extrabold text-amber-600">
                        {toBnNum(timeBreakdown.breakfast.total)} টি
                      </span>
                      <div className="text-[10px] text-slate-400">সকালের মোট মিল</div>
                    </div>
                  </div>

                  {/* Eaters List */}
                  {timeBreakdown.breakfast.eaters.length > 0 ? (
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-1.5">
                        যারা সকালের মিল দিয়েছে:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {timeBreakdown.breakfast.eaters.map(({ member, amount }) => (
                          <div
                            key={member.id}
                            className="bg-amber-50/60 border border-amber-200/70 p-2.5 rounded-xl flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900">{member.name}</div>
                              <div className="text-[10px] text-slate-400">{member.roomOrNote || member.phone}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-amber-200/70 text-amber-800">
                                {toBnNum(amount)} মিল
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateMeal(member.id, 'breakfast', 0)}
                                className="text-[10px] text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                                title="সকালের মিল বাতিল করুন"
                              >
                                বাতিল
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-xl text-center text-xs text-slate-400">
                      সকালে কেউ মিল দেয়নি।
                    </div>
                  )}

                  {/* Non-Eaters / Cancelled */}
                  {timeBreakdown.breakfast.nonEaters.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium mb-1">
                        সকালের মিল বাতিল / বন্ধ রেখেছেন ({toBnNum(timeBreakdown.breakfast.nonEaters.length)} জন):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {timeBreakdown.breakfast.nonEaters.map((m) => (
                          <span
                            key={m.id}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 font-medium"
                          >
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Lunch / দুপুর */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">দুপুরের খাবার (Lunch)</h4>
                        <div className="text-[11px] text-slate-500">
                          {toBnNum(timeBreakdown.lunch.eaters.length)} জন মিল দিয়েছে
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-extrabold text-orange-600">
                        {toBnNum(timeBreakdown.lunch.total)} টি
                      </span>
                      <div className="text-[10px] text-slate-400">দুপুরের মোট মিল</div>
                    </div>
                  </div>

                  {/* Eaters List */}
                  {timeBreakdown.lunch.eaters.length > 0 ? (
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-1.5">
                        যারা দুপুরের মিল দিয়েছে:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {timeBreakdown.lunch.eaters.map(({ member, amount }) => (
                          <div
                            key={member.id}
                            className="bg-orange-50/60 border border-orange-200/70 p-2.5 rounded-xl flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900">{member.name}</div>
                              <div className="text-[10px] text-slate-400">{member.roomOrNote || member.phone}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-orange-200/70 text-orange-800">
                                {toBnNum(amount)} মিল
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateMeal(member.id, 'lunch', 0)}
                                className="text-[10px] text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                                title="দুপুরের মিল বাতিল করুন"
                              >
                                বাতিল
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-xl text-center text-xs text-slate-400">
                      দুপুরে কেউ মিল দেয়নি।
                    </div>
                  )}

                  {/* Non-Eaters / Cancelled */}
                  {timeBreakdown.lunch.nonEaters.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium mb-1">
                        দুপুরের মিল বাতিল / বন্ধ রেখেছেন ({toBnNum(timeBreakdown.lunch.nonEaters.length)} জন):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {timeBreakdown.lunch.nonEaters.map((m) => (
                          <span
                            key={m.id}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 font-medium"
                          >
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Dinner / রাত */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">রাতের খাবার (Dinner)</h4>
                        <div className="text-[11px] text-slate-500">
                          {toBnNum(timeBreakdown.dinner.eaters.length)} জন মিল দিয়েছে
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-extrabold text-indigo-600">
                        {toBnNum(timeBreakdown.dinner.total)} টি
                      </span>
                      <div className="text-[10px] text-slate-400">রাতের মোট মিল</div>
                    </div>
                  </div>

                  {/* Eaters List */}
                  {timeBreakdown.dinner.eaters.length > 0 ? (
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-1.5">
                        যারা রাতের মিল দিয়েছে:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {timeBreakdown.dinner.eaters.map(({ member, amount }) => (
                          <div
                            key={member.id}
                            className="bg-indigo-50/60 border border-indigo-200/70 p-2.5 rounded-xl flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900">{member.name}</div>
                              <div className="text-[10px] text-slate-400">{member.roomOrNote || member.phone}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-indigo-200/70 text-indigo-800">
                                {toBnNum(amount)} মিল
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateMeal(member.id, 'dinner', 0)}
                                className="text-[10px] text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                                title="রাতের মিল বাতিল করুন"
                              >
                                বাতিল
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-xl text-center text-xs text-slate-400">
                      রাতে কেউ মিল দেয়নি।
                    </div>
                  )}

                  {/* Non-Eaters / Cancelled */}
                  {timeBreakdown.dinner.nonEaters.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium mb-1">
                        রাতের মিল বাতিল / বন্ধ রেখেছেন ({toBnNum(timeBreakdown.dinner.nonEaters.length)} জন):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {timeBreakdown.dinner.nonEaters.map((m) => (
                          <span
                            key={m.id}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 font-medium"
                          >
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Guest Meals (মেহমান মিল) */}
                {timeBreakdown.guest.eaters.length > 0 && (
                  <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-amber-900">মেহমান মিল (Guest Meals)</h4>
                          <div className="text-[11px] text-amber-700">অতিরিক্ত মেহমান মিল এন্ট্রি</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-extrabold text-amber-700">
                          {toBnNum(timeBreakdown.guest.total)} টি
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {timeBreakdown.guest.eaters.map(({ member, amount }) => (
                        <div
                          key={member.id}
                          className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between"
                        >
                          <div className="text-xs font-bold text-slate-900">{member.name}</div>
                          <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-amber-200 text-amber-800">
                            {toBnNum(amount)} টি মেহমান মিল
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Whole Month Time-wise Summary */
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    মাসিক সময়ভিত্তিক মিল বিবরণী ({formatMonthName(selectedMonth)})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    প্রতিটি সদস্যের সকাল, দুপুর, রাত ও মেহমান মিলের মাসিক যোগফল
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {monthTimeSummary.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">কোনো সক্রিয় সদস্য নেই।</div>
                ) : (
                  monthTimeSummary.map((item) => (
                    <div
                      key={item.member.id}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-orange-300 transition-all"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                          <div className="text-sm sm:text-base font-bold text-slate-900">
                            {item.member.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.member.roomOrNote || item.member.phone || 'রুম / ফোন নেই'}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-black text-orange-600">
                            {formatMeals(item.total)} টি
                          </div>
                          <div className="text-[10px] text-slate-500">মাসের সর্বমোট মিল</div>
                        </div>
                      </div>

                      {/* Time badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                        <div className="bg-white p-2 rounded-xl border border-slate-200/80 text-center">
                          <div className="text-[11px] text-amber-700 font-semibold flex items-center justify-center gap-1">
                            <Sunrise className="w-3 h-3" />
                            <span>সকাল</span>
                          </div>
                          <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                            {toBnNum(item.breakfast)} টি
                          </div>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-slate-200/80 text-center">
                          <div className="text-[11px] text-orange-700 font-semibold flex items-center justify-center gap-1">
                            <Sun className="w-3 h-3" />
                            <span>দুপুর</span>
                          </div>
                          <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                            {toBnNum(item.lunch)} টি
                          </div>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-slate-200/80 text-center">
                          <div className="text-[11px] text-indigo-700 font-semibold flex items-center justify-center gap-1">
                            <Moon className="w-3 h-3" />
                            <span>রাত</span>
                          </div>
                          <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                            {toBnNum(item.dinner)} টি
                          </div>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-slate-200/80 text-center">
                          <div className="text-[11px] text-amber-800 font-semibold flex items-center justify-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>মেহমান</span>
                          </div>
                          <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                            {toBnNum(item.guest)} টি
                          </div>
                        </div>
                      </div>

                      {/* Zero/cancelled days alert */}
                      {item.zeroDays > 0 && (
                        <div className="mt-2.5 text-[11px] text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                          <Ban className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>এই মাসে {toBnNum(item.zeroDays)} দিন মিল সম্পূর্ণ বন্ধ/বাতিল ছিল</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: MONTHLY MATRIX SHEET */}
      {viewMode === 'monthly' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-orange-600" />
              <span>{formatMonthName(selectedMonth)} - তারিখভিত্তিক মিল শিট</span>
            </h3>
            <span className="text-xs text-slate-500">
              তারিখে ক্লিক করে সরাসরি সম্পাদন করুন
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="py-2.5 px-3 whitespace-nowrap sticky left-0 bg-slate-100 z-10">
                    তারিখ
                  </th>
                  {activeMembers.map((m) => (
                    <th key={m.id} className="py-2.5 px-2 text-center whitespace-nowrap min-w-[70px]">
                      {m.name.split(' ')[0]}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-center whitespace-nowrap bg-orange-50 text-orange-900 font-extrabold">
                    দিনের মোট
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const dayNum = i + 1;
                  const dayDate = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;
                  const isCurrentSelected = dayDate === currentDate;

                  let rowMessTotal = 0;

                  return (
                    <tr
                      key={dayDate}
                      onClick={() => {
                        setCurrentDate(dayDate);
                        setViewMode('daily');
                      }}
                      className={`cursor-pointer transition-colors ${
                        isCurrentSelected
                          ? 'bg-orange-50/70 font-semibold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-700 sticky left-0 bg-inherit z-10 flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-slate-200/70 text-slate-800 flex items-center justify-center font-bold text-[11px]">
                          {toBnNum(dayNum)}
                        </span>
                        <span>{toBnNum(dayNum)} তারিখ</span>
                      </td>

                      {activeMembers.map((m) => {
                        const meal = getMealForMember(m.id, dayDate);
                        const memberDayTotal = meal.breakfast + meal.lunch + meal.dinner + meal.guestMeals;
                        rowMessTotal += memberDayTotal;

                        return (
                          <td key={m.id} className="py-2 px-2 text-center whitespace-nowrap">
                            {memberDayTotal > 0 ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-orange-100/70 text-orange-800 font-bold">
                                {formatMeals(memberDayTotal)}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-2 px-3 text-center whitespace-nowrap font-bold text-orange-700 bg-orange-50/50">
                        {rowMessTotal > 0 ? `${formatMeals(rowMessTotal)} টি` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

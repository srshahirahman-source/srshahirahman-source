import React, { useState, useEffect, useMemo } from 'react';
import { Member, MealEntry, MarketExpense, UtilityBill, Deposit, MessSettings } from './types';
import { 
  getStoredMembers, 
  setStoredMembers, 
  getStoredMeals, 
  setStoredMeals, 
  getStoredExpenses, 
  setStoredExpenses, 
  getStoredUtilities, 
  setStoredUtilities, 
  getStoredDeposits, 
  setStoredDeposits, 
  getSelectedMonth, 
  setSelectedMonth as persistSelectedMonth, 
  getMessName, 
  setMessName as persistMessName,
  getStoredMessSettings,
  setStoredMessSettings
} from './utils/storage';
import { calculateMessData } from './utils/calculations';
import { Header } from './components/Header';
import { BottomNav, AppTab } from './components/BottomNav';
import { DashboardTab } from './components/DashboardTab';
import { MealEntryTab } from './components/MealEntryTab';
import { MarketTab } from './components/MarketTab';
import { DepositBalanceTab } from './components/DepositBalanceTab';
import { MembersTab } from './components/MembersTab';
import { ShareReportModal } from './components/ShareReportModal';
import { DataBackupModal } from './components/DataBackupModal';
import { MealRateModal } from './components/MealRateModal';

export default function App() {
  // State from LocalStorage
  const [messName, setMessName] = useState<string>(() => getMessName());
  const [selectedMonth, setSelectedMonthState] = useState<string>(() => getSelectedMonth());
  const [members, setMembers] = useState<Member[]>(() => getStoredMembers());
  const [meals, setMeals] = useState<MealEntry[]>(() => getStoredMeals());
  const [expenses, setExpenses] = useState<MarketExpense[]>(() => getStoredExpenses());
  const [utilities, setUtilities] = useState<UtilityBill[]>(() => getStoredUtilities());
  const [deposits, setDeposits] = useState<Deposit[]>(() => getStoredDeposits());
  const [settings, setSettings] = useState<MessSettings>(() => getStoredMessSettings());

  // UI State
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isMealRateModalOpen, setIsMealRateModalOpen] = useState(false);

  // Sync to local storage
  const handleUpdateMessName = (name: string) => {
    setMessName(name);
    persistMessName(name);
  };

  const handleSelectMonth = (month: string) => {
    setSelectedMonthState(month);
    persistSelectedMonth(month);
  };

  const handleUpdateSettings = (newSettings: MessSettings) => {
    setSettings(newSettings);
    setStoredMessSettings(newSettings);
  };

  // Ensure consistency: immediately purge any orphaned data from previously deleted members
  useEffect(() => {
    const memberIdSet = new Set(members.map((m) => m.id));

    setMeals((currentMeals) => {
      const valid = currentMeals.filter((m) => memberIdSet.has(m.memberId));
      if (valid.length !== currentMeals.length) {
        setStoredMeals(valid);
        return valid;
      }
      return currentMeals;
    });

    setDeposits((currentDeposits) => {
      const valid = currentDeposits.filter((d) => memberIdSet.has(d.memberId));
      if (valid.length !== currentDeposits.length) {
        setStoredDeposits(valid);
        return valid;
      }
      return currentDeposits;
    });

    setExpenses((currentExpenses) => {
      const valid = currentExpenses.filter((e) => !e.memberId || memberIdSet.has(e.memberId));
      if (valid.length !== currentExpenses.length) {
        setStoredExpenses(valid);
        return valid;
      }
      return currentExpenses;
    });
  }, [members]);

  const reloadAllData = () => {
    setMessName(getMessName());
    setSelectedMonthState(getSelectedMonth());
    setMembers(getStoredMembers());
    setMeals(getStoredMeals());
    setExpenses(getStoredExpenses());
    setUtilities(getStoredUtilities());
    setDeposits(getStoredDeposits());
    setSettings(getStoredMessSettings());
  };

  // Real-time calculations with user-selected meal rate settings & deduction
  const { summary, memberCalculations } = useMemo(() => {
    return calculateMessData(members, meals, expenses, utilities, deposits, selectedMonth, settings);
  }, [members, meals, expenses, utilities, deposits, selectedMonth, settings]);

  // Meals Handlers
  const handleSaveMeal = (mealToSave: Omit<MealEntry, 'id'> & { id?: string }) => {
    setMeals((prev) => {
      let updated: MealEntry[];
      if (mealToSave.id) {
        updated = prev.map((m) => (m.id === mealToSave.id ? (mealToSave as MealEntry) : m));
      } else {
        const existingIdx = prev.findIndex(
          (m) => m.memberId === mealToSave.memberId && m.date === mealToSave.date
        );
        if (existingIdx >= 0) {
          updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            ...mealToSave,
          };
        } else {
          const newEntry: MealEntry = {
            ...mealToSave,
            id: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          };
          updated = [...prev, newEntry];
        }
      }
      setStoredMeals(updated);
      return updated;
    });
  };

  const handleBulkSaveMeals = (mealsToSave: (Omit<MealEntry, 'id'> & { id?: string })[]) => {
    setMeals((prev) => {
      const updated = [...prev];
      mealsToSave.forEach((mealItem) => {
        const idx = updated.findIndex(
          (m) => m.memberId === mealItem.memberId && m.date === mealItem.date
        );
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            ...mealItem,
          };
        } else {
          updated.push({
            ...mealItem,
            id: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          });
        }
      });
      setStoredMeals(updated);
      return updated;
    });
  };

  const handleCancelMeal = (memberId: string, date: string) => {
    setMeals((prev) => {
      const idx = prev.findIndex((m) => m.memberId === memberId && m.date === date);
      let updated: MealEntry[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          guestMeals: 0,
        };
      } else {
        updated = [
          ...prev,
          {
            id: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            memberId,
            date,
            breakfast: 0,
            lunch: 0,
            dinner: 0,
            guestMeals: 0,
          },
        ];
      }
      setStoredMeals(updated);
      return updated;
    });
  };

  // Expenses Handlers
  const handleAddExpense = (expenseData: Omit<MarketExpense, 'id'>) => {
    const newExp: MarketExpense = {
      ...expenseData,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    setStoredExpenses(updated);
  };

  const handleUpdateExpense = (exp: MarketExpense) => {
    const updated = expenses.map((e) => (e.id === exp.id ? exp : e));
    setExpenses(updated);
    setStoredExpenses(updated);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    setStoredExpenses(updated);
  };

  // Utilities Handlers
  const handleAddUtility = (utilData: Omit<UtilityBill, 'id'>) => {
    const newUtil: UtilityBill = {
      ...utilData,
      id: `util_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...utilities, newUtil];
    setUtilities(updated);
    setStoredUtilities(updated);
  };

  const handleUpdateUtility = (util: UtilityBill) => {
    const updated = utilities.map((u) => (u.id === util.id ? util : u));
    setUtilities(updated);
    setStoredUtilities(updated);
  };

  const handleDeleteUtility = (id: string) => {
    const updated = utilities.filter((u) => u.id !== id);
    setUtilities(updated);
    setStoredUtilities(updated);
  };

  // Deposits Handlers
  const handleAddDeposit = (depData: Omit<Deposit, 'id'>) => {
    const newDep: Deposit = {
      ...depData,
      id: `dep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [newDep, ...deposits];
    setDeposits(updated);
    setStoredDeposits(updated);
  };

  const handleDeleteDeposit = (id: string) => {
    const updated = deposits.filter((d) => d.id !== id);
    setDeposits(updated);
    setStoredDeposits(updated);
  };

  // Members Handlers
  const handleAddMember = (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...memberData,
      id: `mem_${Date.now()}`,
    };
    const updated = [...members, newMember];
    setMembers(updated);
    setStoredMembers(updated);
  };

  const handleUpdateMember = (member: Member) => {
    const updated = members.map((m) => (m.id === member.id ? member : m));
    setMembers(updated);
    setStoredMembers(updated);
  };

  const handleDeleteMember = (id: string) => {
    // 1. Remove member
    const updatedMembers = members.filter((m) => m.id !== id);
    setMembers(updatedMembers);
    setStoredMembers(updatedMembers);

    // 2. Cascade delete all meals for this member
    const updatedMeals = meals.filter((m) => m.memberId !== id);
    setMeals(updatedMeals);
    setStoredMeals(updatedMeals);

    // 3. Cascade delete all deposits for this member
    const updatedDeposits = deposits.filter((d) => d.memberId !== id);
    setDeposits(updatedDeposits);
    setStoredDeposits(updatedDeposits);

    // 4. Cascade delete all market expenses for this member
    const updatedExpenses = expenses.filter((e) => e.memberId !== id);
    setExpenses(updatedExpenses);
    setStoredExpenses(updatedExpenses);

    // 5. Clear any utility bills paid by this member
    const updatedUtilities = utilities.map((u) =>
      u.paidByMemberId === id ? { ...u, paidByMemberId: undefined } : u
    );
    setUtilities(updatedUtilities);
    setStoredUtilities(updatedUtilities);
  };

  const handleAddMemberByName = (name: string): string => {
    const newMember: Member = {
      id: `mem_${Date.now()}`,
      name: name.trim(),
      phone: '',
      roomOrNote: '',
      joinDate: new Date().toISOString().split('T')[0],
      active: true,
    };
    const updated = [...members, newMember];
    setMembers(updated);
    setStoredMembers(updated);
    return newMember.id;
  };

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col ${isMobileFrame ? 'items-center py-4 sm:py-8' : ''}`}>
      {/* Outer Shell for Mobile Frame or Full Screen */}
      <div
        className={`w-full bg-slate-100 flex flex-col flex-1 ${
          isMobileFrame
            ? 'max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-slate-800 relative'
            : 'max-w-5xl mx-auto'
        }`}
      >
        {/* Mobile Mockup Speaker & Camera cutout when in Frame mode */}
        {isMobileFrame && (
          <div className="w-full bg-slate-900 py-2 px-6 flex items-center justify-between text-white text-[11px] font-mono z-40 shrink-0">
            <span>৯:৪১</span>
            <div className="w-16 h-3.5 bg-black rounded-full mx-auto" />
            <div className="flex items-center gap-1.5">
              <span>📶</span>
              <span>🔋 ১০০%</span>
            </div>
          </div>
        )}

        {/* Header */}
        <Header
          messName={messName}
          onUpdateMessName={handleUpdateMessName}
          selectedMonth={selectedMonth}
          onSelectMonth={handleSelectMonth}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenBackupModal={() => setIsBackupModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardTab
              summary={summary}
              memberCalculations={memberCalculations}
              recentExpenses={expenses.filter((e) => e.date.startsWith(selectedMonth))}
              members={members}
              selectedMonth={selectedMonth}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onOpenMealRateModal={() => setIsMealRateModalOpen(true)}
            />
          )}

          {activeTab === 'meals' && (
            <MealEntryTab
              members={members}
              meals={meals}
              selectedMonth={selectedMonth}
              onSaveMeal={handleSaveMeal}
              onBulkSaveMeals={handleBulkSaveMeals}
              onCancelMeal={handleCancelMeal}
              onNavigateTab={(tab) => setActiveTab(tab as AppTab)}
            />
          )}

          {activeTab === 'market' && (
            <MarketTab
              members={members}
              expenses={expenses}
              utilities={utilities}
              selectedMonth={selectedMonth}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              onAddUtility={handleAddUtility}
              onUpdateUtility={handleUpdateUtility}
              onDeleteUtility={handleDeleteUtility}
              onSelectMonth={handleSelectMonth}
            />
          )}

          {activeTab === 'balance' && (
            <DepositBalanceTab
              members={members}
              deposits={deposits}
              summary={summary}
              memberCalculations={memberCalculations}
              selectedMonth={selectedMonth}
              onAddDeposit={handleAddDeposit}
              onDeleteDeposit={handleDeleteDeposit}
              onOpenMealRateModal={() => setIsMealRateModalOpen(true)}
              onSelectMonth={handleSelectMonth}
              onAddNewMember={handleAddMemberByName}
              onNavigateTab={(tab) => setActiveTab(tab as AppTab)}
            />
          )}

          {activeTab === 'members' && (
            <MembersTab
              members={members}
              memberCalculations={memberCalculations}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>

      {/* MODALS */}
      <ShareReportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        messName={messName}
        selectedMonth={selectedMonth}
        summary={summary}
        memberCalculations={memberCalculations}
      />

      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataReloaded={reloadAllData}
      />

      <MealRateModal
        isOpen={isMealRateModalOpen}
        onClose={() => setIsMealRateModalOpen(false)}
        settings={settings}
        autoCalculatedRate={summary.autoCalculatedMealRate}
        totalMarketCost={summary.totalMarketCost}
        totalMeals={summary.totalMeals}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}

import { Member, MealEntry, MarketExpense, UtilityBill, Deposit, MessSettings } from '../types';

const STORAGE_KEYS = {
  MEMBERS: 'amader_mess_members_v2',
  MEALS: 'amader_mess_meals_v2',
  EXPENSES: 'amader_mess_expenses_v2',
  UTILITIES: 'amader_mess_utilities_v2',
  DEPOSITS: 'amader_mess_deposits_v2',
  SELECTED_MONTH: 'amader_mess_selected_month_v2',
  MESS_NAME: 'amader_mess_name_v2',
  SETTINGS: 'amader_mess_settings_v2',
};

// Clean up legacy v1 mock data from browser localStorage
try {
  const legacyV1Keys = [
    'amader_mess_members_v1',
    'amader_mess_meals_v1',
    'amader_mess_expenses_v1',
    'amader_mess_utilities_v1',
    'amader_mess_deposits_v1',
    'amader_mess_selected_month_v1',
    'amader_mess_name_v1',
    'amader_mess_settings_v1',
  ];
  legacyV1Keys.forEach((key) => localStorage.removeItem(key));
} catch {
  // Ignore storage errors
}

const DEFAULT_SETTINGS: MessSettings = {
  mealRateMode: 'auto',
  fixedMealRate: 50,
};

// Clean defaults: no strangers' mock data. Only user-added entries will be saved.
const DEFAULT_MEMBERS: Member[] = [];

const DEFAULT_MEALS: MealEntry[] = [];
const DEFAULT_EXPENSES: MarketExpense[] = [];
const DEFAULT_UTILITIES: UtilityBill[] = [];
const DEFAULT_DEPOSITS: Deposit[] = [];

export function getStoredMembers(): Member[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!raw) {
      setStoredMembers(DEFAULT_MEMBERS);
      return DEFAULT_MEMBERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load members from localStorage', e);
    return DEFAULT_MEMBERS;
  }
}

export function setStoredMembers(members: Member[]): void {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
}

export function getStoredMeals(): MealEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEALS);
    if (!raw) {
      setStoredMeals(DEFAULT_MEALS);
      return DEFAULT_MEALS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load meals from localStorage', e);
    return DEFAULT_MEALS;
  }
}

export function setStoredMeals(meals: MealEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
}

export function getStoredExpenses(): MarketExpense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      setStoredExpenses(DEFAULT_EXPENSES);
      return DEFAULT_EXPENSES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load expenses from localStorage', e);
    return DEFAULT_EXPENSES;
  }
}

export function setStoredExpenses(expenses: MarketExpense[]): void {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
}

export function getStoredUtilities(): UtilityBill[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UTILITIES);
    if (!raw) {
      setStoredUtilities(DEFAULT_UTILITIES);
      return DEFAULT_UTILITIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load utilities from localStorage', e);
    return DEFAULT_UTILITIES;
  }
}

export function setStoredUtilities(utilities: UtilityBill[]): void {
  localStorage.setItem(STORAGE_KEYS.UTILITIES, JSON.stringify(utilities));
}

export function getStoredDeposits(): Deposit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEPOSITS);
    if (!raw) {
      setStoredDeposits(DEFAULT_DEPOSITS);
      return DEFAULT_DEPOSITS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load deposits from localStorage', e);
    return DEFAULT_DEPOSITS;
  }
}

export function setStoredDeposits(deposits: Deposit[]): void {
  localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));
}

export function getSelectedMonth(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SELECTED_MONTH);
    if (!raw) {
      const now = new Date();
      // default to 2026-09 to match sample or current system date
      const yr = now.getFullYear() || 2026;
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const def = `${yr}-${mo}`;
      localStorage.setItem(STORAGE_KEYS.SELECTED_MONTH, def);
      return def;
    }
    return raw;
  } catch {
    return '2026-09';
  }
}

export function setSelectedMonth(monthStr: string): void {
  localStorage.setItem(STORAGE_KEYS.SELECTED_MONTH, monthStr);
}

export function getMessName(): string {
  return localStorage.getItem(STORAGE_KEYS.MESS_NAME) || 'আমাদের মেস';
}

export function setMessName(name: string): void {
  localStorage.setItem(STORAGE_KEYS.MESS_NAME, name);
}

export function getStoredMessSettings(): MessSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!data) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(data);
    return {
      mealRateMode: parsed.mealRateMode === 'auto' ? 'auto' : 'fixed',
      fixedMealRate: Number(parsed.fixedMealRate) || 50,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function setStoredMessSettings(settings: MessSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function resetAllDataToDefault(): void {
  setStoredMembers(DEFAULT_MEMBERS);
  setStoredMeals(DEFAULT_MEALS);
  setStoredExpenses(DEFAULT_EXPENSES);
  setStoredUtilities(DEFAULT_UTILITIES);
  setStoredDeposits(DEFAULT_DEPOSITS);
  setMessName('আমাদের মেস');
  setStoredMessSettings(DEFAULT_SETTINGS);
}

export function exportAllDataAsJSON(): string {
  const data = {
    appName: 'Amader Mess',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    messName: getMessName(),
    selectedMonth: getSelectedMonth(),
    settings: getStoredMessSettings(),
    members: getStoredMembers(),
    meals: getStoredMeals(),
    expenses: getStoredExpenses(),
    utilities: getStoredUtilities(),
    deposits: getStoredDeposits(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllDataFromJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.members && Array.isArray(data.members)) {
      setStoredMembers(data.members);
    }
    if (data.meals && Array.isArray(data.meals)) {
      setStoredMeals(data.meals);
    }
    if (data.expenses && Array.isArray(data.expenses)) {
      setStoredExpenses(data.expenses);
    }
    if (data.utilities && Array.isArray(data.utilities)) {
      setStoredUtilities(data.utilities);
    }
    if (data.deposits && Array.isArray(data.deposits)) {
      setStoredDeposits(data.deposits);
    }
    if (data.messName) {
      setMessName(data.messName);
    }
    if (data.settings) {
      setStoredMessSettings(data.settings);
    }
    return true;
  } catch (e) {
    console.error('Failed to import data', e);
    return false;
  }
}

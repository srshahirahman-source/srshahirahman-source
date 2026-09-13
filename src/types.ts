export interface Member {
  id: string;
  name: string;
  phone: string;
  roomOrNote?: string;
  joinDate: string; // YYYY-MM-DD
  active: boolean;
}

export interface MealEntry {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  breakfast: number; // e.g. 0, 0.5, 1
  lunch: number; // e.g. 0, 1, 1.5, 2
  dinner: number; // e.g. 0, 1, 1.5, 2
  guestMeals: number; // e.g. 0, 1, 2
  note?: string;
}

export interface MarketExpense {
  id: string;
  memberId: string; // who did the bazar
  amount: number;
  date: string; // YYYY-MM-DD
  items: string; // grocery items (চাল, ডাল, তেল, সবজি, মাছ)
  note?: string;
}

export type UtilityCategory = 'rent' | 'electricity' | 'gas' | 'wifi' | 'cook' | 'waste' | 'other';

export interface UtilityBill {
  id: string;
  title: string; // e.g., বাড়ি ভাড়া, বিদ্যুৎ বিল, গ্যাস, ওয়াইফাই, খালা/কুক বেতন
  category: UtilityCategory;
  amount: number;
  month: string; // YYYY-MM
  isPaid: boolean;
  paidByMemberId?: string; // or paid from mess fund
  note?: string;
}

export interface Deposit {
  id: string;
  memberId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
}

export type MealRateMode = 'fixed' | 'auto';

export interface MessSettings {
  mealRateMode: MealRateMode; // 'fixed' = predetermined per-meal rate, 'auto' = calculated from bazar
  fixedMealRate: number; // e.g. 50 tk per meal
}

export interface MemberCalculation {
  memberId: string;
  memberName: string;
  phone: string;
  roomOrNote?: string;
  breakfastCount: number;
  lunchCount: number;
  dinnerCount: number;
  guestMealCount: number;
  totalMeals: number;
  mealRate: number; // the active meal rate applied
  mealCost: number; // totalMeals * mealRate
  utilityShare: number;
  totalDeposit: number; // total amount deposited by member
  totalCost: number; // mealCost + utilityShare (total deduction)
  netBalance: number; // totalDeposit - totalCost
  deductedAmount: number; // amount deducted from deposit: Math.min(totalDeposit, totalCost)
  status: 'advance' | 'due' | 'balanced'; // advance (টাকা ফেরত পাবে), due (বকেয়া দিতে হবে)
}

export interface MessSummary {
  totalMarketCost: number;
  totalMeals: number;
  mealRate: number; // active meal rate applied
  autoCalculatedMealRate: number; // totalMarketCost / totalMeals
  fixedMealRate: number;
  mealRateMode: MealRateMode;
  totalDeposits: number;
  totalUtilities: number;
  utilitySharePerMember: number;
  messFundBalance: number; // totalDeposits - totalMarketCost - (total paid utilities)
  totalDue: number; // sum of negative balances
  totalAdvance: number; // sum of positive balances
  memberCount: number;
}

import { Member, MealEntry, MarketExpense, UtilityBill, Deposit, MemberCalculation, MessSummary, MessSettings } from '../types';

export function calculateMessData(
  members: Member[],
  meals: MealEntry[],
  expenses: MarketExpense[],
  utilities: UtilityBill[],
  deposits: Deposit[],
  selectedMonth: string, // "YYYY-MM"
  settings?: MessSettings
): { summary: MessSummary; memberCalculations: MemberCalculation[] } {
  // Active members
  const activeMembers = members.filter((m) => m.active);
  const memberCount = activeMembers.length;
  const activeMemberIds = new Set(activeMembers.map((m) => m.id));
  const allMemberIds = new Set(members.map((m) => m.id));

  // Filter for the selected month AND only for valid active members
  const monthMeals = meals.filter((m) => m.date.startsWith(selectedMonth) && activeMemberIds.has(m.memberId));
  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const monthUtilities = utilities.filter((u) => u.month === selectedMonth);
  const monthDeposits = deposits.filter((d) => d.date.startsWith(selectedMonth) && allMemberIds.has(d.memberId));
  const totalMarketCost = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // 2. Total Meals Consumed for Month
  let totalBreakfast = 0;
  let totalLunch = 0;
  let totalDinner = 0;
  let totalGuestMeals = 0;

  monthMeals.forEach((m) => {
    totalBreakfast += Number(m.breakfast) || 0;
    totalLunch += Number(m.lunch) || 0;
    totalDinner += Number(m.dinner) || 0;
    totalGuestMeals += Number(m.guestMeals) || 0;
  });

  const totalMeals = totalBreakfast + totalLunch + totalDinner + totalGuestMeals;

  // 3. Auto-calculated meal rate from market cost: Total Cost / Total Meals
  const autoCalculatedMealRate = totalMeals > 0 ? totalMarketCost / totalMeals : 0;

  // Active meal rate applied based on user preference (Fixed / Pre-set or Auto)
  const mealRateMode = settings?.mealRateMode || 'fixed';
  const fixedMealRate = settings?.fixedMealRate !== undefined ? settings.fixedMealRate : 50;

  const mealRate =
    mealRateMode === 'fixed' && fixedMealRate > 0
      ? fixedMealRate
      : autoCalculatedMealRate;

  // 4. Total Shared Utilities for Month
  const totalUtilities = monthUtilities.reduce((sum, u) => sum + (Number(u.amount) || 0), 0);
  const totalPaidUtilities = monthUtilities
    .filter((u) => u.isPaid)
    .reduce((sum, u) => sum + (Number(u.amount) || 0), 0);
  const utilitySharePerMember = memberCount > 0 ? totalUtilities / memberCount : 0;

  // 5. Total Deposits for Month
  const totalDeposits = monthDeposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  // 6. Mess Fund Balance / Cash in Hand
  const messFundBalance = totalDeposits - totalMarketCost - totalPaidUtilities;

  // 7. Member-wise calculations
  let totalDue = 0;
  let totalAdvance = 0;

  const memberCalculations: MemberCalculation[] = members.map((member) => {
    const memberMeals = monthMeals.filter((m) => m.memberId === member.id);
    let bf = 0;
    let ln = 0;
    let dn = 0;
    let gm = 0;

    memberMeals.forEach((m) => {
      bf += Number(m.breakfast) || 0;
      ln += Number(m.lunch) || 0;
      dn += Number(m.dinner) || 0;
      gm += Number(m.guestMeals) || 0;
    });

    const indTotalMeals = bf + ln + dn + gm;
    // Meal cost calculation using active meal rate (e.g. 50 tk * 25 meals = 1250 tk)
    const mealCost = indTotalMeals * mealRate;
    const utilityShare = member.active ? utilitySharePerMember : 0;
    // Total cost to deduct from member's deposit
    const totalCost = mealCost + utilityShare;

    const memberDeposits = monthDeposits.filter((d) => d.memberId === member.id);
    const indTotalDeposit = memberDeposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    // Final balance calculation: Total Deposit - Total Cost (টাকা জমা থেকে কেটে নেওয়া)
    const netBalance = indTotalDeposit - totalCost;
    const deductedAmount = Math.min(indTotalDeposit, totalCost);

    let status: 'advance' | 'due' | 'balanced' = 'balanced';
    if (netBalance > 0.5) {
      status = 'advance';
      totalAdvance += netBalance;
    } else if (netBalance < -0.5) {
      status = 'due';
      totalDue += Math.abs(netBalance);
    }

    return {
      memberId: member.id,
      memberName: member.name,
      phone: member.phone,
      roomOrNote: member.roomOrNote,
      breakfastCount: bf,
      lunchCount: ln,
      dinnerCount: dn,
      guestMealCount: gm,
      totalMeals: indTotalMeals,
      mealRate,
      mealCost,
      utilityShare,
      totalDeposit: indTotalDeposit,
      totalCost,
      netBalance,
      deductedAmount,
      status,
    };
  });

  const summary: MessSummary = {
    totalMarketCost,
    totalMeals,
    mealRate,
    autoCalculatedMealRate,
    fixedMealRate,
    mealRateMode,
    totalDeposits,
    totalUtilities,
    utilitySharePerMember,
    messFundBalance,
    totalDue,
    totalAdvance,
    memberCount,
  };

  return { summary, memberCalculations };
}

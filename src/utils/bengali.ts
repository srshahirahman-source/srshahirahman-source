// Bengali numerals and helpers

const bnDigits: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
  '.': '.',
  '-': '-',
};

export function toBnNum(input: number | string | undefined | null): string {
  if (input === undefined || input === null) return '০';
  const str = input.toString();
  if (str.trim() === '') return '০';
  return str.replace(/[0-9]/g, (digit) => bnDigits[digit] || digit);
}

export function formatTaka(amount: number | string, includeSymbol = true): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const formatted = absNum.toLocaleString('en-IN', {
    minimumFractionDigits: absNum % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  });
  const bnFormatted = toBnNum(formatted);
  const symbol = includeSymbol ? '৳ ' : '';
  return isNegative ? `-${symbol}${bnFormatted}` : `${symbol}${bnFormatted}`;
}

export function formatMeals(meals: number): string {
  const formatted = (Math.round(meals * 10) / 10).toString();
  return toBnNum(formatted);
}

export function parseBnFloat(input: string | number | undefined | null): number {
  if (input === undefined || input === null) return 0;
  if (typeof input === 'number') return isNaN(input) ? 0 : input;

  const enDigitsMap: { [key: string]: string } = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };

  // Convert Bengali digits to English digits
  let normalized = input.toString().replace(/[০-৯]/g, (char) => enDigitsMap[char] || char);
  // Remove currency symbols, commas, and other non-numeric chars except dot and minus
  normalized = normalized.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

export const BENGALI_MONTHS: { [key: string]: string } = {
  '01': 'জানুয়ারি',
  '02': 'ফেব্রুয়ারি',
  '03': 'মার্চ',
  '04': 'এপ্রিল',
  '05': 'মে',
  '06': 'জুন',
  '07': 'জুলাই',
  '08': 'আগস্ট',
  '09': 'সেপ্টেম্বর',
  '10': 'অক্টোবর',
  '11': 'নভেম্বর',
  '12': 'ডিসেম্বর',
};

export function formatMonthName(yearMonth: string): string {
  // input: "2026-09"
  if (!yearMonth || !yearMonth.includes('-')) return '';
  const [year, month] = yearMonth.split('-');
  const monthName = BENGALI_MONTHS[month] || month;
  return `${monthName} ${toBnNum(year)}`;
}

export function formatBengaliDate(dateStr: string): string {
  // input: "2026-09-13"
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const [year, month, day] = dateStr.split('-');
  const monthName = BENGALI_MONTHS[month] || month;
  return `${toBnNum(parseInt(day, 10))} ${monthName}, ${toBnNum(year)}`;
}

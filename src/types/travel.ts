export type TripType = "해외" | "국내";
export type TripStatus = "예정" | "진행중" | "완료";
export type ExpenseCategory = "항공" | "숙소" | "식비" | "교통" | "쇼핑" | "관광/액티비티" | "기타";
export type ScheduleItemType = "이동" | "숙소" | "식사" | "관광" | "기타";

export interface Trip {
  id: string;
  title: string;
  type: TripType;
  destination: string;
  country?: string;
  startDate: string;       // YYYY-MM-DD
  endDate: string;         // YYYY-MM-DD
  travelers: number;
  status: TripStatus;
  coverEmoji?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  tripId: string;
  date: string;            // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  amount: number;          // 원화
  currency: string;        // KRW, USD, JPY, EUR ...
  originalAmount?: number;
  receiptImage?: string;
  paidBy?: string;
}

export interface ScheduleItem {
  id: string;
  tripId: string;
  date: string;            // YYYY-MM-DD
  time?: string;
  title: string;
  description?: string;
  type: ScheduleItemType;
  reservationNumber?: string;
}

export interface TripWithExpenses extends Trip {
  expenses: Expense[];
  totalExpense: number;
  schedules: ScheduleItem[];
}

export interface AnnualExpenseStat {
  year: string;
  totalAmount: number;
  tripCount: number;
  avgPerTrip: number;
}

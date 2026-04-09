import { ExpenseCategory } from "@/types/travel";

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  "항공":           "#60a5fa",
  "숙소":           "#a78bfa",
  "식비":           "#34d399",
  "교통":           "#fbbf24",
  "쇼핑":           "#f472b6",
  "관광/액티비티":  "#fb923c",
  "기타":           "#94a3b8",
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  "항공":           "✈️",
  "숙소":           "🏨",
  "식비":           "🍽️",
  "교통":           "🚗",
  "쇼핑":           "🛍️",
  "관광/액티비티":  "🎡",
  "기타":           "📦",
};

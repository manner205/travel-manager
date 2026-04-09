"use client";

import { useState } from "react";
import { MOCK_TRIPS, MOCK_EXPENSES, getAnnualExpenseStats } from "@/lib/mock-data";
import { formatKRW, formatFullKRW, formatDate } from "@/lib/format";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/expense-colors";
import { ExpenseCategory } from "@/types/travel";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Cell, LabelList, PieChart, Pie, Tooltip,
} from "recharts";

function shortLabel(v: number): string {
  if (!v) return "";
  if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}억`;
  if (v >= 10_000) return `${Math.round(v / 10_000)}만`;
  return `${Math.round(v / 1_000)}천`;
}

export default function ExpensesPage() {
  const annualStats = getAnnualExpenseStats();
  const years = annualStats.map((s) => s.year).sort((a, b) => b.localeCompare(a));

  const [startYear, setStartYear] = useState<string | null>(null);
  const [endYear, setEndYear] = useState<string | null>(null);

  const isAll = !startYear && !endYear;
  const lo = startYear && endYear ? (startYear < endYear ? startYear : endYear) : startYear;
  const hi = startYear && endYear ? (startYear > endYear ? startYear : endYear) : startYear;

  const handleYearClick = (year: string) => {
    if (!startYear) {
      setStartYear(year);
      setEndYear(null);
    } else if (!endYear) {
      if (year === startYear) {
        setStartYear(null);
      } else {
        setEndYear(year);
      }
    } else {
      setStartYear(year);
      setEndYear(null);
    }
  };

  const isYearInRange = (year: string) => {
    if (!startYear) return false;
    if (!endYear) return year === startYear;
    return year >= (lo ?? "") && year <= (hi ?? "");
  };

  // 필터된 경비
  const filteredExpenses = MOCK_EXPENSES.filter((e) => {
    if (isAll) return true;
    const y = e.date.slice(0, 4);
    if (!endYear) return y === startYear;
    return y >= (lo ?? "") && y <= (hi ?? "");
  });

  const filteredTrips = MOCK_TRIPS.filter((t) => {
    if (isAll) return true;
    const y = t.startDate.slice(0, 4);
    if (!endYear) return y === startYear;
    return y >= (lo ?? "") && y <= (hi ?? "");
  });

  const totalAmount = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const completedTrips = filteredTrips.filter((t) => t.status === "완료");
  const tripCount = completedTrips.length;
  const avgPerTrip = tripCount > 0 ? Math.round(totalAmount / tripCount) : 0;

  // 카테고리별
  const categoryTotals = filteredExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const pieData = Object.entries(categoryTotals)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amount]) => ({
      name: cat as ExpenseCategory,
      value: amount,
      color: CATEGORY_COLORS[cat as ExpenseCategory],
    }));

  // 연도별 바 차트용
  const barData = annualStats.map((s) => ({
    year: s.year,
    amount: s.totalAmount,
    trips: s.tripCount,
  }));

  const rangeLabel = isAll
    ? "전체"
    : startYear && endYear
    ? `${lo} ~ ${hi}년`
    : `${startYear}년`;

  return (
    <div className="space-y-3">
      {/* 헤더 + 연도 필터 */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">경비 통계</h2>
          {!isAll && (
            <span className="text-xs text-[var(--color-text-secondary)]">{rangeLabel}</span>
          )}
        </div>
        <div className="overflow-x-auto" data-no-swipe>
          <div className="flex gap-1 rounded-xl bg-[var(--color-card)] p-1 border border-[var(--color-border)] w-max">
            <button
              onClick={() => { setStartYear(null); setEndYear(null); }}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                isAll ? "bg-[var(--color-accent)] text-black" : "text-[var(--color-text-secondary)] hover:text-white"
              }`}
            >
              전체
            </button>
            {years.map((y) => (
              <button
                key={y}
                onClick={() => handleYearClick(y)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  isYearInRange(y)
                    ? (y === lo || y === hi) || !endYear
                      ? "bg-[var(--color-accent)] text-black"
                      : "bg-[var(--color-accent)]/40 text-white"
                    : "text-[var(--color-text-secondary)] hover:text-white"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        {startYear && !endYear && (
          <p className="text-[10px] text-[var(--color-text-secondary)]">
            종료 연도를 선택하면 범위로 조회됩니다. 같은 연도를 다시 누르면 해제됩니다.
          </p>
        )}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2">
          <div className="text-[10px] text-[var(--color-text-secondary)]">{rangeLabel} 총 지출</div>
          <div className="mt-0.5 text-sm font-bold text-[var(--color-highlight)]">{formatKRW(totalAmount)}</div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2">
          <div className="text-[10px] text-[var(--color-text-secondary)]">여행 횟수</div>
          <div className="mt-0.5 text-sm font-bold text-white">{tripCount}회</div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2">
          <div className="text-[10px] text-[var(--color-text-secondary)]">평균 경비</div>
          <div className="mt-0.5 text-sm font-bold text-white">{formatKRW(avgPerTrip)}</div>
        </div>
      </div>

      {/* 연도별 바 차트 */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-3">
        <h3 className="text-xs font-medium text-[var(--color-text-secondary)] mb-3">연도별 지출 추이</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 16, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={48} cursor="pointer"
                onClick={(d: any) => handleYearClick(d.year)}>
                <LabelList dataKey="amount" position="top"
                  formatter={(v: any) => shortLabel(Number(v))}
                  style={{ fill: "#64748b", fontSize: 9 }} />
                {barData.map((entry) => {
                  const inRange = isYearInRange(entry.year);
                  return (
                    <Cell
                      key={entry.year}
                      fill="var(--color-highlight)"
                      fillOpacity={isAll || inRange ? 1 : 0.35}
                      stroke={inRange ? "var(--color-highlight)" : "none"}
                      strokeWidth={inRange ? 2 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* 연도 요약 버튼 */}
        <div className="mt-2 grid grid-cols-4 gap-1 border-t border-[var(--color-border)] pt-2">
          {annualStats.slice().reverse().map((s) => {
            const inRange = isYearInRange(s.year);
            return (
              <button key={s.year} onClick={() => handleYearClick(s.year)}
                className={`rounded-lg py-1 text-center transition-colors ${
                  inRange ? "bg-[var(--color-highlight)]/15 ring-1 ring-[var(--color-highlight)]/40" : "hover:bg-white/5"
                }`}>
                <div className="text-[9px] text-[var(--color-text-secondary)]">{s.year}</div>
                <div className={`text-[10px] font-semibold ${inRange ? "text-[var(--color-highlight)]" : "text-white"}`}>
                  {shortLabel(s.totalAmount)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 카테고리별 분석 */}
      {pieData.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <h3 className="text-xs font-medium text-[var(--color-text-secondary)] mb-3">카테고리별 분석</h3>
          <div className="flex items-center gap-4">
            <div className="h-36 w-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => formatFullKRW(Number(v))}
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "white",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{CATEGORY_ICONS[entry.name]}</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-white">{formatKRW(entry.value)}</span>
                    <span className="text-[9px] text-[var(--color-text-secondary)] ml-1">
                      {Math.round((entry.value / totalAmount) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 여행별 경비 목록 */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-4 py-2">
          <h3 className="text-xs font-medium text-[var(--color-text-secondary)]">여행별 지출</h3>
        </div>
        {completedTrips.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--color-text-secondary)]">데이터가 없어요</div>
        ) : (
          completedTrips
            .sort((a, b) => b.startDate.localeCompare(a.startDate))
            .map((trip, i) => {
              const total = MOCK_EXPENSES.filter((e) => e.tripId === trip.id).reduce((s, e) => s + e.amount, 0);
              return (
                <div key={trip.id} className={`flex items-center gap-3 px-4 py-2.5 ${
                  i < completedTrips.length - 1 ? "border-b border-[var(--color-border)]" : ""
                }`}>
                  <span className="text-xl">{trip.coverEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{trip.title}</div>
                    <div className="text-[10px] text-[var(--color-text-secondary)]">
                      {formatDate(trip.startDate)} · {trip.type} · {trip.travelers}명
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-highlight)] flex-shrink-0">
                    {formatKRW(total)}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}

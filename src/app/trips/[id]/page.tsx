"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getTripById, getTripExpenses, getTripSchedules } from "@/lib/db";
import { formatFullKRW, formatKRW, formatDate, formatDateRange, getTripNights } from "@/lib/format";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/expense-colors";
import { Trip, Expense, ScheduleItem, ExpenseCategory } from "@/types/travel";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type Tab = "일정" | "경비";

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<Tab>("경비");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTripById(id), getTripExpenses(id), getTripSchedules(id)])
      .then(([t, e, s]) => {
        setTrip(t);
        setExpenses(e);
        setSchedules(s);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-[var(--color-text-secondary)]">불러오는 중...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="text-4xl">🔍</div>
        <p className="text-[var(--color-text-secondary)]">여행을 찾을 수 없어요</p>
        <Link href="/trips" className="text-sm text-[var(--color-accent)]">목록으로 돌아가기</Link>
      </div>
    );
  }

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const nights = getTripNights(trip.startDate, trip.endDate);

  // 카테고리별 합산
  const categoryTotals = expenses.reduce((acc, e) => {
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

  // 날짜별 일정 그룹
  const scheduleByDate: Record<string, typeof schedules> = {};
  schedules.forEach((s) => {
    if (!scheduleByDate[s.date]) scheduleByDate[s.date] = [];
    scheduleByDate[s.date].push(s);
  });

  return (
    <div className="space-y-3">
      {/* 뒤로가기 + 헤더 */}
      <div className="pt-2 space-y-3">
        <Link href="/trips" className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-white">
          ← 목록으로
        </Link>
        <div className="flex items-start gap-3">
          <span className="text-4xl">{trip.coverEmoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white">{trip.title}</h2>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                trip.type === "해외"
                  ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                  : "bg-emerald-400/20 text-emerald-400"
              }`}>
                {trip.type}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                trip.status === "예정"
                  ? "bg-amber-400/20 text-amber-400"
                  : "bg-[var(--color-text-secondary)]/20 text-[var(--color-text-secondary)]"
              }`}>
                {trip.status}
              </span>
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-1">
              {formatDateRange(trip.startDate, trip.endDate)}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">
              {trip.destination} · {trip.travelers}명
            </div>
          </div>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2">
          <div className="text-[10px] text-[var(--color-text-secondary)]">총 경비</div>
          <div className="mt-0.5 text-sm font-bold text-[var(--color-highlight)]">{formatKRW(totalExpense)}</div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2">
          <div className="text-[10px] text-[var(--color-text-secondary)]">1인당</div>
          <div className="mt-0.5 text-sm font-bold text-white">
            {trip.travelers > 0 ? formatKRW(Math.round(totalExpense / trip.travelers)) : "-"}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2">
          <div className="text-[10px] text-[var(--color-text-secondary)]">1박당</div>
          <div className="mt-0.5 text-sm font-bold text-white">
            {nights > 0 ? formatKRW(Math.round(totalExpense / nights)) : "-"}
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 rounded-xl bg-[var(--color-card)] p-1 border border-[var(--color-border)]">
        {(["경비", "일정"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
              tab === t
                ? "bg-[var(--color-accent)] text-black"
                : "text-[var(--color-text-secondary)] hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 경비 탭 */}
      {tab === "경비" && (
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] py-10 text-center text-sm text-[var(--color-text-secondary)]">
              등록된 경비가 없어요
            </div>
          ) : (
            <>
              {/* 파이 차트 */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                <h3 className="text-xs font-medium text-[var(--color-text-secondary)] mb-3">카테고리별 지출</h3>
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
                            {Math.round((entry.value / totalExpense) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 경비 내역 */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
                <div className="border-b border-[var(--color-border)] px-4 py-2">
                  <h3 className="text-xs font-medium text-[var(--color-text-secondary)]">지출 내역</h3>
                </div>
                {expenses
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((expense, i) => (
                    <div key={expense.id} className={`flex items-center gap-3 px-4 py-2.5 ${
                      i < expenses.length - 1 ? "border-b border-[var(--color-border)]" : ""
                    }`}>
                      <span className="text-base">{CATEGORY_ICONS[expense.category]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white truncate">{expense.description}</div>
                        <div className="text-[10px] text-[var(--color-text-secondary)]">
                          {formatDate(expense.date)} · {expense.category}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-[var(--color-highlight)] flex-shrink-0">
                        {formatKRW(expense.amount)}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 일정 탭 */}
      {tab === "일정" && (
        <div className="space-y-3">
          {schedules.length === 0 ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] py-10 text-center text-sm text-[var(--color-text-secondary)]">
              등록된 일정이 없어요
            </div>
          ) : (
            Object.entries(scheduleByDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, items]) => (
                <div key={date} className="space-y-1.5">
                  <div className="text-xs font-semibold text-[var(--color-text-secondary)]">{formatDate(date)}</div>
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
                    {items.map((item, i) => (
                      <div key={item.id} className={`flex items-start gap-3 px-4 py-2.5 ${
                        i < items.length - 1 ? "border-b border-[var(--color-border)]" : ""
                      }`}>
                        <div className="text-[10px] text-[var(--color-text-secondary)] w-10 flex-shrink-0 pt-0.5">
                          {item.time || ""}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-white">{item.title}</div>
                          {item.description && (
                            <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">{item.description}</div>
                          )}
                          {item.reservationNumber && (
                            <div className="text-[10px] text-[var(--color-accent)] mt-0.5">예약번호: {item.reservationNumber}</div>
                          )}
                        </div>
                        <span className={`text-[9px] rounded-full px-1.5 py-0.5 flex-shrink-0 mt-0.5 ${
                          item.type === "이동" ? "bg-blue-400/20 text-blue-400" :
                          item.type === "숙소" ? "bg-purple-400/20 text-purple-400" :
                          item.type === "식사" ? "bg-green-400/20 text-green-400" :
                          item.type === "관광" ? "bg-orange-400/20 text-orange-400" :
                          "bg-gray-400/20 text-gray-400"
                        }`}>
                          {item.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}

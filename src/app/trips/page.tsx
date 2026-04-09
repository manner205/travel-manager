"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTrips, getAllExpenses } from "@/lib/db";
import { formatKRW, formatDate, getTripNights, getDday } from "@/lib/format";
import { Trip, Expense, TripType, TripStatus } from "@/types/travel";

type Filter = "전체" | TripType | TripStatus;

export default function TripsPage() {
  const [filter, setFilter] = useState<Filter>("전체");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const filters: Filter[] = ["전체", "예정", "완료", "해외", "국내"];

  useEffect(() => {
    Promise.all([getTrips(), getAllExpenses()])
      .then(([t, e]) => {
        setTrips(t);
        setExpenses(e);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = trips.filter((t) => {
    if (filter === "전체") return true;
    if (filter === "예정" || filter === "완료" || filter === "진행중") return t.status === filter;
    return t.type === filter;
  }).sort((a, b) => b.startDate.localeCompare(a.startDate));

  // 연도별 그룹
  const grouped: Record<string, typeof filtered> = {};
  filtered.forEach((t) => {
    const year = t.startDate.slice(0, 4);
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(t);
  });
  const sortedYears = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-[var(--color-text-secondary)]">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 헤더 + 필터 */}
      <div className="space-y-2 pt-2">
        <h2 className="text-base font-bold text-white">여행 목록</h2>
        <div className="overflow-x-auto" data-no-swipe>
          <div className="flex gap-1 rounded-xl bg-[var(--color-card)] p-1 border border-[var(--color-border)] w-max">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  filter === f
                    ? "bg-[var(--color-accent)] text-black"
                    : "text-[var(--color-text-secondary)] hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 데이터 없을 때 */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="text-4xl">🗺️</div>
          <p className="text-sm text-[var(--color-text-secondary)]">등록된 여행이 없어요</p>
        </div>
      )}

      {/* 연도별 그룹 */}
      {sortedYears.map((year) => (
        <section key={year} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{year}년</span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              {grouped[year].length}건 ·{" "}
              {formatKRW(
                grouped[year].reduce((sum, t) => {
                  return sum + expenses.filter((e) => e.tripId === t.id).reduce((s, e) => s + e.amount, 0);
                }, 0)
              )}
            </span>
          </div>
          <div className="space-y-2">
            {grouped[year].map((trip) => {
              const total = expenses.filter((e) => e.tripId === trip.id).reduce((s, e) => s + e.amount, 0);
              const nights = getTripNights(trip.startDate, trip.endDate);
              const isUpcoming = trip.status === "예정";
              return (
                <Link key={trip.id} href={`/trips/${trip.id}`}>
                  <div className={`rounded-xl border p-3 transition-colors cursor-pointer ${
                    isUpcoming
                      ? "border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)] hover:border-[var(--color-accent)]/60"
                      : "border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-card-hover)]"
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{trip.coverEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">{trip.title}</span>
                          <span className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                            trip.type === "해외"
                              ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                              : "bg-emerald-400/20 text-emerald-400"
                          }`}>
                            {trip.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                          {formatDate(trip.startDate)} · {nights}박 {nights + 1}일 · {trip.travelers}명
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {isUpcoming ? (
                          <div className="text-sm font-bold text-[var(--color-accent)]">{getDday(trip.startDate)}</div>
                        ) : (
                          <div className="text-sm font-semibold text-[var(--color-highlight)]">{formatKRW(total)}</div>
                        )}
                        <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">{trip.status}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

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
  const [memoTrip, setMemoTrip] = useState<Trip | null>(null);

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
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">여행 목록</h2>
          <Link href="/trips/new" className="rounded-xl bg-[var(--color-accent)] px-3 py-1.5 text-xs font-bold text-black">
            + 새 여행
          </Link>
        </div>
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
              const isAbroad = trip.type === "해외";
              return (
                <div key={trip.id} className={`rounded-xl border p-3 transition-colors ${
                    isUpcoming && isAbroad
                      ? "border-amber-400/50 bg-amber-400/5"
                      : isUpcoming
                      ? "border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)]"
                      : isAbroad
                      ? "border-amber-400/40 bg-amber-400/5"
                      : "border-[var(--color-border)] bg-[var(--color-card)]"
                  }`}>
                  <Link href={`/trips/${trip.id}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{trip.coverEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">{trip.title}</span>
                          <span className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                            trip.type === "해외"
                              ? "bg-amber-400/20 text-amber-400"
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
                  </Link>
                  {trip.notes && (
                    <button
                      onClick={() => setMemoTrip(trip)}
                      className="mt-2 w-full text-left rounded-lg bg-white/5 px-3 py-1.5 text-[10px] text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors line-clamp-1"
                    >
                      📝 {trip.notes}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
      {/* 메모 바텀시트 */}
      {memoTrip && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/60" onClick={() => setMemoTrip(null)}>
          <div
            className="w-full max-w-lg mx-auto rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 pt-4 pb-8 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-base mr-2">{memoTrip.coverEmoji}</span>
                <span className="text-sm font-bold text-white">{memoTrip.title}</span>
              </div>
              <button onClick={() => setMemoTrip(null)} className="text-[var(--color-text-secondary)] hover:text-white text-lg">✕</button>
            </div>
            <pre className="text-sm text-white whitespace-pre-wrap leading-relaxed font-sans">{memoTrip.notes}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

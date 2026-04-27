"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTrips, getAllExpenses, getAnnualExpenseStats } from "@/lib/db";
import { formatKRW, formatDate, getDday, getTripNights } from "@/lib/format";
import { Trip, Expense, AnnualExpenseStat } from "@/types/travel";

export default function DashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisYear = String(today.getFullYear());

  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [annualStats, setAnnualStats] = useState<AnnualExpenseStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [memoTrip, setMemoTrip] = useState<Trip | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleNotionSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/notion-sync", { method: "POST" });
      const data = await res.json();
      setSyncResult({ ok: data.ok, message: data.message });
    } catch {
      setSyncResult({ ok: false, message: "동기화 중 오류가 발생했습니다." });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(null), 4000);
    }
  }

  useEffect(() => {
    Promise.all([getTrips(), getAllExpenses(), getAnnualExpenseStats()])
      .then(([t, e, s]) => {
        setTrips(t);
        setExpenses(e);
        setAnnualStats(s);
      })
      .finally(() => setLoading(false));
  }, []);

  const upcomingTrips = trips
    .filter((t) => t.status === "예정")
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const recentTrips = trips
    .filter((t) => t.status === "완료")
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, 3);

  const thisYearTotal = expenses
    .filter((e) => e.date.startsWith(thisYear))
    .reduce((s, e) => s + e.amount, 0);

  const thisYearCompletedTrips = trips.filter(
    (t) => t.startDate.startsWith(thisYear) && t.status === "완료"
  );
  const thisYearTripCount = thisYearCompletedTrips.length;
  const thisYearNights = thisYearCompletedTrips.reduce(
    (s, t) => s + getTripNights(t.startDate, t.endDate), 0
  );

  const lastYear = String(today.getFullYear() - 1);
  const lastYearStat = annualStats.find((s) => s.year === lastYear);
  const lastYearNights = trips
    .filter((t) => t.startDate.startsWith(lastYear) && t.status === "완료")
    .reduce((s, t) => s + getTripNights(t.startDate, t.endDate), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-[var(--color-text-secondary)]">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-lg font-bold text-white">Young's Family Travel Manager ✈️</h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {today.getFullYear()}년 {today.getMonth() + 1}월 {today.getDate()}일
          </p>
        </div>
        <button
          onClick={handleNotionSync}
          disabled={syncing}
          className="flex items-center gap-1.5 rounded-xl bg-[#2e2e2e] border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#3a3a3a] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-sm">{syncing ? "⏳" : "🔄"}</span>
          {syncing ? "동기화 중..." : "Notion 동기화"}
        </button>
      </div>

      {/* 동기화 결과 토스트 */}
      {syncResult && (
        <div className={`rounded-xl px-4 py-2.5 text-xs font-medium text-center transition-all ${
          syncResult.ok
            ? "bg-green-500/20 border border-green-500/40 text-green-400"
            : "bg-red-500/20 border border-red-500/40 text-red-400"
        }`}>
          {syncResult.ok ? "✅ " : "❌ "}{syncResult.message}
        </div>
      )}

      {/* 예정된 여행 */}
      {upcomingTrips.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">예정된 여행</h2>
          {upcomingTrips.map((trip) => {
            const dday = getDday(trip.startDate);
            const nights = getTripNights(trip.startDate, trip.endDate);
            return (
              <Link key={trip.id} href={`/trips/${trip.id}`}>
                <div className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)] p-4 hover:border-[var(--color-accent)]/60 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{trip.coverEmoji}</span>
                      <div>
                        <div className="font-semibold text-white">{trip.title}</div>
                        <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                          {formatDate(trip.startDate)} · {nights}박 {nights + 1}일 · {trip.travelers}명
                        </div>
                        {trip.notes && (
                          <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">{trip.notes}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-lg font-bold text-[var(--color-accent)]">{dday}</div>
                      <div className="text-[10px] text-[var(--color-text-secondary)]">{trip.type}</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}

      {/* 올해 현황 */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">{thisYear}년 현황</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
            <div className="text-[10px] text-[var(--color-text-secondary)]">올해 총 지출</div>
            <div className="mt-1 text-base font-bold text-[var(--color-highlight)]">{formatKRW(thisYearTotal)}</div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
            <div className="text-[10px] text-[var(--color-text-secondary)]">완료된 여행</div>
            <div className="mt-1 text-base font-bold text-white">{thisYearTripCount}회 · {thisYearNights}박</div>
          </div>
          {lastYearStat && (
            <>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
                <div className="text-[10px] text-[var(--color-text-secondary)]">{lastYearStat.year}년 총 지출</div>
                <div className="mt-1 text-base font-bold text-white">{formatKRW(lastYearStat.totalAmount)}</div>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
                <div className="text-[10px] text-[var(--color-text-secondary)]">{lastYearStat.year}년 여행 횟수</div>
                <div className="mt-1 text-base font-bold text-white">{lastYearStat.tripCount}회 · {lastYearNights}박</div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 최근 여행 */}
      {recentTrips.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">최근 여행</h2>
            <Link href="/trips" className="text-xs text-[var(--color-accent)]">전체 보기</Link>
          </div>
          <div className="space-y-2">
            {recentTrips.map((trip) => {
              const total = expenses.filter((e) => e.tripId === trip.id).reduce((s, e) => s + e.amount, 0);
              const nights = getTripNights(trip.startDate, trip.endDate);
              return (
                <div key={trip.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3">
                  <Link href={`/trips/${trip.id}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{trip.coverEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{trip.title}</div>
                        <div className="text-[10px] text-[var(--color-text-secondary)]">
                          {formatDate(trip.startDate)} · {nights}박 · {trip.travelers}명
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-semibold text-[var(--color-highlight)]">{formatKRW(total)}</div>
                        <div className="text-[10px] text-[var(--color-text-secondary)]">{trip.type}</div>
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
      )}

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

      {/* 데이터 없을 때 */}
      {trips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="text-4xl">✈️</div>
          <p className="text-sm text-[var(--color-text-secondary)]">아직 등록된 여행이 없어요</p>
          <Link href="/trips/new" className="text-sm text-[var(--color-accent)]">첫 여행 추가하기</Link>
        </div>
      )}
    </div>
  );
}

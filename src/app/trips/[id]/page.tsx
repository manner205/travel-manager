"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTripById, getTripExpenses, getTripSchedules, deleteTrip, copyTrip, createExpense, updateExpense, deleteExpense, createSchedule, deleteSchedule } from "@/lib/db";
import { formatFullKRW, formatKRW, formatDate, formatDateRange, getTripNights } from "@/lib/format";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/expense-colors";
import { Trip, Expense, ScheduleItem, ExpenseCategory, ScheduleItemType } from "@/types/travel";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type Tab = "일정" | "경비";

const CATEGORIES: ExpenseCategory[] = ["항공", "숙소", "식비", "교통", "쇼핑", "관광/액티비티", "기타"];

function ExpenseModal({
  tripId,
  tripDate,
  onClose,
  onSaved,
}: {
  tripId: string;
  tripDate: string;
  onClose: () => void;
  onSaved: (e: Expense) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: tripDate,
    category: "식비" as ExpenseCategory,
    description: "",
    amount: "",
    currency: "KRW",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.description || !form.amount) {
      alert("내용과 금액을 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      const expense = await createExpense({
        tripId,
        date: form.date,
        category: form.category,
        description: form.description,
        amount: Number(form.amount.replace(/,/g, "")),
        currency: form.currency,
      });
      onSaved(expense);
    } catch {
      alert("저장 실패. 다시 시도해주세요.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 pt-4 pb-6 space-y-3 overflow-y-auto overflow-x-hidden max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">경비 추가</h3>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white text-lg">✕</button>
        </div>

        {/* 카테고리 */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">카테고리</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => set("category", c)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  form.category === c
                    ? "bg-[var(--color-accent)] text-black"
                    : "bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:text-white"
                }`}
              >
                {CATEGORY_ICONS[c]} {c}
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">날짜</label>
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="w-full max-w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* 금액 */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">금액 (원)</label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* 내용 */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">내용</label>
          <input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="예: 인천-도쿄 왕복 항공권"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl bg-[var(--color-accent)] py-2.5 text-sm font-bold text-black disabled:opacity-50"
        >
          {saving ? "저장 중..." : "추가"}
        </button>
      </div>
    </div>
  );
}

function ExpenseEditModal({
  expense,
  tripStartDate,
  onClose,
  onSaved,
  onDeleted,
}: {
  expense: Expense;
  tripStartDate: string;
  onClose: () => void;
  onSaved: (updated: Expense) => void;
  onDeleted: (id: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    date: tripStartDate,
    category: expense.category,
    description: expense.description,
    amount: String(expense.amount),
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.description || !form.amount) {
      alert("내용과 금액을 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      await updateExpense(expense.id, {
        date: form.date,
        category: form.category as ExpenseCategory,
        description: form.description,
        amount: Number(form.amount.replace(/,/g, "")),
      });
      onSaved({ ...expense, ...form, amount: Number(form.amount.replace(/,/g, "")), category: form.category as ExpenseCategory });
    } catch {
      alert("저장 실패. 다시 시도해주세요.");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("이 경비를 삭제할까요?")) return;
    setDeleting(true);
    try {
      await deleteExpense(expense.id);
      onDeleted(expense.id);
    } catch {
      alert("삭제 실패. 다시 시도해주세요.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 pt-4 pb-6 space-y-3 overflow-y-auto overflow-x-hidden max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">경비 수정</h3>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white text-lg">✕</button>
        </div>

        {/* 카테고리 */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">카테고리</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => set("category", c)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  form.category === c
                    ? "bg-[var(--color-accent)] text-black"
                    : "bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:text-white"
                }`}
              >
                {CATEGORY_ICONS[c]} {c}
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">날짜</label>
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="w-full max-w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* 금액 */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">금액 (원)</label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* 내용 */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">내용</label>
          <input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-2xl border border-red-400/40 py-2.5 text-sm font-bold text-red-400 disabled:opacity-50"
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] rounded-2xl bg-[var(--color-accent)] py-2.5 text-sm font-bold text-black disabled:opacity-50"
          >
            {saving ? "저장 중..." : "수정 완료"}
          </button>
        </div>
      </div>
    </div>
  );
}

const SCHEDULE_TYPES: ScheduleItemType[] = ["이동", "숙소", "식사", "관광", "기타"];

function ScheduleModal({
  tripId,
  tripDate,
  onClose,
  onSaved,
}: {
  tripId: string;
  tripDate: string;
  onClose: () => void;
  onSaved: (s: ScheduleItem) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: tripDate,
    time: "",
    title: "",
    description: "",
    type: "관광" as ScheduleItemType,
    reservationNumber: "",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title) {
      alert("일정 제목을 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      const schedule = await createSchedule({
        tripId,
        date: form.date,
        time: form.time || undefined,
        title: form.title,
        description: form.description || undefined,
        type: form.type,
        reservationNumber: form.reservationNumber || undefined,
      });
      onSaved(schedule);
    } catch {
      alert("저장 실패. 다시 시도해주세요.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 pt-4 pb-6 space-y-3 overflow-y-auto overflow-x-hidden max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">일정 추가</h3>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white text-lg">✕</button>
        </div>

        {/* 타입 */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">종류</label>
          <div className="flex flex-wrap gap-1.5">
            {SCHEDULE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => set("type", t)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  form.type === t
                    ? "bg-[var(--color-accent)] text-black"
                    : "bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">날짜</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-white focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* 시간 */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">시간 (선택)</label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => set("time", e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-white focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* 제목 */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">제목 *</label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="예: 인천공항 출발"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* 설명 */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">설명 (선택)</label>
          <input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="예: 빈펄 리조트 체크인"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* 예약번호 */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">예약번호 (선택)</label>
          <input
            value={form.reservationNumber}
            onChange={(e) => set("reservationNumber", e.target.value)}
            placeholder="예: VJ 872"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl bg-[var(--color-accent)] py-2.5 text-sm font-bold text-black disabled:opacity-50"
        >
          {saving ? "저장 중..." : "추가"}
        </button>
      </div>
    </div>
  );
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("경비");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [copying, setCopying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([getTripById(id), getTripExpenses(id), getTripSchedules(id)])
      .then(([t, e, s]) => {
        setTrip(t);
        setExpenses(e);
        setSchedules(s);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeleteTrip = async () => {
    if (!confirm("이 여행을 삭제할까요? 경비와 일정도 함께 삭제됩니다.")) return;
    setDeleting(true);
    try {
      await deleteTrip(id);
      router.push("/trips");
    } catch {
      alert("삭제 실패. 다시 시도해주세요.");
      setDeleting(false);
    }
  };

  const handleCopyTrip = async () => {
    if (!confirm("이 여행을 복사할까요? 경비와 일정이 모두 복사됩니다.")) return;
    setCopying(true);
    try {
      const newTrip = await copyTrip(id);
      router.push(`/trips/${newTrip.id}/edit`);
    } catch {
      alert("복사 실패. 다시 시도해주세요.");
      setCopying(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("이 경비를 삭제할까요?")) return;
    await deleteExpense(expenseId);
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("이 일정을 삭제할까요?")) return;
    await deleteSchedule(scheduleId);
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  };

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

  const scheduleByDate: Record<string, typeof schedules> = {};
  schedules.forEach((s) => {
    if (!scheduleByDate[s.date]) scheduleByDate[s.date] = [];
    scheduleByDate[s.date].push(s);
  });

  return (
    <>
      <div className="space-y-3">
        {/* 뒤로가기 + 헤더 */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <Link href="/trips" className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-white">
              ← 목록으로
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyTrip}
                disabled={copying}
                className="rounded-lg px-2.5 py-1 text-xs text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-white transition-colors disabled:opacity-50"
              >
                {copying ? "복사 중..." : "복사"}
              </button>
              <Link
                href={`/trips/${id}/edit`}
                className="rounded-lg px-2.5 py-1 text-xs text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-white transition-colors"
              >
                수정
              </Link>
              <button
                onClick={handleDeleteTrip}
                disabled={deleting}
                className="rounded-lg px-2.5 py-1 text-xs text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          </div>
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
            {/* 경비 추가 버튼 */}
            <button
              onClick={() => setShowExpenseModal(true)}
              className="w-full rounded-xl border border-dashed border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 py-2.5 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
            >
              + 경비 추가
            </button>

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
                      <div
                        key={expense.id}
                        onClick={() => setEditingExpense(expense)}
                        className={`flex items-center gap-3 px-4 py-2.5 group cursor-pointer active:bg-white/5 ${
                          i < expenses.length - 1 ? "border-b border-[var(--color-border)]" : ""
                        }`}
                      >
                        <span className="text-base">{CATEGORY_ICONS[expense.category]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white truncate">{expense.description}</div>
                          <div className="text-[10px] text-[var(--color-text-secondary)]">
                            {formatDate(expense.date)} · {expense.category}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-sm font-medium text-[var(--color-highlight)]">
                            {formatKRW(expense.amount)}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteExpense(expense.id); }}
                            className="text-red-400/50 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
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
            {/* 일정 추가 버튼 */}
            <button
              onClick={() => setShowScheduleModal(true)}
              className="w-full rounded-xl border border-dashed border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 py-2.5 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
            >
              + 일정 추가
            </button>

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
                        <div key={item.id} className={`flex items-start gap-3 px-4 py-2.5 group ${
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
                          <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                            <span className={`text-[9px] rounded-full px-1.5 py-0.5 ${
                              item.type === "이동" ? "bg-blue-400/20 text-blue-400" :
                              item.type === "숙소" ? "bg-purple-400/20 text-purple-400" :
                              item.type === "식사" ? "bg-green-400/20 text-green-400" :
                              item.type === "관광" ? "bg-orange-400/20 text-orange-400" :
                              "bg-gray-400/20 text-gray-400"
                            }`}>
                              {item.type}
                            </span>
                            <button
                              onClick={() => handleDeleteSchedule(item.id)}
                              className="text-red-400/50 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* 일정 추가 모달 */}
      {showScheduleModal && (
        <ScheduleModal
          tripId={id}
          tripDate={trip.startDate}
          onClose={() => setShowScheduleModal(false)}
          onSaved={(s) => {
            setSchedules((prev) => [...prev, s]);
            setShowScheduleModal(false);
          }}
        />
      )}

      {/* 경비 추가 모달 */}
      {showExpenseModal && (
        <ExpenseModal
          tripId={id}
          tripDate={trip.startDate}
          onClose={() => setShowExpenseModal(false)}
          onSaved={(e) => {
            setExpenses((prev) => [...prev, e]);
            setShowExpenseModal(false);
          }}
        />
      )}

      {/* 경비 수정 모달 */}
      {editingExpense && (
        <ExpenseEditModal
          expense={editingExpense}
          tripStartDate={trip.startDate}
          onClose={() => setEditingExpense(null)}
          onSaved={(updated) => {
            setExpenses((prev) => prev.map((e) => e.id === updated.id ? updated : e));
            setEditingExpense(null);
          }}
          onDeleted={(id) => {
            setExpenses((prev) => prev.filter((e) => e.id !== id));
            setEditingExpense(null);
          }}
        />
      )}
    </>
  );
}

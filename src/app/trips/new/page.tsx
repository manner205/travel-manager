"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTrip } from "@/lib/db";
import { TripType, TripStatus, ExpenseCategory } from "@/types/travel";
import DateRangePicker from "@/components/DateRangePicker";

const EMOJIS = ["✈️","🏖️","🏔️","🗺️","🌊","🇯🇵","🇹🇭","🇻🇳","🇺🇸","🇪🇺","🏨","🎡","🦁","🏙️","🌸","🍊","🎿"];

export default function NewTripPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "해외" as TripType,
    destination: "",
    country: "",
    startDate: "",
    endDate: "",
    travelers: 4,
    status: "예정" as TripStatus,
    coverEmoji: "✈️",
    notes: "",
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.destination || !form.startDate || !form.endDate) {
      alert("제목, 목적지, 날짜는 필수입니다.");
      return;
    }
    setSaving(true);
    try {
      const trip = await createTrip(form);
      router.push(`/trips/${trip.id}`);
    } catch (e) {
      alert("저장 실패. 다시 시도해주세요.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="pt-2 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-xs text-[var(--color-text-secondary)] hover:text-white">
          ← 뒤로
        </button>
        <h2 className="text-base font-bold text-white">새 여행 추가</h2>
      </div>

      {/* 이모지 선택 */}
      <div className="space-y-2">
        <label className="text-xs text-[var(--color-text-secondary)]">커버 이모지</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => set("coverEmoji", e)}
              className={`text-2xl rounded-xl p-1.5 transition-colors ${
                form.coverEmoji === e
                  ? "bg-[var(--color-accent)]/30 ring-1 ring-[var(--color-accent)]"
                  : "bg-[var(--color-card)] hover:bg-[var(--color-card-hover)]"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* 제목 */}
      <div className="space-y-1">
        <label className="text-xs text-[var(--color-text-secondary)]">여행 제목 *</label>
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="예: 일본 오사카 가족여행"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
        />
      </div>

      {/* 타입 / 상태 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">구분</label>
          <div className="flex gap-1 rounded-xl bg-[var(--color-card)] p-1 border border-[var(--color-border)]">
            {(["해외", "국내"] as TripType[]).map((t) => (
              <button
                key={t}
                onClick={() => set("type", t)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                  form.type === t ? "bg-[var(--color-accent)] text-black" : "text-[var(--color-text-secondary)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">상태</label>
          <div className="flex gap-1 rounded-xl bg-[var(--color-card)] p-1 border border-[var(--color-border)]">
            {(["예정", "완료"] as TripStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => set("status", s)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                  form.status === s ? "bg-[var(--color-accent)] text-black" : "text-[var(--color-text-secondary)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 목적지 / 국가 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">목적지 *</label>
          <input
            value={form.destination}
            onChange={(e) => set("destination", e.target.value)}
            placeholder="예: 오사카, 교토"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-secondary)]">국가 (해외)</label>
          <input
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            placeholder="예: 일본"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
      </div>

      {/* 날짜 범위 선택 */}
      <div className="space-y-1">
        <label className="text-xs text-[var(--color-text-secondary)]">여행 기간 *</label>
        <DateRangePicker
          startDate={form.startDate}
          endDate={form.endDate}
          onChange={(start, end) => setForm((f) => ({ ...f, startDate: start, endDate: end }))}
        />
      </div>

      {/* 인원 */}
      <div className="space-y-1">
        <label className="text-xs text-[var(--color-text-secondary)]">인원</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => set("travelers", Math.max(1, form.travelers - 1))}
            className="h-9 w-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-white text-lg font-bold hover:bg-[var(--color-card-hover)]"
          >
            −
          </button>
          <span className="text-base font-bold text-white w-6 text-center">{form.travelers}</span>
          <button
            onClick={() => set("travelers", form.travelers + 1)}
            className="h-9 w-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-white text-lg font-bold hover:bg-[var(--color-card-hover)]"
          >
            +
          </button>
          <span className="text-xs text-[var(--color-text-secondary)]">명</span>
        </div>
      </div>

      {/* 메모 */}
      <div className="space-y-1">
        <label className="text-xs text-[var(--color-text-secondary)]">메모</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="여행 메모 (선택)"
          rows={2}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none resize-none"
        />
      </div>

      {/* 저장 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full rounded-2xl bg-[var(--color-accent)] py-3 text-sm font-bold text-black transition-opacity disabled:opacity-50"
      >
        {saving ? "저장 중..." : "여행 추가"}
      </button>
    </div>
  );
}

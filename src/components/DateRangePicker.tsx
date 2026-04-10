"use client";

import { useState } from "react";

interface Props {
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
  onChange: (start: string, end: string) => void;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function toStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return "미선택";
  const [y, m, d] = dateStr.split("-");
  return `${y}.${m}.${d}`;
}

export default function DateRangePicker({ startDate, endDate, onChange }: Props) {
  const today = new Date();
  const initDate = startDate ? new Date(startDate) : today;
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth()); // 0-indexed
  const [hovered, setHovered] = useState<string | null>(null);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (dateStr: string) => {
    if (!startDate || (startDate && endDate)) {
      // 새로 시작
      onChange(dateStr, "");
    } else {
      // startDate만 있는 상태
      if (dateStr < startDate) {
        onChange(dateStr, "");
      } else if (dateStr === startDate) {
        onChange("", "");
      } else {
        onChange(startDate, dateStr);
      }
    }
  };

  // 셀 상태 계산
  const getCellState = (dateStr: string) => {
    const isStart = dateStr === startDate;
    const isEnd = dateStr === endDate;

    // 범위 계산 (hover 포함)
    const rangeEnd = endDate || (startDate && hovered && hovered > startDate ? hovered : null);
    const inRange = startDate && rangeEnd && dateStr > startDate && dateStr < rangeEnd;

    return { isStart, isEnd, inRange: !!inRange };
  };

  // 달력 셀 배열
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // 6주 채우기
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-2">
      {/* 선택된 날짜 표시 */}
      <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2">
        <div className="flex-1 text-center">
          <div className="text-[10px] text-[var(--color-text-secondary)]">출발일</div>
          <div className={`text-sm font-semibold ${startDate ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"}`}>
            {formatDisplay(startDate)}
          </div>
        </div>
        <div className="text-[var(--color-text-secondary)] text-xs">→</div>
        <div className="flex-1 text-center">
          <div className="text-[10px] text-[var(--color-text-secondary)]">귀국일</div>
          <div className={`text-sm font-semibold ${endDate ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"}`}>
            {formatDisplay(endDate)}
          </div>
        </div>
      </div>

      {/* 달력 */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 select-none">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="text-[var(--color-text-secondary)] hover:text-white px-2 py-1 text-sm">‹</button>
          <span className="text-sm font-semibold text-white">
            {viewYear}년 {viewMonth + 1}월
          </span>
          <button onClick={nextMonth} className="text-[var(--color-text-secondary)] hover:text-white px-2 py-1 text-sm">›</button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d, i) => (
            <div key={d} className={`text-center text-[10px] font-medium py-1 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-[var(--color-text-secondary)]"}`}>
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />;
            const dateStr = toStr(viewYear, viewMonth, day);
            const { isStart, isEnd, inRange } = getCellState(dateStr);
            const isToday = dateStr === toStr(today.getFullYear(), today.getMonth(), today.getDate());
            const dow = idx % 7;

            return (
              <button
                key={idx}
                onClick={() => handleDayClick(dateStr)}
                onMouseEnter={() => setHovered(dateStr)}
                onMouseLeave={() => setHovered(null)}
                className={`
                  relative h-8 text-xs font-medium transition-colors
                  ${isStart || isEnd ? "bg-[var(--color-accent)] text-black rounded-full z-10" : ""}
                  ${inRange ? "bg-[var(--color-accent)]/20 text-white" : ""}
                  ${!isStart && !isEnd && !inRange ? (dow === 0 ? "text-red-400" : dow === 6 ? "text-blue-400" : "text-white") : ""}
                  ${!isStart && !isEnd && !inRange ? "hover:bg-white/10 rounded-full" : ""}
                  ${isToday && !isStart && !isEnd ? "ring-1 ring-[var(--color-accent)]/50 rounded-full" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* 안내 텍스트 */}
        <div className="mt-2 text-center text-[10px] text-[var(--color-text-secondary)]">
          {!startDate && "출발일을 선택하세요"}
          {startDate && !endDate && "귀국일을 선택하세요"}
          {startDate && endDate && "날짜를 다시 누르면 재선택됩니다"}
        </div>
      </div>
    </div>
  );
}

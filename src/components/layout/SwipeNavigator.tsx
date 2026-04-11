"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

const ROUTES = ["/", "/trips", "/expenses"];

export default function SwipeNavigator({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // 현재 라우트 인덱스 (탭 3개 중 하나일 때만 스와이프 활성화)
  const currentIndex = ROUTES.indexOf(pathname);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (currentIndex === -1) return; // 탭 외 페이지는 스와이프 비활성화

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // 가로 스와이프 여부 판별 (세로 스크롤과 구분)
    if (Math.abs(deltaX) < 60) return;
    if (Math.abs(deltaY) > Math.abs(deltaX) * 0.7) return;

    // data-no-swipe 요소 내부에서 시작된 스와이프 무시
    const target = e.target as HTMLElement;
    if (target.closest("[data-no-swipe]")) return;

    if (deltaX < 0 && currentIndex < ROUTES.length - 1) {
      // 왼쪽 스와이프 → 다음 탭
      router.push(ROUTES[currentIndex + 1]);
    } else if (deltaX > 0 && currentIndex > 0) {
      // 오른쪽 스와이프 → 이전 탭
      router.push(ROUTES[currentIndex - 1]);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="contents"
    >
      {children}
    </div>
  );
}

# Travel Manager 개발 로그

---

## 2026-04-09

### 프로젝트 초기화
- `D:/Claude-code-app/travel-manager` 폴더 생성
- `CLAUDE.md` 복사 완료 (D:/Claude-code-app/CLAUDE.md.txt 기반)

### 요구사항 수집
- 가족 공유용 웹 앱 (URL 배포 예정)
- 해외 여행 연 3~4회 + 국내 호텔 월 1회 이력 & 일정 관리
- 여행별 경비 정리 기능
- 영수증 사진 일괄 업로드 → AI 자동 경비 정리
- 사진은 WD My Cloud에 저장, 웹에서 불러서 표시
- 기술 스택 확정: Next.js + TypeScript + Tailwind CSS + Supabase + Claude API + Vercel
- 사진 저장: Supabase Storage 사용 (WD My Cloud 연동은 보류 → NAS 업그레이드 후 추가 개발)

### 경비 기능 요구사항
- 여행 단위별 경비 조회 (해당 여행의 총 지출, 항목별 내역)
- 연간 경비 조회 (해당 연도 전체 여행 합산)
- 연도 범위 선택 → 기간 통계 (총 지출, 여행 횟수, 평균 여행 경비 등)

---

## 2026-04-09 (개발 1차)

### 초기 개발 완료
**개발 완료 파일**
- `src/types/travel.ts` — Trip, Expense, ScheduleItem 타입 정의
- `src/lib/mock-data.ts` — 여행 12건, 경비 63건, 일정 7건 목데이터
- `src/lib/format.ts` — 금액, 날짜, D-Day 포맷 유틸
- `src/lib/expense-colors.ts` — 카테고리별 색상 & 아이콘
- `src/app/layout.tsx` — 루트 레이아웃 + 하단 네비게이션
- `src/components/layout/BottomNav.tsx` — 홈/여행/경비 네비게이션
- `src/app/page.tsx` — 대시보드 (예정 여행 D-Day, 올해 현황, 최근 여행)
- `src/app/trips/page.tsx` — 여행 목록 (연도별 그룹, 필터)
- `src/app/trips/[id]/page.tsx` — 여행 상세 (경비 탭 + 일정 탭)
- `src/app/expenses/page.tsx` — 경비 통계 (연도 범위 필터, 차트)

**다음 개발 예정**
- Supabase 연동 (실 데이터 저장/조회)
- 여행/경비 추가/수정/삭제 기능
- 영수증 사진 업로드 + Claude AI 자동 분석
- 가족 공유 로그인 (Supabase Auth)
- Vercel 배포

---

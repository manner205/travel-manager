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

---

## 2026-04-10 (개발 2차)

### Supabase 연동
- Supabase 프로젝트 생성 (Region: Northeast Asia Seoul)
- DB 테이블 생성: `trips`, `expenses`, `schedules`
- RLS 정책 설정 (인증 추가 전 임시 전체 허용)
- `src/lib/supabase.ts` — Supabase 클라이언트 초기화
- `src/lib/db.ts` — 읽기/쓰기 함수 전체 구현
  - 읽기: getTrips, getTripById, getTripExpenses, getTripSchedules, getAllExpenses, getAnnualExpenseStats
  - 쓰기: createTrip, updateTrip, deleteTrip, createExpense, deleteExpense, createSchedule, deleteSchedule
- 4개 페이지 mock-data → Supabase 실데이터로 교체 (useEffect 비동기 로딩)
- 샘플 데이터 2건 DB 직접 삽입 (일본 오사카, 베트남 다낭 + 경비 5건)

### GitHub 연동
- 저장소: https://github.com/manner205/travel-manager.git
- 브랜치: main

### Vercel 배포
- GitHub 저장소 연동 완료
- 환경변수 설정 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- 배포 완료 — push 시 자동 배포

### 여행/경비/일정 CRUD 구현
- `src/app/trips/new/page.tsx` — 여행 추가 폼 (이모지, 타입, 날짜, 인원 등)
- `src/app/trips/[id]/edit/page.tsx` — 여행 수정 폼
- 여행 상세 페이지 기능 추가:
  - 수정/삭제 버튼
  - 경비 추가 모달 (카테고리, 날짜, 금액, 내용)
  - 경비 삭제 (호버 시 ✕ 버튼)
  - 일정 추가 모달 (종류, 날짜, 시간, 제목, 설명, 예약번호)
  - 일정 삭제 (호버 시 ✕ 버튼)

---

## 2026-04-10 (개발 3차)

### 로그인 기능 구현 (Supabase Auth)
- `@supabase/ssr` 설치 (쿠키 기반 세션 관리)
- `src/lib/supabase-browser.ts` — 브라우저용 Supabase 클라이언트
- `src/lib/supabase-server.ts` — 서버용 Supabase 클라이언트
- `src/middleware.ts` — 미인증 사용자 자동으로 /login 리다이렉트
- `src/app/login/page.tsx` — 이메일/비밀번호 로그인 페이지
- `src/contexts/auth-context.tsx` — 인증 상태 관리 Context
- `src/components/layout/Header.tsx` — 로그인 사용자 이름 + 로그아웃 버튼
- BottomNav — 로그인 페이지에서 숨김 처리

### 가족 계정 등록 방법
- Supabase 대시보드 → Authentication → Users → Invite user
- 가족 구성원 이메일로 초대 발송

---

## 다음 개발 예정
- 영수증 사진 업로드 (Claude API 비용 이슈로 보류)
- Vercel 배포 도메인 커스텀 설정 (선택)

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

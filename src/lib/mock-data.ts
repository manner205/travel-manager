import { Trip, Expense, ScheduleItem } from "@/types/travel";

export const MOCK_TRIPS: Trip[] = [
  {
    id: "t001",
    title: "일본 오사카 & 교토",
    type: "해외",
    destination: "오사카, 교토",
    country: "일본",
    startDate: "2026-05-10",
    endDate: "2026-05-15",
    travelers: 4,
    status: "예정",
    coverEmoji: "🇯🇵",
    notes: "벚꽃 시즌 가족 여행",
  },
  {
    id: "t002",
    title: "부산 해운대 호텔",
    type: "국내",
    destination: "부산",
    startDate: "2026-04-19",
    endDate: "2026-04-21",
    travelers: 4,
    status: "예정",
    coverEmoji: "🌊",
  },
  {
    id: "t003",
    title: "베트남 다낭",
    type: "해외",
    destination: "다낭",
    country: "베트남",
    startDate: "2026-01-18",
    endDate: "2026-01-23",
    travelers: 4,
    status: "완료",
    coverEmoji: "🇻🇳",
    notes: "겨울 피서",
  },
  {
    id: "t004",
    title: "강원도 평창 리조트",
    type: "국내",
    destination: "평창",
    startDate: "2026-02-14",
    endDate: "2026-02-16",
    travelers: 4,
    status: "완료",
    coverEmoji: "🏔️",
  },
  {
    id: "t005",
    title: "태국 방콕 & 파타야",
    type: "해외",
    destination: "방콕, 파타야",
    country: "태국",
    startDate: "2025-10-03",
    endDate: "2025-10-09",
    travelers: 4,
    status: "완료",
    coverEmoji: "🇹🇭",
  },
  {
    id: "t006",
    title: "제주도 가족 여행",
    type: "국내",
    destination: "제주",
    startDate: "2025-08-05",
    endDate: "2025-08-08",
    travelers: 4,
    status: "완료",
    coverEmoji: "🍊",
  },
  {
    id: "t007",
    title: "홍콩 & 마카오",
    type: "해외",
    destination: "홍콩, 마카오",
    country: "홍콩",
    startDate: "2025-06-20",
    endDate: "2025-06-25",
    travelers: 2,
    status: "완료",
    coverEmoji: "🏙️",
  },
  {
    id: "t008",
    title: "강릉 경포대 호텔",
    type: "국내",
    destination: "강릉",
    startDate: "2025-04-12",
    endDate: "2025-04-13",
    travelers: 4,
    status: "완료",
    coverEmoji: "🌸",
  },
  {
    id: "t009",
    title: "일본 도쿄 디즈니",
    type: "해외",
    destination: "도쿄",
    country: "일본",
    startDate: "2024-12-26",
    endDate: "2024-12-31",
    travelers: 4,
    status: "완료",
    coverEmoji: "🎡",
  },
  {
    id: "t010",
    title: "괌 가족 여행",
    type: "해외",
    destination: "괌",
    country: "괌",
    startDate: "2024-07-20",
    endDate: "2024-07-25",
    travelers: 4,
    status: "완료",
    coverEmoji: "🏖️",
  },
  {
    id: "t011",
    title: "서울 롯데호텔",
    type: "국내",
    destination: "서울",
    startDate: "2024-11-09",
    endDate: "2024-11-10",
    travelers: 4,
    status: "완료",
    coverEmoji: "🏨",
  },
  {
    id: "t012",
    title: "싱가포르",
    type: "해외",
    destination: "싱가포르",
    country: "싱가포르",
    startDate: "2024-03-15",
    endDate: "2024-03-20",
    travelers: 4,
    status: "완료",
    coverEmoji: "🦁",
  },
];

export const MOCK_EXPENSES: Expense[] = [
  // 다낭 (t003)
  { id: "e001", tripId: "t003", date: "2026-01-18", category: "항공", description: "인천-다낭 왕복 항공권", amount: 1560000, currency: "KRW" },
  { id: "e002", tripId: "t003", date: "2026-01-18", category: "숙소", description: "빈펄 리조트 5박", amount: 980000, currency: "KRW" },
  { id: "e003", tripId: "t003", date: "2026-01-19", category: "식비", description: "해산물 레스토랑", amount: 85000, currency: "USD", originalAmount: 65 },
  { id: "e004", tripId: "t003", date: "2026-01-20", category: "관광/액티비티", description: "바나힐 투어", amount: 240000, currency: "KRW" },
  { id: "e005", tripId: "t003", date: "2026-01-21", category: "쇼핑", description: "한시장 쇼핑", amount: 320000, currency: "KRW" },
  { id: "e006", tripId: "t003", date: "2026-01-22", category: "교통", description: "그랩 택시", amount: 45000, currency: "KRW" },
  { id: "e007", tripId: "t003", date: "2026-01-22", category: "식비", description: "현지 식당", amount: 62000, currency: "KRW" },
  { id: "e008", tripId: "t003", date: "2026-01-23", category: "기타", description: "기념품", amount: 95000, currency: "KRW" },

  // 평창 (t004)
  { id: "e009", tripId: "t004", date: "2026-02-14", category: "숙소", description: "알펜시아 리조트 2박", amount: 520000, currency: "KRW" },
  { id: "e010", tripId: "t004", date: "2026-02-14", category: "교통", description: "렌터카", amount: 180000, currency: "KRW" },
  { id: "e011", tripId: "t004", date: "2026-02-15", category: "관광/액티비티", description: "스키 리프트권", amount: 280000, currency: "KRW" },
  { id: "e012", tripId: "t004", date: "2026-02-15", category: "식비", description: "식사", amount: 95000, currency: "KRW" },
  { id: "e013", tripId: "t004", date: "2026-02-16", category: "식비", description: "식사", amount: 72000, currency: "KRW" },

  // 태국 (t005)
  { id: "e014", tripId: "t005", date: "2025-10-03", category: "항공", description: "인천-방콕 왕복", amount: 1840000, currency: "KRW" },
  { id: "e015", tripId: "t005", date: "2025-10-03", category: "숙소", description: "방콕 호텔 3박", amount: 680000, currency: "KRW" },
  { id: "e016", tripId: "t005", date: "2025-10-06", category: "숙소", description: "파타야 리조트 3박", amount: 540000, currency: "KRW" },
  { id: "e017", tripId: "t005", date: "2025-10-04", category: "관광/액티비티", description: "왕궁 & 사원 투어", amount: 120000, currency: "KRW" },
  { id: "e018", tripId: "t005", date: "2025-10-05", category: "식비", description: "카오산로드 식사", amount: 68000, currency: "KRW" },
  { id: "e019", tripId: "t005", date: "2025-10-07", category: "관광/액티비티", description: "산호섬 투어", amount: 200000, currency: "KRW" },
  { id: "e020", tripId: "t005", date: "2025-10-08", category: "쇼핑", description: "짜뚜짝 시장", amount: 380000, currency: "KRW" },
  { id: "e021", tripId: "t005", date: "2025-10-04", category: "교통", description: "그랩 & 툭툭", amount: 52000, currency: "KRW" },

  // 제주 (t006)
  { id: "e022", tripId: "t006", date: "2025-08-05", category: "항공", description: "김포-제주 왕복", amount: 480000, currency: "KRW" },
  { id: "e023", tripId: "t006", date: "2025-08-05", category: "숙소", description: "제주 풀빌라 3박", amount: 860000, currency: "KRW" },
  { id: "e024", tripId: "t006", date: "2025-08-06", category: "관광/액티비티", description: "한라산 등반", amount: 0, currency: "KRW" },
  { id: "e025", tripId: "t006", date: "2025-08-06", category: "식비", description: "흑돼지 식당", amount: 148000, currency: "KRW" },
  { id: "e026", tripId: "t006", date: "2025-08-07", category: "교통", description: "렌터카", amount: 180000, currency: "KRW" },
  { id: "e027", tripId: "t006", date: "2025-08-07", category: "쇼핑", description: "제주 특산품", amount: 125000, currency: "KRW" },

  // 홍콩 (t007)
  { id: "e028", tripId: "t007", date: "2025-06-20", category: "항공", description: "인천-홍콩 왕복", amount: 980000, currency: "KRW" },
  { id: "e029", tripId: "t007", date: "2025-06-20", category: "숙소", description: "홍콩 호텔 5박", amount: 1200000, currency: "KRW" },
  { id: "e030", tripId: "t007", date: "2025-06-21", category: "관광/액티비티", description: "빅버스 투어", amount: 160000, currency: "KRW" },
  { id: "e031", tripId: "t007", date: "2025-06-22", category: "교통", description: "페리 마카오", amount: 85000, currency: "KRW" },
  { id: "e032", tripId: "t007", date: "2025-06-22", category: "관광/액티비티", description: "마카오 카지노", amount: 300000, currency: "KRW" },
  { id: "e033", tripId: "t007", date: "2025-06-23", category: "식비", description: "딤섬 레스토랑", amount: 95000, currency: "KRW" },
  { id: "e034", tripId: "t007", date: "2025-06-24", category: "쇼핑", description: "침사추이 쇼핑", amount: 520000, currency: "KRW" },

  // 도쿄 (t009)
  { id: "e035", tripId: "t009", date: "2024-12-26", category: "항공", description: "인천-도쿄 왕복", amount: 1680000, currency: "KRW" },
  { id: "e036", tripId: "t009", date: "2024-12-26", category: "숙소", description: "도쿄 호텔 5박", amount: 1350000, currency: "KRW" },
  { id: "e037", tripId: "t009", date: "2024-12-27", category: "관광/액티비티", description: "도쿄 디즈니랜드", amount: 480000, currency: "KRW" },
  { id: "e038", tripId: "t009", date: "2024-12-28", category: "관광/액티비티", description: "도쿄 디즈니씨", amount: 480000, currency: "KRW" },
  { id: "e039", tripId: "t009", date: "2024-12-29", category: "식비", description: "스시 오마카세", amount: 320000, currency: "KRW" },
  { id: "e040", tripId: "t009", date: "2024-12-30", category: "쇼핑", description: "아키하바라 & 시부야", amount: 680000, currency: "KRW" },
  { id: "e041", tripId: "t009", date: "2024-12-31", category: "교통", description: "JR패스 & 택시", amount: 220000, currency: "KRW" },

  // 괌 (t010)
  { id: "e042", tripId: "t010", date: "2024-07-20", category: "항공", description: "인천-괌 왕복", amount: 2080000, currency: "KRW" },
  { id: "e043", tripId: "t010", date: "2024-07-20", category: "숙소", description: "힐튼 괌 5박", amount: 1850000, currency: "KRW" },
  { id: "e044", tripId: "t010", date: "2024-07-21", category: "관광/액티비티", description: "스쿠버다이빙", amount: 320000, currency: "KRW" },
  { id: "e045", tripId: "t010", date: "2024-07-22", category: "관광/액티비티", description: "제트스키 & 바나나보트", amount: 240000, currency: "KRW" },
  { id: "e046", tripId: "t010", date: "2024-07-23", category: "식비", description: "루루스 레스토랑", amount: 185000, currency: "KRW" },
  { id: "e047", tripId: "t010", date: "2024-07-24", category: "쇼핑", description: "DFS 면세점", amount: 920000, currency: "KRW" },
  { id: "e048", tripId: "t010", date: "2024-07-24", category: "교통", description: "렌터카", amount: 280000, currency: "KRW" },

  // 싱가포르 (t012)
  { id: "e049", tripId: "t012", date: "2024-03-15", category: "항공", description: "인천-싱가포르 왕복", amount: 1540000, currency: "KRW" },
  { id: "e050", tripId: "t012", date: "2024-03-15", category: "숙소", description: "마리나베이샌즈 5박", amount: 2800000, currency: "KRW" },
  { id: "e051", tripId: "t012", date: "2024-03-16", category: "관광/액티비티", description: "유니버설 스튜디오", amount: 560000, currency: "KRW" },
  { id: "e052", tripId: "t012", date: "2024-03-17", category: "관광/액티비티", description: "가든스 바이더베이", amount: 160000, currency: "KRW" },
  { id: "e053", tripId: "t012", date: "2024-03-18", category: "식비", description: "호커센터 & 레스토랑", amount: 280000, currency: "KRW" },
  { id: "e054", tripId: "t012", date: "2024-03-19", category: "쇼핑", description: "오차드로드 쇼핑", amount: 780000, currency: "KRW" },
  { id: "e055", tripId: "t012", date: "2024-03-20", category: "교통", description: "그랩 & MRT", amount: 95000, currency: "KRW" },

  // 강릉 (t008)
  { id: "e056", tripId: "t008", date: "2025-04-12", category: "숙소", description: "씨마크 호텔 1박", amount: 280000, currency: "KRW" },
  { id: "e057", tripId: "t008", date: "2025-04-12", category: "교통", description: "KTX 왕복", amount: 148000, currency: "KRW" },
  { id: "e058", tripId: "t008", date: "2025-04-12", category: "식비", description: "회 & 해산물", amount: 120000, currency: "KRW" },
  { id: "e059", tripId: "t008", date: "2025-04-13", category: "관광/액티비티", description: "경포대 자전거", amount: 40000, currency: "KRW" },

  // 서울 롯데호텔 (t011)
  { id: "e060", tripId: "t011", date: "2024-11-09", category: "숙소", description: "롯데호텔 서울 1박", amount: 380000, currency: "KRW" },
  { id: "e061", tripId: "t011", date: "2024-11-09", category: "식비", description: "호텔 레스토랑 디너", amount: 185000, currency: "KRW" },
  { id: "e062", tripId: "t011", date: "2024-11-10", category: "관광/액티비티", description: "명동 & 남산", amount: 45000, currency: "KRW" },
  { id: "e063", tripId: "t011", date: "2024-11-10", category: "쇼핑", description: "면세점", amount: 420000, currency: "KRW" },
];

export const MOCK_SCHEDULES: ScheduleItem[] = [
  // 다낭 (t003)
  { id: "s001", tripId: "t003", date: "2026-01-18", time: "09:00", title: "인천공항 출발", type: "이동", reservationNumber: "VJ 872" },
  { id: "s002", tripId: "t003", date: "2026-01-18", time: "13:30", title: "다낭 도착 & 호텔 체크인", type: "숙소", description: "빈펄 리조트" },
  { id: "s003", tripId: "t003", date: "2026-01-19", time: "09:00", title: "바나힐 투어", type: "관광", description: "황금교, 바나힐 테마파크" },
  { id: "s004", tripId: "t003", date: "2026-01-20", time: "10:00", title: "호이안 당일치기", type: "관광" },
  { id: "s005", tripId: "t003", date: "2026-01-21", time: "자유", title: "한시장 쇼핑 & 해변", type: "기타" },
  { id: "s006", tripId: "t003", date: "2026-01-22", time: "18:00", title: "저녁 씨푸드 레스토랑", type: "식사" },
  { id: "s007", tripId: "t003", date: "2026-01-23", time: "14:00", title: "다낭 출발 귀국", type: "이동", reservationNumber: "VJ 873" },
];

export function getTripExpenses(tripId: string): Expense[] {
  return MOCK_EXPENSES.filter((e) => e.tripId === tripId);
}

export function getTripSchedules(tripId: string): ScheduleItem[] {
  return MOCK_SCHEDULES.filter((s) => s.tripId === tripId);
}

export function getTripById(id: string): Trip | undefined {
  return MOCK_TRIPS.find((t) => t.id === id);
}

export function getAnnualExpenseStats() {
  const yearMap: Record<string, { total: number; tripIds: Set<string> }> = {};
  MOCK_EXPENSES.forEach((e) => {
    const year = e.date.slice(0, 4);
    if (!yearMap[year]) yearMap[year] = { total: 0, tripIds: new Set() };
    yearMap[year].total += e.amount;
    yearMap[year].tripIds.add(e.tripId);
  });
  return Object.entries(yearMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, { total, tripIds }]) => ({
      year,
      totalAmount: total,
      tripCount: tripIds.size,
      avgPerTrip: Math.round(total / tripIds.size),
    }));
}

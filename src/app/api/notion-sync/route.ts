import { NextResponse } from "next/server";

const NOTION_API_KEY = process.env.NOTION_API_KEY!;
const NOTION_DB_TRAVEL = process.env.NOTION_DB_TRAVEL!;
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const NOTION_BASE = "https://api.notion.com/v1";

const notionHeaders = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

const supaHeaders = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
};

// ── 타입 ───────────────────────────────────────────────────────────────────

interface SupaTrip {
  id: string;
  title: string;
  type: string;
  destination: string;
  country?: string;
  start_date: string;
  end_date: string;
  travelers: number;
  status: string;
  notes?: string;
}

interface SupaExpense {
  trip_id: string;
  category: string;
  description: string;
  amount: number;
}

// ── 헬퍼 ───────────────────────────────────────────────────────────────────

function calcNights(start: string, end: string): number {
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 86400000
  );
}

function nightsToLabel(n: number): string {
  if (n === 0) return "당일치기";
  if (n <= 3) return "단기 (1~3박)";
  if (n <= 7) return "중기 (4~7박)";
  return "장기 (8박 이상)";
}

function companionLabel(n: number): string {
  if (n === 1) return "혼자";
  if (n === 2) return "커플";
  return "가족";
}

function statusLabel(s: string): string {
  return s === "완료" ? "다녀옴" : "계획중";
}

function getTransport(expenses: SupaExpense[]): { name: string }[] {
  const tags = new Set<string>();
  for (const e of expenses) {
    if (e.category === "항공") tags.add("비행기");
    if (e.category === "교통") {
      const d = e.description;
      if (/KTX|기차|SRT/.test(d)) tags.add("기차");
      else if (/렌터카|자동차/.test(d)) tags.add("자동차");
      else if (/버스/.test(d)) tags.add("버스");
      else if (/페리|배/.test(d)) tags.add("배");
      else tags.add("자동차");
    }
  }
  return [...tags].map((n) => ({ name: n }));
}

function getThemes(trip: SupaTrip, expenses: SupaExpense[]): { name: string }[] {
  const themes = new Set<string>();
  const combined = `${trip.title}${trip.destination}${trip.notes ?? ""}`.toLowerCase();
  const cats = expenses.map((e) => e.category);

  if (/리조트|풀빌라|호캉스|호텔놀이|힐링|피서/.test(combined)) themes.add("힐링");
  if (/디즈니|유니버설|스키|다이빙|서핑/.test(combined)) themes.add("액티비티");
  if (/사원|왕궁|역사|박물관|문화/.test(combined)) themes.add("문화탐방");
  if (cats.includes("관광/액티비티")) themes.add("액티비티");
  if (cats.includes("쇼핑")) themes.add("쇼핑");
  if (cats.includes("식비")) themes.add("미식");
  if (!themes.size) themes.add("힐링");
  return [...themes].map((n) => ({ name: n }));
}

function rt(content: string) {
  return [{ type: "text", text: { content: content.slice(0, 2000) } }];
}

function h2(text: string) {
  return { object: "block", type: "heading_2", heading_2: { rich_text: rt(text), is_toggleable: false } };
}
function bullet(text: string) {
  return { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: rt(text) } };
}
function bold(text: string) {
  return { object: "block", type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: text }, annotations: { bold: true, italic: false, strikethrough: false, underline: false, code: false, color: "default" } }] } };
}

function buildBlocks(trip: SupaTrip, expenses: SupaExpense[]) {
  const blocks: object[] = [];
  const nights = calcNights(trip.start_date, trip.end_date);
  const total = Math.round(expenses.reduce((s, e) => s + (e.amount ?? 0), 0) / 10000);
  const accom = expenses.filter((e) => e.category === "숙소").map((e) => e.description).join(", ");
  const food = expenses.filter((e) => e.category === "식비").map((e) => e.description).join(", ");

  blocks.push(h2("여행 정보"));
  blocks.push(bullet(`여행지: ${trip.destination}`));
  blocks.push(bullet(`기간: ${trip.start_date} ~ ${trip.end_date} (${nights}박 ${nights + 1}일)`));
  blocks.push(bullet(`인원: ${trip.travelers}명`));
  if (trip.notes?.trim()) blocks.push(bullet(`메모: ${trip.notes.trim()}`));

  if (accom) { blocks.push(h2("숙박")); blocks.push(bullet(accom)); }
  if (food) { blocks.push(h2("식당 & 식비")); blocks.push(bullet(food)); }

  if (expenses.length) {
    blocks.push(h2("지출 내역"));
    for (const e of expenses) {
      blocks.push(bullet(`[${e.category}] ${e.description}: ${(e.amount ?? 0).toLocaleString()}원`));
    }
    if (total > 0) blocks.push(bold(`총 지출: 약 ${total}만원`));
  }

  return blocks;
}

// ── Notion에 이미 있는 Supabase ID 목록 조회 ──────────────────────────────

async function getExistingSupabaseIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  let cursor: string | undefined;

  do {
    const res = await fetch(`${NOTION_BASE}/databases/${NOTION_DB_TRAVEL}/query`, {
      method: "POST",
      headers: notionHeaders,
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    const data = await res.json();
    for (const page of data.results ?? []) {
      const sid = page.properties?.["Supabase ID"]?.rich_text?.[0]?.plain_text;
      if (sid) ids.add(sid);
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return ids;
}

// ── Notion 행 생성 ─────────────────────────────────────────────────────────

async function createNotionRow(trip: SupaTrip, expenses: SupaExpense[]) {
  const nights = calcNights(trip.start_date, trip.end_date);
  const total = Math.round(expenses.reduce((s, e) => s + (e.amount ?? 0), 0) / 10000);
  const accom = expenses.filter((e) => e.category === "숙소").map((e) => e.description).join(", ");
  const food = expenses.filter((e) => e.category === "식비").map((e) => e.description).join(", ");

  const properties: Record<string, unknown> = {
    여행지: { title: rt(trip.title.trim()) },
    "Supabase ID": { rich_text: rt(trip.id) },
    "여행 날짜": { date: { start: trip.start_date } },
    "귀국 날짜": { date: { start: trip.end_date } },
    "국내/해외": { select: { name: trip.type } },
    "여행 기간": { select: { name: nightsToLabel(nights) } },
    박수: { number: nights },
    동행: { select: { name: companionLabel(trip.travelers) } },
    "여행 테마": { multi_select: getThemes(trip, expenses) },
    "여행 상태": { select: { name: statusLabel(trip.status) } },
  };

  const transport = getTransport(expenses);
  if (transport.length) properties["이동 수단"] = { multi_select: transport };
  if (total > 0) properties["총 예산 (만원)"] = { number: total };
  if (accom) properties["숙박 장소"] = { rich_text: rt(accom) };
  if (food) properties["식당"] = { rich_text: rt(food) };
  if (trip.notes?.trim()) properties["메모"] = { rich_text: rt(trip.notes.trim()) };

  const blocks = buildBlocks(trip, expenses);

  const res = await fetch(`${NOTION_BASE}/pages`, {
    method: "POST",
    headers: notionHeaders,
    body: JSON.stringify({
      parent: { database_id: NOTION_DB_TRAVEL },
      properties,
      children: blocks.slice(0, 100),
    }),
  });

  return res.ok;
}

// ── API 핸들러 ─────────────────────────────────────────────────────────────

export async function POST() {
  try {
    // 1. Supabase 데이터 + Notion 기존 ID 병렬 fetch
    const [[tripsRes, expensesRes], existingIds] = await Promise.all([
      Promise.all([
        fetch(`${SUPA_URL}/rest/v1/trips?select=*&order=start_date.asc`, { headers: supaHeaders }),
        fetch(`${SUPA_URL}/rest/v1/expenses?select=*`, { headers: supaHeaders }),
      ]),
      getExistingSupabaseIds(),
    ]);

    const trips: SupaTrip[] = await tripsRes.json();
    const expenses: SupaExpense[] = await expensesRes.json();

    // 2. 신규 항목만 필터링
    const newTrips = trips.filter((t) => !existingIds.has(t.id));

    if (newTrips.length === 0) {
      return NextResponse.json({
        ok: true,
        synced: 0,
        total: trips.length,
        message: "새로 추가된 여행이 없습니다. Notion이 최신 상태입니다.",
      });
    }

    // 3. 신규 항목만 업로드
    const expMap: Record<string, SupaExpense[]> = {};
    for (const e of expenses) {
      expMap[e.trip_id] = [...(expMap[e.trip_id] ?? []), e];
    }

    let success = 0;
    for (const trip of newTrips) {
      const ok = await createNotionRow(trip, expMap[trip.id] ?? []);
      if (ok) success++;
    }

    return NextResponse.json({
      ok: true,
      synced: success,
      total: trips.length,
      message: `${success}개 여행이 Notion에 새로 추가되었습니다.`,
    });
  } catch (err) {
    console.error("Notion sync error:", err);
    return NextResponse.json({ ok: false, message: "동기화 중 오류가 발생했습니다." }, { status: 500 });
  }
}

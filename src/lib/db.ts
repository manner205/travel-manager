import { supabase } from "./supabase";
import { Trip, Expense, ScheduleItem, AnnualExpenseStat } from "@/types/travel";

function toTrip(row: any): Trip {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    destination: row.destination,
    country: row.country,
    startDate: row.start_date,
    endDate: row.end_date,
    travelers: row.travelers,
    status: row.status,
    coverEmoji: row.cover_emoji,
    notes: row.notes,
  };
}

function toExpense(row: any): Expense {
  return {
    id: row.id,
    tripId: row.trip_id,
    date: row.date,
    category: row.category,
    description: row.description,
    amount: row.amount,
    currency: row.currency,
    originalAmount: row.original_amount,
    receiptImage: row.receipt_image,
    paidBy: row.paid_by,
  };
}

function toSchedule(row: any): ScheduleItem {
  return {
    id: row.id,
    tripId: row.trip_id,
    date: row.date,
    time: row.time,
    title: row.title,
    description: row.description,
    type: row.type,
    reservationNumber: row.reservation_number,
  };
}

export async function getTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("start_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toTrip);
}

export async function getTripById(id: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return toTrip(data);
}

export async function getTripExpenses(tripId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("trip_id", tripId)
    .order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toExpense);
}

export async function getTripSchedules(tripId: string): Promise<ScheduleItem[]> {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("trip_id", tripId)
    .order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toSchedule);
}

export async function getAllExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toExpense);
}

// ── 쓰기 함수 ──────────────────────────────────────────────

export async function createTrip(data: Omit<Trip, "id">): Promise<Trip> {
  const { data: row, error } = await supabase
    .from("trips")
    .insert({
      title: data.title,
      type: data.type,
      destination: data.destination,
      country: data.country,
      start_date: data.startDate,
      end_date: data.endDate,
      travelers: data.travelers,
      status: data.status,
      cover_emoji: data.coverEmoji,
      notes: data.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return toTrip(row);
}

export async function updateTrip(id: string, data: Partial<Omit<Trip, "id">>): Promise<void> {
  const { error } = await supabase
    .from("trips")
    .update({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.destination !== undefined && { destination: data.destination }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.startDate !== undefined && { start_date: data.startDate }),
      ...(data.endDate !== undefined && { end_date: data.endDate }),
      ...(data.travelers !== undefined && { travelers: data.travelers }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.coverEmoji !== undefined && { cover_emoji: data.coverEmoji }),
      ...(data.notes !== undefined && { notes: data.notes }),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTrip(id: string): Promise<void> {
  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) throw error;
}

export async function createExpense(data: Omit<Expense, "id">): Promise<Expense> {
  const { data: row, error } = await supabase
    .from("expenses")
    .insert({
      trip_id: data.tripId,
      date: data.date,
      category: data.category,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      original_amount: data.originalAmount,
      receipt_image: data.receiptImage,
      paid_by: data.paidBy,
    })
    .select()
    .single();
  if (error) throw error;
  return toExpense(row);
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

export async function createSchedule(data: Omit<ScheduleItem, "id">): Promise<ScheduleItem> {
  const { data: row, error } = await supabase
    .from("schedules")
    .insert({
      trip_id: data.tripId,
      date: data.date,
      time: data.time,
      title: data.title,
      description: data.description,
      type: data.type,
      reservation_number: data.reservationNumber,
    })
    .select()
    .single();
  if (error) throw error;
  return toSchedule(row);
}

export async function deleteSchedule(id: string): Promise<void> {
  const { error } = await supabase.from("schedules").delete().eq("id", id);
  if (error) throw error;
}

// ── 통계 ────────────────────────────────────────────────────

export async function getAnnualExpenseStats(): Promise<AnnualExpenseStat[]> {
  const expenses = await getAllExpenses();
  const yearMap: Record<string, { total: number; tripIds: Set<string> }> = {};
  expenses.forEach((e) => {
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

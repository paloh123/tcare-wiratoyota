import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, addMonths, differenceInDays } from "date-fns"
import { id } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null, fmt = "dd MMM yyyy"): string {
  if (!date) return "-"
  try {
    return format(new Date(date), fmt, { locale: id })
  } catch {
    return "-"
  }
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "Rp 0"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0"
  return new Intl.NumberFormat("id-ID").format(value)
}

// Interval offsets in months
export const INTERVAL_MONTHS: Record<string, number> = {
  FIRST: 1,
  SECOND: 6,
  THIRD: 12,
  FOURTH: 18,
  FIFTH: 24,
  SIXTH: 30,
  SEVENTH: 36,
}

export const INTERVAL_LABELS: Record<string, string> = {
  FIRST: "1st (1 Bln)",
  SECOND: "2nd (6 Bln)",
  THIRD: "3rd (12 Bln)",
  FOURTH: "4th (18 Bln)",
  FIFTH: "5th (24 Bln)",
  SIXTH: "6th (30 Bln)",
  SEVENTH: "7th (36 Bln)",
}

export const INTERVAL_ORDER = ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH"]

export const MONTH_FIELD_MAP: Record<string, string> = {
  FIRST: "month_1",
  SECOND: "month_6",
  THIRD: "month_12",
  FOURTH: "month_18",
  FIFTH: "month_24",
  SIXTH: "month_30",
  SEVENTH: "month_36",
}

export function getPredDate(deliveryDate: Date, interval: string): Date {
  const months = INTERVAL_MONTHS[interval] ?? 0
  return addMonths(new Date(deliveryDate), months)
}

export function getDaysDiff(predDate: Date, actualDate: Date | null): number | null {
  if (!actualDate) return null
  return differenceInDays(new Date(actualDate), new Date(predDate))
}

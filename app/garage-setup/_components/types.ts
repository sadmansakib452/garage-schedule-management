/**
 * Shared TypeScript interfaces and types for the Garage Scheduling System
 *
 * This file contains all the type definitions used across components
 * to ensure type safety and consistency throughout the application.
 * Updated to include reset state, onboarding types, and daysToGenerate.
 */

export interface TimeSlot {
  id?: string
  start: string
  end: string
  is_available?: boolean
  is_blocked?: boolean
}

export interface DayAvailability {
  type: "working" | "weekend" | "holiday"
  timeSlots?: TimeSlot[]
  start_time?: string | null
  end_time?: string | null
  slot_duration?: number | null
  description?: string
}

export interface WeekDay {
  day: string
  date: string
  availability: DayAvailability
  isCurrentMonth?: boolean
}

export interface EditingSlot {
  id: string
  start: string
  end: string
}

// Reset State Types
export interface ResetState {
  is_reset: boolean
}

export interface ResetResult {
  weekly_patterns_deleted: number
  calendar_events_deleted: number
  time_slots_deleted: number
  total_deleted: number
  is_reset: boolean
}

// Weekly Pattern Setup Types
export interface WeeklyPatternSetup {
  [key: number]: {
    enabled: boolean
    start_time: string
    end_time: string
    slot_duration: number
  }
}

// API-compatible types that match the new backend structure
export interface ApiWeeklyPatternDay {
  day_of_week: number
  type: "OPEN" | "CLOSED"
  start_time?: string
  end_time?: string
  slot_duration?: number
}

export interface ApiWeeklyPatternRequest {
  pattern: ApiWeeklyPatternDay[]
  daysToGenerate: number
}

export interface ApiWeeklyPatternResponse {
  schedules: Array<{
    id: string
    garage_id: string
    event_date: string
    day_of_week: number
    is_recurring: boolean
    type: "OPEN" | "CLOSED"
    start_time: string | null
    end_time: string | null
    slot_duration: number | null
  }>
  is_reset: boolean
}

export interface ApiWeekScheduleDay {
  date: string
  day_of_week: number
  schedule: {
    id: string
    type: "OPEN" | "CLOSED" | "HOLIDAY"
    start_time: string | null
    end_time: string | null
    slot_duration: number | null
    is_recurring: boolean
  } | null
  source: "weekly_pattern" | "special_day" | "no_schedule"
}

export interface ApiSpecialDay {
  id: string
  garage_id: string
  event_date: string
  type: "HOLIDAY" | "OPEN"
  start_time?: string | null
  end_time?: string | null
  slot_duration?: number | null
  is_recurring: boolean
  day_of_week: number
}

export interface ApiSlot {
  id: string
  garage_id: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
  is_blocked: boolean
  order_id: string | null
}

// Constants used across components
export const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export const BRAND_COLOR = "#19CA32"

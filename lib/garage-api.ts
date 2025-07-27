/**
 * Garage API Service - Updated with Reset State & Complete API Coverage
 *
 * This service handles all API communications with the garage scheduling backend.
 * Updated to include reset state management, daysToGenerate field, and all missing endpoints.
 */

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  statusCode?: number
  count?: number
}

// Reset State Types
export interface ResetStateResponse {
  is_reset: boolean
}

export interface ResetResponse {
  weekly_patterns_deleted: number
  calendar_events_deleted: number
  time_slots_deleted: number
  total_deleted: number
  is_reset: boolean
}

// Weekly Pattern Types
export interface WeeklyPatternDay {
  day_of_week: number // 0 = Sunday, 1 = Monday, etc.
  type: "OPEN" | "CLOSED"
  start_time?: string
  end_time?: string
  slot_duration?: number
}

export interface WeeklyPatternRequest {
  pattern: WeeklyPatternDay[]
  daysToGenerate: number
}

export interface WeeklyPatternSchedule {
  id: string
  garage_id: string
  event_date: string
  day_of_week: number
  is_recurring: boolean
  type: "OPEN" | "CLOSED"
  start_time: string | null
  end_time: string | null
  slot_duration: number | null
}

export interface WeeklyPatternResponse {
  schedules: WeeklyPatternSchedule[]
  is_reset: boolean
}

// Week Schedule Types
export interface WeekScheduleDay {
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

// Special Day Types
export interface SpecialDayRequest {
  date: string
  type: "HOLIDAY" | "OPEN"
  start_time?: string
  end_time?: string
  slot_duration?: number
}

export interface SpecialDayResponse {
  id: string
  garage_id: string
  event_date: string
  type: "HOLIDAY" | "OPEN"
  start_time: string | null
  end_time: string | null
  slot_duration: number | null
  is_recurring: boolean
  day_of_week: number
}

// Month Schedule Types
export interface MonthScheduleItem {
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

// Slot Types
export interface Slot {
  id: string
  garage_id: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
  is_blocked: boolean
  order_id: string | null
}

export interface ManualSlotInput {
  start_time: string
  end_time: string
}

export interface ManualSlotsRequest {
  date: string
  slots: ManualSlotInput[]
  replace: boolean
}

export interface SlotUpdateRequest {
  start_time: string
  end_time: string
}

export default class GarageApiService {
  private baseUrl: string
  private token = ""

  constructor(baseUrl?: string) {
    // Use environment variable first, then fallback to parameter, then default
    const rawBaseUrl =
      baseUrl ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.API_BASE_URL ||
      "https://instructional-newsletters-counseling-ri.trycloudflare.com"

    // Remove trailing slash if present
    const cleanBaseUrl = rawBaseUrl.replace(/\/$/, "")

    // Add /api/garage-dashboard suffix for all API calls
    this.baseUrl = `${cleanBaseUrl}/api/garage-dashboard`

    console.log("API Base URL:", this.baseUrl)
  }

  /**
   * Set the authentication token
   */
  setToken(token: string): void {
    this.token = token.trim()
  }

  /**
   * Make HTTP request with proper error handling
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    console.log("Making API request to:", url)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
          statusCode: response.status,
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
        count: data.count,
      }
    } catch (error: any) {
      let errorMessage = "Network error"

      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          errorMessage = `Unable to connect to API at ${this.baseUrl}. Please check your internet connection and API URL.`
        } else {
          errorMessage = error.message
        }
      }

      console.error("API Request failed:", {
        url: url,
        error: errorMessage,
        originalError: error,
      })

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  // ============================================================================
  // RESET STATE MANAGEMENT
  // ============================================================================

  /**
   * Check if the user is in a reset state (needs to set up weekly pattern)
   * GET /schedule/reset-state
   */
  async getResetState(): Promise<ApiResponse<ResetStateResponse>> {
    return this.makeRequest<ResetStateResponse>("/schedule/reset-state")
  }

  /**
   * Reset all schedules permanently
   * DELETE /schedule/reset
   */
  async resetSchedule(): Promise<ApiResponse<ResetResponse>> {
    return this.makeRequest<ResetResponse>("/schedule/reset", {
      method: "DELETE",
    })
  }

  // ============================================================================
  // WEEKLY SCHEDULE MANAGEMENT
  // ============================================================================

  /**
   * Set weekly working pattern for all 7 days with daysToGenerate
   * POST /schedule/weekly
   */
  async setWeeklyPattern(
    pattern: WeeklyPatternDay[],
    daysToGenerate = 30,
  ): Promise<ApiResponse<WeeklyPatternResponse>> {
    if (pattern.length !== 7) {
      return {
        success: false,
        error: "Must provide exactly 7 days of pattern data",
      }
    }

    if (daysToGenerate < 1 || daysToGenerate > 365) {
      return {
        success: false,
        error: "daysToGenerate must be between 1 and 365",
      }
    }

    const request: WeeklyPatternRequest = {
      pattern,
      daysToGenerate,
    }

    return this.makeRequest<WeeklyPatternResponse>("/schedule/weekly", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  /**
   * Get week schedule starting from a specific date
   * GET /schedule/week?startDate=YYYY-MM-DD
   */
  async getWeekSchedule(startDate: string): Promise<ApiResponse<WeekScheduleDay[]>> {
    return this.makeRequest<WeekScheduleDay[]>(`/schedule/week?startDate=${startDate}`)
  }

  /**
   * Helper method to create a weekly pattern
   */
  createWeeklyPattern(
    workingDays: { [key: number]: { start: string; end: string; duration: number } } = {},
  ): WeeklyPatternDay[] {
    const pattern: WeeklyPatternDay[] = []

    for (let day = 0; day <= 6; day++) {
      if (workingDays[day]) {
        pattern.push({
          day_of_week: day,
          type: "OPEN",
          start_time: workingDays[day].start,
          end_time: workingDays[day].end,
          slot_duration: workingDays[day].duration,
        })
      } else {
        pattern.push({
          day_of_week: day,
          type: "CLOSED",
        })
      }
    }

    return pattern
  }

  // ============================================================================
  // SPECIAL DAY MANAGEMENT
  // ============================================================================

  /**
   * Set a special day (holiday or special opening)
   * POST /schedule
   */
  async setSpecialDay(request: SpecialDayRequest): Promise<ApiResponse<SpecialDayResponse>> {
    return this.makeRequest<SpecialDayResponse>("/schedule", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  /**
   * Set holiday (non-working day)
   */
  async setHoliday(date: string, description?: string): Promise<ApiResponse<SpecialDayResponse>> {
    return this.setSpecialDay({
      date,
      type: "HOLIDAY",
    })
  }

  /**
   * Set special opening hours
   */
  async setSpecialOpening(
    date: string,
    startTime: string,
    endTime: string,
    slotDuration = 60,
  ): Promise<ApiResponse<SpecialDayResponse>> {
    return this.setSpecialDay({
      date,
      type: "OPEN",
      start_time: startTime,
      end_time: endTime,
      slot_duration: slotDuration,
    })
  }

  /**
   * Get month schedule (special days only)
   * GET /schedule/month?month=7&year=2025
   */
  async getMonthSchedule(month: number, year: number): Promise<ApiResponse<MonthScheduleItem[]>> {
    return this.makeRequest<MonthScheduleItem[]>(`/schedule/month?month=${month}&year=${year}`)
  }

  /**
   * Delete special day schedule
   * DELETE /schedule?date=YYYY-MM-DD
   */
  async deleteSpecialDay(date: string): Promise<ApiResponse> {
    return this.makeRequest(`/schedule?date=${date}`, {
      method: "DELETE",
    })
  }

  // ============================================================================
  // SLOT MANAGEMENT
  // ============================================================================

  /**
   * Get slots for a specific date
   * GET /slots?date=YYYY-MM-DD
   */
  async getSlotsForDate(date: string): Promise<ApiResponse<Slot[]>> {
    return this.makeRequest<Slot[]>(`/slots?date=${date}`)
  }

  /**
   * Add manual slots for a date (or replace all slots)
   * POST /slots/manual
   */
  async setManualSlots(date: string, slots: ManualSlotInput[], replace = false): Promise<ApiResponse> {
    const request: ManualSlotsRequest = {
      date,
      slots,
      replace,
    }

    return this.makeRequest("/slots/manual", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  /**
   * Update a specific slot's time
   * PATCH /slots/:id
   */
  async updateSlot(slotId: string, startTime: string, endTime: string): Promise<ApiResponse> {
    const request: SlotUpdateRequest = {
      start_time: startTime,
      end_time: endTime,
    }

    return this.makeRequest(`/slots/${slotId}`, {
      method: "PATCH",
      body: JSON.stringify(request),
    })
  }

  /**
   * Block a slot
   * PATCH /slots/:id/block
   */
  async blockSlot(slotId: string): Promise<ApiResponse> {
    return this.makeRequest(`/slots/${slotId}/block`, {
      method: "PATCH",
    })
  }

  /**
   * Unblock a slot
   * PATCH /slots/:id/unblock
   */
  async unblockSlot(slotId: string): Promise<ApiResponse> {
    return this.makeRequest(`/slots/${slotId}/unblock`, {
      method: "PATCH",
    })
  }

  /**
   * Delete a specific slot
   * DELETE /slots/:id
   */
  async deleteSlot(slotId: string): Promise<ApiResponse> {
    return this.makeRequest(`/slots/${slotId}`, {
      method: "DELETE",
    })
  }

  /**
   * Remove all slots for a date
   * DELETE /slots/manual?date=YYYY-MM-DD
   */
  async removeAllSlotsForDate(date: string): Promise<ApiResponse> {
    return this.makeRequest(`/slots/manual?date=${date}`, {
      method: "DELETE",
    })
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get current base URL (useful for debugging)
   */
  getBaseUrl(): string {
    return this.baseUrl
  }

  /**
   * Check if token is set
   */
  hasToken(): boolean {
    return this.token.length > 0
  }

  /**
   * Clear the authentication token
   */
  clearToken(): void {
    this.token = ""
  }
}

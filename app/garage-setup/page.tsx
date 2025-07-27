"use client"

/**
 * Main Garage Setup Page - Updated with Reset State & Onboarding
 *
 * This is the main orchestrator component that manages the overall state
 * and coordinates between all child components. Now includes:
 * - Reset state detection and onboarding flow
 * - Weekly pattern setup modal with daysToGenerate
 * - Complete schedule reset functionality
 * - Fixed date alignment between calendar and week view
 * - Updated API integration with new response structures
 */

import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import GarageApiService, {
  type WeekScheduleDay,
  type MonthScheduleItem,
  type Slot,
  type WeeklyPatternDay,
  type WeeklyPatternResponse,
  type ResetStateResponse,
} from "@/lib/garage-api"

// Import all modular components with correct paths
import { AuthModal } from "./_components/AuthModal"
import { TimeSettingModal } from "./_components/TimeSettingModal"
import { SlotManagementModal } from "./_components/SlotManagementModal"
import { WeeklyPatternSetupModal } from "./_components/WeeklyPatternSetupModal"
import { WeekView } from "./_components/WeekView"
import { CalendarView } from "./_components/CalendarView"

// Import types and utilities with correct paths
import type { TimeSlot, DayAvailability, WeekDay, EditingSlot, WeeklyPatternSetup } from "./_components/types"
import {
  generateWeekData,
  getTotalWeeksInMonth,
  findCurrentWeek,
  getWeekStartDate,
  getWeekIndexForDate,
  generateTimeSlots,
} from "./_components/utils"
import { Calendar } from "lucide-react"

const BRAND_COLOR = "#19CA32"

export default function GarageSetupPage() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // API Service Instance
  const [apiService] = useState(() => new GarageApiService())

  // Authentication State
  const [token, setToken] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)

  // Reset State & Onboarding
  const [isResetState, setIsResetState] = useState(false)
  const [showWeeklyPatternModal, setShowWeeklyPatternModal] = useState(false)
  const [checkingResetState, setCheckingResetState] = useState(false)

  // Navigation State
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Modal States
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [showSlotModal, setShowSlotModal] = useState(false)

  // Selection States
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDayType, setSelectedDayType] = useState<"working" | "weekend" | "holiday">("working")
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)

  // Data States
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{ start: "10:00", end: "18:00" }])
  const [currentWeekData, setCurrentWeekData] = useState<WeekDay[]>([])
  const [availabilityData, setAvailabilityData] = useState<{ [key: string]: DayAvailability }>({})
  const [daySlots, setDaySlots] = useState<TimeSlot[]>([])
  const [manualSlots, setManualSlots] = useState<TimeSlot[]>([{ start: "10:00", end: "11:00" }])

  // Configuration States
  const [slotDuration, setSlotDuration] = useState(60)
  const [isInitialized, setIsInitialized] = useState(false)
  const [editingSlot, setEditingSlot] = useState<EditingSlot | null>(null)
  const [replaceAllSlots, setReplaceAllSlots] = useState(false)

  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")

  // ============================================================================
  // AUTHENTICATION FUNCTIONS
  // ============================================================================

  const handleProceed = async () => {
    if (!token.trim()) {
      toast({
        title: "Error",
        description: "Please enter your API token",
        variant: "destructive",
      })
      return
    }

    // Set the token in the API service and proceed
    apiService.setToken(token)
    setIsAuthenticated(true)

    toast({
      title: "Success",
      description: "API token configured successfully!",
    })

    // Check reset state after authentication
    await checkResetState()
  }

  // ============================================================================
  // RESET STATE FUNCTIONS
  // ============================================================================

  const checkResetState = async () => {
    try {
      setCheckingResetState(true)
      const response = await apiService.getResetState()

      if (response.success && response.data) {
        const resetState = response.data as ResetStateResponse
        setIsResetState(resetState.is_reset)

        if (resetState.is_reset) {
          setShowWeeklyPatternModal(true)
          toast({
            title: "Welcome!",
            description: "Let's set up your weekly schedule to get started.",
          })
        }
      } else {
        console.warn("Failed to check reset state:", response.error)
        // Continue anyway - user might have existing data
        setIsResetState(false)
      }
    } catch (error) {
      console.error("Failed to check reset state:", error)
      // Continue anyway - user might have existing data
      setIsResetState(false)
    } finally {
      setCheckingResetState(false)
    }
  }

  const handleWeeklyPatternSave = async (pattern: WeeklyPatternSetup, daysToGenerate: number) => {
    setLoading(true)
    try {
      // Convert UI pattern to API format
      const apiPattern: WeeklyPatternDay[] = Object.entries(pattern).map(([dayIndex, dayConfig]) => {
        if (dayConfig.enabled) {
          return {
            day_of_week: Number.parseInt(dayIndex),
            type: "OPEN",
            start_time: dayConfig.start_time,
            end_time: dayConfig.end_time,
            slot_duration: dayConfig.slot_duration,
          }
        } else {
          return {
            day_of_week: Number.parseInt(dayIndex),
            type: "CLOSED",
          }
        }
      })

      const response = await apiService.setWeeklyPattern(apiPattern, daysToGenerate)

      if (response.success && response.data) {
        const patternResponse = response.data as WeeklyPatternResponse
        setIsResetState(patternResponse.is_reset)
        setShowWeeklyPatternModal(false)

        toast({
          title: "Success",
          description: isResetState
            ? `Weekly schedule set up successfully! Generated slots for ${daysToGenerate} days.`
            : `Weekly pattern updated successfully! Generated slots for ${daysToGenerate} days.`,
        })

        // Reload data after setting pattern
        await loadWeekSchedule()
        await loadMonthSchedule()
      } else {
        throw new Error(response.error || "Failed to save weekly pattern")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save weekly pattern. Please check your API token.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleReset = async () => {
    setLoading(true)
    try {
      const response = await apiService.resetSchedule()

      if (response.success && response.data) {
        setIsResetState(true)
        setAvailabilityData({})
        setCurrentWeekData([])

        toast({
          title: "Schedule Reset Complete",
          description: `Deleted ${response.data.total_deleted} items. You can now set up a new schedule.`,
        })

        setShowWeeklyPatternModal(true)
      } else {
        throw new Error(response.error || "Failed to reset schedule")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset schedule. Please check your API token.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  const loadWeekSchedule = async () => {
    try {
      setLoading(true)
      const startDate = getWeekStartDate(currentWeekIndex, selectedMonth, selectedYear)
      const response = await apiService.getWeekSchedule(startDate)

      if (response.success && response.data) {
        const newAvailabilityData: { [key: string]: DayAvailability } = { ...availabilityData }

        response.data.forEach((daySchedule: WeekScheduleDay) => {
          if (daySchedule.schedule) {
            let type: "working" | "weekend" | "holiday" = "working"

            if (daySchedule.schedule.type === "HOLIDAY") {
              type = "holiday"
            } else if (daySchedule.schedule.type === "CLOSED") {
              type = "weekend"
            } else {
              type = "working"
            }

            newAvailabilityData[daySchedule.date] = {
              type,
              start_time: daySchedule.schedule.start_time,
              end_time: daySchedule.schedule.end_time,
              slot_duration: daySchedule.schedule.slot_duration,
              timeSlots:
                daySchedule.schedule.start_time && daySchedule.schedule.end_time
                  ? [{ start: daySchedule.schedule.start_time, end: daySchedule.schedule.end_time }]
                  : [],
            }
          }
        })

        setAvailabilityData(newAvailabilityData)
      } else {
        console.warn("Failed to load week schedule:", response.error)
        if (!isResetState) {
          toast({
            title: "API Warning",
            description: response.error || "Failed to load week schedule. Please check your API token.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Failed to load week schedule:", error)
      if (!isResetState) {
        toast({
          title: "Error",
          description: "Network error while loading week schedule. Please check your connection.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMonthSchedule = async () => {
    try {
      setLoading(true)
      const response = await apiService.getMonthSchedule(selectedMonth + 1, selectedYear) // API expects 1-based month

      if (response.success && response.data) {
        const newAvailabilityData: { [key: string]: DayAvailability } = { ...availabilityData }

        response.data.forEach((monthItem: MonthScheduleItem) => {
          const dateStr = monthItem.event_date.split("T")[0]
          let type: "working" | "weekend" | "holiday" = "working"

          if (monthItem.type === "HOLIDAY") {
            type = "holiday"
          } else {
            type = "working"
          }

          newAvailabilityData[dateStr] = {
            type,
            start_time: monthItem.start_time,
            end_time: monthItem.end_time,
            slot_duration: monthItem.slot_duration,
            timeSlots:
              monthItem.start_time && monthItem.end_time
                ? [{ start: monthItem.start_time, end: monthItem.end_time }]
                : [],
          }
        })

        setAvailabilityData(newAvailabilityData)
      } else {
        console.warn("Failed to load month schedule:", response.error)
        if (!isResetState) {
          toast({
            title: "API Warning",
            description: response.error || "Failed to load month schedule. Please check your API token.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Failed to load month schedule:", error)
      if (!isResetState) {
        toast({
          title: "Error",
          description: "Network error while loading month schedule.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const loadSlotsForDate = async (date: string) => {
    try {
      setLoading(true)
      const response = await apiService.getSlotsForDate(date)
      if (response.success && response.data) {
        setDaySlots(
          response.data.map((slot: Slot) => ({
            id: slot.id,
            start: slot.start_time,
            end: slot.end_time,
            is_available: slot.is_available,
            is_blocked: slot.is_blocked,
          })),
        )
      } else {
        console.warn("Failed to load slots:", response.error)
        setDaySlots([])
      }
    } catch (error) {
      console.error("Failed to load slots:", error)
      setDaySlots([])
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // DATA SAVING FUNCTIONS
  // ============================================================================

  const saveAvailabilityToAPI = async (date: string, availability: DayAvailability) => {
    setLoading(true)
    try {
      let response
      if (availability.type === "holiday") {
        response = await apiService.setHoliday(date)
      } else {
        const startTime = availability.start_time || availability.timeSlots?.[0]?.start || "10:00"
        const endTime = availability.end_time || availability.timeSlots?.[0]?.end || "18:00"

        response = await apiService.setSpecialOpening(date, startTime, endTime, availability.slot_duration || 60)
      }

      if (response.success) {
        toast({
          title: "Success",
          description: "Availability updated successfully!",
        })
      } else {
        throw new Error(response.error || "API request failed")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability. Please check your API token.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveManualSlots = async (date: string, slots: TimeSlot[], replace = false) => {
    setLoading(true)
    try {
      const response = await apiService.setManualSlots(
        date,
        slots.map((slot) => ({
          start_time: slot.start,
          end_time: slot.end,
        })),
        replace,
      )

      if (response.success) {
        toast({
          title: "Success",
          description: replace ? "All slots replaced successfully!" : "Manual slots added successfully!",
        })
        await loadSlotsForDate(date)
      } else {
        throw new Error(response.error || "API request failed")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save manual slots. Please check your API token.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // SLOT MANAGEMENT FUNCTIONS
  // ============================================================================

  const updateSlot = async (slotId: string, startTime: string, endTime: string) => {
    setLoading(true)
    try {
      const response = await apiService.updateSlot(slotId, startTime, endTime)

      if (response.success) {
        toast({
          title: "Success",
          description: "Slot updated successfully!",
        })
        await loadSlotsForDate(selectedDate!)
        setEditingSlot(null)
      } else {
        throw new Error(response.error || "API request failed")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update slot. Please check your API token.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSlotBlock = async (slotId: string, isBlocked: boolean) => {
    setLoading(true)
    try {
      const response = isBlocked ? await apiService.unblockSlot(slotId) : await apiService.blockSlot(slotId)

      if (response.success) {
        setDaySlots((prev) => prev.map((slot) => (slot.id === slotId ? { ...slot, is_blocked: !isBlocked } : slot)))
        toast({
          title: "Success",
          description: `Slot ${isBlocked ? "unblocked" : "blocked"} successfully!`,
        })
      } else {
        throw new Error(response.error || "API request failed")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isBlocked ? "unblock" : "block"} slot. Please check your API token.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteSlot = async (slotId: string) => {
    setLoading(true)
    try {
      const response = await apiService.deleteSlot(slotId)

      if (response.success) {
        setDaySlots((prev) => prev.filter((slot) => slot.id !== slotId))
        toast({
          title: "Success",
          description: "Slot deleted successfully!",
        })
      } else {
        throw new Error(response.error || "API request failed")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete slot. Please check your API token.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeAllSlots = async (date: string) => {
    setLoading(true)
    try {
      const response = await apiService.removeAllSlotsForDate(date)

      if (response.success) {
        setDaySlots([])
        toast({
          title: "Success",
          description: `All slots removed for ${date}. ${response.count || 0} slots deleted.`,
        })
      } else {
        throw new Error(response.error || "API request failed")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove all slots. Please check your API token.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // NAVIGATION FUNCTIONS
  // ============================================================================

  const navigateToPreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex((prev) => prev - 1)
    } else {
      let newMonth = selectedMonth - 1
      let newYear = selectedYear
      if (newMonth < 0) {
        newMonth = 11
        newYear = selectedYear - 1
      }
      setSelectedMonth(newMonth)
      setSelectedYear(newYear)
      setCurrentWeekIndex(getTotalWeeksInMonth(newMonth, newYear, availabilityData) - 1)
    }
  }

  const navigateToNextWeek = () => {
    const totalWeeks = getTotalWeeksInMonth(selectedMonth, selectedYear, availabilityData)
    if (currentWeekIndex < totalWeeks - 1) {
      setCurrentWeekIndex((prev) => prev + 1)
    } else {
      let newMonth = selectedMonth + 1
      let newYear = selectedYear
      if (newMonth > 11) {
        newMonth = 0
        newYear = selectedYear + 1
      }
      setSelectedMonth(newMonth)
      setSelectedYear(newYear)
      setCurrentWeekIndex(0)
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleDateClick = (date: string, type: "working" | "weekend" | "holiday") => {
    setSelectedDate(date)
    setSelectedCalendarDate(date)
    setSelectedDayType(type)
    const existingData = availabilityData[date]

    if (existingData && existingData.timeSlots) {
      setTimeSlots(existingData.timeSlots)
    } else {
      setTimeSlots([{ start: "10:00", end: "18:00" }])
    }

    if (type === "working") {
      setShowTimeModal(true)
      loadSlotsForDate(date)
    } else {
      const defaultStart = type === "weekend" ? "10:00" : undefined
      const defaultEnd = type === "weekend" ? "16:00" : undefined

      const newAvailability: DayAvailability = {
        type,
        start_time: defaultStart,
        end_time: defaultEnd,
        slot_duration: type === "weekend" ? 60 : undefined,
        timeSlots: defaultStart && defaultEnd ? [{ start: defaultStart, end: defaultEnd }] : [],
        description: type === "holiday" ? "Holiday" : "Weekend hours",
      }

      setAvailabilityData((prev) => ({
        ...prev,
        [date]: newAvailability,
      }))

      saveAvailabilityToAPI(date, newAvailability)
      setSelectedCalendarDate(null)
    }
  }

  const handleSaveTime = () => {
    if (selectedDate) {
      // Generate slots from the time range and duration
      const generatedSlots = generateTimeSlots(startTime, endTime, slotDuration)

      const newAvailability: DayAvailability = {
        type: selectedDayType,
        timeSlots: generatedSlots,
        start_time: startTime,
        end_time: endTime,
        slot_duration: slotDuration,
      }

      setAvailabilityData((prev) => ({
        ...prev,
        [selectedDate]: newAvailability,
      }))

      saveAvailabilityToAPI(selectedDate, newAvailability)
    }
    setShowTimeModal(false)
    setSelectedDate(null)
    setSelectedCalendarDate(null)
  }

  const handleManageSlots = (date: string) => {
    setSelectedDate(date)
    loadSlotsForDate(date)
    setShowSlotModal(true)
  }

  const handleSaveManualSlots = () => {
    if (selectedDate) {
      saveManualSlots(selectedDate, manualSlots, replaceAllSlots)
      setShowSlotModal(false)
      setReplaceAllSlots(false)
    }
  }

  const handleOpenWeeklyPatternModal = () => {
    setShowWeeklyPatternModal(true)
  }

  // ============================================================================
  // CALENDAR HANDLERS
  // ============================================================================

  const handleDateSelect = (dateStr: string) => {
    setSelectedCalendarDate(dateStr)

    // Find which week this date belongs to and switch to that week
    const targetDate = new Date(dateStr)
    const targetMonth = targetDate.getMonth()
    const targetYear = targetDate.getFullYear()

    // If the selected date is in a different month, switch to that month
    if (targetMonth !== selectedMonth || targetYear !== selectedYear) {
      setSelectedMonth(targetMonth)
      setSelectedYear(targetYear)

      // Calculate the week index for this date in the new month
      const weekIndex = getWeekIndexForDate(dateStr, targetMonth, targetYear, availabilityData)
      setCurrentWeekIndex(weekIndex)
    } else {
      // Same month, just switch to the correct week
      const weekIndex = getWeekIndexForDate(dateStr, selectedMonth, selectedYear, availabilityData)
      setCurrentWeekIndex(weekIndex)
    }
  }

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month)
    setCurrentWeekIndex(0)
  }

  const handleYearChange = (year: number) => {
    setSelectedYear(year)
    setCurrentWeekIndex(0)
  }

  const handleWeekSelect = (weekIndex: number) => {
    setCurrentWeekIndex(weekIndex)
  }

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (!isInitialized && isAuthenticated && !checkingResetState) {
      const currentWeek = findCurrentWeek(availabilityData)
      setSelectedMonth(currentWeek.month)
      setSelectedYear(currentWeek.year)
      setCurrentWeekIndex(currentWeek.weekIndex)
      setIsInitialized(true)

      // Only load initial data if not in reset state
      if (!isResetState) {
        loadWeekSchedule()
        loadMonthSchedule()
      }
    }
  }, [isInitialized, isAuthenticated, checkingResetState, isResetState])

  useEffect(() => {
    if (isInitialized && isAuthenticated && !isResetState) {
      const weekData = generateWeekData(currentWeekIndex, selectedMonth, selectedYear, availabilityData)
      setCurrentWeekData(weekData)

      // Load week schedule when week changes
      loadWeekSchedule()

      // Debug logging to verify date alignment
      console.log(
        "Current Week Data:",
        weekData.map((day) => ({ date: day.date, day: day.day })),
      )
    }
  }, [currentWeekIndex, selectedMonth, selectedYear, isInitialized, isAuthenticated, isResetState])

  useEffect(() => {
    if (isInitialized && isAuthenticated && !isResetState) {
      // Load month schedule when month/year changes
      loadMonthSchedule()
    }
  }, [selectedMonth, selectedYear, isInitialized, isAuthenticated, isResetState])

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show authentication modal if not authenticated
  if (!isAuthenticated) {
    return <AuthModal token={token} setToken={setToken} onProceed={handleProceed} />
  }

  // Show loading while checking reset state
  if (checkingResetState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
            style={{ borderColor: BRAND_COLOR }}
          ></div>
          <p className="text-gray-600">Checking your setup status...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        {/* Header with Weekly Pattern Button */}
        {!isResetState && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Garage Schedule Management</h1>
              <p className="text-sm text-gray-600">Manage your weekly schedule and time slots</p>
            </div>
            <button
              onClick={handleOpenWeeklyPatternModal}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              <Calendar className="w-4 h-4" />
              Weekly Pattern
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Section - Week View */}
          <WeekView
            currentWeekIndex={currentWeekIndex}
            currentWeekData={currentWeekData}
            selectedCalendarDate={selectedCalendarDate}
            loading={loading}
            onPreviousWeek={navigateToPreviousWeek}
            onNextWeek={navigateToNextWeek}
            onManageSlots={handleManageSlots}
          />

          {/* Right Section - Calendar */}
          <CalendarView
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            selectedCalendarDate={selectedCalendarDate}
            currentWeekData={currentWeekData}
            currentWeekIndex={currentWeekIndex}
            availabilityData={availabilityData}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
            onDateSelect={handleDateSelect}
            onWeekSelect={handleWeekSelect}
            onSetWorking={() => selectedCalendarDate && handleDateClick(selectedCalendarDate, "working")}
            onSetWeekend={() => selectedCalendarDate && handleDateClick(selectedCalendarDate, "weekend")}
            onSetHoliday={() => selectedCalendarDate && handleDateClick(selectedCalendarDate, "holiday")}
            onClearSelection={() => setSelectedCalendarDate(null)}
          />
        </div>
      </div>

      {/* Modals */}
      <TimeSettingModal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        timeSlots={timeSlots}
        setTimeSlots={setTimeSlots}
        slotDuration={slotDuration}
        setSlotDuration={setSlotDuration}
        loading={loading}
        onSave={handleSaveTime}
      />

      <SlotManagementModal
        isOpen={showSlotModal}
        onClose={() => setShowSlotModal(false)}
        selectedDate={selectedDate}
        daySlots={daySlots}
        manualSlots={manualSlots}
        setManualSlots={setManualSlots}
        editingSlot={editingSlot}
        setEditingSlot={setEditingSlot}
        replaceAllSlots={replaceAllSlots}
        setReplaceAllSlots={setReplaceAllSlots}
        loading={loading}
        onUpdateSlot={updateSlot}
        onToggleSlotBlock={toggleSlotBlock}
        onDeleteSlot={deleteSlot}
        onSaveManualSlots={handleSaveManualSlots}
        onRemoveAllSlots={removeAllSlots}
      />

      <WeeklyPatternSetupModal
        isOpen={showWeeklyPatternModal}
        onClose={() => setShowWeeklyPatternModal(false)}
        onSave={handleWeeklyPatternSave}
        onReset={handleScheduleReset}
        loading={loading}
        isResetState={isResetState}
      />
    </>
  )
}

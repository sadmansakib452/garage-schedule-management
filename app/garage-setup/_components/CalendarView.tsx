"use client"

/**
 * Calendar View Component
 *
 * This component renders a custom calendar implementation on the right side.
 * It provides month/year navigation, date selection, week highlighting,
 * and availability configuration buttons.
 *
 * CALENDAR IMPLEMENTATION DETAILS:
 * - Custom calendar grid (7x6 = 42 days) to show complete weeks
 * - Manual calculation of weeks and date positioning
 * - Week highlighting with dynamic bars that preserve original colors
 * - No external calendar library used - pure React/JavaScript implementation
 * - Automatic year transitions and proper date handling
 */

import type React from "react"
import { ChevronLeft, ChevronRight, Calendar, Briefcase, Home, Gift } from "lucide-react"
import type { WeekDay, DayAvailability } from "./types"
import { BRAND_COLOR, MONTHS } from "./types"
import { isToday } from "./utils"

interface CalendarViewProps {
  selectedMonth: number
  selectedYear: number
  selectedCalendarDate: string | null
  currentWeekData: WeekDay[]
  currentWeekIndex: number
  availabilityData: { [key: string]: DayAvailability }
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  onDateSelect: (date: string) => void
  onWeekSelect: (weekIndex: number) => void
  onSetWorking: () => void
  onSetWeekend: () => void
  onSetHoliday: () => void
  onClearSelection: () => void
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  selectedMonth,
  selectedYear,
  selectedCalendarDate,
  currentWeekData,
  currentWeekIndex,
  availabilityData,
  onMonthChange,
  onYearChange,
  onDateSelect,
  onWeekSelect,
  onSetWorking,
  onSetWeekend,
  onSetHoliday,
  onClearSelection,
}) => {
  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1)
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday
    const daysInMonth = lastDayOfMonth.getDate()

    const calendarDays: Array<{
      date: string
      day: number
      isCurrentMonth: boolean
      isToday: boolean
      availability?: DayAvailability
      weekIndex: number
    }> = []

    // Add days from previous month
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear
    const daysInPrevMonth = new Date(selectedYear, selectedMonth, 0).getDate()

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const date = new Date(prevYear, prevMonth, day)
      const dateStr = date.toISOString().split("T")[0]
      const weekIndex = Math.floor((firstDayOfWeek - 1 - i + day - 1) / 7)

      calendarDays.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isToday: isToday(dateStr),
        availability: availabilityData[dateStr],
        weekIndex,
      })
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day)
      const dateStr = date.toISOString().split("T")[0]
      const weekIndex = Math.floor((firstDayOfWeek + day - 2) / 7)

      calendarDays.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        isToday: isToday(dateStr),
        availability: availabilityData[dateStr],
        weekIndex,
      })
    }

    // Add days from next month to complete the grid
    const totalCells = Math.ceil(calendarDays.length / 7) * 7
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1
    const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear

    for (let day = 1; calendarDays.length < totalCells; day++) {
      const date = new Date(nextYear, nextMonth, day)
      const dateStr = date.toISOString().split("T")[0]
      const weekIndex = Math.floor(calendarDays.length / 7)

      calendarDays.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isToday: isToday(dateStr),
        availability: availabilityData[dateStr],
        weekIndex,
      })
    }

    return calendarDays
  }

  const calendarDays = generateCalendarDays()
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  const getAvailabilityColor = (availability?: DayAvailability) => {
    if (!availability) return "#f3f4f6" // gray-100

    switch (availability.type) {
      case "working":
        return BRAND_COLOR
      case "weekend":
        return "#f59e0b" // amber-500
      case "holiday":
        return "#ef4444" // red-500
      default:
        return "#f3f4f6" // gray-100
    }
  }

  const isCurrentWeek = (weekIndex: number) => {
    return weekIndex === currentWeekIndex
  }

  const handleDateClick = (dateStr: string, isCurrentMonth: boolean) => {
    if (isCurrentMonth) {
      onDateSelect(dateStr)
    }
  }

  const handleWeekClick = (weekIndex: number) => {
    onWeekSelect(weekIndex)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg text-white" style={{ backgroundColor: BRAND_COLOR }}>
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Calendar View</h2>
            <p className="text-sm text-gray-600">Select dates to configure</p>
          </div>
        </div>
      </div>

      {/* Month/Year Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onMonthChange(selectedMonth === 0 ? 11 : selectedMonth - 1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(Number.parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2"
            style={{ focusRingColor: BRAND_COLOR }}
          >
            {MONTHS.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number.parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2"
            style={{ focusRingColor: BRAND_COLOR }}
          >
            {Array.from({ length: 10 }, (_, i) => selectedYear - 5 + i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => onMonthChange(selectedMonth === 11 ? 0 : selectedMonth + 1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Weeks */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className={`grid grid-cols-7 gap-1 ${isCurrentWeek(weekIndex) ? "bg-blue-50 rounded-lg p-1" : ""}`}
            >
              {week.map((dayData) => {
                const isSelected = selectedCalendarDate === dayData.date
                const availabilityColor = getAvailabilityColor(dayData.availability)

                return (
                  <button
                    key={dayData.date}
                    onClick={() => handleDateClick(dayData.date, dayData.isCurrentMonth)}
                    className={`relative h-10 text-sm rounded-lg transition-all ${
                      dayData.isCurrentMonth ? "hover:bg-gray-100 text-gray-800" : "text-gray-400 cursor-default"
                    } ${isSelected ? "ring-2 ring-opacity-50" : ""} ${dayData.isToday ? "font-bold text-white" : ""}`}
                    style={{
                      backgroundColor: dayData.isToday
                        ? availabilityColor
                        : isSelected
                          ? `${availabilityColor}20`
                          : "transparent",
                      ringColor: isSelected ? availabilityColor : undefined,
                    }}
                    disabled={!dayData.isCurrentMonth}
                  >
                    {dayData.day}
                    {dayData.availability && (
                      <div
                        className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ backgroundColor: availabilityColor }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Actions */}
      {selectedCalendarDate && (
        <div className="border-t pt-4">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-800 mb-1">
              Selected:{" "}
              {new Date(selectedCalendarDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h4>
            <p className="text-xs text-gray-600">Choose the day type for this date</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={onSetWorking}
              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Briefcase className="w-4 h-4" style={{ color: BRAND_COLOR }} />
              <span>Working</span>
            </button>
            <button
              onClick={onSetWeekend}
              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Home className="w-4 h-4 text-amber-500" />
              <span>Weekend</span>
            </button>
            <button
              onClick={onSetHoliday}
              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Gift className="w-4 h-4 text-red-500" />
              <span>Holiday</span>
            </button>
          </div>

          <button
            onClick={onClearSelection}
            className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="border-t pt-4 mt-4">
        <h4 className="text-xs font-medium text-gray-600 mb-2">Legend</h4>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
            <span className="text-gray-600">Working</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-gray-600">Weekend</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600">Holiday</span>
          </div>
        </div>
      </div>
    </div>
  )
}

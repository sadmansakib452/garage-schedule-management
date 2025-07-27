"use client"

/**
 * Weekly Pattern Setup Modal Component
 *
 * This modal handles the initial setup of weekly working patterns.
 * It's shown when the user is in a reset state (is_reset: true) and needs
 * to configure their basic 7-day working schedule with slot generation settings.
 */

import type React from "react"
import { useState } from "react"
import { X, Clock, Calendar, RotateCcw, Settings } from "lucide-react"
import type { WeeklyPatternSetup } from "./types"
import { BRAND_COLOR, DAYS } from "./types"

interface WeeklyPatternSetupModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (pattern: WeeklyPatternSetup, daysToGenerate: number) => void
  onReset: () => void
  loading: boolean
  isResetState: boolean
}

export const WeeklyPatternSetupModal: React.FC<WeeklyPatternSetupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onReset,
  loading,
  isResetState,
}) => {
  const [pattern, setPattern] = useState<WeeklyPatternSetup>({
    0: { enabled: false, start_time: "09:00", end_time: "17:00", slot_duration: 60 }, // Sunday
    1: { enabled: true, start_time: "09:00", end_time: "17:00", slot_duration: 60 }, // Monday
    2: { enabled: true, start_time: "09:00", end_time: "17:00", slot_duration: 60 }, // Tuesday
    3: { enabled: true, start_time: "09:00", end_time: "17:00", slot_duration: 60 }, // Wednesday
    4: { enabled: true, start_time: "09:00", end_time: "17:00", slot_duration: 60 }, // Thursday
    5: { enabled: true, start_time: "09:00", end_time: "17:00", slot_duration: 60 }, // Friday
    6: { enabled: true, start_time: "09:00", end_time: "13:00", slot_duration: 60 }, // Saturday
  })

  const [daysToGenerate, setDaysToGenerate] = useState(30)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  if (!isOpen) return null

  const handleDayToggle = (dayIndex: number) => {
    setPattern((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        enabled: !prev[dayIndex].enabled,
      },
    }))
  }

  const handleTimeChange = (dayIndex: number, field: "start_time" | "end_time", value: string) => {
    setPattern((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [field]: value,
      },
    }))
  }

  const handleDurationChange = (dayIndex: number, value: number) => {
    setPattern((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        slot_duration: value,
      },
    }))
  }

  const handleSave = () => {
    onSave(pattern, daysToGenerate)
  }

  const handleResetConfirm = () => {
    setShowResetConfirm(false)
    onReset()
  }

  const enabledDaysCount = Object.values(pattern).filter((day) => day.enabled).length

  const getDaysToGenerateLabel = (days: number) => {
    if (days === 1) return "1 day"
    if (days <= 7) return `${days} days (${Math.ceil(days / 7)} week)`
    if (days <= 30) return `${days} days (${Math.ceil(days / 7)} weeks)`
    if (days <= 90) return `${days} days (~${Math.ceil(days / 30)} months)`
    if (days <= 365) return `${days} days (~${Math.ceil(days / 30)} months)`
    return `${days} days`
  }

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg text-white" style={{ backgroundColor: BRAND_COLOR }}>
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {isResetState ? "Welcome! Set Up Your Weekly Schedule" : "Update Weekly Pattern"}
              </h3>
              <p className="text-sm text-gray-600">
                {isResetState
                  ? "Configure your default working hours for each day of the week"
                  : "Modify your weekly working pattern"}
              </p>
            </div>
          </div>
          {!isResetState && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isResetState && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-800">Getting Started</h4>
              </div>
              <p className="text-sm text-blue-700">
                Set up your basic weekly schedule first. You can always modify individual days later or add special
                hours for holidays and events.
              </p>
            </div>
          )}

          {/* Slot Generation Settings */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-5 h-5" style={{ color: BRAND_COLOR }} />
              <h4 className="font-medium text-gray-800">Slot Generation Settings</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Days to Generate Slots</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={daysToGenerate}
                  onChange={(e) => setDaysToGenerate(Math.max(1, Math.min(365, Number.parseInt(e.target.value) || 1)))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2"
                  style={{ focusRingColor: BRAND_COLOR }}
                />
                <p className="text-xs text-gray-500 mt-1">How many days ahead to create time slots (1-365 days)</p>
              </div>
              <div className="flex items-center">
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="text-sm font-medium text-gray-800">{getDaysToGenerateLabel(daysToGenerate)}</div>
                  <div className="text-xs text-gray-500">Will generate slots from today forward</div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Pattern Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-800">Weekly Working Pattern</h4>
              <div className="text-sm text-gray-600">{enabledDaysCount} of 7 days enabled</div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {DAYS.map((day) => (
                <div
                  key={day.value}
                  className={`border rounded-lg p-4 transition-colors ${
                    pattern[day.value].enabled ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={pattern[day.value].enabled}
                        onChange={() => handleDayToggle(day.value)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: BRAND_COLOR }}
                      />
                      <span className="font-medium text-gray-800">{day.label}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        pattern[day.value].enabled ? "text-white" : "bg-gray-100 text-gray-600"
                      }`}
                      style={{
                        backgroundColor: pattern[day.value].enabled ? BRAND_COLOR : undefined,
                      }}
                    >
                      {pattern[day.value].enabled ? "Open" : "Closed"}
                    </span>
                  </div>

                  {pattern[day.value].enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={pattern[day.value].start_time}
                          onChange={(e) => handleTimeChange(day.value, "start_time", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2"
                          style={{ focusRingColor: BRAND_COLOR }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                        <input
                          type="time"
                          value={pattern[day.value].end_time}
                          onChange={(e) => handleTimeChange(day.value, "end_time", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2"
                          style={{ focusRingColor: BRAND_COLOR }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Slot Duration (min)</label>
                        <select
                          value={pattern[day.value].slot_duration}
                          onChange={(e) => handleDurationChange(day.value, Number.parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2"
                          style={{ focusRingColor: BRAND_COLOR }}
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={45}>45 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={90}>1.5 hours</option>
                          <option value={120}>2 hours</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {!isResetState && (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center justify-center gap-2 bg-red-100 text-red-700 py-3 px-4 rounded-lg hover:bg-red-200 transition-colors font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All
                </button>
              </>
            )}
            <button
              onClick={handleSave}
              disabled={loading || enabledDaysCount === 0}
              className="flex-1 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  {isResetState ? "Set Up Schedule" : "Update Pattern"}
                </>
              )}
            </button>
          </div>

          {enabledDaysCount === 0 && (
            <p className="text-sm text-red-600 text-center mt-2">Please enable at least one working day to continue.</p>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/90 bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <RotateCcw className="w-5 h-5 text-red-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Reset All Schedules?</h4>
            </div>
            <p className="text-gray-600 mb-6">
              This will permanently delete all your weekly patterns, special days, holidays, and time slots. This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetConfirm}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

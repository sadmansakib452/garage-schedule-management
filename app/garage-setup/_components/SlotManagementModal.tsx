"use client"

/**
 * Slot Management Modal Component
 *
 * This comprehensive modal handles all slot-related operations including:
 * - Viewing existing slots with their status (available, blocked, booked)
 * - Editing individual slot times
 * - Blocking/unblocking slots
 * - Deleting slots
 * - Adding manual slots with overlap validation
 * - Replacing all slots for a date
 * - Removing all slots for a date
 * - Fully responsive design with scroll support
 */

import type React from "react"
import { X, Plus, Minus, Trash2, AlertTriangle } from "lucide-react"
import type { TimeSlot, EditingSlot } from "./types"
import { BRAND_COLOR } from "./types"
import { formatTimeToAmPm } from "./utils"
import { useState } from "react"

interface SlotManagementModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: string | null
  daySlots: TimeSlot[]
  manualSlots: TimeSlot[]
  setManualSlots: (slots: TimeSlot[]) => void
  editingSlot: EditingSlot | null
  setEditingSlot: (slot: EditingSlot | null) => void
  replaceAllSlots: boolean
  setReplaceAllSlots: (replace: boolean) => void
  loading: boolean
  onUpdateSlot: (slotId: string, startTime: string, endTime: string) => void
  onToggleSlotBlock: (slotId: string, isBlocked: boolean) => void
  onDeleteSlot: (slotId: string) => void
  onSaveManualSlots: () => void
  onRemoveAllSlots: (date: string) => void
}

export const SlotManagementModal: React.FC<SlotManagementModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  daySlots,
  manualSlots,
  setManualSlots,
  editingSlot,
  setEditingSlot,
  replaceAllSlots,
  setReplaceAllSlots,
  loading,
  onUpdateSlot,
  onToggleSlotBlock,
  onDeleteSlot,
  onSaveManualSlots,
  onRemoveAllSlots,
}) => {
  const [showRemoveAllConfirm, setShowRemoveAllConfirm] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    onClose()
    setEditingSlot(null)
    setReplaceAllSlots(false)
    setShowRemoveAllConfirm(false)
  }

  const addManualSlot = () => {
    setManualSlots([...manualSlots, { start: "10:00", end: "11:00" }])
  }

  const removeManualSlot = (index: number) => {
    const newSlots = manualSlots.filter((_, i) => i !== index)
    setManualSlots(newSlots)
  }

  const updateManualSlot = (index: number, field: "start" | "end", value: string) => {
    const newSlots = [...manualSlots]
    newSlots[index][field] = value
    setManualSlots(newSlots)
  }

  const handleRemoveAllSlots = () => {
    if (selectedDate) {
      onRemoveAllSlots(selectedDate)
      setShowRemoveAllConfirm(false)
    }
  }

  const formatSelectedDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number)
    const date = new Date(year, month - 1, day) // month is 0-indexed
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
            <span className="block sm:inline">Manage Slots</span>
            {selectedDate && (
              <span className="block sm:inline text-sm md:text-base font-normal text-gray-600 mt-1 sm:mt-0 sm:ml-2">
                - {formatSelectedDate(selectedDate)}
              </span>
            )}
          </h3>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Existing Slots Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h4 className="text-lg font-medium text-gray-800">Existing Slots</h4>
              {daySlots.length > 0 && (
                <button
                  onClick={() => setShowRemoveAllConfirm(true)}
                  disabled={loading}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50 self-start sm:self-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove All Slots
                </button>
              )}
            </div>

            {daySlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <p className="text-sm">No slots found for this date</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {daySlots.map((slot, index) => (
                  <div
                    key={slot.id || index}
                    className={`border rounded-lg p-3 ${
                      slot.is_blocked
                        ? "bg-red-50 border-red-200"
                        : slot.is_available
                          ? "border-green-200"
                          : "bg-gray-50 border-gray-200"
                    }`}
                    style={{
                      backgroundColor: slot.is_available && !slot.is_blocked ? `${BRAND_COLOR}10` : undefined,
                    }}
                  >
                    {editingSlot?.id === slot.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="time"
                            value={editingSlot.start}
                            onChange={(e) => setEditingSlot({ ...editingSlot, start: e.target.value })}
                            className="p-2 border border-gray-300 rounded text-sm focus:ring-2"
                            style={{ focusRingColor: BRAND_COLOR }}
                          />
                          <input
                            type="time"
                            value={editingSlot.end}
                            onChange={(e) => setEditingSlot({ ...editingSlot, end: e.target.value })}
                            className="p-2 border border-gray-300 rounded text-sm focus:ring-2"
                            style={{ focusRingColor: BRAND_COLOR }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onUpdateSlot(editingSlot.id, editingSlot.start, editingSlot.end)}
                            disabled={loading}
                            className="flex-1 text-xs px-2 py-1 rounded transition-colors text-white hover:opacity-80"
                            style={{ backgroundColor: BRAND_COLOR }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSlot(null)}
                            className="flex-1 text-xs px-2 py-1 rounded transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {formatTimeToAmPm(slot.start)} - {formatTimeToAmPm(slot.end)}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              slot.is_blocked
                                ? "bg-red-100 text-red-700"
                                : slot.is_available
                                  ? "text-white"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                            style={{
                              backgroundColor: slot.is_available && !slot.is_blocked ? BRAND_COLOR : undefined,
                            }}
                          >
                            {slot.is_blocked ? "Blocked" : slot.is_available ? "Available" : "Booked"}
                          </span>
                        </div>

                        {slot.is_available && slot.id && (
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              onClick={() => setEditingSlot({ id: slot.id!, start: slot.start, end: slot.end })}
                              disabled={loading}
                              className="text-xs px-2 py-1 rounded transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onToggleSlotBlock(slot.id!, slot.is_blocked || false)}
                              disabled={loading}
                              className={`text-xs px-2 py-1 rounded transition-colors ${
                                slot.is_blocked
                                  ? "text-white hover:opacity-80"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                              style={{
                                backgroundColor: slot.is_blocked ? BRAND_COLOR : undefined,
                              }}
                            >
                              {slot.is_blocked ? "Unblock" : "Block"}
                            </button>
                            <button
                              onClick={() => onDeleteSlot(slot.id!)}
                              disabled={loading}
                              className="text-xs px-2 py-1 rounded transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manual Slot Creation Section */}
          <div className="border-t pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h4 className="text-lg font-medium text-gray-800">Add Manual Slots</h4>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="replaceAll"
                  checked={replaceAllSlots}
                  onChange={(e) => setReplaceAllSlots(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="replaceAll" className="text-sm text-gray-600">
                  Replace all existing slots
                </label>
              </div>
            </div>

            {replaceAllSlots && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ This will delete all existing slots for this date and replace them with the new ones below.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {manualSlots.map((slot, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateManualSlot(index, "start", e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2"
                    style={{ focusRingColor: BRAND_COLOR }}
                  />
                  <span className="text-gray-500 text-sm">to</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateManualSlot(index, "end", e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2"
                    style={{ focusRingColor: BRAND_COLOR }}
                  />
                  <button
                    onClick={() => removeManualSlot(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={addManualSlot}
                className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                style={{ color: BRAND_COLOR }}
              >
                <Plus className="w-4 h-4" />
                Add Another Slot
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={onSaveManualSlots}
              disabled={loading || manualSlots.length === 0}
              className="flex-1 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-colors font-medium disabled:opacity-50"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              {loading ? "Saving..." : replaceAllSlots ? "Replace All Slots" : "Add Manual Slots"}
            </button>
          </div>
        </div>
      </div>

      {/* Remove All Slots Confirmation Modal */}
      {showRemoveAllConfirm && (
        <div className="fixed inset-0 bg-black/90 bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Remove All Slots?</h4>
            </div>
            <p className="text-gray-600 mb-6">
              This will permanently delete all time slots for {selectedDate && formatSelectedDate(selectedDate)}. This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveAllConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveAllSlots}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Removing..." : "Remove All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

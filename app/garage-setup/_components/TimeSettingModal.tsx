"use client";

/**
 * Time Setting Modal Component
 *
 * This modal allows users to configure working hours and slot duration
 * for specific dates. It shows a preview of generated slots and provides
 * facilities for custom time settings.
 */

import type React from "react";
import { useState, useEffect } from "react";
import { X, Clock, Eye } from "lucide-react";
import type { TimeSlot } from "./types";
import { BRAND_COLOR } from "./types";
import { generateTimeSlots, formatTimeToAmPm } from "./utils";

interface TimeSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeSlots: TimeSlot[];
  setTimeSlots: (slots: TimeSlot[]) => void;
  slotDuration: number;
  setSlotDuration: (duration: number) => void;
  loading: boolean;
  onSave: () => void;
  useCustomSlots: boolean; // Declare the useCustomSlots variable
}

export const TimeSettingModal: React.FC<TimeSettingModalProps> = ({
  isOpen,
  onClose,
  timeSlots,
  setTimeSlots,
  slotDuration,
  setSlotDuration,
  loading,
  onSave,
  useCustomSlots, // Use the useCustomSlots variable
}) => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [previewSlots, setPreviewSlots] = useState<
    Array<{ start: string; end: string }>
  >([]);

  // Initialize values when modal opens
  useEffect(() => {
    if (isOpen && timeSlots.length > 0) {
      setStartTime(timeSlots[0].start);
      setEndTime(timeSlots[timeSlots.length - 1].end);
    }
  }, [isOpen, timeSlots]);

  // Generate preview slots when settings change
  useEffect(() => {
    if (startTime && endTime && slotDuration) {
      const generated = generateTimeSlots(startTime, endTime, slotDuration);
      setPreviewSlots(generated);
    }
  }, [startTime, endTime, slotDuration]);

  if (!isOpen) return null;

  const handleApplyGenerated = () => {
    const generatedSlots = generateTimeSlots(startTime, endTime, slotDuration);
    setTimeSlots(
      generatedSlots.map((slot) => ({ start: slot.start, end: slot.end }))
    );
  };

  const isValidTimeRange = () => {
    return startTime < endTime && previewSlots.length > 0;
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg text-white"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Set Working Hours
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Time Range Settings */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2"
                  style={{ focusRingColor: BRAND_COLOR }}
                />
              </div>
            </div>

            {/* Slot Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Slot Duration
              </label>
              <select
                value={slotDuration}
                onChange={(e) =>
                  setSlotDuration(Number.parseInt(e.target.value))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2"
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

            {/* Slot Preview */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4" style={{ color: BRAND_COLOR }} />
                <h4 className="font-medium text-gray-800">Slot Preview</h4>
                <span className="text-sm text-gray-500">
                  ({previewSlots.length} slots)
                </span>
              </div>

              {previewSlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {previewSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="text-xs p-2 bg-gray-50 border border-gray-200 rounded text-center"
                    >
                      {formatTimeToAmPm(slot.start)} -{" "}
                      {formatTimeToAmPm(slot.end)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  {startTime >= endTime
                    ? "End time must be after start time"
                    : "No slots can be generated with current settings"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={loading || !isValidTimeRange()}
              className="flex-1 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-colors font-medium disabled:opacity-50"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              {loading ? "Saving..." : "Save Working Hours"}
            </button>
          </div>

          {!isValidTimeRange() && (
            <p className="text-sm text-red-600 text-center mt-2">
              {!useCustomSlots
                ? "Please set valid start and end times"
                : "Please add at least one valid time slot"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

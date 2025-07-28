"use client";

/**
 * Week View Component
 *
 * This component displays a weekly calendar view showing the current week's
 * schedule with day-by-day availability. It provides navigation controls
 * and quick actions for managing slots.
 */

import type React from "react";
import { ChevronLeft, ChevronRight, Settings, Calendar } from "lucide-react";
import type { WeekDay } from "./types";
import { BRAND_COLOR } from "./types";
import { isToday, formatTimeToAmPm } from "./utils";

interface WeekViewProps {
  currentWeekIndex: number;
  currentWeekData: WeekDay[];
  selectedCalendarDate: string | null;
  loading: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onManageSlots: (date: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentWeekIndex,
  currentWeekData,
  selectedCalendarDate,
  loading,
  onPreviousWeek,
  onNextWeek,
  onManageSlots,
}) => {
  const getAvailabilityColor = (availability: WeekDay["availability"]) => {
    switch (availability.type) {
      case "working":
        return BRAND_COLOR; // Green
      case "weekend":
        return "#ef4444"; // Red (FIXED: was yellow/amber)
      case "holiday":
        return "#f59e0b"; // Yellow/Amber (FIXED: was red)
      default:
        return "#6b7280"; // Gray
    }
  };

  const getAvailabilityText = (availability: WeekDay["availability"]) => {
    switch (availability.type) {
      case "working":
        if (availability.start_time && availability.end_time) {
          return `${formatTimeToAmPm(
            availability.start_time
          )} - ${formatTimeToAmPm(availability.end_time)}`;
        }
        return "Working Day";
      case "weekend":
        if (availability.start_time && availability.end_time) {
          return `${formatTimeToAmPm(
            availability.start_time
          )} - ${formatTimeToAmPm(availability.end_time)}`;
        }
        return "Weekend Hours";
      case "holiday":
        return availability.description || "Holiday";
      default:
        return "No Schedule";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="p-2 rounded-lg text-white"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Week View</h2>
          <p className="text-sm text-gray-600">Manage your weekly schedule</p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPreviousWeek}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-800">
            Week {currentWeekIndex + 1}
          </p>
          {currentWeekData.length > 0 && (
            <p className="text-xs text-gray-500">
              {new Date(currentWeekData[0].date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {new Date(currentWeekData[6].date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>

        <button
          onClick={onNextWeek}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Week Days */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {currentWeekData.map((dayData, index) => {
          const isSelected = selectedCalendarDate === dayData.date;
          const isTodayDate = isToday(dayData.date);
          const availabilityColor = getAvailabilityColor(dayData.availability);

          return (
            <div
              key={dayData.date}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected ? "ring-2 ring-opacity-50" : "hover:shadow-sm"
              } ${!dayData.isCurrentMonth ? "opacity-60" : ""}`}
              style={{
                borderColor: isSelected ? availabilityColor : "#e5e7eb",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[50px] md:min-w-[60px]">
                    <div className="text-xs md:text-sm font-medium text-gray-800">
                      {dayData.day.slice(0, 3)}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        isTodayDate ? "text-white" : "text-gray-700"
                      } ${
                        isTodayDate
                          ? "rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center mx-auto"
                          : ""
                      }`}
                      style={{
                        backgroundColor: isTodayDate
                          ? availabilityColor
                          : undefined,
                      }}
                    >
                      {new Date(dayData.date).getDate()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium mb-1 truncate"
                      style={{ color: availabilityColor }}
                    >
                      {getAvailabilityText(dayData.availability)}
                    </div>
                    {dayData.availability.slot_duration && (
                      <div className="text-xs text-gray-500">
                        {dayData.availability.slot_duration} min slots
                      </div>
                    )}
                  </div>
                </div>

                {dayData.availability.type === "working" && (
                  <button
                    onClick={() => onManageSlots(dayData.date)}
                    disabled={loading}
                    className="flex items-center gap-1 px-2 md:px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <Settings className="w-3 h-3" />
                    <span className="hidden sm:inline">Manage</span>
                  </button>
                )}
              </div>

              {/* Availability Indicator */}
              <div className="mt-3">
                <div className="h-1 rounded-full bg-gray-200">
                  <div
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: availabilityColor,
                      width:
                        dayData.availability.type === "working"
                          ? "100%"
                          : dayData.availability.type === "weekend"
                          ? "60%"
                          : dayData.availability.type === "holiday"
                          ? "30%"
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div
              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor: BRAND_COLOR,
                borderTopColor: "transparent",
              }}
            />
            Loading...
          </div>
        </div>
      )}
    </div>
  );
};

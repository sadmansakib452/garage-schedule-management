/**
 * Utility functions for the Garage Scheduling System
 * Updated to fix date alignment issues between calendar and week view
 */

/**
 * Get current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string represents today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getCurrentDate();
}

/**
 * Format time from 24-hour to 12-hour AM/PM format
 */
export function formatTimeToAmPm(time: string): string {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

/**
 * Get the start date of a week (Sunday) for a given week index in a month
 */
export function getWeekStartDate(
  weekIndex: number,
  month: number,
  year: number
): string {
  // Get the first day of the month
  const firstDay = new Date(year, month, 1);

  // Find the first Sunday of the month (or before)
  const firstSunday = new Date(firstDay);
  firstSunday.setDate(1 - firstDay.getDay());

  // Add weeks to get to the desired week
  const weekStart = new Date(firstSunday);
  weekStart.setDate(firstSunday.getDate() + weekIndex * 7);

  const resultYear = weekStart.getFullYear();
  const resultMonth = String(weekStart.getMonth() + 1).padStart(2, "0");
  const resultDay = String(weekStart.getDate()).padStart(2, "0");

  return `${resultYear}-${resultMonth}-${resultDay}`;
}

/**
 * Find which week index a specific date belongs to in a given month
 * Updated to match calendar generation logic
 */
export function getWeekIndexForDate(
  dateStr: string,
  month: number,
  year: number,
  availabilityData: any
): number {
  const targetDate = new Date(dateStr);
  const targetDay = targetDate.getDate();

  // Get the first day of the month and its day of week
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // Calculate week index using the same logic as calendar generation
  const weekIndex = Math.floor((firstDayOfWeek + targetDay - 2) / 7);

  return Math.max(0, weekIndex);
}

/**
 * Generate week data for a specific week index
 * FIXED: Corrected week start calculation to match CalendarView exactly
 */
export function generateWeekData(
  weekIndex: number,
  month: number,
  year: number,
  availabilityData: any
) {
  console.log("🔍 DEBUG: generateWeekData called with:", {
    weekIndex,
    month,
    year,
  });

  // Get the first day of the month
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday

  console.log("🔍 DEBUG: Month info:", {
    firstDay: firstDay.toISOString(),
    firstDayOfWeek,
    firstDayName: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][firstDayOfWeek],
  });

  // FIXED: Use the exact same logic as CalendarView
  // CalendarView uses: const firstSunday = new Date(firstDay); firstSunday.setDate(1 - firstDay.getDay());
  const firstSunday = new Date(firstDay);
  firstSunday.setDate(1 - firstDay.getDay());

  console.log("🔍 DEBUG: First Sunday calculation (FIXED):", {
    formula: `firstDay.setDate(1 - ${firstDayOfWeek})`,
    firstSunday: firstSunday.toISOString(),
    firstSundayDate: firstSunday.getDate(),
  });

  // Add weeks to get to the desired week
  const weekStart = new Date(firstSunday);
  weekStart.setDate(firstSunday.getDate() + weekIndex * 7);

  console.log("🔍 DEBUG: Week start calculation:", {
    formula: `firstSunday.getDate() + ${weekIndex} * 7`,
    calculation: `${firstSunday.getDate()} + ${weekIndex * 7}`,
    weekStart: weekStart.toISOString(),
    weekStartDate: weekStart.getDate(),
  });

  const weekData = [];
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  console.log("🔍 DEBUG: Generating week days:");

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);

    const dateStr = currentDate.toISOString().split("T")[0];
    const availability = availabilityData[dateStr] || {
      type: "working" as const,
      timeSlots: [{ start: "10:00", end: "18:00" }],
      start_time: "10:00",
      end_time: "18:00",
      slot_duration: 60,
    };

    const weekDay = {
      day: dayNames[i],
      date: dateStr,
      availability,
      isCurrentMonth: currentDate.getMonth() === month,
    };

    weekData.push(weekDay);

    console.log("🔍 DEBUG: Day", i, ":", {
      dayName: dayNames[i],
      date: dateStr,
      isCurrentMonth: currentDate.getMonth() === month,
      month: currentDate.getMonth(),
      targetMonth: month,
    });
  }

  console.log(
    "🔍 DEBUG: Final week data:",
    weekData.map((day) => ({ day: day.day, date: day.date }))
  );

  return weekData;
}

/**
 * Get total number of weeks in a month for calendar display
 */
export function getTotalWeeksInMonth(
  month: number,
  year: number,
  availabilityData: any
): number {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Find the first Sunday (start of first week)
  const firstSunday = new Date(firstDay);
  firstSunday.setDate(1 - firstDay.getDay());

  // Find the last Saturday (end of last week)
  const lastSaturday = new Date(lastDay);
  lastSaturday.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  // Calculate number of weeks
  const diffTime = lastSaturday.getTime() - firstSunday.getTime();
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

  return Math.max(1, diffWeeks);
}

/**
 * Find the current week based on today's date
 */
export function findCurrentWeek(availabilityData: any) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const todayStr = getCurrentDate();
  const weekIndex = getWeekIndexForDate(
    todayStr,
    currentMonth,
    currentYear,
    availabilityData
  );

  return {
    month: currentMonth,
    year: currentYear,
    weekIndex: Math.max(0, weekIndex),
  };
}

/**
 * Generate time slots based on start time, end time, and duration
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: number
): Array<{ start: string; end: string }> {
  const slots = [];

  // Parse start and end times
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  // Convert to minutes since midnight
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Generate slots
  for (
    let currentMinutes = startMinutes;
    currentMinutes + slotDuration <= endMinutes;
    currentMinutes += slotDuration
  ) {
    const slotStartHour = Math.floor(currentMinutes / 60);
    const slotStartMin = currentMinutes % 60;
    const slotEndMinutes = currentMinutes + slotDuration;
    const slotEndHour = Math.floor(slotEndMinutes / 60);
    const slotEndMin = slotEndMinutes % 60;

    const slotStart = `${String(slotStartHour).padStart(2, "0")}:${String(
      slotStartMin
    ).padStart(2, "0")}`;
    const slotEnd = `${String(slotEndHour).padStart(2, "0")}:${String(
      slotEndMin
    ).padStart(2, "0")}`;

    slots.push({ start: slotStart, end: slotEnd });
  }

  return slots;
}

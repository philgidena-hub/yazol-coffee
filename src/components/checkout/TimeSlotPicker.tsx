"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SHOP_HOURS: Record<number, { open: number; close: number }> = {
  0: { open: 9, close: 17 }, // Sunday
  1: { open: 8, close: 18 }, // Monday
  2: { open: 8, close: 18 }, // Tuesday
  3: { open: 8, close: 18 }, // Wednesday
  4: { open: 8, close: 18 }, // Thursday
  5: { open: 8, close: 18 }, // Friday
  6: { open: 9, close: 17 }, // Saturday
};

const SLOT_INTERVAL = 10; // minutes
const MIN_PREP_TIME = 10; // minutes from now

interface TimeSlot {
  display: string; // "2:30 PM"
  value: string;   // "2026-02-16T14:30"
}

interface DayOption {
  date: Date;
  label: string;
  hasSlots: boolean;
}

function formatTime(hours: number, minutes: number): string {
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function formatDateValue(date: Date, hours: number, minutes: number): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const h = hours.toString().padStart(2, "0");
  const min = minutes.toString().padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

function getDayLabel(date: Date, index: number): string {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function generateSlots(date: Date, isToday: boolean): TimeSlot[] {
  const dayOfWeek = date.getDay();
  const hours = SHOP_HOURS[dayOfWeek];
  const slots: TimeSlot[] = [];

  let startMinutes = hours.open * 60;
  const endMinutes = hours.close * 60 - SLOT_INTERVAL;

  if (isToday) {
    const now = new Date();
    const earliestMinutes = now.getHours() * 60 + now.getMinutes() + MIN_PREP_TIME;
    const roundedUp = Math.ceil(earliestMinutes / SLOT_INTERVAL) * SLOT_INTERVAL;
    startMinutes = Math.max(startMinutes, roundedUp);
  }

  for (let m = startMinutes; m <= endMinutes; m += SLOT_INTERVAL) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push({
      display: formatTime(h, min),
      value: formatDateValue(date, h, min),
    });
  }

  return slots;
}

function generateDays(): DayOption[] {
  const days: DayOption[] = [];
  const today = new Date();
  for (let i = 0; i < 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);
    const hasSlots = generateSlots(date, i === 0).length > 0;
    days.push({ date, label: getDayLabel(date, i), hasSlots });
  }
  return days;
}

interface TimeSlotPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TimeSlotPicker({ value, onChange }: TimeSlotPickerProps) {
  const days = useMemo(() => generateDays(), []);

  // Auto-select the first day that has available slots
  const firstAvailableDay = useMemo(
    () => days.findIndex((d) => d.hasSlots),
    [days]
  );

  const [selectedDay, setSelectedDay] = useState(
    firstAvailableDay >= 0 ? firstAvailableDay : 0
  );

  // If today has no slots on mount, auto-select next day
  useEffect(() => {
    if (firstAvailableDay >= 0 && firstAvailableDay !== selectedDay && !value) {
      setSelectedDay(firstAvailableDay);
    }
  }, [firstAvailableDay]); // eslint-disable-line react-hooks/exhaustive-deps

  const slots = useMemo(
    () => generateSlots(days[selectedDay].date, selectedDay === 0),
    [days, selectedDay]
  );

  return (
    <div className="space-y-4">
      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {days.map((day, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setSelectedDay(i);
              onChange("");
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-body transition-colors ${
              selectedDay === i
                ? "bg-brown text-white"
                : !day.hasSlots
                ? "bg-white border border-black/5 text-brown/25 cursor-not-allowed"
                : "bg-white border border-black/10 text-brown/50 hover:border-brown/30"
            }`}
            disabled={!day.hasSlots}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Time slot grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {slots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => onChange(slot.value)}
                  className={`py-2.5 px-2 rounded-xl text-sm font-body text-center transition-colors ${
                    value === slot.value
                      ? "bg-brown text-white"
                      : "bg-white border border-black/10 text-brown/50 hover:border-brown/30 hover:text-brown"
                  }`}
                >
                  {slot.display}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-brown/50 text-sm font-body text-center py-8">
              Shop is closed — please select another day
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

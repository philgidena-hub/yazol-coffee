"use client";

import { useState, useMemo } from "react";
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

const SLOT_INTERVAL = 15; // minutes
const MIN_PREP_TIME = 30; // minutes

interface TimeSlot {
  display: string; // "2:30 PM"
  value: string;   // "2026-02-16T14:30"
}

interface DayOption {
  date: Date;
  label: string;
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

function generateDays(): DayOption[] {
  const days: DayOption[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);
    days.push({ date, label: getDayLabel(date, i) });
  }
  return days;
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

interface TimeSlotPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TimeSlotPicker({ value, onChange }: TimeSlotPickerProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const days = useMemo(() => generateDays(), []);

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
                ? "bg-gold text-bg"
                : "bg-surface border border-cream/10 text-cream-muted hover:border-gold/30"
            }`}
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
                      ? "bg-gold text-bg"
                      : "bg-surface border border-cream/10 text-cream-muted hover:border-gold/30 hover:text-cream"
                  }`}
                >
                  {slot.display}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-cream-muted text-sm font-body text-center py-8">
              No available time slots for this day
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

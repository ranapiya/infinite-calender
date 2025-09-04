import React from "react";
import { getMonthDetails } from "@/lib/calendar";
import { format } from "date-fns";
import { JournalEntry } from "@/data";
import Image from "next/image";

interface MonthGridProps {
  date: Date;
  entries: { [key: string]: JournalEntry[] };
  onEntryClick: (entry: JournalEntry) => void;
  selectedDate?: Date | null;
}

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthGrid({
  date,
  entries,
  onEntryClick,
  selectedDate,
}: MonthGridProps) {
  const { monthName, year, days } = getMonthDetails(date);

  return (
    <div
      className="month-grid p-2 mb-6"
      data-month={monthName}
      data-year={year}
    >
      {/* Weekdays row */}
      <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-semibold text-cyan-700 border-b border-gray-200">
        {weekdayNames.map((day, index) => (
          <div key={index} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-[2px] mt-1">
        {days.map((day, index) => {
          const isSelected =
            selectedDate &&
            day &&
            format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

          return (
            <div
              key={index}
              className={`relative aspect-square border border-gray-200 rounded-sm overflow-hidden flex items-center justify-center
                ${isSelected ? "ring-2 ring-blue-400" : ""}`}
            >
              {/* Empty day (before/after current month) */}
              {!day && <span className="text-xs text-gray-400"> </span>}

              {/* Day with entries */}
              {day && entries[format(day, "yyyy-MM-dd")] ? (
                entries[format(day, "yyyy-MM-dd")].map((entry, entryIndex) => (
                  <div
                    key={entryIndex}
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => onEntryClick(entry)}
                  >
                    <Image
                      src={entry.imgUrl}
                      alt="Journal Entry Thumbnail"
                      fill
                      className="object-cover"
                    />
                    {/* Day number overlay */}
                    <span
                      className={`absolute top-1 left-1 text-[10px] sm:text-xs font-bold px-1 py-0.5 rounded 
                        ${isSelected ? "bg-yellow-200 text-blue-700" : "bg-white/80 text-gray-800"}`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                ))
              ) : (
                // Day without entries
                <span
                  className={`text-[11px] sm:text-xs font-medium ${
                    isSelected ? "bg-yellow-200 text-blue-700 px-1 py-0.5 rounded" : "text-gray-700"
                  }`}
                >
                  {day ? format(day, "d") : ""}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

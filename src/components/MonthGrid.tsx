import React from "react";
import { getMonthDetails } from "@/lib/calendar";
import { format } from "date-fns";
import { JournalEntry } from "@/data";
import { Card } from "@/components/ui/card";
import Image from "next/image";

interface MonthGridProps {
  date: Date;
  entries: { [key: string]: JournalEntry[] };
  onEntryClick: (entry: JournalEntry) => void;
}

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthGrid({
  date,
  entries,
  onEntryClick,
}: MonthGridProps) {
  const { monthName, year, days } = getMonthDetails(date);

  return (
    <div
      className="month-grid p-2 mb-4"
      data-month={monthName}
      data-year={year}
    >
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-cyan-700 border-b border-gray-200">
        {weekdayNames.map((day, index) => (
          <div key={index} className="p-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-1">
        {days.map((day, index) => (
          <div
            key={index}
            className="flex flex-col min-h-[100px] border-r border-b border-gray-200 p-2 relative"
          >
            <span className="text-sm font-medium">
              {day ? format(day, "d") : ""}
            </span>
            {day && (
              <div className="flex-1 flex flex-col gap-1 mt-1 overflow-hidden">
                {entries[format(day, "yyyy-MM-dd")]?.map(
                  (entry, entryIndex) => (
                    <div
                      key={entryIndex}
                      onClick={() => onEntryClick(entry)}
                      className="cursor-pointer"
                    >
                      <Card className="p-1 bg-blue-100 border-blue-300 hover:bg-blue-200 transition-colors flex items-center justify-center h-16 w-full overflow-hidden">
                        <div className="relative w-full h-full rounded-sm">
                          <Image
                            src={entry.imgUrl}
                            alt="Journal Entry Thumbnail"
                            fill
                            className="object-cover rounded-sm"
                          />
                        </div>
                      </Card>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

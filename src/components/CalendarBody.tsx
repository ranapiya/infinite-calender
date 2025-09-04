import React, { forwardRef, useCallback, useEffect } from "react";
import MonthGrid from "./MonthGrid";
import { JournalEntry } from "@/data";

interface CalendarBodyProps {
  months: { date: Date; key: string }[];
  groupedEntries: { [key: string]: JournalEntry[] };
  onEntryClick: (entry: JournalEntry) => void;
  loadMoreMonths: (direction: "up" | "down") => void;
}

const CalendarBody = forwardRef<HTMLDivElement, CalendarBodyProps>(
  ({ months, groupedEntries, onEntryClick, loadMoreMonths }, ref) => {
    const handleScroll = useCallback(() => {
      const container = (ref as React.RefObject<HTMLDivElement>).current;
      if (!container) return;

      if (
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 200
      ) {
        loadMoreMonths("down");
      }

      if (container.scrollTop <= 200) {
        loadMoreMonths("up");
      }
    }, [loadMoreMonths, ref]);

    useEffect(() => {
      const container = (ref as React.RefObject<HTMLDivElement>).current;
      if (!container) return;

      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }, [handleScroll, ref]);

    return (
      <div
        ref={ref}
        className="flex-1 overflow-y-scroll mt-[56px] sm:mt-[64px] pb-4"
      >
        {months.map(({ date, key }) => (
          <MonthGrid
            key={key}
            date={date}
            entries={groupedEntries}
            onEntryClick={onEntryClick}
          />
        ))}
      </div>
    );
  }
);

CalendarBody.displayName = "CalendarBody";
export default CalendarBody;

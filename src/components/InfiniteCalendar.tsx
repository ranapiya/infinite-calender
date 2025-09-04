"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format, parse } from "date-fns";
import { groupEntriesByDate, findCurrentMonthInView } from "@/lib/calendar";
import { journalEntries, JournalEntry } from "@/data";
import { useSwipeable } from "react-swipeable";

import CalendarHeader from "./CalendarHeader";
import CalendarBody from "./CalendarBody";
import EntrySheet from "./EntrySheet";

interface MonthData {
  date: Date;
  key: string;
}

export default function InfiniteCalendar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [months, setMonths] = useState<MonthData[]>([]);
  const [currentHeader, setCurrentHeader] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const groupedEntries = groupEntriesByDate(journalEntries);
  const sortedEntries = journalEntries.sort(
    (a, b) =>
      parse(a.date, "dd/MM/yyyy", new Date()).getTime() -
      parse(b.date, "dd/MM/yyyy", new Date()).getTime()
  );

  /** Load More Months */
  const loadMoreMonths = useCallback((direction: "up" | "down") => {
    setMonths((prevMonths) => {
      const newMonths: MonthData[] = [];
      if (direction === "down") {
        const lastMonth =
          prevMonths.length > 0
            ? prevMonths[prevMonths.length - 1].date
            : new Date(2025, 7, 1);
        for (let i = 1; i <= 3; i++) {
          const newDate = new Date(
            lastMonth.getFullYear(),
            lastMonth.getMonth() + i,
            1
          );
          newMonths.push({ date: newDate, key: format(newDate, "yyyy-MM") });
        }
        return [...prevMonths, ...newMonths];
      } else {
        const firstMonth =
          prevMonths.length > 0 ? prevMonths[0].date : new Date(2025, 7, 1);
        for (let i = 1; i <= 3; i++) {
          const newDate = new Date(
            firstMonth.getFullYear(),
            firstMonth.getMonth() - i,
            1
          );
          newMonths.push({ date: newDate, key: format(newDate, "yyyy-MM") });
        }
        return [...newMonths.reverse(), ...prevMonths];
      }
    });
  }, []);

  /** Entry Click Handler */
  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setActiveIndex(
      sortedEntries.findIndex(
        (e) => e.date === entry.date && e.description === entry.description
      )
    );
    setIsSheetOpen(true);
  };

  /** Navigate Between Entries */
  const navigateEntries = (direction: "prev" | "next") => {
    if (direction === "prev" && activeIndex > 0) {
      const prevIndex = activeIndex - 1;
      setSelectedEntry(sortedEntries[prevIndex]);
      setActiveIndex(prevIndex);
    } else if (direction === "next" && activeIndex < sortedEntries.length - 1) {
      const nextIndex = activeIndex + 1;
      setSelectedEntry(sortedEntries[nextIndex]);
      setActiveIndex(nextIndex);
    }
  };

  /** Swipe Support */
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigateEntries("next"),
    onSwipedRight: () => navigateEntries("prev"),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  /** Initial Months */
  useEffect(() => {
    const defaultDate = new Date(2025, 7, 1);
    const initialMonths: MonthData[] = [];
    for (let i = -1; i <= 1; i++) {
      const date = new Date(
        defaultDate.getFullYear(),
        defaultDate.getMonth() + i,
        1
      );
      initialMonths.push({ date, key: format(date, "yyyy-MM") });
    }
    setMonths(initialMonths);
  }, []);

  /** Observe current month */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(() => {
      const allMonths = Array.from(
        container.querySelectorAll(".month-grid")
      ) as HTMLDivElement[];
      const bestMatch = findCurrentMonthInView(allMonths);
      if (bestMatch.month && bestMatch.year) {
        setCurrentHeader(`${bestMatch.month} ${bestMatch.year}`);
      }
    }, { root: container, threshold: 0.5 });

    const monthElements = container.querySelectorAll(".month-grid");
    monthElements.forEach((el) => observer.observe(el));

    return () => {
      monthElements.forEach((el) => observer.unobserve(el));
    };
  }, [months]);

  /** Jump to Specific Date */
  const handleJumpToDate = (date: Date) => {
    if (!containerRef.current) return;
    setSelectedDate(date);

    const monthKey = format(date, "yyyy-MM");
    const monthExists = months.some((m) => m.key === monthKey);

    if (!monthExists) {
      const diff =
        (date.getFullYear() - months[0].date.getFullYear()) * 12 +
        (date.getMonth() - months[0].date.getMonth());

      if (diff > 0) {
        for (let i = 0; i <= Math.ceil(diff / 3); i++) loadMoreMonths("down");
      } else {
        for (let i = 0; i <= Math.ceil(Math.abs(diff) / 3); i++)
          loadMoreMonths("up");
      }
    }

    setTimeout(() => {
      const targetMonth = containerRef.current?.querySelector(
        `[data-month="${format(date, "MMMM")}"][data-year="${date.getFullYear()}"]`
      );
      targetMonth?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col h-screen w-full max-w-5xl">
        <CalendarHeader
          currentHeader={currentHeader}
          selectedDate={selectedDate}
          onJumpToDate={handleJumpToDate}
        />
        <CalendarBody
          ref={containerRef}
          months={months}
          groupedEntries={groupedEntries}
          onEntryClick={handleEntryClick}
          loadMoreMonths={loadMoreMonths}
        />
        <EntrySheet
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          selectedEntry={selectedEntry}
          navigateEntries={navigateEntries}
          activeIndex={activeIndex}
          totalEntries={sortedEntries.length}
          swipeHandlers={swipeHandlers}
        />
      </div>
    </div>
  );
}

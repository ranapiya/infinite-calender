"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format, parse } from "date-fns";
import { groupEntriesByDate, findCurrentMonthInView } from "@/lib/calendar";
import { journalEntries, JournalEntry } from "@/data";
import MonthGrid from "../components/MonthGrid";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {Sheet,SheetContent,SheetDescription,SheetTitle} from "@/components/ui/sheet";
import { useSwipeable } from "react-swipeable";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

  const loadMoreMonths = useCallback((direction: "up" | "down") => {
    setMonths((prevMonths) => {
      const newMonths: MonthData[] = [];
      if (direction === "down") {
        const lastMonth =
          prevMonths.length > 0
            ? prevMonths[prevMonths.length - 1].date
            : new Date(2025, 7, 1); // Start from August 2025
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
          prevMonths.length > 0 ? prevMonths[0].date : new Date(2025, 7, 1); // Start from August 2025
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

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setActiveIndex(
      sortedEntries.findIndex(
        (e) => e.date === entry.date && e.description === entry.description
      )
    );
    setIsSheetOpen(true);
  };

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

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigateEntries("next"),
    onSwipedRight: () => navigateEntries("prev"),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      () => {
        const allMonths = Array.from(
          container.querySelectorAll(".month-grid")
        ) as HTMLDivElement[];
        const bestMatch = findCurrentMonthInView(allMonths);
        if (bestMatch.month && bestMatch.year) {
          setCurrentHeader(`${bestMatch.month} ${bestMatch.year}`);
        }
      },
      {
        root: container,
        threshold: 0.5,
      }
    );

    const monthElements = container.querySelectorAll(".month-grid");
    monthElements.forEach((el) => observer.observe(el));

    return () => {
      monthElements.forEach((el) => observer.unobserve(el));
    };
  }, [months]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
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
  }, [loadMoreMonths]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);





   const handleJumpToDate = (date: Date) => {
    if (!containerRef.current) return;
    setSelectedDate(date);

    // Ensure that month is loaded
    const monthKey = format(date, "yyyy-MM");
    const monthExists = months.some((m) => m.key === monthKey);

    if (!monthExists) {
      // load months until we get it
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
      if (targetMonth) {
        targetMonth.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 200);
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col h-screen w-full max-w-5xl">
        <header className="flex items-center justify-between mt-20 p-3 rounded-3xl bg-gradient-to-bl from-cyan-300 to-emerald-300 shadow z-10">
          <span className="text-lg font-bold sm:text-xl">
            {currentHeader || format(new Date(), "MMMM yyyy")}
          </span>
          <div className="flex gap-2 items-center">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => date && handleJumpToDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Pick a date"
              className="px-2 py-1 rounded-md border text-sm"
            />
            <Button
              variant="secondary"
              onClick={() => handleJumpToDate(new Date())}
              className="text-sm"
            >
              Today
            </Button>
          </div>
        </header>

        <div
          ref={containerRef}
          className="flex-1 overflow-y-scroll mt-[56px] sm:mt-[64px] pb-4"
        >
          {months.map(({ date, key }) => (
            <MonthGrid
              key={key}
              date={date}
              entries={groupedEntries}
              onEntryClick={handleEntryClick}
            />
          ))}
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent
            side={undefined}
            className="flex flex-col p-4 w-[95%] sm:w-full max-w-sm sm:max-w-lg 
            mx-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            fixed rounded-xl shadow-lg"
          >
            {selectedEntry && (
              <div {...swipeHandlers} className="flex flex-col items-center">
                <Card className="w-full">
                  <CardHeader>
                    <div className="relative w-full h-40 sm:h-48 mb-4">
                      <Image
                        src={selectedEntry.imgUrl}
                        alt="Journal Entry"
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <SheetTitle className="text-base sm:text-lg">
                      {selectedEntry.date}
                    </SheetTitle>
                    <SheetDescription className="text-sm sm:text-base mt-1">
                      Rating: {"⭐".repeat(Math.round(selectedEntry.rating))} (
                      {selectedEntry.rating})
                    </SheetDescription>
                    <div className="mt-2 text-sm sm:text-base text-gray-600">
                      <span className="font-semibold">Categories:</span>{" "}
                      {selectedEntry.categories.join(", ")}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base">
                      {selectedEntry.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
            <div className="flex justify-between items-center mt-4 w-full">
              <Button
                variant="outline"
                onClick={() => navigateEntries("prev")}
                disabled={activeIndex === 0}
                className="text-sm sm:text-base"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" /> Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => navigateEntries("next")}
                disabled={activeIndex === sortedEntries.length - 1}
                className="text-sm sm:text-base"
              >
                Next <ArrowRight className="h-4 w-4 ml-1 sm:ml-2" />
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

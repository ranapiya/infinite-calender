// src/components/InfiniteCalendar.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { format, parse } from 'date-fns';
import { getMonthDetails, groupEntriesByDate, findCurrentMonthInView } from '@/lib/calendar';;
import { journalEntries, JournalEntry } from '@/data';
import MonthGrid from '../components/MonthGrid';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MonthData {
  date: Date;
  key: string;
}

export default function InfiniteCalendar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [months, setMonths] = useState<MonthData[]>([]);
  const [currentHeader, setCurrentHeader] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const groupedEntries = groupEntriesByDate(journalEntries);
  const sortedEntries = journalEntries.sort((a, b) => 
    parse(a.date, 'dd/MM/yyyy', new Date()).getTime() - 
    parse(b.date, 'dd/MM/yyyy', new Date()).getTime()
  );

  const loadMoreMonths = useCallback((direction: 'up' | 'down') => {
    setMonths(prevMonths => {
      let newMonths: MonthData[] = [];
      if (direction === 'down') {
        const lastMonth = prevMonths.length > 0 ? prevMonths[prevMonths.length - 1].date : new Date();
        for (let i = 1; i <= 3; i++) {
          const newDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + i, 1);
          newMonths.push({ date: newDate, key: format(newDate, 'yyyy-MM') });
        }
        return [...prevMonths, ...newMonths];
      } else {
        const firstMonth = prevMonths.length > 0 ? prevMonths[0].date : new Date();
        for (let i = 1; i <= 3; i++) {
          const newDate = new Date(firstMonth.getFullYear(), firstMonth.getMonth() - i, 1);
          newMonths.push({ date: newDate, key: format(newDate, 'yyyy-MM') });
        }
        return [...newMonths.reverse(), ...prevMonths];
      }
    });
  }, []);

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setActiveIndex(sortedEntries.findIndex(e => e.date === entry.date && e.description === entry.description));
    setIsSheetOpen(true);
  };

  const navigateEntries = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && activeIndex > 0) {
      const prevIndex = activeIndex - 1;
      setSelectedEntry(sortedEntries[prevIndex]);
      setActiveIndex(prevIndex);
    } else if (direction === 'next' && activeIndex < sortedEntries.length - 1) {
      const nextIndex = activeIndex + 1;
      setSelectedEntry(sortedEntries[nextIndex]);
      setActiveIndex(nextIndex);
    }
  };

  useEffect(() => {
    const today = new Date();
    const initialMonths: MonthData[] = [];
    for (let i = -1; i <= 1; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      initialMonths.push({ date, key: format(date, 'yyyy-MM') });
    }
    setMonths(initialMonths);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLDivElement;
            const month = el.dataset.month;
            const year = el.dataset.year;
            if (month && year) {
              setCurrentHeader(`${month} ${year}`);
            }
          }
        });
        
        // Find most visible month to update header
        const allMonths = Array.from(container.querySelectorAll('.month-grid')) as HTMLDivElement[];
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

    const monthElements = container.querySelectorAll('.month-grid');
    monthElements.forEach(el => observer.observe(el));

    // Cleanup observer on unmount
    return () => {
      monthElements.forEach(el => observer.unobserve(el));
    };
  }, [months]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Load more months at the bottom
    if (container.scrollHeight - container.scrollTop <= container.clientHeight + 200) {
      loadMoreMonths('down');
    }

    // Load more months at the top
    if (container.scrollTop <= 200) {
      loadMoreMonths('up');
    }
  }, [loadMoreMonths]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="fixed top-0 left-0 w-full bg-white shadow z-10 p-4 text-center text-xl font-bold">
        {currentHeader || format(new Date(), 'MMMM yyyy')}
      </header>
      <div ref={containerRef} className="flex-1 overflow-y-scroll mt-[64px] pb-4">
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
        <SheetContent className="flex flex-col p-4 sm:w-[540px] sm:max-w-none w-full" side="bottom">
          {selectedEntry && (
            <div className="flex flex-col items-center">
              <Card className="w-full max-w-lg mx-auto">
                <CardHeader>
                  <img
                    src={selectedEntry.imgUrl}
                    alt="Journal Entry"
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <SheetTitle>{selectedEntry.date}</SheetTitle>
                  <SheetDescription>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Rating:</span>
                      <span className="text-yellow-500">{'⭐'.repeat(Math.round(selectedEntry.rating))}</span>
                      <span className="ml-2 text-gray-500">({selectedEntry.rating})</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold">Categories:</span> {selectedEntry.categories.join(', ')}
                    </div>
                  </SheetDescription>
                </CardHeader>
                <CardContent>
                  <p>{selectedEntry.description}</p>
                </CardContent>
              </Card>
            </div>
          )}
          <div className="flex justify-between items-center mt-4 w-full max-w-lg mx-auto">
            <Button
              variant="outline"
              onClick={() => navigateEntries('prev')}
              disabled={activeIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateEntries('next')}
              disabled={activeIndex === sortedEntries.length - 1}
            >
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
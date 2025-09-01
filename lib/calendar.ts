

import { format, getDaysInMonth, startOfMonth, parse } from 'date-fns';
import { JournalEntry } from '@/data';

export const getMonthDetails = (date: Date) => {
  const start = startOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const startDayOfWeek = start.getDay(); 
  

  const monthArray: (Date | null)[] = [];

 
  for (let i = 0; i < startDayOfWeek; i++) {
    monthArray.push(null);
  }


  for (let i = 1; i <= daysInMonth; i++) {
    monthArray.push(new Date(date.getFullYear(), date.getMonth(), i));
  }

  const remainingSlots = 42 - monthArray.length; 

  for (let i = 1; i <= remainingSlots; i++) {
    monthArray.push(null);
  }

  return {
    monthName: format(date, 'MMMM'),
    year: format(date, 'yyyy'),
    days: monthArray,
  };
};

export const groupEntriesByDate = (entries: JournalEntry[]) => {
  const groupedEntries: { [key: string]: JournalEntry[] } = {};
  entries.forEach(entry => {
    const date = parse(entry.date, 'dd/MM/yyyy', new Date());
    const dateString = format(date, 'yyyy-MM-dd');
    if (!groupedEntries[dateString]) {
      groupedEntries[dateString] = [];
    }
    groupedEntries[dateString].push(entry);
  });
  return groupedEntries;
};

export const findCurrentMonthInView = (elements: HTMLDivElement[]) => {
  let bestMatch = { month: '', year: '', intersectionRatio: 0 };
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const intersectionTop = Math.max(0, rect.top);
    const intersectionBottom = Math.min(viewportHeight, rect.bottom);
    const intersectionHeight = intersectionBottom - intersectionTop;
    const intersectionRatio = intersectionHeight / rect.height;

    if (intersectionRatio > bestMatch.intersectionRatio) {
      bestMatch = {
        month: el.dataset.month || '',
        year: el.dataset.year || '',
        intersectionRatio
      };
    }
  });
  return bestMatch;
};
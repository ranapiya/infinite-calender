import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CalendarHeaderProps {
  currentHeader: string;
  selectedDate: Date | null;
  onJumpToDate: (date: Date) => void;
}

export default function CalendarHeader({
  currentHeader,
  selectedDate,
  onJumpToDate,
}: CalendarHeaderProps) {
  return (
    <header className="flex items-center justify-between mt-20 p-3 rounded-3xl bg-gradient-to-bl from-cyan-300 to-emerald-300 shadow z-10">
      <span className="text-lg font-bold sm:text-xl">
        {currentHeader || format(new Date(), "MMMM yyyy")}
      </span>
      <div className="flex gap-2 items-center">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => date && onJumpToDate(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Pick a date"
          className="px-2 py-1 rounded-md border text-sm"
        />
        <Button
          variant="secondary"
          onClick={() => onJumpToDate(new Date())}
          className="text-sm"
        >
          Today
        </Button>
      </div>
    </header>
  );
}

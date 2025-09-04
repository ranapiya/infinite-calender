import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import Image from "next/image";
import { JournalEntry } from "@/data";
import { SwipeableHandlers } from "react-swipeable";
interface EntrySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEntry: JournalEntry | null;
  navigateEntries: (direction: "prev" | "next") => void;
  activeIndex: number;
  totalEntries: number;
  swipeHandlers: SwipeableHandlers;
}

export default function EntrySheet({
  isOpen,
  onOpenChange,
  selectedEntry,
  navigateEntries,
  activeIndex,
  totalEntries,
  swipeHandlers,
}: EntrySheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
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
            disabled={activeIndex === totalEntries - 1}
            className="text-sm sm:text-base"
          >
            Next <ArrowRight className="h-4 w-4 ml-1 sm:ml-2" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

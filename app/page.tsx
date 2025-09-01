"use client";

import InfiniteCalendar from "@/src/components/InfiniteCalendar";

export default function HomePage() {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-white items-center justify-center tracking-wide ">
            📅 My Calendar
          </h1>
        </div>
      </header>

      {/* Calendar */}
      <main className="flex-1 overflow-hidden">
        <InfiniteCalendar />
      </main>
    </div>
  );
}

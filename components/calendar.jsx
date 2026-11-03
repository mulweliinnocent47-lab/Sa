
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const today = new Date();

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function changeMonth(direction) {
    setCurrentDate(new Date(year, month + direction, 1));
  }

  const dates = [];

  for (let i = 0; i < firstDay; i++) {
    dates.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    dates.push(day);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">

        <button
          onClick={() => changeMonth(-1)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ChevronLeft size={20} />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {monthName} {year}
        </h2>

        <button
          onClick={() => changeMonth(1)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ChevronRight size={20} />
        </button>

      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-2 text-center">

        {weekdays.map((day) => (
          <div
            key={day}
            className="py-2 text-xs font-semibold text-gray-500"
          >
            {day}
          </div>
        ))}

        {dates.map((day, index) => {
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          return (
            <div
              key={index}
              className={`
                flex aspect-square items-center justify-center
                rounded-lg text-sm
                ${day ? "text-gray-800 dark:text-gray-200" : ""}
                ${isToday
                  ? "bg-blue-600 font-bold text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"}
              `}
            >
              {day}
            </div>
          );
        })}

      </div>

    </div>
  );
}

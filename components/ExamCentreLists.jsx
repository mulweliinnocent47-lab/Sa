"use client";

// components/ExamCentreLists.jsx
import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, PlayCircle } from "lucide-react";
import { Badge, Card, PrimaryButton, SectionTitle } from "@/components/ui";

const FIRST = 3; // how many show at first
const STEP = 10; // how many each "Show more" adds
const LEVEL_TONE = { Mixed: "brand", Hard: "danger", Medium: "gold" };

function MoreControls({ shown, total, onMore, onLess }) {
  if (total <= FIRST) return null;
  const remaining = total - shown;
  const btn =
    "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted";
  return (
    <div className="mt-3 flex gap-2">
      {remaining > 0 && (
        <button type="button" onClick={onMore} className={btn}>
          <ChevronDown className="size-4" /> Show {Math.min(STEP, remaining)} more
          <span className="text-xs text-muted-foreground">({remaining} left)</span>
        </button>
      )}
      {shown > FIRST && (
        <button type="button" onClick={onLess} className={btn}>
          <ChevronUp className="size-4" /> Show less
        </button>
      )}
    </div>
  );
}

export function ExamCentreLists({ timetable = [], sessions = [] }) {
  const [tCount, setTCount] = useState(FIRST);
  const [sCount, setSCount] = useState(FIRST);

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">

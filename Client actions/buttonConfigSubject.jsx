"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Chip, ChipRow } from "@/components/ui";

const TABS = ["Overview", "Notes", "Papers"];
const GRADES = ["7", "8", "9", "10", "11", "12"];

export  function Button() {
  const router = useRouter();
  const current = useSearchParams().get("grade") ?? "10"; // default: Grade 10

  return (
    <ChipRow>
      
      {GRADES.map((g) => (
        <Chip key={g} active={current === g} onClick={() => router.push(`/subjects?grade=${g}`)}>
           Grade {g}
        </Chip>
      ))}
    </ChipRow>
  );
}

export  function Button2({prop,value}) {
  const router = useRouter();
  const current = useSearchParams().get("Overview") ?? "Overview"; // default: Grade 10

  return (
    <ChipRow>
      
      {TABS.map((g) => (
       <Chip key={g} active={current === g} onClick={() => router.push(`/subjects/${value}?grade=${prop}&tab=${g}`)}>
        {g}
       </Chip>
      ))}
    </ChipRow>
  );
}
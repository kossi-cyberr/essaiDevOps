"use client";

import type { TaskFilter } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ key: TaskFilter; label: string }> = [
  { key: "all", label: "Toutes" },
  { key: "active", label: "En cours" },
  { key: "completed", label: "Terminées" },
];

export default function TaskFilters({
  value,
  counts,
  onChange,
}: {
  value: TaskFilter;
  counts: Record<TaskFilter, number>;
  onChange: (filter: TaskFilter) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filtrer les tâches"
      className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1"
    >
      {FILTERS.map((filter) => {
        const active = value === filter.key;
        return (
          <button
            key={filter.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(filter.key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition",
              active
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {filter.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                active ? "bg-brand-50 text-brand-700" : "bg-slate-200/70 text-slate-500"
              )}
            >
              {counts[filter.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

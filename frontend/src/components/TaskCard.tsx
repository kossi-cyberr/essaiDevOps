"use client";

import type { Task } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";

interface TaskCardProps {
  task: Task;
  busy?: boolean;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskCard({ task, busy, onToggle, onEdit, onDelete }: TaskCardProps) {
  return (
    <li className="group flex animate-fade-in items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-card">
      {/* Case à cocher personnalisée */}
      <button
        type="button"
        onClick={() => onToggle(task)}
        disabled={busy}
        aria-pressed={task.completed}
        aria-label={task.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
          task.completed
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 bg-white text-transparent hover:border-brand-400"
        )}
      >
        {busy ? (
          <Spinner className="h-3.5 w-3.5 text-white" />
        ) : (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "break-words text-sm font-medium leading-relaxed",
            task.completed ? "text-slate-400 line-through" : "text-slate-900"
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-slate-500">
            {task.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>Créée le {formatDate(task.createdAt)}</span>
          {task.completed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
              Terminée
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={`Modifier « ${task.title} »`}
          title="Modifier"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" strokeLinecap="round" />
            <path
              d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
          aria-label={`Supprimer « ${task.title} »`}
          title="Supprimer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 11v5M14 11v5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </li>
  );
}

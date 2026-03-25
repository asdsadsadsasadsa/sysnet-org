"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import {
  EVENTS,
  EVENT_TYPES,
  TYPE_LABELS,
  TYPE_COLORS,
  type EventType,
} from "@/data/events";

function formatDateRange(start: string, end?: string): string {
  const startDate = new Date(start + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  if (!end) return startDate.toLocaleDateString("en-GB", opts);
  const endDate = new Date(end + "T00:00:00");
  if (start === end) return startDate.toLocaleDateString("en-GB", opts);
  const startFmt = startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${startFmt} – ${endDate.toLocaleDateString("en-GB", opts)}`;
}

export default function EventsPage() {
  const [typeFilter, setTypeFilter] = useState<EventType | "">("");

  const sorted = [...EVENTS].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const filtered = typeFilter
    ? sorted.filter((e) => e.type === typeFilter)
    : sorted;

  return (
    <div className="space-y-6">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow">Events</p>
          <h1 className="section-title mt-3">Upcoming events</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            Conferences, workshops, calls for papers, and chapter meetings relevant to systems engineers.
          </p>
        </div>
        <aside className="shell-card p-6">
          <p className="eyebrow">Event types</p>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {EVENT_TYPES.slice(1).map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(typeFilter === t.value ? "" : (t.value as EventType))}
                className={`rounded-lg border px-3 py-1.5 text-left text-xs font-medium transition-all ${
                  typeFilter === t.value
                    ? TYPE_COLORS[t.value as EventType] + " ring-1 ring-current"
                    : TYPE_COLORS[t.value as EventType]
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </aside>
      </section>

      <div className="shell-card p-4 flex flex-wrap gap-3 items-center">
        {EVENT_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value as EventType | "")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              typeFilter === t.value
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="text-xs soft-muted ml-auto shrink-0">
          {filtered.length} event{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="shell-card p-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">No events match this filter</h2>
          <p className="mt-2 text-sm soft-muted">
            Try a different type or{" "}
            <button
              onClick={() => setTypeFilter("")}
              className="text-blue-600 hover:underline"
            >
              view all events
            </button>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => (
            <div key={event.id} className="shell-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-block rounded-lg border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${TYPE_COLORS[event.type]}`}
                  >
                    {TYPE_LABELS[event.type]}
                  </span>
                  <span className="text-xs soft-muted">{event.organizer}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-700">
                    {formatDateRange(event.startDate, event.endDate)}
                  </div>
                  <div className="text-xs soft-muted">{event.location}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[15px] font-semibold text-slate-900 hover:text-blue-700 hover:underline leading-snug"
                  >
                    {event.title}
                  </a>
                  <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-2">
                    {event.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {event.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 rounded border border-slate-200"
                  >
                    {tag}
                  </span>
                ))}
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs font-medium text-blue-600 hover:underline shrink-0"
                >
                  View →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";

const GROUPS = [
  { slug: "mbse", name: "Model-Based Systems Engineering", description: "SysML, Capella, DOORS, and the transition from documents to models." },
  { slug: "aerospace", name: "Aerospace & Defense", description: "Safety-critical systems, DO-178C, and mission planning." },
  { slug: "embedded", name: "Embedded Systems", description: "Hardware/software integration, RTOS, and physical interfaces." },
  { slug: "medical", name: "Medical Devices", description: "Regulated environments, risk management, and ISO 13485." },
  { slug: "robotics", name: "Robotics & Autonomy", description: "Perception, planning, safety envelopes, and sensor fusion." }
];

export default function GroupsIndexPage() {
  return (
    <div className="space-y-6">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow">Working Groups</p>
          <h1 className="section-title mt-3">Domain Spaces</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            Specialized spaces for domain-specific patterns and discussions. Unlike the global feed, 
            these working groups focus on deep, contextual problem solving.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {GROUPS.map((g) => (
          <Link key={g.slug} href={`/g/${g.slug}`} className="shell-card p-6 block hover:border-blue-300 transition-colors">
            <h2 className="text-lg font-semibold text-slate-900">{g.name}</h2>
            <p className="mt-2 text-sm text-slate-600 leading-6">{g.description}</p>
            <div className="mt-4 text-sm font-medium text-blue-700">Enter space →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

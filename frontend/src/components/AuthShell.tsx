import Link from "next/link";
import type { ReactNode } from "react";

const features = [
  "Vos tâches, rien que les vôtres",
  "Suivi en temps réel de votre progression",
  "Filtres rapides : en cours et terminées",
];

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-slate-200 lg:grid-cols-2">
        {/* Panneau de présentation (masqué sur mobile) */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-10 text-white lg:flex">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sky-400/20 blur-2xl"
            aria-hidden="true"
          />

          <Link href="/" className="relative flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m4 12 5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-tight">Taskly</span>
          </Link>

          <div className="relative space-y-6">
            <h2 className="text-3xl font-semibold leading-tight">
              Moins de chaos.
              <br />
              Plus de choses accomplies.
            </h2>
            <ul className="space-y-3 text-sm text-brand-50/90">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-brand-100/70">
            Simple, rapide et sécurisé par JWT.
          </p>
        </aside>

        {/* Formulaire */}
        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mb-8 lg:hidden">
            <span className="inline-flex items-center gap-2 text-brand-700">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-brand-100">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m4 12 5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-lg font-semibold tracking-tight">Taskly</span>
            </span>
          </div>

          <header className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
          </header>

          {children}

          <footer className="mt-6 text-center text-sm text-slate-500">{footer}</footer>
        </section>
      </div>
    </main>
  );
}

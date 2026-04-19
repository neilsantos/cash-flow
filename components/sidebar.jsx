"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Users,
  Wallet,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/caixa-do-dia", label: "Caixa do dia", icon: Wallet },
  { href: "/pendentes", label: "Pendentes", icon: Clock3 },
  { href: "/clientes", label: "Clientes", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-3 z-20 mx-3 mt-3 rounded-lg border border-white/10 bg-emerald-950/95 p-3 text-white shadow-2xl shadow-emerald-950/15 backdrop-blur lg:fixed lg:inset-y-5 lg:left-5 lg:right-auto lg:top-5 lg:mx-0 lg:mt-0 lg:w-64 lg:p-4">
      <div className="flex items-center gap-3 px-2 py-2">
        <span className="grid size-10 place-items-center rounded-lg bg-emerald-300 text-emerald-950">
          <CircleDollarSign size={22} />
        </span>
        <div>
          <span className="block text-sm font-semibold">Admin Financeiro</span>
          <span className="block text-xs text-zinc-400">Cash Flow OS</span>
        </div>
      </div>

      <nav
        className="mt-4 grid grid-cols-4 gap-2 lg:grid-cols-1"
        aria-label="Menu principal"
      >
        {links.map((link) => {
          const Icon = link.icon;
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

          return (
            <Link
              className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition lg:justify-start ${
                active
                  ? "bg-white text-emerald-950 shadow-lg shadow-emerald-950/20"
                  : "text-zinc-400 hover:bg-white/8 hover:text-white"
              }`}
              href={link.href}
              key={link.href}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 hidden rounded-lg border border-white/10 bg-white/[0.04] p-4 lg:block">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
          <CalendarDays size={14} />
          Operacao ativa
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Caixa, clientes e indicadores em uma base simples para evoluir o admin.
        </p>
      </div>
    </aside>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBossStore } from "@/store/bossStore";

interface Modulo04ShellProps {
  children: ReactNode;
  nombre: string;
  nivelLabel: string;
}

const NAV_ITEMS = [
  { href: "/modulo04", label: "Campo Base", icon: "⚔️" },
  { href: "/modulo04/checkin", label: "Check-in", icon: "✓" },
  { href: "/modulo04/journal", label: "Journal", icon: "📖" },
  { href: "/modulo04/mapa", label: "Mapa", icon: "🗺" },
  { href: "/modulo04/perfil", label: "Perfil", icon: "👤" },
];

export default function Modulo04Shell({
  children,
  nombre,
  nivelLabel,
}: Modulo04ShellProps) {
  const pathname = usePathname();
  const streakDays = useBossStore((s) => s.streakDays);

  return (
    <div className="flex min-h-screen flex-col bg-[#0D0D14]">
      {/* Header fijo */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#2A2A3A] bg-[#0D0D14] px-5 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <span className="text-sm font-bold text-[#F0EDE8]">{nombre} </span>
            <span className="text-sm font-bold text-[#C9A84C]">Chronicles</span>
            <p className="text-xs text-[rgba(240,237,232,0.5)]">{nivelLabel}</p>
          </div>
          <div className="text-right">
            {streakDays > 0 && (
              <p className="text-xs font-bold text-[#C9A84C]">
                🔥 {streakDays} días
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Contenido con padding para header y tab bar */}
      <main className="flex-1 pb-20 pt-16">{children}</main>

      {/* Tab bar fijo */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#2A2A3A] bg-[#0D0D14]">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-1"
              >
                <span className="text-lg">{item.icon}</span>
                <span
                  className={`text-[10px] font-medium ${
                    isActive
                      ? "text-[#22D3EE]"
                      : "text-[rgba(240,237,232,0.4)]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

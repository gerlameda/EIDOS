"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useBossStore } from "@/store/bossStore";
import { saveProfileNombreAction } from "./actions";

interface Modulo04ShellProps {
  children: ReactNode;
  nombre: string;
  nivelLabel: string;
  needsNombre?: boolean;
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
  needsNombre = false,
}: Modulo04ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const streakDays = useBossStore((s) => s.streakDays);

  const [editing, setEditing] = useState(needsNombre);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Escribe al menos un nombre.");
      return;
    }
    startTransition(async () => {
      const res = await saveProfileNombreAction(trimmed);
      if (res.ok) {
        setError(null);
        setEditing(false);
        router.refresh();
      } else {
        setError(res.error ?? "No pudimos guardar.");
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0D0D14]">
      {/* Header fijo */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#2A2A3A] bg-[#0D0D14] px-5 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] uppercase tracking-wider text-[#22D3EE]">
                  Tu nombre de héroe
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                      if (e.key === "Escape" && !needsNombre) {
                        setEditing(false);
                        setError(null);
                      }
                    }}
                    autoFocus
                    placeholder="Escríbelo aquí"
                    disabled={pending}
                    className="w-full max-w-[10rem] rounded-md border border-[#2A2A3A] bg-[#14141C] px-2 py-1 text-sm text-[#F0EDE8] outline-none focus:border-[#22D3EE] disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={pending}
                    className="rounded-md bg-[#22D3EE] px-2 py-1 text-xs font-bold text-[#0D0D14] disabled:opacity-50"
                  >
                    {pending ? "…" : "✓"}
                  </button>
                  {!needsNombre && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setError(null);
                      }}
                      disabled={pending}
                      className="rounded-md border border-[#2A2A3A] px-2 py-1 text-xs text-[rgba(240,237,232,0.55)]"
                    >
                      ×
                    </button>
                  )}
                </div>
                {error && (
                  <p className="text-[10px] text-red-300">{error}</p>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setValue(needsNombre ? "" : nombre);
                  setEditing(true);
                }}
                className="group flex flex-col items-start text-left"
                title="Editar nombre"
              >
                <span className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-[#F0EDE8]">
                    {nombre}
                  </span>
                  <span className="text-sm font-bold text-[#C9A84C]">
                    Chronicles
                  </span>
                  <span className="text-[10px] text-[rgba(240,237,232,0.3)] opacity-0 transition group-hover:opacity-100">
                    ✎
                  </span>
                </span>
                <p className="text-xs text-[rgba(240,237,232,0.5)]">
                  {nivelLabel}
                </p>
              </button>
            )}
          </div>
          <div className="shrink-0 text-right">
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

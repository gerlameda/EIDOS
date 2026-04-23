"use client";
import { useState } from "react";
import { useSyncStatusStore } from "@/store/syncStatusStore";

export function SyncStatusBanner() {
  const lastError = useSyncStatusStore((s) => s.lastError);
  const isSyncing = useSyncStatusStore((s) => s.isSyncing);
  const retryLast = useSyncStatusStore((s) => s.retryLast);
  const clearError = useSyncStatusStore((s) => s.clearError);
  const [expanded, setExpanded] = useState(false);

  if (!lastError) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-lg border border-red-500/40 bg-[#1a0a0a]/95 p-3 shadow-xl shadow-red-900/30 backdrop-blur sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden
          className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-red-500/20 text-red-300"
        >
          !
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-200">
            No pudimos guardar tu progreso
          </p>
          <p className="mt-0.5 text-xs text-red-300/80">
            Tus respuestas están en este dispositivo pero no llegaron al
            servidor.
          </p>

          {expanded && (
            <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-words rounded bg-black/40 p-2 text-[10px] text-red-200/90">
              {lastError}
            </pre>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void retryLast()}
              disabled={isSyncing}
              className="rounded bg-red-500/30 px-2.5 py-1 text-xs font-medium text-red-100 transition hover:bg-red-500/40 disabled:opacity-50"
            >
              {isSyncing ? "Reintentando…" : "Reintentar"}
            </button>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded px-2 py-1 text-xs text-red-300/80 transition hover:text-red-100"
            >
              {expanded ? "Ocultar detalle" : "Ver detalle"}
            </button>
            <button
              type="button"
              onClick={clearError}
              className="ml-auto rounded px-2 py-1 text-xs text-red-300/60 transition hover:text-red-100"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

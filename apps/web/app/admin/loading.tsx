import React from 'react';

export default function AdminLoading() {
  return (
    <div className="w-full flex flex-col gap-6 animate-pulse select-none" aria-busy="true" aria-label="Memuat panel admin...">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-64 bg-border/60 rounded-lg" />
          <div className="h-4 w-96 bg-border/40 rounded-md" />
        </div>
        <div className="h-9 w-36 bg-border/50 rounded-lg shrink-0" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/70 bg-surface/80 flex flex-col gap-3">
            <div className="h-4 w-24 bg-border/50 rounded" />
            <div className="h-8 w-16 bg-border/70 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/70 bg-surface p-6 flex flex-col gap-4">
        <div className="h-5 w-48 bg-border/60 rounded" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full bg-surface-soft/60 border border-border/40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

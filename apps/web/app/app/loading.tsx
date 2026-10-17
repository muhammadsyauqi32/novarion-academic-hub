import React from 'react';

export default function AppLoading() {
  return (
    <div className="w-full flex flex-col gap-6 animate-pulse select-none" aria-busy="true" aria-label="Memuat konten...">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-56 bg-border/60 rounded-lg" />
          <div className="h-4 w-80 bg-border/40 rounded-md" />
        </div>
        <div className="h-9 w-32 bg-border/50 rounded-lg shrink-0" />
      </div>

      {/* Stats / Cards skeleton grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/70 bg-surface/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-border/50 rounded" />
              <div className="w-8 h-8 rounded-xl bg-border/40" />
            </div>
            <div className="h-8 w-20 bg-border/70 rounded-lg" />
            <div className="h-3 w-36 bg-border/40 rounded" />
          </div>
        ))}
      </div>

      {/* Main content block skeleton */}
      <div className="rounded-2xl border border-border/70 bg-surface p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="h-5 w-40 bg-border/60 rounded" />
          <div className="h-4 w-20 bg-border/40 rounded" />
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-soft/60 border border-border/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-border/50 shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-4 w-48 bg-border/60 rounded" />
                  <div className="h-3 w-32 bg-border/40 rounded" />
                </div>
              </div>
              <div className="h-8 w-16 bg-border/40 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

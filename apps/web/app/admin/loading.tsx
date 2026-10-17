import React from 'react';

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse motion-reduce:animate-none">
      {/* Title & Action Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-64 bg-surface-soft border border-border/60 rounded-lg" />
          <div className="h-4 w-96 max-w-full bg-surface-soft/60 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-32 bg-surface-soft border border-border/60 rounded-lg" />
          <div className="h-8 w-32 bg-surface-soft border border-border/60 rounded-lg" />
        </div>
      </div>

      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-between"
          >
            <div className="flex flex-col gap-2">
              <div className="h-3 w-24 bg-surface-soft rounded" />
              <div className="h-7 w-16 bg-surface-soft rounded-lg" />
              <div className="h-3 w-20 bg-surface-soft/60 rounded" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-soft border border-border/40" />
          </div>
        ))}
      </div>

      {/* 2 Big Content Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-4">
          <div className="h-5 w-48 bg-surface-soft rounded" />
          <div className="flex flex-col gap-3 pt-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-12 w-full bg-surface-soft/50 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-4">
          <div className="h-5 w-48 bg-surface-soft rounded" />
          <div className="h-28 w-full bg-surface-soft/40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

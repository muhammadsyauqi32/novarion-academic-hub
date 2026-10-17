import React from 'react';

export default function StudentAppLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse max-w-7xl mx-auto w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 sm:w-64 bg-border/60 rounded-lg" />
          <div className="h-4 w-36 sm:w-48 bg-border/40 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 bg-border/50 rounded-lg" />
          <div className="h-9 w-28 bg-border/50 rounded-lg" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-24 bg-surface rounded-card border border-border p-4 flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-border/40 rounded" />
            <div className="h-6 w-12 bg-border/60 rounded" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-border/30" />
        </div>
        <div className="h-24 bg-surface rounded-card border border-border p-4 flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-border/40 rounded" />
            <div className="h-6 w-12 bg-border/60 rounded" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-border/30" />
        </div>
        <div className="h-24 bg-surface rounded-card border border-border p-4 flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-border/40 rounded" />
            <div className="h-6 w-12 bg-border/60 rounded" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-border/30" />
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="h-5 w-40 bg-border/50 rounded" />
          <div className="h-28 bg-surface rounded-card border border-border p-4" />
          <div className="h-28 bg-surface rounded-card border border-border p-4" />
        </div>
        <div className="lg:col-span-5 space-y-4">
          <div className="h-5 w-32 bg-border/50 rounded" />
          <div className="h-64 bg-surface rounded-card border border-border p-4" />
        </div>
      </div>
    </div>
  );
}

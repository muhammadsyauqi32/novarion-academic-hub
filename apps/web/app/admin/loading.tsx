import React from 'react';

export default function AdminWorkspaceLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-56 bg-border/60 rounded-lg" />
          <div className="h-4 w-44 bg-border/40 rounded-md" />
        </div>
        <div className="h-9 w-32 bg-border/50 rounded-lg" />
      </div>

      <div className="h-96 bg-surface rounded-card border border-border p-6" />
    </div>
  );
}

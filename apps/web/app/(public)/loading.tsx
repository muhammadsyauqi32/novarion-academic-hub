import React from 'react';

export default function PublicLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-pulse motion-reduce:animate-none">
      <div className="flex flex-col items-center gap-4 max-w-xl w-full text-center">
        <div className="h-6 w-44 bg-surface-soft rounded-full" />
        <div className="h-12 w-80 max-w-full bg-surface-soft rounded-xl" />
        <div className="h-4 w-96 max-w-full bg-surface-soft/60 rounded-md" />
        <div className="flex gap-3 mt-4">
          <div className="h-10 w-36 bg-surface-soft rounded-xl" />
          <div className="h-10 w-36 bg-surface-soft rounded-xl" />
        </div>
      </div>
    </div>
  );
}

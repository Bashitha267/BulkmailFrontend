import React from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ className = 'w-4 h-4' }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function SkeletonBox({ className = 'h-4 w-full' }) {
  return <div className={`animate-pulse bg-gray-200/80 rounded-xl ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBox className="h-7 w-48" />
          <SkeletonBox className="h-3.5 w-36" />
        </div>
        <div className="flex gap-2">
          <SkeletonBox className="h-9 w-28 rounded-xl" />
          <SkeletonBox className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      <SkeletonBox className="h-20 w-full rounded-3xl" />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="bg-white border border-gray-100 rounded-3xl p-4 space-y-3">
            <SkeletonBox className="h-3.5 w-20" />
            <SkeletonBox className="h-7 w-16" />
            <SkeletonBox className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <SkeletonBox className="h-36 w-full rounded-3xl" />
          <SkeletonBox className="h-64 w-full rounded-3xl" />
        </div>
        <div className="lg:col-span-5 space-y-4">
          <SkeletonBox className="h-48 w-full rounded-3xl" />
          <SkeletonBox className="h-48 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBox className="h-7 w-40" />
          <SkeletonBox className="h-3.5 w-64" />
        </div>
        <div className="flex gap-2">
          <SkeletonBox className="h-9 w-24 rounded-xl" />
          <SkeletonBox className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3 flex-1">
              <SkeletonBox className="w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1 max-w-xs">
                <SkeletonBox className="h-3.5 w-32" />
                <SkeletonBox className="h-3 w-48" />
              </div>
            </div>
            <SkeletonBox className="h-6 w-20 rounded-lg hidden sm:block" />
            <SkeletonBox className="h-7 w-16 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

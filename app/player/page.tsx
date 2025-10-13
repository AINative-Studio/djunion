'use client';

import { Suspense } from 'react';
import PlayerContent from './player-content';

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}
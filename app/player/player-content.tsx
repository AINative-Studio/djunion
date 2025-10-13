'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const PlayerContentInner = dynamic(() => import('./player-content-inner'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
});

export default function PlayerContent() {
  return <PlayerContentInner />;
}
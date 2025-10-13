'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import AudioPlayer from '@/components/audio-player';

export default function PlayerParamsHandler() {
  const [isMounted, setIsMounted] = useState(false);
  const [urlParams, setUrlParams] = useState<{
    station?: string;
    trackTitle?: string;
    trackArtist?: string;
    brandColor?: string;
    listeners?: string;
    isLive?: boolean;
  }>({});
  
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsMounted(true);
    
    // Extract URL parameters only after mounting
    if (searchParams) {
      setUrlParams({
        station: searchParams.get('station') || undefined,
        trackTitle: searchParams.get('track') || undefined,
        trackArtist: searchParams.get('artist') || undefined,
        brandColor: searchParams.get('color') || undefined,
        listeners: searchParams.get('listeners') || undefined,
        isLive: searchParams.get('live') === 'true',
      });
    }
  }, [searchParams]);

  // Don't render the main content until mounted on client
  if (!isMounted) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Embeddable Audio Player</h1>
          <p className="text-gray-600">
            Loading player...
          </p>
        </div>
      </div>
    );
  }
  
  // Default values
  const stationName = urlParams.station || "Hot 97.5 FM";
  const currentTrack = {
    title: urlParams.trackTitle || "Blinding Lights",
    artist: urlParams.trackArtist || "The Weeknd",
    album: "After Hours"
  };
  const listenerCount = urlParams.listeners ? parseInt(urlParams.listeners) : 127;
  const color = urlParams.brandColor || "#00D084";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Embeddable Audio Player</h1>
        <p className="text-gray-600">
          This player can be embedded on any website using an iframe or script tag
        </p>
      </div>

      {/* Default Player */}
      <AudioPlayer 
        stationName={stationName}
        currentTrack={currentTrack}
        brandColor={color}
        listeners={listenerCount}
        isLive={urlParams.isLive}
      />

      {/* Custom Branded Player */}
      <AudioPlayer
        stationName="Indie Vibes Radio"
        currentTrack={{
          title: "Watermelon Sugar",
          artist: "Harry Styles",
          album: "Fine Line"
        }}
        brandColor="#8B5CF6"
        listeners={89}
        isLive={false}
      />

      {/* Minimal Player */}
      <AudioPlayer
        stationName="Classic Rock 101"
        currentTrack={{
          title: "Bohemian Rhapsody",
          artist: "Queen",
          album: "A Night at the Opera"
        }}
        brandColor="#EF4444"
        listeners={234}
        showChat={false}
        showCallIn={false}
      />

      <div className="text-center text-sm text-gray-600 max-w-md mx-auto">
        <p className="mb-2">
          <strong>Embed Code:</strong>
        </p>
        <code className="bg-gray-200 p-2 rounded text-xs block">
          {`<iframe src="https://djunion.com/player/embed?station=hot975" width="400" height="300"></iframe>`}
        </code>
      </div>
    </div>
  );
}
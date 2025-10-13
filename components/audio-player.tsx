'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  MessageCircle, 
  Phone,
  Radio,
  Users
} from 'lucide-react';

interface AudioPlayerProps {
  stationName?: string;
  currentTrack?: {
    title: string;
    artist: string;
    album?: string;
    cover?: string;
  };
  isLive?: boolean;
  listeners?: number;
  brandColor?: string;
  showControls?: boolean;
  showChat?: boolean;
  showCallIn?: boolean;
  autoplay?: boolean;
}

export default function AudioPlayer({
  stationName = "Hot 97.5 FM",
  currentTrack = {
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours"
  },
  isLive = true,
  listeners = 127,
  brandColor = "#00D084",
  showControls = true,
  showChat = true,
  showCallIn = true,
  autoplay = false
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control actual audio playback
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    setIsMuted(value[0] === 0);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 text-white"
        style={{ backgroundColor: brandColor }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="h-5 w-5" />
            <span className="font-semibold text-sm">{stationName}</span>
          </div>
          <div className="flex items-center space-x-2">
            {isLive && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
                🔴 LIVE
              </Badge>
            )}
            <div className="flex items-center space-x-1 text-xs">
              <Users className="h-3 w-3" />
              <span>{listeners}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        {/* Track Info */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
              {currentTrack.cover ? (
                <img 
                  src={currentTrack.cover} 
                  alt="Album cover" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Radio className="h-8 w-8 text-gray-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {currentTrack.title}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {currentTrack.artist}
              </p>
              {currentTrack.album && (
                <p className="text-xs text-gray-500 truncate">
                  {currentTrack.album}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
              className={`${isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="p-4 space-y-4">
            {/* Play/Pause and Volume */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMute}
                className="w-10 h-10 p-0"
              >
                {isMuted || volume[0] === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                size="lg"
                onClick={togglePlay}
                className="w-16 h-16 rounded-full"
                style={{ backgroundColor: brandColor }}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white ml-1" />
                )}
              </Button>

              <div className="flex items-center space-x-2 w-20">
                <Slider
                  value={isMuted ? [0] : volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-2">
              {showChat && (
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              )}
              {showCallIn && (
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Call In
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 pb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Powered by DJ Union
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
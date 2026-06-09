'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Radio, 
  Play, 
  Pause, 
  SkipForward, 
  Volume2,
  Users, 
  TrendingUp, 
  DollarSign,
  Upload,
  Calendar,
  Settings,
  BarChart3,
  Music,
  Mic,
  Globe,
  Zap,
  Clock,
  Heart,
  MessageCircle,
  Phone,
  Copy,
  Code,
  Eye,
  Palette,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
  Download,
  FileText,
  Server,
  CreditCard,
  Headphones,
  Folder,
  Tag,
  User,
  Mail,
  Shield,
  Database,
  ExternalLink
} from 'lucide-react';

type Show = {
  id: number;
  title: string;
  host: string;
  time: string;
  duration: string;
  type: string;
  date: string;
  status: string;
};

export default function DashboardPage() {
  const [isLive, setIsLive] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: "Blinding Lights",
    artist: "The Weeknd",
    duration: "3:20",
    progress: 45
  });
  const [listeners, setListeners] = useState(127);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);

  // Simulate real-time listener count updates
  useEffect(() => {
    const interval = setInterval(() => {
      setListeners(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: "Live Listeners",
      value: listeners,
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Monthly Revenue",
      value: "$1,247",
      change: "+23%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Total Plays",
      value: "8.2K",
      change: "+18%",
      icon: Play,
      color: "text-purple-600"
    },
    {
      title: "Engagement Rate",
      value: "84%",
      change: "+5%",
      icon: Heart,
      color: "text-red-600"
    }
  ];

  const recentTracks = [
    { id: 1, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", genre: "Pop", plays: 342, likes: 28, duration: "3:20" },
    { id: 2, title: "Watermelon Sugar", artist: "Harry Styles", album: "Fine Line", genre: "Pop", plays: 298, likes: 31, duration: "2:54" },
    { id: 3, title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", genre: "Pop", plays: 256, likes: 19, duration: "3:23" },
    { id: 4, title: "Good 4 U", artist: "Olivia Rodrigo", album: "SOUR", genre: "Pop Rock", plays: 221, likes: 23, duration: "2:58" },
    { id: 5, title: "Stay", artist: "The Kid LAROI", album: "F*CK LOVE 3", genre: "Hip Hop", plays: 189, likes: 15, duration: "2:21" }
  ];

  const scheduledShows = [
    { id: 1, title: "Morning Drive", host: "Sarah Johnson", time: "8:00 AM", duration: "2h", type: "Live", date: "2025-01-15", status: "scheduled" },
    { id: 2, title: "Lunch Break Hits", host: "Auto DJ", time: "12:00 PM", duration: "1h", type: "Playlist", date: "2025-01-15", status: "scheduled" },
    { id: 3, title: "Evening Mix", host: "Mike Chen", time: "6:00 PM", duration: "3h", type: "Live", date: "2025-01-15", status: "scheduled" },
    { id: 4, title: "Late Night Vibes", host: "Auto DJ", time: "11:00 PM", duration: "2h", type: "Playlist", date: "2025-01-15", status: "scheduled" }
  ];

  const revenueData = [
    { month: "Jan", ads: 1200, sponsorships: 800, premium: 400 },
    { month: "Feb", ads: 1400, sponsorships: 900, premium: 450 },
    { month: "Mar", ads: 1600, sponsorships: 1100, premium: 500 },
    { month: "Apr", ads: 1800, sponsorships: 1200, premium: 550 },
    { month: "May", ads: 2000, sponsorships: 1400, premium: 600 }
  ];

  const analyticsData = [
    { date: "Jan 1", listeners: 120, engagement: 85 },
    { date: "Jan 2", listeners: 135, engagement: 88 },
    { date: "Jan 3", listeners: 142, engagement: 90 },
    { date: "Jan 4", listeners: 158, engagement: 92 },
    { date: "Jan 5", listeners: 167, engagement: 89 }
  ];

  const handleShowAction = (action: string, show: Show | null = null) => {
    setModalType(action);
    setSelectedShow(show);
    setShowModal(true);
  };

  const handleSubmitLogs = () => {
    alert('Logs submitted successfully! Your track logs have been sent to the rights organizations.');
  };

  const handleGenerateReport = () => {
    alert('Report generated! Your monthly analytics report is being prepared and will be emailed to you shortly.');
  };

  const handleUploadMusic = () => {
    alert('Music upload initiated! Please select your audio files to upload to your library.');
  };

  const handlePayoutSettings = () => {
    alert('Payout settings updated! Your payment preferences have been saved.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Radio className="h-8 w-8 text-[#00D084]" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">DJ Union</h1>
                <p className="text-sm text-gray-600">Hot 97.5 FM</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={`${isLive ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500'}`}>
                {isLive ? '🔴 LIVE' : '⚫ OFFLINE'}
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="live" className="flex items-center space-x-2">
              <Radio className="h-4 w-4" />
              <span>Live</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center space-x-2">
              <Music className="h-4 w-4" />
              <span>Library</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="monetization" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="publishing" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Publishing</span>
            </TabsTrigger>
            <TabsTrigger value="agent" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>AI Agent</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Live Dashboard */}
          <TabsContent value="live" className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change} from last month
                        </p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Controls */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mic className="h-5 w-5 text-[#00D084]" />
                      <span>Live Broadcasting</span>
                    </CardTitle>
                    <CardDescription>Control your live stream and track playback</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Go Live Button */}
                    <div className="text-center">
                      <Button
                        size="lg"
                        className={`w-full h-16 text-lg font-semibold ${
                          isLive 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-[#00D084] hover:bg-[#00B070] text-white'
                        }`}
                        onClick={() => setIsLive(!isLive)}
                      >
                        {isLive ? (
                          <>
                            <Pause className="h-6 w-6 mr-2" />
                            End Broadcast
                          </>
                        ) : (
                          <>
                            <Play className="h-6 w-6 mr-2" />
                            Go Live
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Current Track */}
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{currentTrack.title}</h3>
                            <p className="text-gray-600">{currentTrack.artist}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{currentTrack.duration}</p>
                          </div>
                        </div>
                        <Progress value={currentTrack.progress} className="mb-3" />
                        <div className="flex justify-center space-x-4">
                          <Button variant="outline" size="sm">
                            <SkipForward className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stream Health */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Stream Health</p>
                        <p className="text-lg font-semibold text-green-600">Excellent</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Bitrate</p>
                        <p className="text-lg font-semibold text-blue-600">128 kbps</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Uptime</p>
                        <p className="text-lg font-semibold text-purple-600">2h 34m</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Recent Tracks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Tracks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentTracks.slice(0, 4).map((track, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {track.title}
                            </p>
                            <p className="text-xs text-gray-600 truncate">{track.artist}</p>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{track.plays}</span>
                            <Heart className="h-3 w-3" />
                            <span>{track.likes}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Shows */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Today's Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scheduledShows.map((show, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{show.title}</p>
                            <p className="text-xs text-gray-600">{show.time} • {show.duration}</p>
                          </div>
                          <Badge variant={show.type === 'Live' ? 'default' : 'secondary'}>
                            {show.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Music Library */}
          <TabsContent value="library" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Music Library</h2>
              <div className="flex space-x-4">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-[#00D084] hover:bg-[#00B070]" onClick={handleUploadMusic}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Music
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Library Stats */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Library Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">247</p>
                    <p className="text-sm text-gray-600">Total Tracks</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">3.2GB</p>
                    <p className="text-sm text-gray-600">Storage Used</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">12</p>
                    <p className="text-sm text-gray-600">Playlists</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">8</p>
                    <p className="text-sm text-gray-600">Genres</p>
                  </div>
                </CardContent>
              </Card>

              {/* Music Library Content */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Your Music Collection</CardTitle>
                    <div className="flex space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search tracks..." className="pl-10 w-64" />
                      </div>
                      <select className="border border-gray-300 rounded-md px-3 py-2">
                        <option>All Genres</option>
                        <option>Pop</option>
                        <option>Rock</option>
                        <option>Hip Hop</option>
                        <option>Electronic</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTracks.map((track) => (
                      <div key={track.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Music className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{track.title}</p>
                            <p className="text-sm text-gray-600">{track.artist} • {track.album}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">{track.genre}</Badge>
                              <span className="text-xs text-gray-500">{track.duration}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{track.plays} plays</p>
                            <p className="text-xs text-gray-600">{track.likes} likes</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedule */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Broadcasting Schedule</h2>
              <Button className="bg-[#00D084] hover:bg-[#00B070]" onClick={() => handleShowAction('add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Show
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar View */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                  <CardDescription>Click on any show to view details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center font-medium text-gray-600 p-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i - 6;
                      const isToday = day === 15;
                      const hasShow = [15, 16, 17].includes(day);
                      
                      return (
                        <div 
                          key={i} 
                          className={`p-2 text-center border rounded cursor-pointer hover:bg-gray-50 ${
                            isToday ? 'bg-[#00D084] text-white' : ''
                          } ${day < 1 || day > 31 ? 'text-gray-300' : ''}`}
                          onClick={() => hasShow && handleShowAction('view', scheduledShows[0])}
                        >
                          {day > 0 && day <= 31 ? day : ''}
                          {hasShow && (
                            <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mt-1"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Show List */}
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Shows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scheduledShows.map((show) => (
                      <div key={show.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{show.title}</h4>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleShowAction('edit', show)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleShowAction('delete', show)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{show.host}</p>
                        <p className="text-sm text-gray-600">{show.time} • {show.duration}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant={show.type === 'Live' ? 'default' : 'secondary'}>
                            {show.type}
                          </Badge>
                          <Badge className={`${show.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {show.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue & Monetization */}
          <TabsContent value="monetization" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Revenue & Monetization</h2>
              <div className="flex space-x-4">
                <Button variant="outline" onClick={handlePayoutSettings}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payout Settings
                </Button>
                <Button variant="outline" onClick={handleGenerateReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">$1,247</p>
                    <p className="text-sm text-gray-600">+23% from last month</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ad Impressions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">45.2K</p>
                    <p className="text-sm text-gray-600">Average CPM: $4.25</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Payout</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">$847</p>
                    <p className="text-sm text-gray-600">Available Dec 1st</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue breakdown by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 text-center">
                          <p className="font-medium">{month.month}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex space-x-4">
                            <div className="text-center">
                              <p className="text-sm font-medium text-blue-600">${month.ads}</p>
                              <p className="text-xs text-gray-600">Ads</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-green-600">${month.sponsorships}</p>
                              <p className="text-xs text-gray-600">Sponsors</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-purple-600">${month.premium}</p>
                              <p className="text-xs text-gray-600">Premium</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">${month.ads + month.sponsorships + month.premium}</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <div className="flex space-x-4">
                <select className="border border-gray-300 rounded-md px-3 py-2">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                  <option>Last year</option>
                </select>
                <Button variant="outline" onClick={handleGenerateReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Listeners</p>
                      <p className="text-2xl font-bold text-gray-900">12,847</p>
                      <p className="text-sm text-green-600">+18% vs last period</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                      <p className="text-2xl font-bold text-gray-900">24m 32s</p>
                      <p className="text-sm text-green-600">+12% vs last period</p>
                    </div>
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Peak Listeners</p>
                      <p className="text-2xl font-bold text-gray-900">1,234</p>
                      <p className="text-sm text-green-600">+8% vs last period</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Engagement</p>
                      <p className="text-2xl font-bold text-gray-900">89.2%</p>
                      <p className="text-sm text-green-600">+5% vs last period</p>
                    </div>
                    <Heart className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Listener Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Listener Trends</CardTitle>
                <CardDescription>Daily listener count and engagement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-20">
                          <p className="font-medium">{day.date}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="text-sm font-medium">{day.listeners} listeners</p>
                              <Progress value={(day.listeners / 200) * 100} className="w-32 h-2" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{day.engagement}% engagement</p>
                              <Progress value={day.engagement} className="w-32 h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Countries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { country: "United States", listeners: 5234, percentage: 41 },
                      { country: "Canada", listeners: 2156, percentage: 17 },
                      { country: "United Kingdom", listeners: 1876, percentage: 15 },
                      { country: "Australia", listeners: 1234, percentage: 10 },
                      { country: "Germany", listeners: 987, percentage: 8 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{item.country}</span>
                            <span className="text-sm text-gray-600">{item.listeners}</span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Listening Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { device: "Mobile", percentage: 65, color: "bg-blue-500" },
                      { device: "Desktop", percentage: 25, color: "bg-green-500" },
                      { device: "Tablet", percentage: 7, color: "bg-purple-500" },
                      { device: "Smart Speaker", percentage: 3, color: "bg-orange-500" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm font-medium">{item.device}</span>
                        </div>
                        <span className="text-sm text-gray-600">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Publishing */}
          <TabsContent value="publishing" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Publishing & Reporting</h2>
              <Button className="bg-[#00D084] hover:bg-[#00B070]" onClick={handleSubmitLogs}>
                <FileText className="h-4 w-4 mr-2" />
                Submit Logs
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Track Logs */}
              <Card>
                <CardHeader>
                  <CardTitle>Track Logs</CardTitle>
                  <CardDescription>Automatically generated play logs for rights reporting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">January 2025 Logs</p>
                          <p className="text-sm text-gray-600">247 tracks logged</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Ready</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {recentTracks.slice(0, 3).map((track, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{track.title}</p>
                            <p className="text-xs text-gray-600">{track.artist} • Played {track.plays} times</p>
                          </div>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rights Organizations */}
              <Card>
                <CardHeader>
                  <CardTitle>Rights Organizations</CardTitle>
                  <CardDescription>Connected performance rights organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "ASCAP", status: "Connected", lastSync: "2 hours ago" },
                      { name: "BMI", status: "Connected", lastSync: "2 hours ago" },
                      { name: "SESAC", status: "Connected", lastSync: "2 hours ago" },
                      { name: "SoundExchange", status: "Pending", lastSync: "Never" }
                    ].map((org, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-sm text-gray-600">Last sync: {org.lastSync}</p>
                        </div>
                        <Badge className={`${
                          org.status === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {org.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Your station's compliance with broadcasting regulations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-900">Music Licensing</p>
                    <p className="text-sm text-green-700">Fully Compliant</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-900">Content Guidelines</p>
                    <p className="text-sm text-green-700">Fully Compliant</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-900">Reporting</p>
                    <p className="text-sm text-green-700">Up to Date</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Agent */}
          <TabsContent value="agent" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">AI Voice Agent</h2>
              <Button className="bg-[#00D084] hover:bg-[#00B070]">
                <Zap className="h-4 w-4 mr-2" />
                Configure Agent
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Status</CardTitle>
                  <CardDescription>Your AI voice assistant is active</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Voice Agent Active</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Calls Handled Today</span>
                      <span className="font-medium">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Response Time</span>
                      <span className="font-medium">1.2s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Satisfaction Rate</span>
                      <span className="font-medium">94%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Interactions</CardTitle>
                  <CardDescription>Latest AI agent conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Song Request</p>
                        <p className="text-xs text-gray-600">"Can you play some Taylor Swift?"</p>
                        <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                      <MessageCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">WhatsApp Message</p>
                        <p className="text-xs text-gray-600">"What's the name of that last song?"</p>
                        <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Phone className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Call-in Show</p>
                        <p className="text-xs text-gray-600">"I love your morning show!"</p>
                        <p className="text-xs text-gray-500 mt-1">12 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Agent Configuration</CardTitle>
                <CardDescription>Customize your AI voice assistant settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Voice Settings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Voice Type</span>
                        <Badge variant="outline">Professional Male</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Speech Speed</span>
                        <Badge variant="outline">Normal</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Language</span>
                        <Badge variant="outline">English (US)</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Capabilities</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Song Requests</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">WhatsApp Integration</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Call Screening</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Station Settings</h2>
              <Button className="bg-[#00D084] hover:bg-[#00B070]">
                <Settings className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* General Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="stationName">Station Name</Label>
                    <Input id="stationName" defaultValue="Hot 97.5 FM" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" defaultValue="The hottest hits and latest music" />
                  </div>
                  <div>
                    <Label htmlFor="genre">Primary Genre</Label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>Pop</option>
                      <option>Rock</option>
                      <option>Hip Hop</option>
                      <option>Electronic</option>
                      <option>Country</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Streaming Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Streaming</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bitrate">Audio Bitrate</Label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>128 kbps</option>
                      <option>192 kbps</option>
                      <option>256 kbps</option>
                      <option>320 kbps</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="format">Audio Format</Label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>MP3</option>
                      <option>AAC</option>
                      <option>OGG</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="maxListeners">Max Listeners</Label>
                    <Input id="maxListeners" type="number" defaultValue="1000" />
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="user@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>UTC-8 (Pacific)</option>
                      <option>UTC-5 (Eastern)</option>
                      <option>UTC+0 (GMT)</option>
                      <option>UTC+1 (CET)</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notifications" defaultChecked />
                    <Label htmlFor="notifications">Email notifications</Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bring Your Own Server */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-[#00D084]" />
                  <span>Bring Your Own Server</span>
                </CardTitle>
                <CardDescription>
                  Connect your own streaming server or purchase managed services from DJ Union
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Custom Server Configuration */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Custom Server Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="serverUrl">Server URL</Label>
                        <Input 
                          id="serverUrl" 
                          placeholder="stream.yourserver.com" 
                          defaultValue=""
                        />
                      </div>
                      <div>
                        <Label htmlFor="serverPort">Port</Label>
                        <Input 
                          id="serverPort" 
                          type="number" 
                          placeholder="8000" 
                          defaultValue=""
                        />
                      </div>
                      <div>
                        <Label htmlFor="mountPoint">Mount Point</Label>
                        <Input 
                          id="mountPoint" 
                          placeholder="/live" 
                          defaultValue=""
                        />
                      </div>
                      <div>
                        <Label htmlFor="serverPassword">Server Password</Label>
                        <Input 
                          id="serverPassword" 
                          type="password" 
                          placeholder="Enter server password"
                        />
                      </div>
                      <Button variant="outline" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Test Connection
                      </Button>
                    </div>
                  </div>

                  {/* Managed Services */}
                  <div className="space-y-4">
                    <h4 className="font-medium">DJ Union Managed Services</h4>
                    <div className="space-y-3">
                      <Card className="p-4 border-2 border-[#00D084]">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium">Shoutcast Server</h5>
                            <p className="text-sm text-gray-600">Managed MP3 streaming server</p>
                          </div>
                          <Badge className="bg-[#00D084] text-white">Recommended</Badge>
                        </div>
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span>Max Listeners:</span>
                            <span>1,000</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Bitrate:</span>
                            <span>Up to 320 kbps</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Uptime SLA:</span>
                            <span>99.9%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">$29/month</span>
                          <Button size="sm" className="bg-[#00D084] hover:bg-[#00B070]">
                            Purchase
                          </Button>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium">Icecast Server</h5>
                            <p className="text-sm text-gray-600">Open source streaming server</p>
                          </div>
                        </div>
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span>Max Listeners:</span>
                            <span>500</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Formats:</span>
                            <span>MP3, OGG, AAC</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Uptime SLA:</span>
                            <span>99.5%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">$19/month</span>
                          <Button size="sm" variant="outline">
                            Purchase
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Current Server Status */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Current Server Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Server Type</p>
                      <p className="font-medium">DJ Union Managed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-600">Online</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Uptime</p>
                      <p className="font-medium">99.9%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-[#00D084]" />
                  <span>Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Password & Authentication</h4>
                    <Button variant="outline" className="w-full">
                      Change Password
                    </Button>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="twoFactor" />
                      <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">API Access</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">API Key</span>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Show
                        </Button>
                      </div>
                      <Button variant="outline" className="w-full">
                        Generate New API Key
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal for Show Management */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                {modalType === 'add' && 'Add New Show'}
                {modalType === 'edit' && 'Edit Show'}
                {modalType === 'view' && 'Show Details'}
                {modalType === 'delete' && 'Delete Show'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modalType === 'delete' ? (
                <div className="space-y-4">
                  <p>Are you sure you want to delete "{selectedShow?.title}"?</p>
                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setShowModal(false)}>
                      Cancel
                    </Button>
                    <Button 
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => {
                        alert('Show deleted successfully!');
                        setShowModal(false);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ) : modalType === 'view' ? (
                <div className="space-y-4">
                  <div>
                    <Label>Show Title</Label>
                    <p className="font-medium">{selectedShow?.title}</p>
                  </div>
                  <div>
                    <Label>Host</Label>
                    <p className="font-medium">{selectedShow?.host}</p>
                  </div>
                  <div>
                    <Label>Time & Duration</Label>
                    <p className="font-medium">{selectedShow?.time} • {selectedShow?.duration}</p>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Badge variant={selectedShow?.type === 'Live' ? 'default' : 'secondary'}>
                      {selectedShow?.type}
                    </Badge>
                  </div>
                  <Button onClick={() => setShowModal(false)}>
                    Close
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="showTitle">Show Title</Label>
                    <Input 
                      id="showTitle" 
                      defaultValue={modalType === 'edit' ? selectedShow?.title : ''} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="showHost">Host</Label>
                    <Input 
                      id="showHost" 
                      defaultValue={modalType === 'edit' ? selectedShow?.host : ''} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="showTime">Time</Label>
                    <Input 
                      id="showTime" 
                      type="time" 
                      defaultValue={modalType === 'edit' ? '08:00' : ''} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="showDuration">Duration (hours)</Label>
                    <Input 
                      id="showDuration" 
                      type="number" 
                      defaultValue={modalType === 'edit' ? '2' : ''} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="showType">Type</Label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>Live</option>
                      <option>Playlist</option>
                    </select>
                  </div>
                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setShowModal(false)}>
                      Cancel
                    </Button>
                    <Button 
                      className="bg-[#00D084] hover:bg-[#00B070]"
                      onClick={() => {
                        alert(`Show ${modalType === 'add' ? 'added' : 'updated'} successfully!`);
                        setShowModal(false);
                      }}
                    >
                      {modalType === 'add' ? 'Add Show' : 'Update Show'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
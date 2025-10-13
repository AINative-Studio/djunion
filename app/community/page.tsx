import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Radio, 
  Users, 
  MessageCircle, 
  Heart, 
  Star,
  Calendar,
  Clock,
  TrendingUp,
  Zap,
  Music,
  Mic,
  ArrowRight,
  ExternalLink,
  Pin,
  Eye,
  ThumbsUp
} from 'lucide-react';

const communityStats = [
  { label: "Active Members", value: "12,847", icon: Users },
  { label: "Discussions", value: "3,421", icon: MessageCircle },
  { label: "Solutions Shared", value: "8,932", icon: Heart },
  { label: "Expert Contributors", value: "156", icon: Star }
];

const featuredDiscussions = [
  {
    title: "Best practices for growing your listener base in 2025",
    author: "Sarah Johnson",
    avatar: "SJ",
    category: "Growth",
    replies: 23,
    likes: 45,
    views: 892,
    lastActivity: "2 hours ago",
    isPinned: true,
    tags: ["audience-growth", "marketing", "tips"]
  },
  {
    title: "AI Voice Agent setup - Complete walkthrough",
    author: "Mike Chen",
    avatar: "MC",
    category: "AI Agents",
    replies: 18,
    likes: 67,
    views: 1234,
    lastActivity: "4 hours ago",
    isPinned: true,
    tags: ["ai-agents", "setup", "tutorial"]
  },
  {
    title: "Monetization strategies that actually work",
    author: "Lisa Rodriguez",
    avatar: "LR",
    category: "Monetization",
    replies: 31,
    likes: 89,
    views: 1567,
    lastActivity: "6 hours ago",
    isPinned: false,
    tags: ["monetization", "revenue", "ads"]
  }
];

const recentDiscussions = [
  {
    title: "How to fix audio quality issues during live streams?",
    author: "David Wilson",
    avatar: "DW",
    category: "Technical",
    replies: 7,
    likes: 12,
    views: 234,
    lastActivity: "1 hour ago",
    tags: ["audio", "streaming", "troubleshooting"]
  },
  {
    title: "Best music licensing options for small stations",
    author: "Emma Thompson",
    avatar: "ET",
    category: "Legal",
    replies: 15,
    likes: 28,
    views: 456,
    lastActivity: "3 hours ago",
    tags: ["licensing", "music", "legal"]
  },
  {
    title: "Analytics dashboard not updating - anyone else?",
    author: "Alex Kim",
    avatar: "AK",
    category: "Support",
    replies: 4,
    likes: 8,
    views: 123,
    lastActivity: "5 hours ago",
    tags: ["analytics", "bug", "support"]
  },
  {
    title: "Successful podcast to radio transition stories",
    author: "Jordan Martinez",
    avatar: "JM",
    category: "Stories",
    replies: 22,
    likes: 34,
    views: 678,
    lastActivity: "8 hours ago",
    tags: ["podcast", "transition", "success-stories"]
  },
  {
    title: "WhatsApp integration with AI agents - tips needed",
    author: "Taylor Brown",
    avatar: "TB",
    category: "AI Agents",
    replies: 9,
    likes: 19,
    views: 345,
    lastActivity: "12 hours ago",
    tags: ["whatsapp", "ai-agents", "integration"]
  }
];

const categories = [
  { name: "Getting Started", count: 234, icon: Mic, color: "bg-blue-100 text-blue-800" },
  { name: "Technical Support", count: 189, icon: Zap, color: "bg-yellow-100 text-yellow-800" },
  { name: "Growth & Marketing", count: 156, icon: TrendingUp, color: "bg-green-100 text-green-800" },
  { name: "AI Agents", count: 143, icon: Zap, color: "bg-purple-100 text-purple-800" },
  { name: "Monetization", count: 98, icon: TrendingUp, color: "bg-orange-100 text-orange-800" },
  { name: "Music & Content", count: 87, icon: Music, color: "bg-pink-100 text-pink-800" },
  { name: "Success Stories", count: 76, icon: Star, color: "bg-indigo-100 text-indigo-800" },
  { name: "Feature Requests", count: 54, icon: Heart, color: "bg-red-100 text-red-800" }
];

const topContributors = [
  { name: "Sarah Johnson", avatar: "SJ", posts: 127, reputation: 2840, badge: "Expert" },
  { name: "Mike Chen", avatar: "MC", posts: 98, reputation: 2156, badge: "Mentor" },
  { name: "Lisa Rodriguez", avatar: "LR", posts: 89, reputation: 1987, badge: "Helper" },
  { name: "David Wilson", avatar: "DW", posts: 76, reputation: 1654, badge: "Contributor" },
  { name: "Emma Thompson", avatar: "ET", posts: 65, reputation: 1432, badge: "Rising Star" }
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Radio className="h-8 w-8 text-[#00D084]" />
              <span className="text-xl font-bold text-gray-900">DJ Union</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">Documentation</Link>
              <Link href="/support" className="text-gray-600 hover:text-gray-900 transition-colors">Support</Link>
              <Link href="/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-[#00D084] hover:bg-[#00B070]">Join Community</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-[#00D084]/10 text-[#00D084] border-[#00D084]/20">
            🎙️ Join 12K+ Broadcasters
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            DJ Union
            <span className="block text-[#00D084]">Community</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with fellow broadcasters, share knowledge, get help, and grow together in the world's largest radio community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-[#00D084] hover:bg-[#00B070] text-white px-8 py-4">
                Join the Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-4">
              <MessageCircle className="mr-2 h-5 w-5" />
              Browse Discussions
            </Button>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg">
                  <CardContent className="p-6">
                    <IconComponent className="h-8 w-8 text-[#00D084] mx-auto mb-4" />
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <p className="text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category, index) => {
                    const IconComponent = category.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-4 w-4 text-[#00D084]" />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <Badge className={category.color}>
                          {category.count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Contributors</CardTitle>
                <CardDescription>Most helpful community members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topContributors.map((contributor, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#00D084] text-white text-xs">
                          {contributor.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {contributor.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{contributor.posts} posts</span>
                          <span>•</span>
                          <span>{contributor.reputation} rep</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {contributor.badge}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card className="bg-gradient-to-r from-[#00D084] to-[#00B070] text-white border-0">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Community Guidelines</h3>
                <p className="text-green-100 text-sm mb-4">
                  Help us maintain a welcoming and helpful environment for everyone.
                </p>
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  Read Guidelines
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Featured Discussions */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Featured Discussions</h2>
                <Button className="bg-[#00D084] hover:bg-[#00B070]">
                  Start Discussion
                </Button>
              </div>
              <div className="space-y-4">
                {featuredDiscussions.map((discussion, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[#00D084] text-white">
                            {discussion.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {discussion.isPinned && (
                              <Pin className="h-4 w-4 text-[#00D084]" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {discussion.category}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {discussion.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {discussion.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span>by {discussion.author}</span>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{discussion.replies} replies</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{discussion.likes} likes</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{discussion.views} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{discussion.lastActivity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Discussions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Discussions</h2>
              <div className="space-y-4">
                {recentDiscussions.map((discussion, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                            {discussion.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {discussion.category}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-2">
                            {discussion.title}
                          </h3>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {discussion.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>by {discussion.author}</span>
                            <span>{discussion.replies} replies</span>
                            <span>{discussion.likes} likes</span>
                            <span>{discussion.views} views</span>
                            <span>{discussion.lastActivity}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline" size="lg">
                Load More Discussions
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#00D084] to-[#00B070]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Join the Conversation?</h2>
          <p className="text-xl text-green-100 mb-8">
            Connect with thousands of broadcasters, share your knowledge, and grow your radio station together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-[#00D084] hover:bg-gray-100 px-8 py-4">
                Join Community Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-4">
              Browse Discussions
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Radio className="h-8 w-8 text-[#00D084]" />
                <span className="text-xl font-bold">DJ Union</span>
              </div>
              <p className="text-gray-400">
                Building the future of radio broadcasting together.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#discussions" className="hover:text-white transition-colors">Discussions</Link></li>
                <li><Link href="#categories" className="hover:text-white transition-colors">Categories</Link></li>
                <li><Link href="#contributors" className="hover:text-white transition-colors">Top Contributors</Link></li>
                <li><Link href="#guidelines" className="hover:text-white transition-colors">Guidelines</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/developers" className="hover:text-white transition-colors">Developers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 DJ Union. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
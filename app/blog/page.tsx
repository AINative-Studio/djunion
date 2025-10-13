import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Radio, 
  Calendar, 
  User, 
  Clock, 
  Search,
  TrendingUp,
  Zap,
  Music,
  DollarSign,
  BarChart3,
  Mic,
  ArrowRight,
  Eye
} from 'lucide-react';

const featuredPost = {
  title: "The Future of Radio: How AI Voice Agents Are Revolutionizing Broadcasting",
  excerpt: "Discover how artificial intelligence is transforming the radio industry, from automated DJ assistants to personalized listener experiences.",
  author: "Sarah Johnson",
  date: "January 15, 2025",
  readTime: "8 min read",
  category: "AI & Technology",
  image: "https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg?auto=compress&cs=tinysrgb&w=800",
  featured: true
};

const blogPosts = [
  {
    title: "10 Tips for Growing Your Radio Station Audience in 2025",
    excerpt: "Proven strategies to attract and retain listeners in today's competitive audio landscape.",
    author: "Mike Chen",
    date: "January 12, 2025",
    readTime: "6 min read",
    category: "Growth",
    views: "2.1K",
    image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    title: "Maximizing Revenue: A Complete Guide to Radio Monetization",
    excerpt: "Learn how to turn your passion for broadcasting into a profitable business with our comprehensive monetization guide.",
    author: "Lisa Rodriguez",
    date: "January 10, 2025",
    readTime: "12 min read",
    category: "Monetization",
    views: "1.8K",
    image: "https://images.pexels.com/photos/3483098/pexels-photo-3483098.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    title: "The Science of Audio Quality: Getting Professional Sound",
    excerpt: "Technical deep-dive into audio encoding, bitrates, and streaming quality optimization.",
    author: "David Wilson",
    date: "January 8, 2025",
    readTime: "10 min read",
    category: "Technical",
    views: "1.5K",
    image: "https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    title: "Building Community: Engaging Your Radio Audience",
    excerpt: "Strategies for creating loyal listener communities and fostering meaningful connections.",
    author: "Emma Thompson",
    date: "January 5, 2025",
    readTime: "7 min read",
    category: "Community",
    views: "1.3K",
    image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    title: "Analytics That Matter: Understanding Your Radio Metrics",
    excerpt: "Learn which metrics actually drive growth and how to interpret your station's performance data.",
    author: "Alex Kim",
    date: "January 3, 2025",
    readTime: "9 min read",
    category: "Analytics",
    views: "1.1K",
    image: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    title: "From Bedroom to Broadcast: Starting Your First Radio Show",
    excerpt: "A beginner's guide to launching your radio career, from equipment setup to going live.",
    author: "Jordan Martinez",
    date: "December 30, 2024",
    readTime: "11 min read",
    category: "Getting Started",
    views: "2.5K",
    image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400"
  }
];

const categories = [
  { name: "All Posts", count: 47, icon: Radio },
  { name: "AI & Technology", count: 12, icon: Zap },
  { name: "Growth", count: 8, icon: TrendingUp },
  { name: "Monetization", count: 6, icon: DollarSign },
  { name: "Technical", count: 9, icon: BarChart3 },
  { name: "Community", count: 5, icon: Music },
  { name: "Getting Started", count: 7, icon: Mic }
];

const popularTags = [
  "streaming", "ai-agents", "monetization", "analytics", "audio-quality", 
  "audience-growth", "podcasting", "live-radio", "music-licensing", "automation"
];

export default function BlogPage() {
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
                <Button size="sm" className="bg-[#00D084] hover:bg-[#00B070]">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-[#00D084]/10 text-[#00D084] border-[#00D084]/20">
            📝 Broadcasting Insights & Tips
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            DJ Union
            <span className="block text-[#00D084]">Blog</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Stay up-to-date with the latest trends, tips, and insights from the world of radio broadcasting and audio technology.
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search articles..."
                className="pl-10 py-3 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category, index) => {
                    const IconComponent = category.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-4 w-4 text-[#00D084]" />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {category.count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs cursor-pointer hover:bg-[#00D084] hover:text-white">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <Card className="bg-gradient-to-r from-[#00D084] to-[#00B070] text-white border-0">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Stay Updated</h3>
                <p className="text-green-100 text-sm mb-4">
                  Get the latest broadcasting tips and industry insights delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <Input 
                    placeholder="Your email address" 
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
                  />
                  <Button className="w-full bg-white text-[#00D084] hover:bg-gray-100">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Featured Post */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <Badge className="mb-4 bg-[#00D084]/10 text-[#00D084]">
                    Featured
                  </Badge>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{featuredPost.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                  <Button className="bg-[#00D084] hover:bg-[#00B070]">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Posts */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {blogPosts.map((post, index) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Eye className="h-3 w-3" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-3 leading-tight">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{post.author}</span>
                          <span>•</span>
                          <span>{post.date}</span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="p-0 h-auto text-[#00D084]">
                          Read more
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline" size="lg">
                Load More Articles
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#00D084] to-[#00B070]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your Radio Journey?</h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of broadcasters who are already building their audience with DJ Union.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-[#00D084] hover:bg-gray-100 px-8 py-4">
                Start Broadcasting Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-4">
                Read Documentation
              </Button>
            </Link>
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
                Insights and tips for the future of broadcasting.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Blog</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#latest" className="hover:text-white transition-colors">Latest Posts</Link></li>
                <li><Link href="#categories" className="hover:text-white transition-colors">Categories</Link></li>
                <li><Link href="#authors" className="hover:text-white transition-colors">Authors</Link></li>
                <li><Link href="#newsletter" className="hover:text-white transition-colors">Newsletter</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
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
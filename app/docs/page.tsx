import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  Book, 
  Code, 
  Zap, 
  ArrowRight,
  ExternalLink,
  Download,
  Play,
  Settings,
  Webhook,
  BarChart3,
  Music,
  DollarSign
} from 'lucide-react';

const sections = [
  {
    title: "Getting Started",
    description: "Everything you need to start broadcasting",
    icon: Play,
    articles: [
      { title: "Quick Start Guide", description: "Get your station live in 5 minutes", time: "5 min read" },
      { title: "Setting Up Your First Stream", description: "Step-by-step streaming setup", time: "10 min read" },
      { title: "Uploading Music", description: "Build your music library", time: "7 min read" },
      { title: "Going Live", description: "Start your first broadcast", time: "3 min read" }
    ]
  },
  {
    title: "Broadcasting",
    description: "Master the art of radio broadcasting",
    icon: Radio,
    articles: [
      { title: "Live Streaming Best Practices", description: "Tips for professional broadcasts", time: "12 min read" },
      { title: "Playlist Management", description: "Organize and schedule your music", time: "8 min read" },
      { title: "Audio Quality Settings", description: "Optimize your stream quality", time: "6 min read" },
      { title: "Scheduling Shows", description: "Automate your broadcasting", time: "9 min read" }
    ]
  },
  {
    title: "Monetization",
    description: "Turn your passion into profit",
    icon: DollarSign,
    articles: [
      { title: "Ad Network Setup", description: "Start earning with ads", time: "5 min read" },
      { title: "Sponsored Content", description: "Work with sponsors", time: "10 min read" },
      { title: "Revenue Analytics", description: "Track your earnings", time: "7 min read" },
      { title: "Payout Settings", description: "Configure payments", time: "4 min read" }
    ]
  },
  {
    title: "AI Voice Agents",
    description: "Leverage AI for better engagement",
    icon: Zap,
    articles: [
      { title: "Agent Configuration", description: "Set up your AI assistant", time: "8 min read" },
      { title: "Voice Customization", description: "Personalize your agent's voice", time: "6 min read" },
      { title: "Call-in Management", description: "Handle listener calls with AI", time: "10 min read" },
      { title: "WhatsApp Integration", description: "Connect with listeners", time: "7 min read" }
    ]
  },
  {
    title: "Analytics",
    description: "Understand your audience",
    icon: BarChart3,
    articles: [
      { title: "Listener Analytics", description: "Track your audience growth", time: "9 min read" },
      { title: "Geographic Insights", description: "See where listeners tune in", time: "6 min read" },
      { title: "Engagement Metrics", description: "Measure listener interaction", time: "8 min read" },
      { title: "Custom Reports", description: "Create detailed reports", time: "11 min read" }
    ]
  },
  {
    title: "Developer API",
    description: "Build with DJ Union APIs",
    icon: Code,
    articles: [
      { title: "API Authentication", description: "Secure your API access", time: "5 min read" },
      { title: "Streaming Endpoints", description: "Access live stream data", time: "12 min read" },
      { title: "Webhook Events", description: "Real-time notifications", time: "8 min read" },
      { title: "Rate Limits", description: "Understand API limits", time: "4 min read" }
    ]
  }
];

const popularArticles = [
  { title: "How to Go Live in 5 Minutes", category: "Getting Started", views: "12.5K" },
  { title: "Maximizing Ad Revenue", category: "Monetization", views: "8.2K" },
  { title: "Setting Up AI Voice Agents", category: "AI Agents", views: "6.7K" },
  { title: "Understanding Analytics", category: "Analytics", views: "5.9K" },
  { title: "API Quick Start", category: "Developer", views: "4.3K" }
];

export default function DocsPage() {
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
              <Link href="/developers" className="text-gray-600 hover:text-gray-900 transition-colors">Developers</Link>
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
            📚 Comprehensive Documentation
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            DJ Union
            <span className="block text-[#00D084]">Documentation</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Everything you need to master radio broadcasting, from getting started to advanced features and API integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#getting-started">
              <Button size="lg" className="bg-[#00D084] hover:bg-[#00B070] text-white px-8 py-4">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/developers">
              <Button variant="outline" size="lg" className="px-8 py-4">
                <Code className="mr-2 h-5 w-5" />
                API Docs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Articles</h2>
            <p className="text-lg text-gray-600">Most viewed guides and tutorials</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularArticles.map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {article.category}
                    </Badge>
                    <span className="text-xs text-gray-500">{article.views} views</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-[#00D084]">
                    Read article
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600">Find exactly what you're looking for</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <Card key={index} className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#00D084]/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-[#00D084]" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {section.articles.map((article, articleIndex) => (
                        <div key={articleIndex} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{article.title}</h4>
                            <p className="text-sm text-gray-600">{article.description}</p>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{article.time}</span>
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Quick Access</h2>
            <p className="text-xl text-gray-600">Jump to commonly needed resources</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Download className="h-8 w-8 text-[#00D084] mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Download Center</h3>
                <p className="text-sm text-gray-600 mb-4">Get apps, plugins, and tools</p>
                <Button variant="outline" size="sm">
                  Browse Downloads
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Settings className="h-8 w-8 text-[#00D084] mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Setup Guides</h3>
                <p className="text-sm text-gray-600 mb-4">Step-by-step configuration</p>
                <Button variant="outline" size="sm">
                  View Guides
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Webhook className="h-8 w-8 text-[#00D084] mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Integrations</h3>
                <p className="text-sm text-gray-600 mb-4">Connect with other services</p>
                <Button variant="outline" size="sm">
                  See Integrations
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Book className="h-8 w-8 text-[#00D084] mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Tutorials</h3>
                <p className="text-sm text-gray-600 mb-4">Learn with step-by-step guides</p>
                <Button variant="outline" size="sm">
                  View Tutorials
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#00D084] to-[#00B070]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Still Need Help?</h2>
          <p className="text-xl text-green-100 mb-8">
            Can't find what you're looking for? Our support team is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/support">
              <Button size="lg" className="bg-white text-[#00D084] hover:bg-gray-100 px-8 py-4">
                Contact Support
              </Button>
            </Link>
            <Link href="/community">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-4">
                Join Community
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
                The future of radio broadcasting documentation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Documentation</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#getting-started" className="hover:text-white transition-colors">Getting Started</Link></li>
                <li><Link href="#broadcasting" className="hover:text-white transition-colors">Broadcasting</Link></li>
                <li><Link href="#monetization" className="hover:text-white transition-colors">Monetization</Link></li>
                <li><Link href="#api" className="hover:text-white transition-colors">API Reference</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
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
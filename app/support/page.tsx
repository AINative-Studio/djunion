import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  Search,
  Book,
  Users,
  Zap,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const supportOptions = [
  {
    title: "Live Chat",
    description: "Get instant help from our support team",
    icon: MessageCircle,
    availability: "24/7",
    responseTime: "< 2 minutes",
    badge: "Fastest",
    badgeColor: "bg-green-100 text-green-800"
  },
  {
    title: "Email Support",
    description: "Send us a detailed message",
    icon: Mail,
    availability: "24/7",
    responseTime: "< 4 hours",
    badge: "Most Popular",
    badgeColor: "bg-blue-100 text-blue-800"
  },
  {
    title: "Phone Support",
    description: "Talk directly with our experts",
    icon: Phone,
    availability: "Business Hours",
    responseTime: "Immediate",
    badge: "Business+",
    badgeColor: "bg-purple-100 text-purple-800"
  },
  {
    title: "Community Forum",
    description: "Get help from other broadcasters",
    icon: Users,
    availability: "24/7",
    responseTime: "Varies",
    badge: "Free",
    badgeColor: "bg-gray-100 text-gray-800"
  }
];

const commonIssues = [
  {
    title: "Stream Won't Start",
    description: "Troubleshoot streaming connection issues",
    icon: AlertCircle,
    category: "Streaming",
    views: "2.1K"
  },
  {
    title: "Audio Quality Problems",
    description: "Fix poor audio quality and dropouts",
    icon: Radio,
    category: "Audio",
    views: "1.8K"
  },
  {
    title: "Payment Issues",
    description: "Resolve billing and payment problems",
    icon: CheckCircle,
    category: "Billing",
    views: "1.5K"
  },
  {
    title: "AI Agent Not Responding",
    description: "Fix AI voice agent configuration",
    icon: Zap,
    category: "AI Agents",
    views: "1.2K"
  },
  {
    title: "Upload Failures",
    description: "Solve music upload problems",
    icon: HelpCircle,
    category: "Library",
    views: "980"
  },
  {
    title: "Analytics Not Updating",
    description: "Fix missing or delayed analytics data",
    icon: Info,
    category: "Analytics",
    views: "756"
  }
];

const statusItems = [
  { service: "Streaming Infrastructure", status: "Operational", color: "text-green-600" },
  { service: "AI Voice Agents", status: "Operational", color: "text-green-600" },
  { service: "Analytics API", status: "Operational", color: "text-green-600" },
  { service: "File Upload Service", status: "Operational", color: "text-green-600" },
  { service: "Payment Processing", status: "Operational", color: "text-green-600" }
];

export default function SupportPage() {
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
              <Link href="/community" className="text-gray-600 hover:text-gray-900 transition-colors">Community</Link>
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
            🎧 24/7 Support Available
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            We're Here to
            <span className="block text-[#00D084]">Help You Succeed</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get the support you need to build and grow your radio station. Our expert team is available 24/7 to help you succeed.
          </p>
          
          {/* Quick Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for help articles..."
                className="pl-10 py-3 text-lg"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#00D084] hover:bg-[#00B070] text-white px-8 py-4">
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Live Chat
            </Button>
            <Link href="#contact">
              <Button variant="outline" size="lg" className="px-8 py-4">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* System Status */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">System Status</h2>
            <p className="text-lg text-gray-600">All systems operational</p>
          </div>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                {statusItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="font-medium text-gray-900">{item.service}</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${item.color}`} />
                      <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t text-center">
                <Button variant="outline" size="sm">
                  View Status Page
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Support Channel</h2>
            <p className="text-xl text-gray-600">Multiple ways to get the help you need</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-[#00D084]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-[#00D084]" />
                    </div>
                    <div className="flex justify-center mb-2">
                      <Badge className={option.badgeColor}>
                        {option.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{option.availability}</span>
                      </div>
                      <p className="text-sm text-gray-600">Response: {option.responseTime}</p>
                    </div>
                    <Button className="w-full bg-[#00D084] hover:bg-[#00B070]">
                      Get Help
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Common Issues */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Common Issues</h2>
            <p className="text-xl text-gray-600">Quick solutions to frequent problems</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commonIssues.map((issue, index) => {
              const IconComponent = issue.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-[#00D084]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-[#00D084]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {issue.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{issue.views} views</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{issue.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                        <Button variant="ghost" size="sm" className="p-0 h-auto text-[#00D084]">
                          View solution
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
            <p className="text-xl text-gray-600">Can't find what you're looking for? We're here to help.</p>
          </div>
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your full name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Brief description of your issue" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>Select a category</option>
                    <option>Streaming Issues</option>
                    <option>Audio Quality</option>
                    <option>Billing & Payments</option>
                    <option>AI Voice Agents</option>
                    <option>API & Development</option>
                    <option>Account Management</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    rows={6}
                    placeholder="Please describe your issue in detail. Include any error messages, steps you've tried, and your account information if relevant."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="urgent" className="rounded" />
                  <Label htmlFor="urgent" className="text-sm">This is urgent (Business+ plans only)</Label>
                </div>
                <Button className="w-full bg-[#00D084] hover:bg-[#00B070] py-3">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Additional Resources</h2>
            <p className="text-xl text-gray-600">More ways to get help and stay informed</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Book className="h-12 w-12 text-[#00D084] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Documentation</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive guides and tutorials for all features
                </p>
                <Link href="/docs">
                  <Button variant="outline">
                    Browse Docs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-[#00D084] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Community Forum</h3>
                <p className="text-gray-600 mb-4">
                  Connect with other broadcasters and share knowledge
                </p>
                <Link href="/community">
                  <Button variant="outline">
                    Join Community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-[#00D084] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Webinars</h3>
                <p className="text-gray-600 mb-4">
                  Live training sessions and Q&A with experts
                </p>
                <Button variant="outline">
                  View Schedule
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
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
                24/7 support for your broadcasting success.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">System Status</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/webinars" className="hover:text-white transition-colors">Webinars</Link></li>
                <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
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
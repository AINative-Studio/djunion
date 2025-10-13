import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Radio, 
  Zap, 
  Globe, 
  DollarSign,
  ArrowRight,
  CheckCircle,
  Star,
  ExternalLink,
  Book,
  Download,
  Webhook,
  Building,
  Headphones,
  BarChart3,
  Music
} from 'lucide-react';

const features = [
  {
    icon: Radio,
    title: "Streaming API",
    description: "Real-time audio streaming with WebRTC and HLS support. Get listener counts, track metadata, and stream health in real-time."
  },
  {
    icon: Zap,
    title: "AI Voice Agents",
    description: "Integrate intelligent voice assistants into your applications. Handle call-ins, announcements, and automated interactions."
  },
  {
    icon: BarChart3,
    title: "Analytics API",
    description: "Access detailed listener analytics, geographic data, engagement metrics, and revenue insights programmatically."
  },
  {
    icon: DollarSign,
    title: "Monetization Tools",
    description: "Integrate advertising, sponsorships, and premium content with automated revenue optimization and reporting."
  },
  {
    icon: Webhook,
    title: "Real-time Events",
    description: "Subscribe to webhooks for track changes, listener events, stream status, and AI agent interactions."
  },
  {
    icon: Globe,
    title: "Global CDN",
    description: "Leverage our worldwide content delivery network for low-latency streaming and optimal user experience."
  }
];

const useCases = [
  {
    title: "Radio Station Apps",
    description: "Build mobile and web apps for your radio station with live streaming, chat, and listener engagement.",
    icon: Radio,
    examples: ["Mobile radio apps", "Web players", "Smart speaker skills"]
  },
  {
    title: "Podcast Platforms",
    description: "Create podcast hosting platforms with live streaming capabilities and audience interaction.",
    icon: Headphones,
    examples: ["Podcast hosting", "Live shows", "Audience Q&A"]
  },
  {
    title: "Music Discovery",
    description: "Build music discovery apps that integrate with live radio streams and AI-powered recommendations.",
    icon: Music,
    examples: ["Music discovery", "Playlist generation", "Social listening"]
  },
  {
    title: "Business Solutions",
    description: "Integrate background music, announcements, and audio branding into business applications.",
    icon: Building,
    examples: ["Retail audio", "Office music", "Event streaming"]
  }
];

const testimonials = [
  {
    name: "Alex Chen",
    role: "CTO, StreamTech",
    content: "DJ Union's API allowed us to build our radio app in weeks instead of months. The documentation is excellent.",
    rating: 5,
    company: "StreamTech"
  },
  {
    name: "Maria Rodriguez",
    role: "Lead Developer, AudioFlow",
    content: "The real-time events and analytics APIs are game-changers. We've built features we never thought possible.",
    rating: 5,
    company: "AudioFlow"
  },
  {
    name: "David Kim",
    role: "Founder, RadioNext",
    content: "Integrating DJ Union's AI voice agents transformed our user experience. Our engagement is up 300%.",
    rating: 5,
    company: "RadioNext"
  }
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$0",
    period: "month",
    description: "Perfect for testing and small projects",
    features: [
      "1,000 API calls/month",
      "Basic streaming endpoints",
      "Community support",
      "Rate limit: 10 req/min"
    ],
    popular: false,
    cta: "Start Building"
  },
  {
    name: "Developer",
    price: "$49",
    period: "month",
    description: "For growing applications",
    features: [
      "50,000 API calls/month",
      "All streaming & analytics APIs",
      "Webhook support",
      "Email support",
      "Rate limit: 100 req/min",
      "Custom branding"
    ],
    popular: true,
    cta: "Start Free Trial"
  },
  {
    name: "Business",
    price: "$199",
    period: "month",
    description: "For production applications",
    features: [
      "500,000 API calls/month",
      "AI voice agent APIs",
      "Priority support",
      "SLA guarantees",
      "Rate limit: 1000 req/min",
      "White-label options"
    ],
    popular: false,
    cta: "Contact Sales"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale deployments",
    features: [
      "Unlimited API calls",
      "Dedicated infrastructure",
      "24/7 phone support",
      "Custom integrations",
      "On-premise options",
      "Training & onboarding"
    ],
    popular: false,
    cta: "Contact Sales"
  }
];

export default function DevelopersPage() {
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
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">API Features</Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
              <Link href="#docs" className="text-gray-600 hover:text-gray-900 transition-colors">Documentation</Link>
              <Link href="/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-[#00D084] hover:bg-[#00B070]">Join Developer Program</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-[#00D084]/10 text-[#00D084] border-[#00D084]/20 hover:bg-[#00D084]/20">
            🚀 Now with AI Voice Agent APIs
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Build the Future of
            <span className="block text-[#00D084]">Audio Experiences</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Powerful APIs for live streaming, AI voice agents, and real-time audio analytics. 
            Build radio apps, podcast platforms, and audio experiences that scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="bg-[#00D084] hover:bg-[#00B070] text-white px-8 py-4 text-lg">
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#docs">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                <Book className="mr-2 h-5 w-5" />
                View Documentation
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-[#00D084] mr-2" />
              Free tier available
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-[#00D084] mr-2" />
              RESTful & WebSocket APIs
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-[#00D084] mr-2" />
              99.9% uptime SLA
            </div>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Get Started in Minutes</h2>
            <p className="text-xl text-gray-300">Simple, powerful APIs that just work</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Stream Live Audio</h3>
              <p className="text-gray-300 mb-6">
                Get real-time stream data, listener counts, and track information with just a few lines of code.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-[#00D084]" />
                  <span>Real-time WebSocket connections</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-[#00D084]" />
                  <span>Global CDN with low latency</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-[#00D084]" />
                  <span>Automatic failover and scaling</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm">
              <div className="text-green-400 mb-2">// Get live stream data</div>
              <div className="text-blue-400">const</div> <span className="text-white">response</span> <span className="text-gray-400">=</span> <span className="text-blue-400">await</span> <span className="text-yellow-400">fetch</span><span className="text-white">(</span>
              <div className="ml-4 text-green-300">'https://api.djunion.com/v1/streams/live'</div><span className="text-white">,</span>
              <div className="ml-4 text-white">{`{`}</div>
              <div className="ml-8 text-blue-400">headers</div><span className="text-white">:</span> <span className="text-white">{`{`}</span>
              <div className="ml-12 text-green-300">'Authorization'</div><span className="text-white">:</span> <span className="text-green-300">'Bearer YOUR_API_KEY'</span>
              <div className="ml-8 text-white">{`}`}</div>
              <div className="ml-4 text-white">{`}`}</div>
              <span className="text-white">);</span>
              <div className="mt-2 text-blue-400">const</div> <span className="text-white">data</span> <span className="text-gray-400">=</span> <span className="text-blue-400">await</span> <span className="text-white">response.json();</span>
              <div className="mt-2 text-gray-400">// {`{ listeners: 1247, currentTrack: {...} }`}</div>
            </div>
          </div>
        </div>
      </section>

      {/* API Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful APIs for Every Use Case</h2>
            <p className="text-xl text-gray-600">Everything you need to build amazing audio experiences</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="w-12 h-12 bg-[#00D084]/10 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-[#00D084]" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Every Audio Application</h2>
            <p className="text-xl text-gray-600">See what developers are building with DJ Union APIs</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <Card key={index} className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#00D084]/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-[#00D084]" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{useCase.title}</CardTitle>
                        <CardDescription>{useCase.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {useCase.examples.map((example, exampleIndex) => (
                        <Badge key={exampleIndex} variant="outline" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Developers Worldwide</h2>
            <p className="text-xl text-gray-600">Join thousands of developers building with DJ Union</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <p className="text-sm text-[#00D084] font-medium">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Developer-Friendly Pricing</h2>
            <p className="text-xl text-gray-600">Start free, scale as you grow</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${tier.popular ? 'ring-2 ring-[#00D084] transform scale-105' : ''}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#00D084] text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    {tier.period && <span className="text-gray-600">/{tier.period}</span>}
                  </div>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-[#00D084] mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${tier.popular ? 'bg-[#00D084] hover:bg-[#00B070] text-white' : ''}`}
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Preview */}
      <section id="docs" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Documentation</h2>
            <p className="text-xl text-gray-600">Everything you need to get started and scale</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5 text-[#00D084]" />
                  <span>Quick Start Guide</span>
                </CardTitle>
                <CardDescription>
                  Get up and running with DJ Union APIs in under 10 minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Start Tutorial
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-[#00D084]" />
                  <span>API Reference</span>
                </CardTitle>
                <CardDescription>
                  Complete API documentation with interactive examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Browse APIs
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-[#00D084]" />
                  <span>SDKs & Libraries</span>
                </CardTitle>
                <CardDescription>
                  Official SDKs for JavaScript, Python, PHP, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <Badge variant="outline">JavaScript</Badge>
                  <Badge variant="outline">Python</Badge>
                  <Badge variant="outline">PHP</Badge>
                  <Badge variant="outline">Ruby</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  Download SDKs
                  <Download className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#00D084] to-[#00B070]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Building?</h2>
          <p className="text-xl text-green-100 mb-8">
            Join our developer program and get access to powerful APIs, comprehensive documentation, 
            and dedicated support. Start building the future of audio today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-[#00D084] hover:bg-gray-100 px-8 py-4 text-lg">
                Join Developer Program
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
              Schedule Demo
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
              <p className="text-gray-400 mb-4">
                Powerful APIs for the future of audio experiences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Developers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">API Pricing</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">API Status</Link></li>
                <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog" className="hover:text-white transition-colors">Developer Blog</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/examples" className="hover:text-white transition-colors">Code Examples</Link></li>
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
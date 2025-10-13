import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  Mic, 
  Music, 
  BarChart3, 
  DollarSign, 
  Zap, 
  Users, 
  Globe,
  Play,
  Headphones,
  Smartphone,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: Radio,
    title: "Live Broadcasting",
    description: "Professional-grade live streaming with real-time audio processing and instant go-live capabilities."
  },
  {
    icon: Music,
    title: "Music Library",
    description: "Upload, organize, and manage your music collection with smart playlist automation and crate organization."
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track listener engagement, geographic distribution, and revenue metrics with comprehensive reporting."
  },
  {
    icon: DollarSign,
    title: "Monetization Tools",
    description: "Integrate ads, sponsorships, and premium content with automated revenue optimization."
  },
  {
    icon: Zap,
    title: "AI Voice Agents",
    description: "Deploy intelligent voice assistants for call-ins, announcements, and automated interactions."
  },
  {
    icon: Globe,
    title: "Global Distribution",
    description: "Reach audiences worldwide with CDN-powered streaming and multi-platform syndication."
  }
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Up to 10 listeners",
      "2 hours streaming/day",
      "Basic analytics",
      "Community support"
    ],
    popular: false
  },
  {
    name: "Creator",
    price: "$29",
    period: "month",
    description: "For serious broadcasters",
    features: [
      "Unlimited listeners",
      "24/7 streaming",
      "Advanced analytics",
      "Monetization tools",
      "API access",
      "Priority support"
    ],
    popular: true
  },
  {
    name: "Business",
    price: "$99",
    period: "month",
    description: "For growing stations",
    features: [
      "Everything in Creator",
      "White-label player",
      "Multiple DJs",
      "Advanced scheduling",
      "Custom branding",
      "Phone support"
    ],
    popular: false
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Everything in Business",
      "Dedicated infrastructure",
      "Custom integrations",
      "24/7 phone support",
      "SLA guarantees",
      "Training & onboarding"
    ],
    popular: false
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Radio Host, WXYZ FM",
    content: "DJ Union transformed our station. The analytics alone have helped us grow our audience by 300%.",
    rating: 5
  },
  {
    name: "Mike Chen",
    role: "Indie DJ & Producer",
    content: "Finally, a platform that gets what DJs need. The AI voice agent is incredible - it's like having a co-host.",
    rating: 5
  },
  {
    name: "Lisa Rodriguez",
    role: "Station Manager, Hot 97.5",
    content: "The monetization tools paid for themselves within the first month. Couldn't be happier.",
    rating: 5
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Radio className="h-8 w-8 text-[#00D084]" />
              <span className="text-xl font-bold text-gray-900">DJ Union</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
              <Link href="/developers" className="text-gray-600 hover:text-gray-900 transition-colors">Developers</Link>
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
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-[#00D084]/10 text-[#00D084] border-[#00D084]/20 hover:bg-[#00D084]/20">
            🎙️ Now with AI Voice Agents
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            The Future of
            <span className="block text-[#00D084]">Radio Broadcasting</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Professional radio software that's simple, powerful, and affordable. Stream live, monetize your content, 
            and grow your audience with cutting-edge AI tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="bg-[#00D084] hover:bg-[#00B070] text-white px-8 py-4 text-lg">
                Start Broadcasting Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-[#00D084] mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-[#00D084] mr-2" />
              Setup in 5 minutes
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-[#00D084] mr-2" />
              24/7 support
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get On Air in 3 Simple Steps</h2>
            <p className="text-xl text-gray-600">From signup to streaming in under 5 minutes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00D084] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Create Your Station</h3>
              <p className="text-gray-600">Sign up and customize your station with branding, music, and preferences in minutes.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00D084] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Upload & Schedule</h3>
              <p className="text-gray-600">Upload your music library and set up automated playlists or schedule live broadcasts.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00D084] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Go Live & Monetize</h3>
              <p className="text-gray-600">Start streaming to the world and begin earning revenue through ads and sponsorships.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600">Professional broadcasting tools that scale with your audience</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#00D084]/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-[#00D084]" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that's right for your station</p>
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
                  <Link href="/signup">
                    <Button 
                      className={`w-full ${tier.popular ? 'bg-[#00D084] hover:bg-[#00B070] text-white' : ''}`}
                      variant={tier.popular ? 'default' : 'outline'}
                    >
                      {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Broadcasters Worldwide</h2>
            <p className="text-xl text-gray-600">Join thousands of successful stations using DJ Union</p>
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#00D084] to-[#00B070]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Broadcasting?</h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of broadcasters who've made the switch to DJ Union. 
            Start your free trial today - no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-[#00D084] hover:bg-gray-100 px-8 py-4 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                Book a Demo
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
              <p className="text-gray-400 mb-4">
                The future of radio broadcasting. Simple, powerful, and affordable.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:text-white">
                  Twitter
                </Button>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:text-white">
                  Discord
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/developers" className="hover:text-white transition-colors">API</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
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
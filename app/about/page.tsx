import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  Users, 
  Globe, 
  Zap, 
  Heart,
  ArrowRight,
  MapPin,
  Calendar,
  Award,
  Target,
  Lightbulb,
  Shield
} from 'lucide-react';

const stats = [
  { label: "Active Stations", value: "12,847", icon: Radio },
  { label: "Countries", value: "89", icon: Globe },
  { label: "Team Members", value: "47", icon: Users },
  { label: "Years of Experience", value: "8", icon: Calendar }
];

const values = [
  {
    icon: Heart,
    title: "Passion for Audio",
    description: "We believe in the power of audio to connect, inspire, and entertain people around the world."
  },
  {
    icon: Lightbulb,
    title: "Innovation First",
    description: "We're constantly pushing the boundaries of what's possible in radio broadcasting technology."
  },
  {
    icon: Shield,
    title: "Trust & Reliability",
    description: "Our platform is built on a foundation of security, uptime, and unwavering reliability."
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Everything we build is guided by feedback from our community of broadcasters and listeners."
  }
];

const team = [
  {
    name: "Sarah Johnson",
    role: "CEO & Co-Founder",
    bio: "Former radio host turned tech entrepreneur. 15+ years in broadcasting.",
    image: "SJ"
  },
  {
    name: "Mike Chen",
    role: "CTO & Co-Founder", 
    bio: "Ex-Spotify engineer with expertise in audio streaming and AI technologies.",
    image: "MC"
  },
  {
    name: "Lisa Rodriguez",
    role: "Head of Product",
    bio: "Product leader with experience at Apple Music and Pandora.",
    image: "LR"
  },
  {
    name: "David Wilson",
    role: "VP of Engineering",
    bio: "Infrastructure expert who scaled audio platforms for millions of users.",
    image: "DW"
  }
];

const milestones = [
  { year: "2017", title: "Company Founded", description: "Started in a garage with a vision to democratize radio" },
  { year: "2018", title: "First 1,000 Stations", description: "Reached our first major milestone of active broadcasters" },
  { year: "2020", title: "AI Voice Agents", description: "Launched revolutionary AI-powered broadcasting assistants" },
  { year: "2022", title: "Global Expansion", description: "Expanded to serve broadcasters in 50+ countries" },
  { year: "2024", title: "10K+ Stations", description: "Became the world's largest independent radio platform" },
  { year: "2025", title: "Next Chapter", description: "Continuing to innovate with new AI and streaming technologies" }
];

export default function AboutPage() {
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
            🎙️ Founded in 2017
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Democratizing
            <span className="block text-[#00D084]">Radio Broadcasting</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We believe everyone should have the power to broadcast their voice to the world. 
            DJ Union makes professional radio broadcasting accessible, affordable, and intelligent.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
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

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            To empower creators, broadcasters, and storytellers with the tools they need to share their voice 
            with the world. We're building the future of audio broadcasting - one that's accessible, intelligent, 
            and community-driven.
          </p>
          <div className="flex items-center justify-center space-x-2 text-[#00D084]">
            <Target className="h-6 w-6" />
            <span className="font-semibold">Making radio broadcasting accessible to everyone</span>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-[#00D084]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-[#00D084]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">Key milestones in our mission to transform radio</p>
          </div>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#00D084] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{milestone.year}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The passionate people behind DJ Union</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-[#00D084] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">{member.image}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-[#00D084] font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#00D084] to-[#00B070]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Join Our Mission</h2>
          <p className="text-xl text-green-100 mb-8">
            Ready to be part of the future of radio broadcasting? Start your journey with DJ Union today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-[#00D084] hover:bg-gray-100 px-8 py-4">
                Start Broadcasting
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/careers">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-4">
                Join Our Team
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
                Democratizing radio broadcasting for everyone.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
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
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
                <li><Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link></li>
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
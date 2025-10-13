import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  Heart,
  Zap,
  Globe,
  ArrowRight,
  Code,
  Palette,
  BarChart3,
  Headphones,
  Shield,
  Briefcase
} from 'lucide-react';

const benefits = [
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Comprehensive health, dental, and vision insurance plus wellness stipend"
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description: "Work when you're most productive with flexible hours and unlimited PTO"
  },
  {
    icon: Globe,
    title: "Remote First",
    description: "Work from anywhere in the world with our fully distributed team"
  },
  {
    icon: Zap,
    title: "Growth Budget",
    description: "$2,000 annual learning budget for conferences, courses, and books"
  },
  {
    icon: DollarSign,
    title: "Equity Package",
    description: "Meaningful equity stake in the company's success and growth"
  },
  {
    icon: Users,
    title: "Amazing Team",
    description: "Work with passionate, talented people who love what they do"
  }
];

const openRoles = [
  {
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build scalable web applications and APIs that power millions of radio streams worldwide.",
    requirements: ["5+ years experience", "React/Node.js", "Cloud platforms", "Audio streaming experience preferred"],
    icon: Code
  },
  {
    title: "AI/ML Engineer",
    department: "Engineering", 
    location: "Remote",
    type: "Full-time",
    description: "Develop and improve our AI voice agents and recommendation systems.",
    requirements: ["3+ years ML experience", "Python/TensorFlow", "NLP/Speech processing", "Production ML systems"],
    icon: Zap
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time", 
    description: "Design beautiful, intuitive experiences for broadcasters and listeners.",
    requirements: ["4+ years product design", "Figma expertise", "Design systems", "Audio/media experience preferred"],
    icon: Palette
  },
  {
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Remote", 
    type: "Full-time",
    description: "Scale our infrastructure to handle millions of concurrent audio streams.",
    requirements: ["4+ years DevOps", "Kubernetes/Docker", "AWS/GCP", "Audio streaming infrastructure"],
    icon: Shield
  },
  {
    title: "Data Analyst",
    department: "Analytics",
    location: "Remote",
    type: "Full-time",
    description: "Turn data into insights that help broadcasters grow their audience.",
    requirements: ["3+ years analytics", "SQL/Python", "Data visualization", "Media/audio industry knowledge"],
    icon: BarChart3
  },
  {
    title: "Audio Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Contract",
    description: "Optimize audio quality and develop new audio processing features.",
    requirements: ["Audio engineering degree", "DSP experience", "Real-time audio", "Broadcast standards knowledge"],
    icon: Headphones
  }
];

const values = [
  {
    title: "Passion for Audio",
    description: "We're all here because we believe in the power of audio to connect people."
  },
  {
    title: "Remote First",
    description: "We've been remote since day one and built our culture around distributed work."
  },
  {
    title: "Continuous Learning",
    description: "Technology evolves fast, and we invest in helping our team stay ahead."
  },
  {
    title: "Work-Life Balance",
    description: "We believe great work comes from well-rested, happy people."
  }
];

export default function CareersPage() {
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
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">Documentation</Link>
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
            🚀 We're Hiring!
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Join the Future of
            <span className="block text-[#00D084]">Radio Broadcasting</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Help us build the tools that empower millions of broadcasters worldwide. 
            Work with cutting-edge technology, passionate people, and make a real impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#00D084] hover:bg-[#00B070] text-white px-8 py-4">
              <Briefcase className="mr-2 h-5 w-5" />
              View Open Roles
            </Button>
            <Link href="/about">
              <Button variant="outline" size="lg" className="px-8 py-4">
                Learn About Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Work at DJ Union?</h2>
            <p className="text-xl text-gray-600">Our culture and values that make us special</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Benefits & Perks</h2>
            <p className="text-xl text-gray-600">We take care of our team so they can do their best work</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-[#00D084]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-[#00D084]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                        <p className="text-gray-600 text-sm">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-xl text-gray-600">Find your next opportunity with us</p>
          </div>
          <div className="space-y-6">
            {openRoles.map((role, index) => {
              const IconComponent = role.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-[#00D084]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-6 w-6 text-[#00D084]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{role.title}</h3>
                            <Badge className="bg-[#00D084]/10 text-[#00D084]">{role.department}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{role.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{role.type}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4">{role.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {role.requirements.map((req, reqIndex) => (
                              <Badge key={reqIndex} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button className="bg-[#00D084] hover:bg-[#00B070] ml-6">
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#00D084] to-[#00B070]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Don't See Your Role?</h2>
          <p className="text-xl text-green-100 mb-8">
            We're always looking for talented people to join our team. 
            Send us your resume and tell us how you'd like to contribute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#00D084] hover:bg-gray-100 px-8 py-4">
              Send Us Your Resume
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-4">
              Learn More About Us
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
                Join us in building the future of radio broadcasting.
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
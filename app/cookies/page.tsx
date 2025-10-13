import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  Cookie, 
  Settings, 
  Shield, 
  Eye,
  ToggleLeft,
  Calendar,
  Info
} from 'lucide-react';

export default function CookiesPage() {
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
            <Calendar className="h-4 w-4 mr-2" />
            Last Updated: January 1, 2025
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Cookie
            <span className="block text-[#00D084]">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Learn how DJ Union uses cookies and similar technologies to enhance your broadcasting experience and provide personalized services.
          </p>
        </div>
      </section>

      {/* Cookie Summary */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cookie className="h-6 w-6 text-[#00D084]" />
                <span>Cookie Usage Summary</span>
              </CardTitle>
              <CardDescription>How we use cookies to improve your experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Settings className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Essential Cookies</h4>
                  <p className="text-sm text-gray-600">Required for basic functionality</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Eye className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600">Help us understand usage patterns</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <ToggleLeft className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Preference Cookies</h4>
                  <p className="text-sm text-gray-600">Remember your settings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What Are Cookies?</h2>
            
            <p className="text-gray-600 mb-6">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences, 
              keeping you logged in, and helping us understand how you use our platform.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Essential Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies are necessary for our website to function properly. They enable core functionality such as:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>User authentication and login sessions</li>
              <li>Security features and fraud prevention</li>
              <li>Basic website functionality and navigation</li>
              <li>Load balancing and performance optimization</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics Cookies</h3>
            <p className="text-gray-600 mb-4">
              We use analytics cookies to understand how visitors interact with our website. This helps us:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>Measure website traffic and usage patterns</li>
              <li>Identify popular features and content</li>
              <li>Improve our platform based on user behavior</li>
              <li>Troubleshoot technical issues</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Preference Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies remember your choices and preferences to provide a personalized experience:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>Language and region settings</li>
              <li>Theme and display preferences</li>
              <li>Audio quality and player settings</li>
              <li>Dashboard layout and customizations</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Marketing Cookies</h3>
            <p className="text-gray-600 mb-6">
              With your consent, we may use marketing cookies to show you relevant advertisements 
              and measure the effectiveness of our marketing campaigns. These cookies help us 
              deliver personalized content and offers.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Third-Party Cookies</h2>
            
            <p className="text-gray-600 mb-4">
              We work with trusted third-party services that may also set cookies on your device:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li><strong>Google Analytics:</strong> Website analytics and performance monitoring</li>
              <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
              <li><strong>Intercom:</strong> Customer support and communication</li>
              <li><strong>Cloudflare:</strong> Security and content delivery</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Managing Your Cookie Preferences</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Browser Settings</h3>
            <p className="text-gray-600 mb-6">
              You can control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>View and delete existing cookies</li>
              <li>Block all cookies or specific types</li>
              <li>Set preferences for future cookie acceptance</li>
              <li>Receive notifications when cookies are set</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">DJ Union Cookie Preferences</h3>
            <p className="text-gray-600 mb-6">
              You can manage your cookie preferences directly on our platform through your account settings. 
              Note that disabling certain cookies may affect the functionality of our services.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Cookie Retention</h2>
            
            <p className="text-gray-600 mb-4">
              Different cookies have different lifespans:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain for a set period (typically 30 days to 2 years)</li>
              <li><strong>Authentication Cookies:</strong> Expire when you log out or after 30 days of inactivity</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Updates to This Policy</h2>
            
            <p className="text-gray-600 mb-6">
              We may update this cookie policy from time to time to reflect changes in our practices 
              or applicable laws. We will notify you of any material changes by posting the updated 
              policy on our website and updating the "Last Updated" date.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Contact Us</h2>
            
            <p className="text-gray-600 mb-6">
              If you have any questions about our use of cookies, please contact us:
            </p>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-2"><strong>Email:</strong> privacy@djunion.com</p>
              <p className="text-gray-600 mb-2"><strong>Address:</strong> DJ Union Privacy Team, 123 Broadcasting Ave, San Francisco, CA 94105</p>
              <p className="text-gray-600"><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
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
                Transparent cookie usage for better experiences.
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
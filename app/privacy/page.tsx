import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  Shield, 
  Eye, 
  Lock, 
  Users,
  Globe,
  Mail,
  Calendar
} from 'lucide-react';

export default function PrivacyPage() {
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
            <Shield className="h-4 w-4 mr-2" />
            Last Updated: January 1, 2025
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Privacy
            <span className="block text-[#00D084]">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information when you use DJ Union.
          </p>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-6 w-6 text-[#00D084]" />
                <span>Privacy at a Glance</span>
              </CardTitle>
              <CardDescription>Key points about how we handle your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Lock className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Data Encryption</h4>
                      <p className="text-sm text-gray-600">All data is encrypted in transit and at rest</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">No Data Selling</h4>
                      <p className="text-sm text-gray-600">We never sell your personal information</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Globe className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">GDPR Compliant</h4>
                      <p className="text-sm text-gray-600">Full compliance with international privacy laws</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Data Portability</h4>
                      <p className="text-sm text-gray-600">Export your data anytime</p>
                    </div>
                  </div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h3>
            <p className="text-gray-600 mb-6">
              When you create an account, we collect basic information such as your name, email address, 
              and station details. This information is necessary to provide our broadcasting services and 
              communicate with you about your account.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Usage Data</h3>
            <p className="text-gray-600 mb-6">
              We collect information about how you use our platform, including streaming statistics, 
              listener analytics, and feature usage. This helps us improve our services and provide 
              you with relevant insights about your broadcasts.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Audio Content</h3>
            <p className="text-gray-600 mb-6">
              We process and store the audio content you upload and broadcast through our platform. 
              This includes music files, voice recordings, and live streams. We use this content 
              solely to provide our broadcasting services.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">How We Use Your Information</h2>
            
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>Provide and maintain our broadcasting services</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send important service updates and notifications</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Improve our platform and develop new features</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Information Sharing</h2>
            
            <p className="text-gray-600 mb-6">
              We do not sell, trade, or rent your personal information to third parties. We may share 
              your information only in the following circumstances:
            </p>

            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and users</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Data Security</h2>
            
            <p className="text-gray-600 mb-6">
              We implement industry-standard security measures to protect your information:
            </p>

            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>End-to-end encryption for all data transmission</li>
              <li>Encrypted storage of all personal and audio data</li>
              <li>Regular security audits and penetration testing</li>
              <li>Multi-factor authentication for account access</li>
              <li>Limited access to personal data on a need-to-know basis</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Your Rights</h2>
            
            <p className="text-gray-600 mb-6">
              You have the following rights regarding your personal information:
            </p>

            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Restriction:</strong> Limit how we process your information</li>
              <li><strong>Objection:</strong> Object to certain types of processing</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Cookies and Tracking</h2>
            
            <p className="text-gray-600 mb-6">
              We use cookies and similar technologies to enhance your experience on our platform. 
              These help us remember your preferences, analyze usage patterns, and provide personalized content. 
              You can control cookie settings through your browser preferences.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">International Transfers</h2>
            
            <p className="text-gray-600 mb-6">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your data in accordance with 
              applicable privacy laws, including GDPR and CCPA.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Children's Privacy</h2>
            
            <p className="text-gray-600 mb-6">
              Our services are not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If you believe we have collected 
              information from a child under 13, please contact us immediately.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Changes to This Policy</h2>
            
            <p className="text-gray-600 mb-6">
              We may update this privacy policy from time to time. We will notify you of any material 
              changes by email or through our platform. Your continued use of our services after such 
              changes constitutes acceptance of the updated policy.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Contact Us</h2>
            
            <p className="text-gray-600 mb-6">
              If you have any questions about this privacy policy or our data practices, please contact us:
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
                Your privacy is our priority.
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
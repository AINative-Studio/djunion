import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  FileText, 
  Scale, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';

export default function TermsPage() {
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
            Terms of
            <span className="block text-[#00D084]">Service</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            These terms govern your use of DJ Union's broadcasting platform and services. 
            Please read them carefully before using our platform.
          </p>
        </div>
      </section>

      {/* Key Points */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-[#00D084]" />
                <span>Key Terms Summary</span>
              </CardTitle>
              <CardDescription>Important points to understand before using our services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Content Ownership</h4>
                      <p className="text-sm text-gray-600">You retain ownership of your content</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Platform License</h4>
                      <p className="text-sm text-gray-600">Limited license to broadcast your content</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Scale className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Content Responsibility</h4>
                      <p className="text-sm text-gray-600">You're responsible for content compliance</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Account Termination</h4>
                      <p className="text-sm text-gray-600">We may suspend accounts for violations</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
            
            <p className="text-gray-600 mb-6">
              By accessing or using DJ Union's services, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations. If you do not agree with any of these terms, 
              you are prohibited from using or accessing our services.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">2. Description of Service</h2>
            
            <p className="text-gray-600 mb-6">
              DJ Union provides a cloud-based radio broadcasting platform that enables users to:
            </p>

            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>Stream live audio content to listeners worldwide</li>
              <li>Upload and manage music libraries</li>
              <li>Access AI-powered voice agents for broadcasting assistance</li>
              <li>Monetize content through advertising and sponsorships</li>
              <li>Analyze listener engagement and demographics</li>
              <li>Integrate with third-party services and platforms</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">3. User Accounts</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Registration</h3>
            <p className="text-gray-600 mb-6">
              To use our services, you must create an account by providing accurate and complete information. 
              You are responsible for maintaining the confidentiality of your account credentials and for all 
              activities that occur under your account.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Responsibilities</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>Provide accurate and up-to-date information</li>
              <li>Maintain the security of your login credentials</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Respect the rights of other users and third parties</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">4. Content and Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Content</h3>
            <p className="text-gray-600 mb-6">
              You retain ownership of all content you upload, broadcast, or otherwise make available through 
              our platform. By using our services, you grant DJ Union a limited, non-exclusive, royalty-free 
              license to host, store, and distribute your content solely for the purpose of providing our services.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Content Restrictions</h3>
            <p className="text-gray-600 mb-4">You agree not to upload, broadcast, or distribute content that:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>Infringes on intellectual property rights of others</li>
              <li>Contains hate speech, harassment, or discriminatory content</li>
              <li>Promotes violence or illegal activities</li>
              <li>Contains explicit sexual content or nudity</li>
              <li>Violates privacy rights of individuals</li>
              <li>Contains malware, viruses, or harmful code</li>
              <li>Violates any applicable laws or regulations</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Music Licensing</h3>
            <p className="text-gray-600 mb-6">
              You are responsible for obtaining all necessary licenses and permissions for any copyrighted 
              music or content you broadcast. DJ Union provides tools to help with music licensing compliance 
              but does not guarantee license coverage for your content.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">5. Acceptable Use Policy</h2>
            
            <p className="text-gray-600 mb-4">You agree to use our services only for lawful purposes and in accordance with these terms. Prohibited activities include:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>Attempting to gain unauthorized access to our systems</li>
              <li>Interfering with or disrupting our services</li>
              <li>Using our platform to spam or send unsolicited communications</li>
              <li>Impersonating others or providing false information</li>
              <li>Collecting user data without proper consent</li>
              <li>Using automated tools to access our services without permission</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">6. Payment and Billing</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Subscription Plans</h3>
            <p className="text-gray-600 mb-6">
              Our services are offered under various subscription plans with different features and limitations. 
              Subscription fees are billed in advance and are non-refundable except as required by law.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Processing</h3>
            <p className="text-gray-600 mb-6">
              Payments are processed by third-party payment processors. You agree to provide accurate payment 
              information and authorize us to charge your payment method for all fees incurred.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Revenue Sharing</h3>
            <p className="text-gray-600 mb-6">
              For monetization features, revenue sharing terms are specified in your subscription plan. 
              Payments to broadcasters are subject to minimum thresholds and payment processing schedules.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">7. Privacy and Data Protection</h2>
            
            <p className="text-gray-600 mb-6">
              Your privacy is important to us. Our collection, use, and protection of your personal information 
              is governed by our Privacy Policy, which is incorporated into these terms by reference.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">8. Service Availability</h2>
            
            <p className="text-gray-600 mb-6">
              While we strive to maintain high service availability, we do not guarantee uninterrupted access 
              to our platform. We may temporarily suspend services for maintenance, updates, or other operational reasons.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">9. Termination</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Termination by You</h3>
            <p className="text-gray-600 mb-6">
              You may terminate your account at any time by contacting our support team or using the account 
              deletion feature in your dashboard. Upon termination, your access to paid features will end at 
              the end of your current billing period.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Termination by Us</h3>
            <p className="text-gray-600 mb-6">
              We may suspend or terminate your account immediately if you violate these terms, engage in 
              fraudulent activity, or for any other reason at our sole discretion. We will provide notice 
              when reasonably possible.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">10. Disclaimers and Limitation of Liability</h2>
            
            <p className="text-gray-600 mb-6">
              Our services are provided "as is" without warranties of any kind. We disclaim all warranties, 
              express or implied, including but not limited to merchantability, fitness for a particular purpose, 
              and non-infringement.
            </p>

            <p className="text-gray-600 mb-6">
              To the maximum extent permitted by law, DJ Union shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages arising from your use of our services.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">11. Indemnification</h2>
            
            <p className="text-gray-600 mb-6">
              You agree to indemnify and hold harmless DJ Union from any claims, damages, or expenses arising 
              from your use of our services, your content, or your violation of these terms.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">12. Governing Law</h2>
            
            <p className="text-gray-600 mb-6">
              These terms are governed by the laws of the State of California, United States, without regard 
              to conflict of law principles. Any disputes will be resolved in the courts of San Francisco County, California.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">13. Changes to Terms</h2>
            
            <p className="text-gray-600 mb-6">
              We may update these terms from time to time. We will notify you of material changes by email 
              or through our platform. Your continued use of our services after such changes constitutes 
              acceptance of the updated terms.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">14. Contact Information</h2>
            
            <p className="text-gray-600 mb-6">
              If you have any questions about these terms, please contact us:
            </p>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-2"><strong>Email:</strong> legal@djunion.com</p>
              <p className="text-gray-600 mb-2"><strong>Address:</strong> DJ Union Legal Team, 123 Broadcasting Ave, San Francisco, CA 94105</p>
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
                Clear terms for a better broadcasting experience.
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
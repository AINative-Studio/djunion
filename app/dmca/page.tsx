import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Radio, 
  Shield, 
  FileText, 
  AlertTriangle, 
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  Scale,
  Info
} from 'lucide-react';

export default function DMCAPage() {
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
            DMCA
            <span className="block text-[#00D084]">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            DJ Union respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA). 
            Learn about our copyright policies and how to report infringement.
          </p>
        </div>
      </section>

      {/* Quick Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-[#00D084]" />
                <span>Copyright Protection Overview</span>
              </CardTitle>
              <CardDescription>How we protect intellectual property on our platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">DMCA Compliance</h4>
                  <p className="text-sm text-gray-600">Full compliance with copyright law</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Quick Response</h4>
                  <p className="text-sm text-gray-600">24-48 hour takedown processing</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Fair Process</h4>
                  <p className="text-sm text-gray-600">Counter-notification rights protected</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">DMCA Policy</h2>
            
            <p className="text-gray-600 mb-6">
              DJ Union respects the intellectual property rights of others and expects our users to do the same. 
              In accordance with the Digital Millennium Copyright Act of 1998 (DMCA), we will respond expeditiously 
              to claims of copyright infringement committed using our platform.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Reporting Copyright Infringement</h2>
            
            <p className="text-gray-600 mb-4">
              If you believe that your copyrighted work has been copied and is accessible on our platform 
              in a way that constitutes copyright infringement, please provide our designated copyright agent 
              with the following information:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Required Information for DMCA Takedown Notice</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-2 mb-6">
              <li>A physical or electronic signature of the copyright owner or authorized agent</li>
              <li>Identification of the copyrighted work claimed to have been infringed</li>
              <li>Identification of the material that is claimed to be infringing and information reasonably sufficient to permit us to locate the material</li>
              <li>Your contact information, including address, telephone number, and email address</li>
              <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner</li>
              <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the copyright owner</li>
            </ol>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Designated Copyright Agent</h2>
            
            <p className="text-gray-600 mb-6">
              Please send DMCA takedown notices to our designated copyright agent:
            </p>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-gray-600 mb-2"><strong>DMCA Agent:</strong> Legal Department</p>
              <p className="text-gray-600 mb-2"><strong>Email:</strong> dmca@djunion.com</p>
              <p className="text-gray-600 mb-2"><strong>Address:</strong> DJ Union DMCA Agent, 123 Broadcasting Ave, San Francisco, CA 94105</p>
              <p className="text-gray-600"><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Our Response Process</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Upon Receiving a Valid DMCA Notice</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-2 mb-6">
              <li>We will promptly investigate the claim</li>
              <li>If the claim appears valid, we will remove or disable access to the allegedly infringing material</li>
              <li>We will notify the user who posted the material about the takedown</li>
              <li>We will provide the user with information about filing a counter-notification</li>
              <li>We may terminate repeat infringers' accounts</li>
            </ol>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Counter-Notification Process</h2>
            
            <p className="text-gray-600 mb-4">
              If you believe that your material was removed or disabled by mistake or misidentification, 
              you may file a counter-notification with the following information:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Required Information for Counter-Notification</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-2 mb-6">
              <li>Your physical or electronic signature</li>
              <li>Identification of the material that has been removed and the location where it appeared before removal</li>
              <li>A statement under penalty of perjury that you have a good faith belief that the material was removed by mistake or misidentification</li>
              <li>Your name, address, and telephone number</li>
              <li>A statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located</li>
              <li>A statement that you will accept service of process from the person who provided the original DMCA notification</li>
            </ol>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Repeat Infringer Policy</h2>
            
            <p className="text-gray-600 mb-6">
              DJ Union has adopted a policy of terminating, in appropriate circumstances and at our sole discretion, 
              users who are deemed to be repeat infringers. We may also limit access to our platform and/or 
              terminate the accounts of any users who infringe any intellectual property rights of others, 
              whether or not there is any repeat infringement.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Safe Harbor Provisions</h2>
            
            <p className="text-gray-600 mb-6">
              DJ Union qualifies for the safe harbor provisions of the DMCA. We do not monitor user-generated 
              content for copyright infringement, but we respond promptly to valid DMCA notices and have 
              implemented appropriate policies for dealing with repeat infringers.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Music Licensing</h2>
            
            <p className="text-gray-600 mb-4">
              For broadcasters using our platform, please note:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>You are responsible for obtaining proper licenses for copyrighted music</li>
              <li>We provide tools to help with licensing compliance but do not guarantee coverage</li>
              <li>Consider working with performance rights organizations (PROs) like ASCAP, BMI, and SESAC</li>
              <li>Our platform includes features to help track and report music usage</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">False Claims</h2>
            
            <p className="text-gray-600 mb-6">
              Please note that under Section 512(f) of the DMCA, any person who knowingly materially 
              misrepresents that material is infringing may be subject to liability for damages. 
              Do not make false claims of copyright infringement.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">Contact Information</h2>
            
            <p className="text-gray-600 mb-6">
              For questions about this DMCA policy or to report copyright infringement:
            </p>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-2"><strong>Email:</strong> dmca@djunion.com</p>
              <p className="text-gray-600 mb-2"><strong>Legal Department:</strong> legal@djunion.com</p>
              <p className="text-gray-600 mb-2"><strong>Address:</strong> DJ Union Legal Team, 123 Broadcasting Ave, San Francisco, CA 94105</p>
              <p className="text-gray-600"><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </section>

      {/* DMCA Notice Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Submit a DMCA Takedown Notice</h2>
            <p className="text-lg text-gray-600">Use this form to report copyright infringement</p>
          </div>
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your full legal name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Your phone number" />
                  </div>
                  <div>
                    <Label htmlFor="organization">Organization (if applicable)</Label>
                    <Input id="organization" placeholder="Company or organization name" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Mailing Address</Label>
                  <Textarea id="address" rows={3} placeholder="Your complete mailing address" />
                </div>
                <div>
                  <Label htmlFor="copyrighted-work">Description of Copyrighted Work</Label>
                  <Textarea 
                    id="copyrighted-work" 
                    rows={4}
                    placeholder="Describe the copyrighted work that you believe has been infringed"
                  />
                </div>
                <div>
                  <Label htmlFor="infringing-material">Location of Infringing Material</Label>
                  <Textarea 
                    id="infringing-material" 
                    rows={4}
                    placeholder="Provide URLs or specific locations where the infringing material can be found on our platform"
                  />
                </div>
                <div>
                  <Label htmlFor="additional-info">Additional Information</Label>
                  <Textarea 
                    id="additional-info" 
                    rows={4}
                    placeholder="Any additional information that may help us process your request"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" id="good-faith" className="mt-1" />
                    <Label htmlFor="good-faith" className="text-sm">
                      I have a good faith belief that use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" id="accuracy" className="mt-1" />
                    <Label htmlFor="accuracy" className="text-sm">
                      I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner.
                    </Label>
                  </div>
                </div>
                <Button className="w-full bg-[#00D084] hover:bg-[#00B070] py-3">
                  Submit DMCA Notice
                </Button>
              </form>
            </CardContent>
          </Card>
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
                Protecting intellectual property rights.
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
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Users, 
  DollarSign, 
  Zap, 
  Settings,
  Search,
  Ban,
  UserCheck,
  TrendingUp,
  Radio,
  AlertTriangle,
  CheckCircle,
  Building,
  CreditCard
} from 'lucide-react';

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const platformStats = [
    { title: "Total Stations", value: "12,847", change: "+18%", icon: Radio, color: "text-blue-600" },
    { title: "Active Broadcasters", value: "8,234", change: "+12%", icon: Users, color: "text-green-600" },
    { title: "Monthly Revenue", value: "$234K", change: "+23%", icon: DollarSign, color: "text-purple-600" },
    { title: "AI Agent Usage", value: "89%", change: "+15%", icon: Zap, color: "text-orange-600" }
  ];

  const recentStations = [
    { id: '1', name: 'Hot 97.5 FM', owner: 'Sarah Johnson', plan: 'Business', status: 'active', listeners: 1234, revenue: '$3,245' },
    { id: '2', name: 'Indie Vibes Radio', owner: 'Mike Chen', plan: 'Creator', status: 'active', listeners: 567, revenue: '$1,890' },
    { id: '3', name: 'Classic Rock 101', owner: 'Lisa Rodriguez', plan: 'Business', status: 'suspended', listeners: 0, revenue: '$0' },
    { id: '4', name: 'Urban Beats FM', owner: 'David Wilson', plan: 'Creator', status: 'active', listeners: 892, revenue: '$2,156' }
  ];

  const pendingActions = [
    { id: '1', type: 'dmca', station: 'Indie Vibes Radio', description: 'DMCA takedown request for "Copyrighted Song"', priority: 'high' },
    { id: '2', type: 'violation', station: 'Classic Rock 101', description: 'Content policy violation reported', priority: 'medium' },
    { id: '3', type: 'payment', station: 'Hot 97.5 FM', description: 'Payment dispute - chargeback received', priority: 'high' },
    { id: '4', type: 'support', station: 'Urban Beats FM', description: 'Premium support ticket escalated', priority: 'low' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-[#00D084]" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Super Admin</h1>
                <p className="text-sm text-gray-600">Platform Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800">All Systems Operational</Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {platformStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="stations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="stations" className="flex items-center space-x-2">
              <Radio className="h-4 w-4" />
              <span>Stations</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Ad Network</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>AI Agents</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Legal</span>
            </TabsTrigger>
          </TabsList>

          {/* Station Management */}
          <TabsContent value="stations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Station Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search stations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            {/* Pending Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span>Pending Actions</span>
                  <Badge className="ml-2">{pendingActions.length}</Badge>
                </CardTitle>
                <CardDescription>Items requiring admin attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingActions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          action.priority === 'high' ? 'bg-red-500' : 
                          action.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium">{action.station}</p>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Review</Button>
                        <Button variant="outline" size="sm">Resolve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stations Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Stations</CardTitle>
                <CardDescription>Manage broadcaster accounts and stations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentStations.map((station) => (
                    <div key={station.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Radio className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{station.name}</p>
                          <p className="text-sm text-gray-600">Owner: {station.owner}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">{station.listeners}</p>
                          <p className="text-xs text-gray-600">Listeners</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{station.revenue}</p>
                          <p className="text-xs text-gray-600">Revenue</p>
                        </div>
                        <Badge className={`${
                          station.plan === 'Business' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {station.plan}
                        </Badge>
                        <Badge className={`${
                          station.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {station.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <UserCheck className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ad Network */}
          <TabsContent value="ads" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Ad Network Management</h2>
              <Button className="bg-[#00D084] hover:bg-[#00B070]">
                <DollarSign className="h-4 w-4 mr-2" />
                Upload New Ad
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ad Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">847</p>
                    <p className="text-sm text-gray-600">Active Campaigns</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fill Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">94.2%</p>
                    <p className="text-sm text-gray-600">Average Fill Rate</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">70/30</p>
                    <p className="text-sm text-gray-600">Broadcaster/Platform</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ad Performance Metrics</CardTitle>
                <CardDescription>Global advertising performance across all stations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Pre-roll Ads</p>
                        <p className="text-sm text-gray-600">2.3M impressions today</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">$9,847</p>
                        <p className="text-xs text-gray-600">CPM: $4.28</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Mid-roll Ads</p>
                        <p className="text-sm text-gray-600">1.8M impressions today</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">$7,920</p>
                        <p className="text-xs text-gray-600">CPM: $4.40</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Sponsored Content</p>
                        <p className="text-sm text-gray-600">456 campaigns active</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">$12,340</p>
                        <p className="text-xs text-gray-600">Fixed rates</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Platform Revenue</p>
                        <p className="text-sm text-gray-600">30% commission</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-purple-600">$9,032</p>
                        <p className="text-xs text-gray-600">Today's earnings</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Agents */}
          <TabsContent value="agents" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">AI Agent Platform</h2>
              <Button className="bg-[#00D084] hover:bg-[#00B070]">
                <Zap className="h-4 w-4 mr-2" />
                Agent Settings
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">7,234</p>
                    <p className="text-sm text-gray-600">Currently Online</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Interactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">45.2K</p>
                    <p className="text-sm text-gray-600">Calls & Messages</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">1.2s</p>
                    <p className="text-sm text-gray-600">Global Average</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Satisfaction Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">94.8%</p>
                    <p className="text-sm text-gray-600">User Satisfaction</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Agent Usage Analytics</CardTitle>
                <CardDescription>AI agent performance and usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Top Use Cases</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Song Requests</span>
                          <span className="text-sm font-medium">34.2%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Call Screening</span>
                          <span className="text-sm font-medium">28.7%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">WhatsApp Support</span>
                          <span className="text-sm font-medium">21.5%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Voice Announcements</span>
                          <span className="text-sm font-medium">15.6%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Resource Usage</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">OpenAI API Calls</span>
                          <span className="text-sm font-medium">2.3M/day</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Claude API Calls</span>
                          <span className="text-sm font-medium">1.8M/day</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Voice Synthesis</span>
                          <span className="text-sm font-medium">890K/day</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">WhatsApp Messages</span>
                          <span className="text-sm font-medium">156K/day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Billing & Subscriptions</h2>
              <Button variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Stripe Dashboard
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">$234K</p>
                    <p className="text-sm text-gray-600">+23% from last month</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">8,234</p>
                    <p className="text-sm text-gray-600">Paying customers</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">2.3%</p>
                    <p className="text-sm text-gray-600">Monthly churn</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Failed Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">47</p>
                    <p className="text-sm text-gray-600">Require attention</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Breakdown</CardTitle>
                <CardDescription>Revenue by plan type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Creator Plan</p>
                        <p className="text-sm text-gray-600">5,234 subscribers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">$151,786</p>
                        <p className="text-xs text-gray-600">$29/month</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Business Plan</p>
                        <p className="text-sm text-gray-600">2,456 subscribers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">$243,144</p>
                        <p className="text-xs text-gray-600">$99/month</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Enterprise Plan</p>
                        <p className="text-sm text-gray-600">544 subscribers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">$272,000</p>
                        <p className="text-xs text-gray-600">$500/month avg</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Free Plan</p>
                        <p className="text-sm text-gray-600">15,678 users</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-600">$0</p>
                        <p className="text-xs text-gray-600">Conversion target</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal */}
          <TabsContent value="legal" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Legal & Rights Management</h2>
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                DMCA Settings
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>DMCA Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">23</p>
                    <p className="text-sm text-gray-600">This month</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rights Payouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">$45.2K</p>
                    <p className="text-sm text-gray-600">To rights orgs</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">99.7%</p>
                    <p className="text-sm text-gray-600">Platform wide</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Rights Organization Integrations</CardTitle>
                <CardDescription>Connected rights management organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">ASCAP</p>
                        <p className="text-sm text-gray-600">American Society of Composers, Authors and Publishers</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">BMI</p>
                        <p className="text-sm text-gray-600">Broadcast Music, Inc.</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">SESAC</p>
                        <p className="text-sm text-gray-600">Society of European Stage Authors and Composers</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
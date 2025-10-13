'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Key, 
  Webhook, 
  Book, 
  Settings, 
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Radio,
  Play,
  Download,
  ExternalLink
} from 'lucide-react';

export default function DeveloperPortalPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production App', key: 'dju_live_1234567890abcdef', created: '2024-01-15', lastUsed: '2 hours ago' },
    { id: '2', name: 'Testing Environment', key: 'dju_test_0987654321fedcba', created: '2024-01-10', lastUsed: '1 day ago' }
  ]);

  const webhooks = [
    { id: '1', url: 'https://myapp.com/webhooks/track-change', events: ['track.started', 'track.ended'], status: 'active' },
    { id: '2', url: 'https://analytics.example.com/dj-union', events: ['listener.joined', 'listener.left'], status: 'active' }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Radio className="h-8 w-8 text-[#00D084]" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Developer Portal</h1>
                <p className="text-sm text-gray-600">Manage your API keys and integrations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Book className="h-4 w-4 mr-2" />
                Documentation
              </Button>
              <Button className="bg-[#00D084] hover:bg-[#00B070]">
                <Plus className="h-4 w-4 mr-2" />
                New App
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Start */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-[#00D084] to-[#00B070] text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to DJ Union APIs</h2>
                  <p className="text-green-100 mb-4">
                    Build amazing radio experiences with our powerful APIs and SDKs
                  </p>
                  <div className="flex space-x-4">
                    <Button variant="outline" className="border-white text-white hover:bg-white/10">
                      <Code className="h-4 w-4 mr-2" />
                      View Docs
                    </Button>
                    <Button variant="outline" className="border-white text-white hover:bg-white/10">
                      <Download className="h-4 w-4 mr-2" />
                      Download SDK
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <Code className="h-24 w-24 opacity-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="api-keys" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center space-x-2">
              <Webhook className="h-4 w-4" />
              <span>Webhooks</span>
            </TabsTrigger>
            <TabsTrigger value="playground" className="flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>API Playground</span>
            </TabsTrigger>
            <TabsTrigger value="apps" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Apps</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center space-x-2">
              <Book className="h-4 w-4" />
              <span>Documentation</span>
            </TabsTrigger>
          </TabsList>

          {/* API Keys */}
          <TabsContent value="api-keys" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">API Keys</h2>
                <p className="text-gray-600">Manage your API keys for accessing DJ Union services</p>
              </div>
              <Button className="bg-[#00D084] hover:bg-[#00B070]">
                <Plus className="h-4 w-4 mr-2" />
                Generate New Key
              </Button>
            </div>

            <div className="grid gap-6">
              {apiKeys.map((key) => (
                <Card key={key.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{key.name}</h3>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                          <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                            {showApiKey ? key.key : key.key.replace(/./g, '•').substring(0, 20) + '...'}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(key.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600">
                          Created: {key.created} • Last used: {key.lastUsed}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Rate Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Rate Limits & Usage</CardTitle>
                <CardDescription>Current API usage and limits for your plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">2,847</p>
                    <p className="text-sm text-gray-600">Requests Today</p>
                    <p className="text-xs text-gray-500">of 50,000 limit</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">12</p>
                    <p className="text-sm text-gray-600">Webhooks Sent</p>
                    <p className="text-xs text-gray-500">Last hour</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">99.9%</p>
                    <p className="text-sm text-gray-600">Uptime</p>
                    <p className="text-xs text-gray-500">Last 30 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Webhooks</h2>
                <p className="text-gray-600">Configure webhooks to receive real-time notifications</p>
              </div>
              <Button className="bg-[#00D084] hover:bg-[#00B070]">
                <Plus className="h-4 w-4 mr-2" />
                Add Webhook
              </Button>
            </div>

            <div className="grid gap-6">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                            {webhook.url}
                          </code>
                          <Badge className={webhook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {webhook.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {webhook.events.map((event, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Test
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Available Events */}
            <Card>
              <CardHeader>
                <CardTitle>Available Webhook Events</CardTitle>
                <CardDescription>Events you can subscribe to</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Track Events</h4>
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">track.started</Badge>
                      <Badge variant="outline" className="text-xs">track.ended</Badge>
                      <Badge variant="outline" className="text-xs">track.paused</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Listener Events</h4>
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">listener.joined</Badge>
                      <Badge variant="outline" className="text-xs">listener.left</Badge>
                      <Badge variant="outline" className="text-xs">listener.request</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Stream Events</h4>
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">stream.started</Badge>
                      <Badge variant="outline" className="text-xs">stream.ended</Badge>
                      <Badge variant="outline" className="text-xs">stream.error</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Agent Events</h4>
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">agent.call_started</Badge>
                      <Badge variant="outline" className="text-xs">agent.call_ended</Badge>
                      <Badge variant="outline" className="text-xs">agent.message</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Playground */}
          <TabsContent value="playground" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">API Playground</h2>
              <p className="text-gray-600">Test API endpoints directly from your browser</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="endpoint">Endpoint</Label>
                    <Input 
                      id="endpoint" 
                      value="/api/v1/stations/current-track" 
                      className="font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="method">Method</Label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                      <option>DELETE</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="headers">Headers</Label>
                    <textarea 
                      id="headers" 
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                      value={`Authorization: Bearer dju_live_1234567890abcdef
Content-Type: application/json`}
                    />
                  </div>
                  <Button className="w-full bg-[#00D084] hover:bg-[#00B070]">
                    Send Request
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm">
                    <pre>{`{
  "status": "success",
  "data": {
    "track": {
      "id": "track_123",
      "title": "Blinding Lights",
      "artist": "The Weeknd",
      "album": "After Hours",
      "duration": 200,
      "started_at": "2024-01-15T10:30:00Z"
    },
    "listeners": {
      "current": 127,
      "peak_today": 234
    }
  }
}`}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Apps */}
          <TabsContent value="apps" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">OAuth Apps</h2>
                <p className="text-gray-600">Manage OAuth applications for third-party integrations</p>
              </div>
              <Button className="bg-[#00D084] hover:bg-[#00B070]">
                <Plus className="h-4 w-4 mr-2" />
                Register App
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No OAuth Apps Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Register your first OAuth application to allow users to authenticate with DJ Union
                  </p>
                  <Button className="bg-[#00D084] hover:bg-[#00B070]">
                    Register Your First App
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation */}
          <TabsContent value="docs" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Documentation</h2>
              <p className="text-gray-600">Comprehensive guides and API reference</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Book className="h-5 w-5 text-[#00D084]" />
                    <span>Getting Started</span>
                  </CardTitle>
                  <CardDescription>
                    Quick start guide to building with DJ Union APIs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Guide
                    <ExternalLink className="h-4 w-4 ml-2" />
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
                    Complete API documentation with examples
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Browse API Docs
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
                    Official SDKs for popular programming languages
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

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Webhook className="h-5 w-5 text-[#00D084]" />
                    <span>Webhook Guide</span>
                  </CardTitle>
                  <CardDescription>
                    Learn how to implement and secure webhooks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Webhook Docs
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
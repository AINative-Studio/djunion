'use client';

import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { 
  Radio, 
  Upload, 
  Mic, 
  Music, 
  Palette, 
  DollarSign, 
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Profile Setup', icon: Radio },
  { id: 2, title: 'Stream Type', icon: Mic },
  { id: 3, title: 'Music Library', icon: Music },
  { id: 4, title: 'Branding', icon: Palette },
  { id: 5, title: 'Monetization', icon: DollarSign }
];

function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    stationName: '',
    description: '',
    genre: '',
    streamType: '',
    hasMusic: false,
    brandColor: '#00D084',
    logo: null,
    monetization: 'ads'
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      window.location.href = '/dashboard';
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Set up your broadcaster profile</h2>
              <p className="text-gray-600">Tell us about your station and what you'll be broadcasting.</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="stationName">Station Name</Label>
                <Input
                  id="stationName"
                  placeholder="e.g., Hot 97.5 FM, Indie Vibes Radio"
                  value={formData.stationName}
                  onChange={(e) => handleInputChange('stationName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of your station"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="genre">Primary Genre</Label>
                <Input
                  id="genre"
                  placeholder="e.g., Hip-Hop, Rock, Electronic, Talk"
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose your streaming style</h2>
              <p className="text-gray-600">How do you plan to broadcast your content?</p>
            </div>
            <RadioGroup
              value={formData.streamType}
              onValueChange={(value) => handleInputChange('streamType', value)}
              className="grid gap-4"
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="live" id="live" />
                <div className="flex-1">
                  <Label htmlFor="live" className="font-medium">Live Broadcasting</Label>
                  <p className="text-sm text-gray-600">Stream live with real-time DJ controls</p>
                </div>
                <Mic className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="playlist" id="playlist" />
                <div className="flex-1">
                  <Label htmlFor="playlist" className="font-medium">Automated Playlists</Label>
                  <p className="text-sm text-gray-600">Schedule playlists to play automatically</p>
                </div>
                <Music className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="hybrid" id="hybrid" />
                <div className="flex-1">
                  <Label htmlFor="hybrid" className="font-medium">Hybrid (Both)</Label>
                  <p className="text-sm text-gray-600">Mix of live shows and automated content</p>
                </div>
                <Radio className="h-5 w-5 text-gray-400" />
              </div>
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Set up your music library</h2>
              <p className="text-gray-600">Upload your tracks or connect to your existing music collection.</p>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#00D084] transition-colors">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Music Files</h3>
              <p className="text-gray-600 mb-4">Drag and drop MP3 files or click to browse</p>
              <Button variant="outline">
                Choose Files
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-sm">Supported Formats</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">MP3</Badge>
                    <Badge variant="secondary">WAV</Badge>
                    <Badge variant="secondary">FLAC</Badge>
                    <Badge variant="secondary">AAC</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="p-4">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-sm">Free Plan Limits</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-sm text-gray-600">Up to 1GB storage</p>
                  <p className="text-sm text-gray-600">~250 songs</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Customize your station branding</h2>
              <p className="text-gray-600">Make your station stand out with custom colors and logo.</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="brandColor">Brand Color</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <input
                    type="color"
                    id="brandColor"
                    value={formData.brandColor}
                    onChange={(e) => handleInputChange('brandColor', e.target.value)}
                    className="w-12 h-12 rounded border-2 border-gray-300"
                  />
                  <Input
                    value={formData.brandColor}
                    onChange={(e) => handleInputChange('brandColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label>Station Logo</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#00D084] transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload logo</p>
                  <Button variant="outline" size="sm">
                    Browse
                  </Button>
                </div>
              </div>
            </div>
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div 
                  className="rounded-lg p-6 text-white"
                  style={{ backgroundColor: formData.brandColor }}
                >
                  <div className="flex items-center space-x-3">
                    <Radio className="h-8 w-8" />
                    <div>
                      <h3 className="font-bold text-lg">{formData.stationName || 'Your Station'}</h3>
                      <p className="opacity-90">{formData.description || 'Your station description'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose your monetization strategy</h2>
              <p className="text-gray-600">Start earning from your broadcasts right away.</p>
            </div>
            <RadioGroup
              value={formData.monetization}
              onValueChange={(value) => handleInputChange('monetization', value)}
              className="grid gap-4"
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="ads" id="ads" />
                <div className="flex-1">
                  <Label htmlFor="ads" className="font-medium">DJ Union Ad Network</Label>
                  <p className="text-sm text-gray-600">Earn revenue from pre-roll and mid-roll ads</p>
                  <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
                    Recommended
                  </Badge>
                </div>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="sponsored" id="sponsored" />
                <div className="flex-1">
                  <Label htmlFor="sponsored" className="font-medium">Sponsored Content</Label>
                  <p className="text-sm text-gray-600">Upload your own sponsored ads and promotions</p>
                </div>
                <Upload className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="none" id="none" />
                <div className="flex-1">
                  <Label htmlFor="none" className="font-medium">Ad-Free (For Now)</Label>
                  <p className="text-sm text-gray-600">Start without ads, enable monetization later</p>
                </div>
                <CheckCircle className="h-5 w-5 text-gray-400" />
              </div>
            </RadioGroup>
            {formData.monetization === 'ads' && (
              <Card className="p-4 bg-green-50 border-green-200">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-3">
                    <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Instant Revenue</h4>
                      <p className="text-sm text-green-700">
                        Start earning immediately with our premium ad network. Average CPM: $2-8
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="h-6 w-6 text-[#00D084]" />
              <span className="font-bold text-lg">DJ Union</span>
            </div>
            <div className="text-sm text-gray-600">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive 
                      ? 'bg-[#00D084] text-white' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-200' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <Button
            onClick={handleNext}
            className="bg-[#00D084] hover:bg-[#00B070] flex items-center space-x-2"
          >
            <span>{currentStep === steps.length ? 'Complete Setup' : 'Continue'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D084]"></div>
      </div>
    }>
      <OnboardingFlow />
    </Suspense>
  );
}
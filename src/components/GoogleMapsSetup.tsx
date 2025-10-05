// Google Maps Setup Helper Component

import { useState } from 'react';
import { AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleMapsSetupProps {
  className?: string;
}

export function GoogleMapsSetup({ className }: GoogleMapsSetupProps) {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState('');

  const steps = [
    {
      title: "Get Google Cloud Account",
      description: "Go to Google Cloud Console and create/select a project",
      action: "Open Google Cloud Console",
      link: "https://console.cloud.google.com/"
    },
    {
      title: "Enable APIs",
      description: "Enable Maps JavaScript API, Places API, and Geocoding API",
      action: "Go to API Library",
      link: "https://console.cloud.google.com/apis/library"
    },
    {
      title: "Create API Key",
      description: "Create credentials and copy your API key",
      action: "Create Credentials",
      link: "https://console.cloud.google.com/apis/credentials"
    },
    {
      title: "Add to Project",
      description: "Paste your API key in the configuration file",
      action: "Configure API Key",
      link: null
    }
  ];

  const handleCopyInstructions = () => {
    const instructions = `
// In src/config/maps.ts, replace 'YOUR_API_KEY_HERE' with your actual API key:

export const MAPS_CONFIG = {
  API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '${apiKey || 'YOUR_ACTUAL_API_KEY'}',
  // ... rest of config
};
    `;
    navigator.clipboard.writeText(instructions);
  };

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <div className="glass-card rounded-3xl p-8">
        <div className="text-center mb-8">
          <AlertCircle className="w-16 h-16 text-neon-orange mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Google Maps Setup</h2>
          <p className="text-muted-foreground">Follow these steps to enable Google Maps in your app</p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((stepInfo, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4 p-4 rounded-2xl transition-all duration-300',
                step > index + 1 ? 'bg-success/20 border border-success/30' :
                step === index + 1 ? 'bg-primary/20 border border-primary/30' :
                'bg-muted/20 border border-muted/30'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                step > index + 1 ? 'bg-success text-success-foreground' :
                step === index + 1 ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              )}>
                {step > index + 1 ? <CheckCircle className="w-4 h-4" /> : index + 1}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">{stepInfo.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{stepInfo.description}</p>
                
                {stepInfo.link && (
                  <a
                    href={stepInfo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-all duration-300 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {stepInfo.action}
                  </a>
                )}

                {index === 3 && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Paste your API key here:
                      </label>
                      <input
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-3 py-2 rounded-xl bg-input border border-card-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    
                    {apiKey && (
                      <div className="p-4 bg-muted/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Configuration Code:</span>
                          <button
                            onClick={handleCopyInstructions}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30 transition-all duration-300"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        </div>
                        <code className="text-xs text-neon-lime block">
                          API_KEY: '{apiKey.substring(0, 20)}...'
                        </code>
                        <p className="text-xs text-muted-foreground mt-2">
                          Replace 'YOUR_API_KEY_HERE' in src/config/maps.ts with your API key
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {step === index + 1 && (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/80 transition-all duration-300 text-sm"
                >
                  Done
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Quick Setup Option */}
        <div className="mt-8 p-4 bg-info/20 border border-info/30 rounded-2xl">
          <h3 className="font-semibold text-white mb-2">Quick Setup (For Testing)</h3>
          <p className="text-sm text-muted-foreground mb-3">
            You can temporarily add your API key directly to the config file:
          </p>
          <div className="bg-muted/20 p-3 rounded-xl">
            <code className="text-xs text-neon-lime">
              // In src/config/maps.ts<br/>
              API_KEY: 'YOUR_ACTUAL_API_KEY_HERE'
            </code>
          </div>
        </div>

        {/* Security Warning */}
        <div className="mt-6 p-4 bg-warning/20 border border-warning/30 rounded-2xl">
          <h3 className="font-semibold text-white mb-2">🔒 Security Important!</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Restrict your API key to your domain in Google Cloud Console</li>
            <li>• Monitor usage to avoid unexpected charges</li>
            <li>• Never commit API keys to public repositories</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


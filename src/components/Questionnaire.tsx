'use client';

import { useState } from 'react';

export interface QuestionnaireData {
  businessDescription: string;
  businessModel: string;
  targetMarket: string;
  location: string;
  locationType: string;
  investmentLevel?: string;
  timeline?: string;
  uniqueAdvantage?: string;
}

interface Props {
  onSubmit: (data: QuestionnaireData) => void;
  isLoading?: boolean;
}

const BUSINESS_MODELS = [
  { value: 'product-sales', label: 'Sell products (one-time purchase)' },
  { value: 'services', label: 'Sell services (hourly/project)' },
  { value: 'subscription', label: 'Subscription/membership' },
  { value: 'marketplace', label: 'Marketplace/platform (take a cut)' },
  { value: 'freemium', label: 'Freemium (free + premium)' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'other', label: 'Other' },
];

const LOCATION_TYPES = [
  { value: 'local', label: 'Local (specific city/region)' },
  { value: 'regional', label: 'Regional (state/multi-state)' },
  { value: 'national', label: 'National' },
  { value: 'international', label: 'International/Global' },
  { value: 'online', label: 'Online only' },
];

const INVESTMENT_LEVELS = [
  { value: 'bootstrap', label: 'Bootstrap ($0-$5K)' },
  { value: 'small', label: 'Small ($5K-$25K)' },
  { value: 'medium', label: 'Medium ($25K-$100K)' },
  { value: 'large', label: 'Large ($100K-$500K)' },
  { value: 'venture', label: 'Venture scale ($500K+)' },
  { value: 'unsure', label: 'Not sure yet' },
];

const TIMELINES = [
  { value: 'operating', label: 'Already operating' },
  { value: '3-months', label: 'Within 3 months' },
  { value: '6-months', label: '3-6 months' },
  { value: '12-months', label: '6-12 months' },
  { value: 'exploring', label: 'Just exploring' },
];

export function Questionnaire({ onSubmit, isLoading }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuestionnaireData>({
    businessDescription: '',
    businessModel: '',
    targetMarket: '',
    location: '',
    locationType: '',
    investmentLevel: '',
    timeline: '',
    uniqueAdvantage: '',
  });

  const updateField = (field: keyof QuestionnaireData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return data.businessDescription.length >= 20;
      case 2: return data.businessModel !== '';
      case 3: return data.targetMarket.length >= 10;
      case 4: return data.locationType !== '' && (data.locationType !== 'local' || data.location !== '');
      default: return true;
    }
  };

  const handleSubmit = () => {
    onSubmit(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Step {step} of 7</span>
          <span>{Math.round((step / 7) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="card">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Describe your business idea</h2>
            <p className="text-gray-400">In 2-3 sentences, what will you sell or offer, and to whom?</p>
            <textarea
              className="input min-h-[120px] resize-none"
              placeholder="Example: I want to open a mobile dog grooming service targeting busy professionals in Nashville who don't have time to take their dogs to traditional groomers."
              value={data.businessDescription}
              onChange={(e) => updateField('businessDescription', e.target.value)}
              maxLength={500}
            />
            <div className="text-sm text-gray-500 text-right">
              {data.businessDescription.length}/500
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">How will you make money?</h2>
            <p className="text-gray-400">Select your primary business model</p>
            <div className="space-y-2">
              {BUSINESS_MODELS.map(model => (
                <label 
                  key={model.value}
                  className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-colors ${
                    data.businessModel === model.value 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="businessModel"
                    value={model.value}
                    checked={data.businessModel === model.value}
                    onChange={(e) => updateField('businessModel', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    data.businessModel === model.value ? 'border-blue-500' : 'border-gray-500'
                  }`}>
                    {data.businessModel === model.value && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <span>{model.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Who is your ideal customer?</h2>
            <p className="text-gray-400">Consider age, income, location, profession, interests</p>
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="Example: Busy professionals aged 30-50, household income $75K+, live in urban/suburban areas, own dogs, value convenience over cost..."
              value={data.targetMarket}
              onChange={(e) => updateField('targetMarket', e.target.value)}
              maxLength={300}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Where will you operate?</h2>
            <div className="space-y-2">
              {LOCATION_TYPES.map(loc => (
                <label 
                  key={loc.value}
                  className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-colors ${
                    data.locationType === loc.value 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="locationType"
                    value={loc.value}
                    checked={data.locationType === loc.value}
                    onChange={(e) => updateField('locationType', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    data.locationType === loc.value ? 'border-blue-500' : 'border-gray-500'
                  }`}>
                    {data.locationType === loc.value && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <span>{loc.label}</span>
                </label>
              ))}
            </div>
            {data.locationType === 'local' && (
              <input
                className="input mt-4"
                placeholder="Enter city or region..."
                value={data.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Investment level (optional)</h2>
            <p className="text-gray-400">How much are you planning to invest initially?</p>
            <div className="space-y-2">
              {INVESTMENT_LEVELS.map(level => (
                <label 
                  key={level.value}
                  className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-colors ${
                    data.investmentLevel === level.value 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="investmentLevel"
                    value={level.value}
                    checked={data.investmentLevel === level.value}
                    onChange={(e) => updateField('investmentLevel', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    data.investmentLevel === level.value ? 'border-blue-500' : 'border-gray-500'
                  }`}>
                    {data.investmentLevel === level.value && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <span>{level.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Timeline (optional)</h2>
            <p className="text-gray-400">When do you want to launch?</p>
            <div className="space-y-2">
              {TIMELINES.map(t => (
                <label 
                  key={t.value}
                  className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-colors ${
                    data.timeline === t.value 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="timeline"
                    value={t.value}
                    checked={data.timeline === t.value}
                    onChange={(e) => updateField('timeline', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    data.timeline === t.value ? 'border-blue-500' : 'border-gray-500'
                  }`}>
                    {data.timeline === t.value && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">What makes you different? (optional)</h2>
            <p className="text-gray-400">What's your unique advantage over existing options?</p>
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="Example: We come to their home, use eco-friendly products, and offer subscription packages with automatic scheduling..."
              value={data.uniqueAdvantage}
              onChange={(e) => updateField('uniqueAdvantage', e.target.value)}
              maxLength={300}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            ← Back
          </button>
          
          {step < 7 ? (
            <button
              className="btn"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="spinner" /> Generating...
                </span>
              ) : (
                '🚀 Generate Business Plan'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

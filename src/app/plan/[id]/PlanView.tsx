'use client';

import { useState } from 'react';
import { BusinessPlan } from '@/lib/db/schema';

interface Props {
  plan: BusinessPlan;
}

type SectionKey = 
  | 'executiveSummary'
  | 'marketAnalysis'
  | 'competitiveAnalysis'
  | 'customerAnalysis'
  | 'financialProjections'
  | 'marketingStrategy'
  | 'operationsPlan'
  | 'riskAnalysis'
  | 'legalCompliance';

const SECTIONS: { key: SectionKey; title: string; icon: string }[] = [
  { key: 'executiveSummary', title: 'Executive Summary', icon: '📋' },
  { key: 'marketAnalysis', title: 'Market Analysis', icon: '📊' },
  { key: 'competitiveAnalysis', title: 'Competitive Analysis', icon: '⚔️' },
  { key: 'customerAnalysis', title: 'Customer Personas', icon: '👥' },
  { key: 'financialProjections', title: 'Financial Projections', icon: '💰' },
  { key: 'marketingStrategy', title: 'Marketing Strategy', icon: '📢' },
  { key: 'operationsPlan', title: 'Operations Plan', icon: '⚙️' },
  { key: 'riskAnalysis', title: 'Risk Analysis', icon: '⚠️' },
  { key: 'legalCompliance', title: 'Legal & Compliance', icon: '⚖️' },
];

export function PlanView({ plan }: Props) {
  const [activeSection, setActiveSection] = useState<SectionKey>('executiveSummary');
  const [isPrintMode, setIsPrintMode] = useState(false);
  const confidence = (plan.confidence as Record<string, number>) || {};
  
  // Handle PDF export - show all sections then print
  const handleExportPDF = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 100);
  };

  // Check if plan is still generating
  if (plan.status === 'generating') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{width: 40, height: 40}} />
          <h2 className="text-xl">Plan is still generating...</h2>
          <p className="text-gray-400 mt-2">Refresh in a few seconds</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    // Try both camelCase and snake_case versions for backward compatibility
    const section = plan[activeSection] as Record<string, unknown> | null;
    if (!section) {
      return <p className="text-gray-400">This section is not available. Plan status: {plan.status}</p>;
    }

    if (activeSection === 'executiveSummary') {
      return (
        <div className="prose prose-invert max-w-none">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {(section as any).content || JSON.stringify(section)}
          </p>
        </div>
      );
    }

    // Render JSON sections nicely
    return <SectionRenderer data={section} />;
  };

  const getConfidenceBadge = (key: SectionKey) => {
    const conf = confidence[key];
    if (!conf) return null;
    
    const color = conf >= 0.8 ? 'success' : conf >= 0.6 ? 'warning' : 'error';
    const label = conf >= 0.8 ? 'High' : conf >= 0.6 ? 'Medium' : 'Low';
    
    return (
      <span className={`badge ${color}`}>
        {label} confidence
      </span>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Business Plan</h1>
              <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                {plan.businessDescription.slice(0, 100)}...
              </p>
            </div>
            <div className="flex gap-2 no-print">
              <button className="btn" onClick={handleExportPDF}>
                📄 Export PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <nav className="w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">SECTIONS</h2>
            <ul className="space-y-1">
              {SECTIONS.map(({ key, title, icon }) => (
                <li key={key}>
                  <button
                    onClick={() => setActiveSection(key)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      activeSection === key
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <span>{icon}</span>
                    <span className="flex-1">{title}</span>
                    {!!plan[key as keyof typeof plan] && (
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {isPrintMode ? (
            /* Print Mode: Show ALL sections */
            <div className="print-content">
              <h1 className="text-3xl font-bold mb-2 print-title">Business Plan</h1>
              <p className="text-gray-400 mb-8 print-subtitle">{plan.businessDescription}</p>
              
              {SECTIONS.map(({ key, title, icon }) => {
                const section = plan[key] as Record<string, unknown> | null;
                if (!section) return null;
                
                return (
                  <div key={key} className="mb-8 print-section">
                    <h2 className="text-2xl font-bold mb-4 print-section-title">
                      {icon} {title}
                    </h2>
                    {key === 'executiveSummary' ? (
                      <p className="text-lg leading-relaxed whitespace-pre-wrap">
                        {(section as any).content || JSON.stringify(section)}
                      </p>
                    ) : (
                      <SectionRenderer data={section} />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Normal Mode: Show active section only */
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {SECTIONS.find(s => s.key === activeSection)?.icon}{' '}
                  {SECTIONS.find(s => s.key === activeSection)?.title}
                </h2>
                {getConfidenceBadge(activeSection)}
              </div>
              
              {renderSection()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SectionRenderer({ data }: { data: Record<string, unknown> }) {
  const renderValue = (value: unknown, depth = 0): React.ReactNode => {
    if (value === null || value === undefined) return null;
    
    if (typeof value === 'string' || typeof value === 'number') {
      return <span>{String(value)}</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      
      // Check if it's an array of objects or simple values
      if (typeof value[0] === 'object' && value[0] !== null) {
        return (
          <div className="space-y-4">
            {value.map((item, i) => (
              <div key={i} className="card bg-gray-800/50 p-4">
                <SectionRenderer data={item as Record<string, unknown>} />
              </div>
            ))}
          </div>
        );
      }
      
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, i) => (
            <li key={i} className="text-gray-300">{String(item)}</li>
          ))}
        </ul>
      );
    }
    
    if (typeof value === 'object') {
      return <SectionRenderer data={value as Record<string, unknown>} />;
    }
    
    return String(value);
  };

  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Filter out confidence and other meta fields
  const entries = Object.entries(data).filter(
    ([key]) => !['confidence', 'sources'].includes(key)
  );

  return (
    <div className="space-y-6">
      {entries.map(([key, value]) => (
        <div key={key}>
          <h3 className="text-lg font-semibold text-blue-400 mb-2">
            {formatKey(key)}
          </h3>
          <div className="text-gray-300">
            {renderValue(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

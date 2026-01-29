'use client';

import { useState } from 'react';
import { Questionnaire, QuestionnaireData } from '@/components/Questionnaire';

type PlanStatus = 'idle' | 'generating' | 'complete' | 'error';

interface AgentStatus {
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  section?: string;
}

export default function Home() {
  const [status, setStatus] = useState<PlanStatus>('idle');
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: QuestionnaireData) => {
    setStatus('generating');
    setError(null);
    
    // Initialize agent statuses
    const initialAgents: AgentStatus[] = [
      { name: 'Market Research', status: 'pending' },
      { name: 'Competitor Analysis', status: 'pending' },
      { name: 'Customer Personas', status: 'pending' },
      { name: 'Financial Model', status: 'pending' },
      { name: 'Go-to-Market', status: 'pending' },
      { name: 'Operations', status: 'pending' },
      { name: 'Risk Assessment', status: 'pending' },
      { name: 'Legal & Compliance', status: 'pending' },
    ];
    setAgents(initialAgents);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
        
        for (const line of lines) {
          const data = JSON.parse(line.slice(6));
          
          if (data.type === 'plan_created') {
            setPlanId(data.planId);
          } else if (data.type === 'agent_start') {
            setAgents(prev => prev.map(a => 
              a.name === data.agent ? { ...a, status: 'running' } : a
            ));
          } else if (data.type === 'agent_complete') {
            setAgents(prev => prev.map(a => 
              a.name === data.agent ? { ...a, status: 'complete', section: data.section } : a
            ));
          } else if (data.type === 'agent_error') {
            setAgents(prev => prev.map(a => 
              a.name === data.agent ? { ...a, status: 'error' } : a
            ));
          } else if (data.type === 'complete') {
            setStatus('complete');
          }
        }
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  if (status === 'idle') {
    return (
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              ✨ Catalyst AI
            </h1>
            <p className="text-xl text-gray-400">
              Generate a comprehensive business plan in minutes
            </p>
          </div>
          
          <Questionnaire onSubmit={handleSubmit} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">
            {status === 'generating' ? '🔄 Generating Your Plan...' : 
             status === 'complete' ? '✅ Plan Complete!' :
             '❌ Error'}
          </h1>
          {status === 'generating' && (
            <p className="text-gray-400">Our AI agents are researching and building your plan</p>
          )}
        </div>

        {/* Agent Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {agents.map(agent => (
            <div key={agent.name} className="card text-center">
              <div className="mb-2">
                {agent.status === 'pending' && <span className="text-2xl">⏳</span>}
                {agent.status === 'running' && <div className="spinner mx-auto" />}
                {agent.status === 'complete' && <span className="text-2xl">✅</span>}
                {agent.status === 'error' && <span className="text-2xl">❌</span>}
              </div>
              <div className="text-sm font-medium">{agent.name}</div>
              <div className={`text-xs mt-1 ${
                agent.status === 'complete' ? 'text-green-400' :
                agent.status === 'running' ? 'text-blue-400' :
                agent.status === 'error' ? 'text-red-400' :
                'text-gray-500'
              }`}>
                {agent.status}
              </div>
            </div>
          ))}
        </div>

        {status === 'complete' && planId && (
          <div className="text-center">
            <a 
              href={`/plan/${planId}`}
              className="btn inline-block"
            >
              View Your Business Plan →
            </a>
          </div>
        )}

        {error && (
          <div className="card border-red-500/50 text-center">
            <p className="text-red-400">{error}</p>
            <button 
              className="btn mt-4"
              onClick={() => setStatus('idle')}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

import { db, businessPlans, BusinessPlan } from '@/lib/db';
import { desc } from 'drizzle-orm';

export default async function DebugPage() {
  let plans: BusinessPlan[] = [];
  let error: string | null = null;
  
  try {
    plans = await db.query.businessPlans.findMany({
      orderBy: desc(businessPlans.createdAt),
      limit: 3
    });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
    plans = [];
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug - Recent Plans</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="space-y-6">
        {plans.map((plan, index) => (
          <div key={plan.id} className="bg-gray-100 p-4 rounded border">
            <h2 className="font-bold text-lg mb-2">Plan #{index + 1}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>ID:</strong> {plan.id}
              </div>
              <div>
                <strong>Status:</strong> {plan.status}
              </div>
              <div className="col-span-2">
                <strong>Description:</strong> {plan.businessDescription.slice(0, 150)}...
              </div>
              <div>
                <strong>Created:</strong> {plan.createdAt?.toISOString()}
              </div>
              <div>
                <strong>Completed:</strong> {plan.completedAt?.toISOString() || 'N/A'}
              </div>
            </div>
            
            <h3 className="font-semibold mt-4 mb-2">Sections Status:</h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                'executiveSummary',
                'marketAnalysis', 
                'competitiveAnalysis',
                'customerAnalysis',
                'financialProjections',
                'marketingStrategy',
                'operationsPlan',
                'riskAnalysis',
                'legalCompliance'
              ].map(section => (
                <div key={section} className={`p-2 rounded ${
                  plan[section as keyof typeof plan] ? 'bg-green-200' : 'bg-red-200'
                }`}>
                  {section}: {plan[section as keyof typeof plan] ? '✓' : '✗'}
                </div>
              ))}
            </div>
            
            <h3 className="font-semibold mt-4 mb-2">Confidence:</h3>
            <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(plan.confidence, null, 2)}
            </pre>
            
            <h3 className="font-semibold mt-4 mb-2">Executive Summary (first 200 chars):</h3>
            <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(plan.executiveSummary, null, 2)?.slice(0, 200)}...
            </pre>
          </div>
        ))}
        
        {plans.length === 0 && !error && (
          <p>No plans found in database.</p>
        )}
      </div>
    </div>
  );
}
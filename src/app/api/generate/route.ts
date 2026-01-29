import { NextRequest } from 'next/server';
import { db, businessPlans, agentRuns } from '@/lib/db';
import { runAgents, generateExecutiveSummary } from '@/agents/orchestrator';
import { QuestionnaireData } from '@/components/Questionnaire';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 120; // 2 minute timeout

export async function POST(request: NextRequest) {
  const data: QuestionnaireData = await request.json();

  // Create a readable stream for SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        // Create plan record
        const planId = uuidv4();
        
        await db.insert(businessPlans).values({
          id: planId,
          businessDescription: data.businessDescription,
          businessModel: data.businessModel,
          targetMarket: data.targetMarket,
          location: data.location || '',
          locationType: data.locationType,
          investmentLevel: data.investmentLevel,
          timeline: data.timeline,
          uniqueAdvantage: data.uniqueAdvantage,
          status: 'generating',
        });

        send({ type: 'plan_created', planId });

        // Run all agents
        const results = await runAgents(data, send);

        // Generate executive summary
        const executiveSummary = await generateExecutiveSummary(data, results);

        // Build sections object
        const sections: Record<string, unknown> = {};
        const confidence: Record<string, number> = {};
        
        for (const [key, result] of results) {
          if (result.status === 'complete' && result.data) {
            sections[key] = result.data;
            confidence[key] = result.confidence || 0.7;
          }
        }

        // Update plan with results
        await db.update(businessPlans)
          .set({
            executiveSummary: { content: executiveSummary },
            marketAnalysis: sections.marketAnalysis || null,
            competitiveAnalysis: sections.competitiveAnalysis || null,
            customerAnalysis: sections.customerAnalysis || null,
            financialProjections: sections.financialProjections || null,
            marketingStrategy: sections.marketingStrategy || null,
            operationsPlan: sections.operationsPlan || null,
            riskAnalysis: sections.riskAnalysis || null,
            legalCompliance: sections.legalCompliance || null,
            confidence,
            status: 'complete',
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where({ id: planId } as any);

        // Log agent runs
        for (const [key, result] of results) {
          await db.insert(agentRuns).values({
            planId,
            agentType: result.agent,
            status: result.status,
            output: result.data || null,
            error: result.error || null,
            completedAt: new Date(),
          });
        }

        send({ type: 'complete', planId });
      } catch (error) {
        console.error('Generation error:', error);
        send({ 
          type: 'error', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

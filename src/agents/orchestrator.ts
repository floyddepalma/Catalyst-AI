import Anthropic from '@anthropic-ai/sdk';
import { QuestionnaireData } from '@/components/Questionnaire';

const anthropic = new Anthropic();

export interface AgentResult {
  agent: string;
  status: 'complete' | 'error';
  data?: Record<string, unknown>;
  error?: string;
  confidence?: number;
  sources?: string[];
}

type StreamCallback = (event: {
  type: string;
  agent?: string;
  section?: string;
  planId?: string;
}) => void;

const AGENT_CONFIGS = [
  {
    name: 'Market Research',
    key: 'marketAnalysis',
    prompt: (data: QuestionnaireData) => `You are a market research analyst. Analyze the market for this business:

Business: ${data.businessDescription}
Business Model: ${data.businessModel}
Target Market: ${data.targetMarket}
Location: ${data.locationType}${data.location ? ` - ${data.location}` : ''}

Provide a comprehensive market analysis including:
1. Industry Overview - Current state and trends
2. Market Size - TAM (Total Addressable Market), SAM (Serviceable), SOM (Obtainable)
3. Growth Trends - Industry growth rate and projections
4. Market Drivers - Key factors driving growth
5. Challenges - Potential headwinds

Return as JSON with structure:
{
  "industryOverview": "string",
  "marketSize": { "tam": "string", "sam": "string", "som": "string" },
  "growthRate": "string",
  "trends": ["string"],
  "drivers": ["string"],
  "challenges": ["string"],
  "confidence": 0.0-1.0
}`
  },
  {
    name: 'Competitor Analysis',
    key: 'competitiveAnalysis',
    prompt: (data: QuestionnaireData) => `You are a competitive intelligence analyst. Analyze competitors for this business:

Business: ${data.businessDescription}
Business Model: ${data.businessModel}
Location: ${data.locationType}${data.location ? ` - ${data.location}` : ''}
Unique Advantage: ${data.uniqueAdvantage || 'Not specified'}

Provide comprehensive competitive analysis:
1. Direct Competitors - Similar businesses in the space
2. Indirect Competitors - Alternative solutions
3. Competitive Positioning - Where this business fits
4. Differentiation Strategy - How to stand out
5. SWOT Analysis

Return as JSON:
{
  "directCompetitors": [{ "name": "string", "strengths": ["string"], "weaknesses": ["string"] }],
  "indirectCompetitors": ["string"],
  "positioning": "string",
  "differentiators": ["string"],
  "swot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
  "confidence": 0.0-1.0
}`
  },
  {
    name: 'Customer Personas',
    key: 'customerAnalysis',
    prompt: (data: QuestionnaireData) => `You are a customer research specialist. Create detailed customer personas for:

Business: ${data.businessDescription}
Target Market: ${data.targetMarket}
Business Model: ${data.businessModel}

Create 2-3 detailed customer personas including:
1. Demographics - Age, income, location, profession
2. Psychographics - Values, interests, lifestyle
3. Pain Points - Problems they face
4. Goals - What they're trying to achieve
5. Buying Behavior - How they make purchase decisions
6. Jobs to Be Done - Tasks they hire products/services for

Return as JSON:
{
  "personas": [
    {
      "name": "string (descriptive name like 'Busy Professional Parent')",
      "demographics": { "age": "string", "income": "string", "location": "string", "profession": "string" },
      "psychographics": ["string"],
      "painPoints": ["string"],
      "goals": ["string"],
      "buyingBehavior": "string",
      "jobsToBeDone": ["string"]
    }
  ],
  "confidence": 0.0-1.0
}`
  },
  {
    name: 'Financial Model',
    key: 'financialProjections',
    prompt: (data: QuestionnaireData) => `You are a financial analyst. Create financial projections for:

Business: ${data.businessDescription}
Business Model: ${data.businessModel}
Investment Level: ${data.investmentLevel || 'Not specified'}
Timeline: ${data.timeline || 'Not specified'}
Location: ${data.locationType}${data.location ? ` - ${data.location}` : ''}

Provide 3-year financial projections including:
1. Startup Costs - Initial investment breakdown
2. Revenue Projections - Year 1, 2, 3
3. Operating Expenses - Monthly/annual costs
4. Unit Economics - Revenue per customer, CAC, LTV
5. Break-even Analysis
6. Funding Requirements

Return as JSON:
{
  "startupCosts": { "total": "string", "breakdown": [{ "item": "string", "cost": "string" }] },
  "revenueProjections": { "year1": "string", "year2": "string", "year3": "string" },
  "operatingExpenses": { "monthly": "string", "breakdown": [{ "item": "string", "cost": "string" }] },
  "unitEconomics": { "revenuePerCustomer": "string", "cac": "string", "ltv": "string", "ltvCacRatio": "string" },
  "breakeven": { "timeline": "string", "unitsRequired": "string" },
  "fundingNeeds": "string",
  "confidence": 0.0-1.0
}`
  },
  {
    name: 'Go-to-Market',
    key: 'marketingStrategy',
    prompt: (data: QuestionnaireData) => `You are a marketing strategist. Create a go-to-market strategy for:

Business: ${data.businessDescription}
Target Market: ${data.targetMarket}
Business Model: ${data.businessModel}
Location: ${data.locationType}${data.location ? ` - ${data.location}` : ''}
Investment Level: ${data.investmentLevel || 'Not specified'}

Provide comprehensive marketing strategy:
1. Brand Positioning - Core message and value proposition
2. Marketing Channels - Prioritized channels for customer acquisition
3. Content Strategy - Types of content to create
4. Launch Plan - First 90 days
5. Customer Acquisition - Tactics and estimated costs
6. Retention Strategy - How to keep customers

Return as JSON:
{
  "positioning": "string",
  "valueProposition": "string",
  "channels": [{ "channel": "string", "priority": "high/medium/low", "tactics": ["string"] }],
  "contentStrategy": ["string"],
  "launchPlan": { "week1": "string", "week2_4": "string", "month2_3": "string" },
  "acquisitionCost": "string",
  "retentionStrategy": ["string"],
  "confidence": 0.0-1.0
}`
  },
  {
    name: 'Operations',
    key: 'operationsPlan',
    prompt: (data: QuestionnaireData) => `You are an operations consultant. Create an operations plan for:

Business: ${data.businessDescription}
Business Model: ${data.businessModel}
Location: ${data.locationType}${data.location ? ` - ${data.location}` : ''}
Timeline: ${data.timeline || 'Not specified'}

Provide detailed operations plan:
1. Key Activities - Core business activities
2. Key Resources - What you need to operate
3. Key Partnerships - Vendors, suppliers, partners
4. Technology Stack - Tools and systems needed
5. Processes - Key operational processes
6. Quality Control - How to maintain quality
7. Scaling Plan - How operations scale with growth

Return as JSON:
{
  "keyActivities": ["string"],
  "keyResources": { "physical": ["string"], "human": ["string"], "financial": ["string"], "intellectual": ["string"] },
  "partnerships": [{ "type": "string", "purpose": "string" }],
  "technology": ["string"],
  "processes": [{ "name": "string", "description": "string" }],
  "qualityControl": ["string"],
  "scalingPlan": "string",
  "confidence": 0.0-1.0
}`
  },
  {
    name: 'Risk Assessment',
    key: 'riskAnalysis',
    prompt: (data: QuestionnaireData) => `You are a risk analyst. Assess risks for:

Business: ${data.businessDescription}
Business Model: ${data.businessModel}
Location: ${data.locationType}${data.location ? ` - ${data.location}` : ''}
Investment Level: ${data.investmentLevel || 'Not specified'}

Identify and assess risks:
1. Market Risks - Market acceptance, competition
2. Financial Risks - Cash flow, funding
3. Operational Risks - Execution challenges
4. Regulatory Risks - Legal/compliance issues
5. Technology Risks - Technical challenges
6. Mitigation Strategies - How to address each risk

Return as JSON:
{
  "risks": [
    {
      "category": "string",
      "risk": "string",
      "likelihood": "high/medium/low",
      "impact": "high/medium/low",
      "mitigation": "string"
    }
  ],
  "topRisks": ["string"],
  "contingencyPlans": ["string"],
  "confidence": 0.0-1.0
}`
  },
  {
    name: 'Legal & Compliance',
    key: 'legalCompliance',
    prompt: (data: QuestionnaireData) => `You are a business legal consultant. Provide legal/compliance guidance for:

Business: ${data.businessDescription}
Business Model: ${data.businessModel}
Location: ${data.locationType}${data.location ? ` - ${data.location}` : ''}

Cover these areas:
1. Business Structure - Recommended entity type (LLC, Corp, etc.)
2. Licenses & Permits - Required registrations
3. Industry Regulations - Specific compliance requirements
4. Contracts Needed - Key legal documents
5. Insurance - Required/recommended coverage
6. Intellectual Property - Trademark, patent considerations

Return as JSON:
{
  "recommendedStructure": { "type": "string", "reasoning": "string" },
  "licensesPermits": [{ "name": "string", "description": "string", "cost": "string" }],
  "regulations": ["string"],
  "contractsNeeded": ["string"],
  "insurance": [{ "type": "string", "purpose": "string" }],
  "intellectualProperty": ["string"],
  "disclaimer": "This is general guidance, not legal advice. Consult an attorney.",
  "confidence": 0.0-1.0
}`
  }
];

export async function runAgents(
  data: QuestionnaireData,
  onStream: StreamCallback
): Promise<Map<string, AgentResult>> {
  const results = new Map<string, AgentResult>();
  
  // Run all agents in parallel
  const agentPromises = AGENT_CONFIGS.map(async (config) => {
    onStream({ type: 'agent_start', agent: config.name });
    
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: config.prompt(data)
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      // Parse JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      results.set(config.key, {
        agent: config.name,
        status: 'complete',
        data: parsed,
        confidence: parsed.confidence || 0.7
      });

      onStream({ type: 'agent_complete', agent: config.name, section: config.key });
    } catch (error) {
      console.error(`Agent ${config.name} failed:`, error);
      results.set(config.key, {
        agent: config.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      onStream({ type: 'agent_error', agent: config.name });
    }
  });

  await Promise.all(agentPromises);
  
  return results;
}

export async function generateExecutiveSummary(
  data: QuestionnaireData,
  sections: Map<string, AgentResult>
): Promise<string> {
  const sectionSummaries = Array.from(sections.entries())
    .filter(([_, result]) => result.status === 'complete')
    .map(([key, result]) => `${key}: ${JSON.stringify(result.data).slice(0, 500)}...`)
    .join('\n\n');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Write an executive summary for this business plan:

Business Description: ${data.businessDescription}
Business Model: ${data.businessModel}
Target Market: ${data.targetMarket}

Section summaries:
${sectionSummaries}

Write a compelling 2-3 paragraph executive summary that captures the business opportunity, strategy, and key financials. Be specific and use numbers where available.`
      }
    ]
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text : '';
}

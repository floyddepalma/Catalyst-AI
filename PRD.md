# PRD: AI Business Plan Generator

**Product Name:** Catalyst AI (working title)  
**Version:** 1.0  
**Author:** Tessie & Floyd DePalma  
**Date:** January 28, 2026  
**Status:** Draft

---

## 1. Overview & Vision

### 1.1 Problem Statement
Entrepreneurs often have a business idea but lack the expertise, time, or resources to create a comprehensive business plan. Traditional business planning requires:
- Weeks of research and writing
- Expensive consultants ($5K-$50K+)
- Knowledge of multiple frameworks (business model canvas, financial modeling, etc.)
- Understanding of market research methodologies

### 1.2 Solution
An AI-powered business plan generator that transforms a simple business description into a comprehensive, investor-ready business plan in minutes. The system uses a swarm of specialized AI agents to research and build each section in parallel.

### 1.3 Vision Statement
*"Describe your business idea in plain English, answer a few key questions, and receive a complete business plan with market research, competitive analysis, financial projections, and go-to-market strategy."*

### 1.4 Target Users
- First-time entrepreneurs
- Small business owners pivoting/expanding
- Startup founders seeking funding
- Business students and educators
- Side-hustle creators validating ideas

### 1.5 Success Metrics
- Time to complete plan: < 10 minutes
- Plan completeness score: 90%+ of required sections
- User satisfaction: 4.5+ stars
- Conversion to paid: 10%+ of free users

---

## 2. User Flow & Questionnaire

### 2.1 High-Level Flow
```
[Landing Page] → [Questionnaire] → [Processing/Swarm] → [Plan Dashboard] → [Export/Share]
```

### 2.2 Intake Questionnaire (5-7 questions)

**Question 1: Business Description** (Required)
> "Describe your business idea in 2-3 sentences. What will you sell or offer, and to whom?"
- Free text, 500 char max
- Example: "I want to open a mobile dog grooming service targeting busy professionals in Nashville who don't have time to take their dogs to traditional groomers."

**Question 2: Business Model** (Required)
> "How will you make money?"
- Multiple choice with custom option:
  - [ ] Sell products (one-time purchase)
  - [ ] Sell services (hourly/project)
  - [ ] Subscription/membership
  - [ ] Marketplace/platform (take a cut)
  - [ ] Freemium (free + premium)
  - [ ] Advertising
  - [ ] Other: ___________

**Question 3: Target Market** (Required)
> "Who is your ideal customer?"
- Free text, 300 char max
- Prompt: Consider age, income, location, profession, interests

**Question 4: Location/Geography** (Required)
> "Where will you operate?"
- Options:
  - [ ] Local (specific city/region): ___________
  - [ ] Regional (state/multi-state)
  - [ ] National
  - [ ] International/Global
  - [ ] Online only

**Question 5: Investment Level** (Optional)
> "How much are you planning to invest initially?"
- Range selector:
  - [ ] Bootstrap ($0-$5K)
  - [ ] Small ($5K-$25K)
  - [ ] Medium ($25K-$100K)
  - [ ] Large ($100K-$500K)
  - [ ] Venture scale ($500K+)
  - [ ] Not sure yet

**Question 6: Timeline** (Optional)
> "When do you want to launch?"
- Options:
  - [ ] Already operating
  - [ ] Within 3 months
  - [ ] 3-6 months
  - [ ] 6-12 months
  - [ ] Just exploring

**Question 7: Unique Advantage** (Optional)
> "What makes your idea different from existing options?"
- Free text, 300 char max

---

## 3. Agent Architecture

### 3.1 Orchestrator Agent
Central coordinator that:
- Parses questionnaire responses
- Infers business model type
- Spawns specialized agents
- Aggregates results
- Compiles final document

### 3.2 Specialized Agents (Parallel Swarm)

| Agent | Responsibility | Inputs | Outputs |
|-------|---------------|--------|---------|
| **market-research-agent** | Industry analysis, market size, trends | Business type, location | TAM/SAM/SOM, industry overview, growth trends |
| **competitor-analysis-agent** | Direct/indirect competitors, positioning | Business type, location, unique advantage | Competitor matrix, SWOT, differentiation strategy |
| **customer-persona-agent** | Detailed customer profiles | Target market, business model | 2-3 personas with demographics, psychographics, jobs-to-be-done |
| **financial-model-agent** | Revenue projections, costs, unit economics | Business model, investment level, pricing | 3-year projections, break-even, startup costs |
| **go-to-market-agent** | Marketing channels, sales strategy | Customer personas, location, budget | Channel strategy, launch plan, customer acquisition |
| **operations-agent** | Day-to-day operations, resources needed | Business type, location, scale | Operations plan, key resources, vendors |
| **risk-assessment-agent** | Identify risks and mitigation | All inputs | Risk matrix, mitigation strategies, contingencies |
| **legal-compliance-agent** | Business structure, licenses, regulations | Business type, location | Legal requirements checklist, recommended structure |

### 3.3 Execution Flow
```
1. User completes questionnaire
2. Orchestrator parses and validates inputs
3. Orchestrator spawns 8 agents simultaneously
4. Each agent:
   a. Performs web research if needed
   b. Generates its section
   c. Returns structured JSON
5. Orchestrator waits for all agents (timeout: 120s)
6. Orchestrator compiles into unified document
7. Final formatting and PDF generation
8. Present to user with interactive dashboard
```

### 3.4 Agent Communication Format
```json
{
  "agent": "market-research-agent",
  "status": "complete",
  "confidence": 0.85,
  "data": {
    "market_size": {
      "tam": "$50B",
      "sam": "$5B",
      "som": "$50M"
    },
    "trends": [...],
    "growth_rate": "12% CAGR"
  },
  "sources": [...],
  "warnings": []
}
```

---

## 4. Output Specification

### 4.1 Generated Business Plan Sections

1. **Executive Summary** (auto-generated from all sections)
2. **Company Description** (from questionnaire + inference)
3. **Market Analysis** (from market-research-agent)
4. **Competitive Analysis** (from competitor-analysis-agent)
5. **Customer Analysis** (from customer-persona-agent)
6. **Products/Services** (from questionnaire + inference)
7. **Marketing & Sales Strategy** (from go-to-market-agent)
8. **Operations Plan** (from operations-agent)
9. **Management & Organization** (template + questionnaire)
10. **Financial Projections** (from financial-model-agent)
11. **Risk Analysis** (from risk-assessment-agent)
12. **Legal & Compliance** (from legal-compliance-agent)
13. **Implementation Timeline** (auto-generated milestones)
14. **Appendix** (sources, detailed data)

### 4.2 Output Formats
- **Interactive Web Dashboard** - Primary view with expandable sections
- **PDF Export** - Formatted for investors/banks
- **Word/Google Docs** - Editable template
- **Lean Canvas** - One-page visual summary
- **Pitch Deck** - 10-slide presentation (future)

### 4.3 Quality Indicators
Each section displays:
- Confidence score (Low/Medium/High)
- Data freshness indicator
- Source count
- "Needs review" flags for assumptions

---

## 5. Technical Requirements

### 5.1 Technology Stack
- **Frontend:** React/Next.js or simple HTML + Tailwind
- **Backend:** Node.js or Python (for agent orchestration)
- **AI:** Claude API (Sonnet for agents, Opus for orchestration)
- **Search:** Brave Search API for market research
- **PDF:** React-PDF or similar
- **Database:** Neon Postgres (user accounts, saved plans)

### 5.2 API Requirements
- Claude API (primary LLM)
- Brave Search API (market research)
- Optional: Census API, BLS API (demographics, labor data)

### 5.3 Performance Requirements
- Total generation time: < 3 minutes
- Individual agent timeout: 120 seconds
- Concurrent users: 100+
- Plan storage: 30 days minimum

### 5.4 Security Requirements
- User data encryption at rest
- No PII in AI prompts beyond what's necessary
- Rate limiting on generation
- API key protection

---

## 6. MVP Scope

### 6.1 Phase 1 MVP (2 weeks)
- [ ] Questionnaire form (web)
- [ ] 4 core agents: market, competitor, financial, go-to-market
- [ ] Basic orchestration
- [ ] Simple output display (web page)
- [ ] PDF export

### 6.2 Phase 2 (2 weeks)
- [ ] Add remaining 4 agents
- [ ] Interactive dashboard with confidence scores
- [ ] User accounts and saved plans
- [ ] Edit/regenerate sections

### 6.3 Phase 3 (Future)
- [ ] Pitch deck generation
- [ ] Integration with business tools
- [ ] Team collaboration
- [ ] Industry-specific templates
- [ ] AI chat for plan refinement

---

## 7. Open Questions

1. **Pricing Model:** Freemium (1 free plan) vs subscription vs pay-per-plan?
2. **Data Sources:** Which free APIs provide best market data?
3. **Accuracy Disclaimers:** How to present confidence levels without undermining value?
4. **Differentiation:** Focus on speed, depth, or specific industries?

---

## 8. Appendix

### 8.1 Research References
- EO Accelerator 4-Pillar Framework (Cash, Strategy, People, Execution)
- Business Model Canvas (9 blocks)
- Lean Canvas
- SBA Business Plan Guidelines
- Top 5 startup failure reasons (42% no market need, 29% cash flow, 23% wrong team)

### 8.2 Related Projects
- Construction Estimator App (similar agent swarm architecture)

---

*Document generated by Tessie on January 28, 2026*

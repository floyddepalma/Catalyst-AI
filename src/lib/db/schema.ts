import { pgTable, text, timestamp, jsonb, uuid, varchar } from 'drizzle-orm/pg-core';

// Business Plans table
export const businessPlans = pgTable('business_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Questionnaire responses
  businessDescription: text('business_description').notNull(),
  businessModel: varchar('business_model', { length: 100 }).notNull(),
  targetMarket: text('target_market').notNull(),
  location: varchar('location', { length: 200 }).notNull(),
  locationType: varchar('location_type', { length: 50 }).notNull(),
  investmentLevel: varchar('investment_level', { length: 50 }),
  timeline: varchar('timeline', { length: 50 }),
  uniqueAdvantage: text('unique_advantage'),
  
  // Generated sections (JSON)
  executiveSummary: jsonb('executive_summary'),
  marketAnalysis: jsonb('market_analysis'),
  competitiveAnalysis: jsonb('competitive_analysis'),
  customerAnalysis: jsonb('customer_analysis'),
  marketingStrategy: jsonb('marketing_strategy'),
  operationsPlan: jsonb('operations_plan'),
  financialProjections: jsonb('financial_projections'),
  riskAnalysis: jsonb('risk_analysis'),
  legalCompliance: jsonb('legal_compliance'),
  
  // Metadata
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  confidence: jsonb('confidence'), // Per-section confidence scores
  sources: jsonb('sources'), // Research sources used
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Agent runs table (for tracking individual agent executions)
export const agentRuns = pgTable('agent_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').references(() => businessPlans.id).notNull(),
  
  agentType: varchar('agent_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).default('running').notNull(),
  
  input: jsonb('input'),
  output: jsonb('output'),
  error: text('error'),
  
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  durationMs: varchar('duration_ms', { length: 20 }),
});

// Types
export type BusinessPlan = typeof businessPlans.$inferSelect;
export type NewBusinessPlan = typeof businessPlans.$inferInsert;
export type AgentRun = typeof agentRuns.$inferSelect;
export type NewAgentRun = typeof agentRuns.$inferInsert;

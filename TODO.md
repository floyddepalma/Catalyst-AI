# Catalyst AI - TODO

## Status: Almost Ready to Ship 🚀

### Completed ✅
- [x] 7-step questionnaire form
- [x] 8 parallel AI agents (market, competitor, customer, financial, marketing, operations, risk, legal)
- [x] SSE streaming for real-time agent status
- [x] Database schema (Drizzle + Neon Postgres)
- [x] PlanView with section navigation
- [x] Agent status grid during generation
- [x] Debug logging for blank page issue
- [x] Basic styling (dark theme)

### Before Launch 🎯
- [ ] Set up production environment variables
  - [ ] Create Neon database
  - [ ] Add DATABASE_URL to .env.local
  - [ ] Add ANTHROPIC_API_KEY to .env.local
- [ ] Run database migration: `pnpm db:push`
- [ ] Test full flow end-to-end
- [ ] PDF export (react-pdf already in deps)
- [ ] Deploy to Vercel

### Nice to Have (Post-MVP)
- [ ] User accounts (save multiple plans)
- [ ] Edit/regenerate individual sections
- [ ] Pitch deck generation
- [ ] Industry-specific templates
- [ ] Web search integration (Brave API) for real market data

### Known Issues
- Blank page: Added debug logging to PlanView.tsx - check console if issue recurs
- JSON parsing: Agent responses occasionally don't have valid JSON - handled with try/catch

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Push database schema
pnpm db:push

# Run development server
pnpm dev
```

---
*Last updated: January 29, 2026 by Tessie*

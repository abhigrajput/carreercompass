# CareerCompass Security Report

## Security Measures Implemented

### Authentication

- Supabase Auth for user sessions
- Admin routes protected with timing-safe password comparison (`lib/security/timing-safe.ts`)
- Service role key used only in server API routes (`lib/supabase/admin.ts`)

### API Security

- Rate limiting on all API routes via `lib/rate-limit.ts` and `guardRateLimit`
- Input validation with Zod on all API routes (`lib/validation.ts`, `lib/api-guard.ts`)
- Prompt injection sanitization on AI chat and roadmap/timetable prompts (`lib/security/prompt-guard.ts`)
- JSON body parsing with consistent 400 error responses

### Payment Security

- Razorpay signature verification (SHA-256 HMAC) with timing-safe compare
- Plan amounts defined server-side in `PLANS` — client cannot set amount
- Payment records stored in Supabase after verification

### Database Security

- Row Level Security policies in `supabase/rls-policies.sql`
- RLS: users can only access their own student-linked data where applicable
- Service role key never exposed to the browser

### Business Logic

- Points idempotency: one award per action per student per day (`analytics_events.idempotency_key`)
- Referral abuse: max 10 referrals per code, self-referral blocked by email match
- Game scores: session tokens via `/api/game-start`, server-side score from correct/total counts
- Community: max 10 posts/hour per student, 280-char limit, basic profanity filter

### Client Security

- No `dangerouslySetInnerHTML` in the codebase
- URL search params sanitized on explore, roadmap, parent, skill-games pages
- No file upload endpoints (no upload attack surface)

### Infrastructure

- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- `poweredByHeader: false`, response compression enabled
- Environment variables checked on startup (`lib/env-check.ts` in root layout)
- `.gitignore` covers `.env`, `.env.local`, `*.pem`, `.vercel`

## Dependency Audit (2026-05-19)

Run `npm audit` in `careercompass/`. As of last audit:

- **19 vulnerabilities** (2 moderate, 17 high), mostly in transitive deps (`html-pdf-node`, dev tooling)
- `npm audit fix` applied where non-breaking; remaining issues are documented here
- Production runtime paths (Next.js, Supabase client, Zod) are not directly affected by PDF dev dependency chain
- **Action:** Replace or remove `html-pdf-node` if unused in production builds

## Known Limitations

- [ ] Game session tokens are in-memory on a single server instance; use `game_sessions` table for multi-instance Vercel
- [ ] `is_pro` in localStorage can still show UI gates client-side — verify via Supabase for paid features
- [ ] Voice input requires HTTPS (enforced by the browser)
- [ ] Profanity filter is a minimal word list, not ML-based moderation

## Reporting Vulnerabilities

Email: security@careercompass.in (placeholder)  
Target response time: 48 hours

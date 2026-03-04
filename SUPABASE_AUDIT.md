# Supabase Audit Report — HSOS Codebase

**Generated:** 2026-03-03
**Scope:** Every file referencing Supabase, all expected tables, missing SQL, broken patterns

---

## 1. Files That Reference Supabase

### Client-side (browser)

| # | File | What it does with Supabase |
|---|------|---------------------------|
| 1 | `lib/supabase/client.ts` | **Canonical singleton.** `getSupabase()` creates one `SupabaseClient` with `persistSession` + `autoRefreshToken`. Falls back to `/api/supabase-config` at runtime if env vars missing at build. |
| 2 | `app/login/page.tsx` | Calls `getSupabase()` → `auth.signInWithPassword()` / `auth.signUp()` |
| 3 | `app/call/page.tsx` | Calls `getSupabase()` → queries **profiles**, inserts into **call_sessions**, passes client to `ContactPicker` and `persistCallData` |
| 4 | `components/call/ContactPicker.tsx` | Receives `supabase: any` as prop → calls `loadContacts(supabase)` and `addContact(supabase, …)` via zustand store |
| 5 | `store/contactStore.ts` | Queries **profiles** (for `org_id`), full CRUD on **contacts** |
| 6 | `lib/persistence.ts` | Inserts into **call_transcripts**, **coaching_events**; updates **call_sessions** |
| 7 | `hooks/useDeepgramTranscription.ts` | **Creates its own inline `createClient()`** to grab `auth.getSession()` for the JWT token |

### Server-side (API routes)

| # | File | What it does with Supabase |
|---|------|---------------------------|
| 8 | `app/api/deepgram-token/route.ts` | **Creates its own `createClient()` with SERVICE_ROLE_KEY** → `auth.getUser(token)` to verify JWT |
| 9 | `app/api/supabase-config/route.ts` | Returns `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` as JSON (no client creation) |
| 10 | `app/api/debug/route.ts` | Returns boolean flags for which env vars are set (no client creation) |

### Other

| # | File | Reference |
|---|------|-----------|
| 11 | `package.json` | `@supabase/supabase-js: ^2.47.10` |
| 12 | `README.md` | Lists env vars |

---

## 2. Tables Expected by Code (and whether they exist)

**None of these tables have been created.** There are zero `.sql` files, zero migration files, and no `supabase/` config directory in the repo.

### Table: `profiles`

| Column | Type (inferred) | Used in |
|--------|----------------|---------|
| `id` | uuid (= `auth.users.id`) | `.eq('id', user.id)` |
| `org_id` | uuid / text | `.select('org_id')` |

**Queried from:**
- `store/contactStore.ts:75-79` — `.from('profiles').select('org_id').eq('id', user.id).single()`
- `app/call/page.tsx:118-122` — same query

### Table: `contacts`

| Column | Type (inferred) | Used in |
|--------|----------------|---------|
| `id` | uuid, PK | filter, response |
| `user_id` | uuid, FK→auth.users | `.eq('user_id', user.id)` |
| `org_id` | uuid / text | set on insert |
| `name` | text, NOT NULL | insert, filter |
| `company` | text, nullable | insert, filter |
| `email` | text, nullable | insert, filter |
| `phone` | text, nullable | insert |
| `title` | text, nullable | insert |
| `priority` | integer, nullable | `order('priority', …)` |
| `notes` | text, nullable | insert |
| `created_at` | timestamptz | `order('created_at', …)` |
| `updated_at` | timestamptz | insert |

**Queried from:**
- `store/contactStore.ts:50-55` — SELECT with ordering
- `store/contactStore.ts:81-89` — INSERT
- `store/contactStore.ts:103-106` — UPDATE
- `store/contactStore.ts:120-123` — DELETE

### Table: `call_sessions`

| Column | Type (inferred) | Used in |
|--------|----------------|---------|
| `id` | uuid, PK | response, `.eq('id', sessionId)` |
| `user_id` | uuid, FK→auth.users | insert |
| `org_id` | uuid / text, nullable | insert |
| `contact_id` | uuid, FK→contacts, nullable | insert |
| `status` | text (`active` / `completed`) | insert, update |
| `started_at` | timestamptz | insert |
| `ended_at` | timestamptz, nullable | update |
| `duration_seconds` | integer | update |
| `transcript_line_count` | integer | update |
| `coaching_event_count` | integer | update |

**Queried from:**
- `app/call/page.tsx:124-134` — INSERT
- `lib/persistence.ts:73-82` — UPDATE

### Table: `call_transcripts`

| Column | Type (inferred) | Used in |
|--------|----------------|---------|
| `session_id` | uuid, FK→call_sessions | insert |
| `user_id` | uuid, FK→auth.users | insert |
| `line_number` | integer | insert |
| `speaker` | text (`rep` / `prospect`) | insert |
| `text` | text | insert |
| `timestamp` | timestamptz | insert |

**Queried from:**
- `lib/persistence.ts:38-40` — bulk INSERT

### Table: `coaching_events`

| Column | Type (inferred) | Used in |
|--------|----------------|---------|
| `session_id` | uuid, FK→call_sessions | insert |
| `user_id` | uuid, FK→auth.users | insert |
| `event_type` | text | insert |
| `suggestion` | text | insert |
| `trigger_text` | text, nullable | insert |
| `confidence` | real / float | insert |
| `source` | text, nullable | insert |
| `technique` | text, nullable | insert |
| `urgency` | text (`critical`/`warning`/`opportunity`/`info`) | insert |
| `created_at` | timestamptz | insert |

**Queried from:**
- `lib/persistence.ts:63-65` — bulk INSERT

---

## 3. SQL to Create All Missing Tables

Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query):

```sql
-- ============================================================
-- HSOS SCHEMA — Run in Supabase SQL Editor
-- ============================================================

-- 0. Enable UUID extension (usually already on)
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────
-- 1. PROFILES
-- ──────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  org_id      uuid default uuid_generate_v4(),
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ──────────────────────────────────────────────
-- 2. CONTACTS
-- ──────────────────────────────────────────────
create table if not exists public.contacts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  org_id      uuid,
  name        text not null,
  company     text,
  email       text,
  phone       text,
  title       text,
  priority    integer default 0,
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.contacts enable row level security;

create policy "Users can CRUD own contacts"
  on public.contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- 3. CALL SESSIONS
-- ──────────────────────────────────────────────
create table if not exists public.call_sessions (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  org_id                uuid,
  contact_id            uuid references public.contacts(id) on delete set null,
  status                text not null default 'active' check (status in ('active', 'completed')),
  started_at            timestamptz not null default now(),
  ended_at              timestamptz,
  duration_seconds      integer default 0,
  transcript_line_count integer default 0,
  coaching_event_count  integer default 0,
  created_at            timestamptz default now()
);

alter table public.call_sessions enable row level security;

create policy "Users can CRUD own sessions"
  on public.call_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- 4. CALL TRANSCRIPTS
-- ──────────────────────────────────────────────
create table if not exists public.call_transcripts (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid not null references public.call_sessions(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  line_number integer not null,
  speaker     text not null check (speaker in ('rep', 'prospect')),
  text        text not null,
  timestamp   timestamptz not null default now(),
  created_at  timestamptz default now()
);

alter table public.call_transcripts enable row level security;

create policy "Users can CRUD own transcripts"
  on public.call_transcripts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast lookups by session
create index if not exists idx_call_transcripts_session
  on public.call_transcripts(session_id);

-- ──────────────────────────────────────────────
-- 5. COACHING EVENTS
-- ──────────────────────────────────────────────
create table if not exists public.coaching_events (
  id            uuid primary key default uuid_generate_v4(),
  session_id    uuid not null references public.call_sessions(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  event_type    text not null,
  suggestion    text not null,
  trigger_text  text,
  confidence    real,
  source        text,
  technique     text,
  urgency       text check (urgency in ('critical', 'warning', 'opportunity', 'info')),
  created_at    timestamptz default now()
);

alter table public.coaching_events enable row level security;

create policy "Users can CRUD own coaching events"
  on public.coaching_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast lookups by session
create index if not exists idx_coaching_events_session
  on public.coaching_events(session_id);

-- ──────────────────────────────────────────────
-- 6. AUTH TRIGGER — auto-create profile on signup
-- ──────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, org_id, full_name, created_at, updated_at)
  values (
    new.id,
    uuid_generate_v4(),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    now(),
    now()
  );
  return new;
end;
$$;

-- Drop existing trigger if any, then create
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

## 4. Files That Will Break Without These Tables

### Hard failures (query errors thrown or returned, blocks user flow)

| File | Line(s) | Table | Impact |
|------|---------|-------|--------|
| `store/contactStore.ts` | 50-55 | `contacts` | `loadContacts()` fails → contact list empty, error logged |
| `store/contactStore.ts` | 75-79 | `profiles` | `addContact()` fails → can't create contacts (no `org_id`) |
| `store/contactStore.ts` | 81-89 | `contacts` | INSERT fails → new contact not saved |
| `store/contactStore.ts` | 103-106 | `contacts` | UPDATE fails → edits lost |
| `store/contactStore.ts` | 120-123 | `contacts` | DELETE fails → can't remove contacts |
| `app/call/page.tsx` | 118-122 | `profiles` | `handleStartCall()` gets null `org_id` → session created with null org |
| `app/call/page.tsx` | 124-134 | `call_sessions` | INSERT fails → **call cannot start** (returns early on error) |
| `components/call/ContactPicker.tsx` | 21-23 | `contacts` (via store) | Picker shows empty list + error in console |

### Soft failures (error caught, operation skipped, continues running)

| File | Line(s) | Table | Impact |
|------|---------|-------|--------|
| `lib/persistence.ts` | 38-40 | `call_transcripts` | Transcript save silently fails (line 44 comment: "table might not exist yet") |
| `lib/persistence.ts` | 63-65 | `coaching_events` | Coaching events silently lost |
| `lib/persistence.ts` | 73-82 | `call_sessions` | Session never marked `completed` — stays `active` forever |

### Auth flow (works without tables, BUT)

| File | Line(s) | Table | Impact |
|------|---------|-------|--------|
| `app/login/page.tsx` | 41-44 | `profiles` (via trigger) | Signup works via Supabase Auth, but without the trigger no `profiles` row is created → downstream queries for `org_id` return null |

---

## 5. Broken Imports, Inline Clients & Inconsistencies

### 5A. Inline Supabase client (bypasses singleton)

**`hooks/useDeepgramTranscription.ts:147-156`**
```typescript
async function getSupabaseToken(): Promise<string> {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}
```

**Problems:**
- Creates a **new throwaway client** every time `startListening()` is called
- Does NOT set `{ persistSession: true, autoRefreshToken: true }` — so this client's `getSession()` may return null because it has no knowledge of the session stored by the main singleton
- Should use `getSupabase()` from `lib/supabase/client.ts` instead

### 5B. Server-side client (acceptable, but inconsistent)

**`app/api/deepgram-token/route.ts:17-20`**
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

**Verdict:** This is correct for a server-side API route that needs admin-level access. However, it creates a new client per request with no auth config. Consider extracting a `getServiceSupabase()` helper if more API routes are added.

### 5C. Broken imports

**None found.** All `@/` path imports resolve to existing files.

### 5D. Weak typing (`supabase: any`)

These files pass the Supabase client as `any`, losing all type safety:

| File | Line(s) |
|------|---------|
| `store/contactStore.ts` | 27, 30, 31, 32 |
| `lib/persistence.ts` | 8 |
| `components/call/ContactPicker.tsx` | 9, 166 |

**Should be:** `SupabaseClient` (imported from `@supabase/supabase-js`)

### 5E. No generated Database types

There is no `database.types.ts` anywhere. The code relies on hand-written interfaces (`Contact`, `TranscriptLine`, `CoachingEvent`) that could drift from the actual schema. After creating the tables, you should run:

```bash
npx supabase gen types typescript --project-id <your-project-id> > lib/supabase/database.types.ts
```

### 5F. Missing auth trigger

The `login/page.tsx` signup flow calls `auth.signUp()` (line 41) and immediately redirects to `/call` (line 50). On `/call`, the code queries `profiles` for `org_id`. Without the `handle_new_user` trigger, there is no `profiles` row → `org_id` is null → call sessions and contacts are created with `org_id: null`.

### 5G. Supabase config endpoint exposes keys

**`app/api/supabase-config/route.ts`** returns `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with **no authentication**. While these are "public" keys by design, the endpoint itself has no rate limiting or access control.

---

## 6. Environment Variables Summary

| Variable | Required | Where used |
|----------|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `lib/supabase/client.ts`, `hooks/useDeepgramTranscription.ts`, `app/api/deepgram-token/route.ts`, `app/api/supabase-config/route.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `lib/supabase/client.ts`, `hooks/useDeepgramTranscription.ts`, `app/api/supabase-config/route.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server) | `app/api/deepgram-token/route.ts` |
| `DEEPGRAM_API_KEY` | Yes (server) | `app/api/deepgram-token/route.ts` |
| `OPENAI_API_KEY` | Optional | `app/api/coach/route.ts` |

---

## 7. Recommended Fix Order

1. **Run the SQL above** in Supabase to create all 5 tables + RLS + trigger
2. **Fix the inline client** in `useDeepgramTranscription.ts` → use `getSupabase()`
3. **Replace `any` types** with `SupabaseClient` across stores and components
4. **Generate `database.types.ts`** and wire it into `createClient<Database>()`
5. **Extract `getServiceSupabase()`** for server-side API routes

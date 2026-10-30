# Mentorship Scheduler

A page where mentors and interns can both publish their availability and book short meets or consultations. The way it is setup makes it highly flexible for both parties to find a time that fits.

**Live demo:** https://mentorship-scheduler-zeta.vercel.app/


## Features

- Available slots grouped by day, with start times and durations
- Booking form with name and email validation using Zod
- Confirmation page with an AI-generated message and template fallback
- Add to calendar via `.ics` download or Google Calendar link
- Friendly feedback when a slot is booked by someone else
- Concurrency testing for simultaneous booking attempts

## Tech stack

| Area | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Supabase: PostgreSQL, Row Level Security, Edge Functions |
| AI | Gemini (Google AI Studio free tier) via an Edge Function |
| Hosting | Vercel (frontend), Supabase (backend) |

## Architecture

There is no separate application API server. Supabase provides the API layer, while PostgreSQL handles the data model, constraints, Row Level Security (RLS), and the `book_slot()` database function. One Supabase Edge Function handles AI-generated confirmation messages.

The PostgreSQL schema can be reused when migrating to a NestJS + PostgreSQL backend, although Supabase-specific authentication, RLS policies, API access, and Edge Functions may require changes.

## Run locally

**Requirements:** Node.js 20.19+ and a Supabase project.

1. **Clone and install**

   Replace the repository URL and path with your actual GitHub repository.

   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>/web
   npm install
   ```

2. **Set up the database**

   In your Supabase project, open the SQL Editor and run `supabase/schema.sql` from the repository root.

3. **Create the host account**

   In Supabase, open **Authentication → Users** and add a user for the host. Enable **Auto Confirm User** if available.

   Disable public sign-ups only if the application is designed to use a pre-created host account and does not require customer accounts.

4. **Configure environment variables**

   Create `web/.env.local`:

   ```env
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<publishable-key>
   ```

   Get the project URL and publishable key from your Supabase project's **Connect** dialog or **Settings → API Keys**. The variable name must match the one used in `src/lib/supabase.ts`.

   Do not put a Supabase secret key or service-role key in frontend environment variables.

5. **Start the app**

   From `web/`, run:

   ```bash
   npm run dev
   ```

   Open the local URL printed by Vite, usually `http://localhost:5173`.

6. **Optional: Enable AI-generated confirmation messages**

   From the repository root, link the Supabase project and configure the Gemini API key:

   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase secrets set GEMINI_API_KEY=<your-key>
   npx supabase functions deploy <function-name>
   ```

   Replace `<function-name>` with the actual Edge Function directory name. The deployed name must match the function name used in `supabase.functions.invoke(...)`.

   Without the AI function, the app displays a template confirmation message, provided the frontend handles the function error as a fallback.


## Environment variables

| Variable | Location | Required |
|---|---|---|
| `VITE_SUPABASE_URL` | `web/.env.local` | Yes |
| `VITE_SUPABASE_ANON_KEY` | `web/.env.local` | Yes |
| `GEMINI_API_KEY` | Supabase Edge Function secret | No |

The Supabase URL and key are available in your project's **Connect** dialog or **Settings → API Keys**. The `VITE_SUPABASE_ANON_KEY` variable must match the name used in `src/lib/supabase.ts`.

The Gemini API key is configured separately using the Supabase CLI and must never be exposed in frontend environment variables.



## AI tools used

- **Claude (Anthropic):** planning and stack choice, drafting the SQL, Edge Function and first versions of the UI, and debugging (stale builds, Vercel deploys, `.ics` on mobile).
- **Gemini:** runtime feature only (confirmation message).

I chose the scope and architecture, using Claude for analysis and recommendations, configured Supabase and Vercel, tested and debugged the app, and reviewed the generated code.

# GitHub Copilot Instructions

## Project Overview
**Chandu Travels** is a Tirumala Balaji Temple cab booking web application built with React, TypeScript, and Supabase. The app features an AI-powered chatbot for booking assistance, admin dashboard for managing bookings/messages, and customer-facing pages for browsing services and tracking orders.

## Architecture & Data Flow

### Technology Stack
- **Frontend Framework**: React 19 + TypeScript (Vite)
- **UI Components**: shadcn/ui (Radix UI primitives) with Tailwind CSS
- **Styling**: Tailwind CSS with HSL-based theming system
- **Backend/Database**: Supabase (PostgreSQL) with Edge Functions (Deno)
- **API Client**: `@tanstack/react-query` for data fetching
- **Routing**: React Router v7 with protected routes
- **State Management**: React hooks + React Query (no Redux/Zustand)

### Critical Integration Points

1. **Supabase Client** ([src/integrations/supabase/client.ts](src/integrations/supabase/client.ts))
   - Singleton instance with auto-refresh and localStorage persistence
   - Import as: `import { supabase } from "@/integrations/supabase/client"`
   - Environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`

2. **Supabase Edge Functions**
   - ChatBot uses [supabase/functions/chat/index.ts](supabase/functions/chat/index.ts) (Deno/TypeScript)
   - Integrates with Lovable AI gateway (Gemini 2.5 Flash model)
   - Environment variable: `LOVABLE_API_KEY` (configured in Supabase)
   - Endpoints called from client with Authorization Bearer token

3. **Database Tables** (from migrations and code references)
   - `bookings` - stores cab booking requests (order_number, pickup/drop location, date/time, passengers, status, special_requests)
   - `contact_messages` - contact form submissions (name, email, phone, subject, message, status)
   - `user_roles` - admin authentication (user_id, role='admin')

### Route Structure
All routes defined in [src/App.tsx](src/App.tsx):
- `/` → VideoIntro
- `/home`, `/booking`, `/contact`, `/services` → public pages
- `/admin/login` → AdminLogin
- `/admin/dashboard`, `/admin/update-location` → protected (require admin role)
- `/track/:orderNumber` → TrackBooking (public order tracking)
- `*` → NotFound (catch-all)

## Key Patterns & Conventions

### Component Patterns
- **shadcn/ui Components**: Located in [src/components/ui/](src/components/ui/) - do NOT modify these; they're auto-generated from the UI library
- **Page Components**: [src/pages/](src/pages/) - full-page views, export as default
- **Reusable Components**: [src/components/](src/components/) (ChatBot.tsx, Navigation.tsx, Footer.tsx, etc.)
- **Hooks**: [src/hooks/](src/hooks/) - custom hooks like `use-mobile`, `use-toast`

### Toast Notifications
- Use `useToast()` hook (from [src/hooks/use-toast.ts](src/hooks/use-toast.ts))
- Two toast providers configured: `<Toaster />` (shadcn) and `<Sonner />` (Sonner library)
- Example: `const { toast } = useToast(); toast({ title: "Success", description: "..." })`

### Data Fetching & Supabase
- Use Supabase client directly for ad-hoc queries (not RQ-wrapped)
- Pattern: `supabase.from("table_name").select("*")` with error checking
- Protected routes check auth via `supabase.auth.getUser()` and verify admin role from `user_roles` table (see [src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx))

### Protected Routes
- Wrap components with `<ProtectedRoute>` component to enforce admin authentication
- Component checks: user exists → admin role in DB → redirects to login if not authenticated

### ChatBot Integration
- [src/components/ChatBot.tsx](src/components/ChatBot.tsx) is a floating chat widget
- Calls Supabase chat Edge Function via HTTP POST
- Implements streaming responses by parsing Server-Sent Events (SSE)
- Rate limit handling for 429 errors
- Payment required handling for 402 errors (Lovable AI credits)

## Build & Development Commands
```bash
npm run dev        # Start Vite dev server on http://localhost:8080
npm run build      # Production build (outputs to dist/)
npm run build:dev  # Development build with debug info
npm run lint       # ESLint check all files
npm run preview    # Preview production build
```

### Supabase Local Development
```bash
supabase start     # Start local Supabase (requires Docker)
supabase functions serve  # Run Edge Functions locally
```

## Project-Specific Patterns

### Environment Variables
Located in `.env.local` (not committed):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Public API key
- `LOVABLE_API_KEY` - Set in Supabase dashboard (for chat Edge Function)

### Import Aliases
Path alias configured in [vite.config.ts](vite.config.ts):
- `@/` resolves to `./src/` - always use `@/` for imports instead of relative paths

### Form Handling
- Uses `react-hook-form` with `@hookform/resolvers` for validation
- Forms are standard HTML with shadcn/ui input components

### Theming
- HSL-based color system defined in CSS variables (index.css)
- Tailwind classes extend these colors (`bg-primary`, `text-secondary`, etc.)
- Dark mode supported via Tailwind `darkMode: ["class"]`

## Common Workflows

**Adding a new page**:
1. Create TypeScript React component in [src/pages/](src/pages/)
2. Add route in [src/App.tsx](src/App.tsx)
3. Import Navigation if needed (most pages have it)

**Adding a protected admin page**:
1. Create component in [src/pages/](src/pages/)
2. Wrap route in `<ProtectedRoute>` in App.tsx
3. Use Supabase client to fetch admin data

**Modifying ChatBot behavior**:
1. Update system prompt in [supabase/functions/chat/index.ts](supabase/functions/chat/index.ts)
2. Or adjust streaming logic in [src/components/ChatBot.tsx](src/components/ChatBot.tsx)

## Notes for AI Assistants
- This is a Lovable.dev-generated project (evidenced by componentTagger plugin)
- Always preserve the auto-generated shadcn/ui components in [src/components/ui/](src/components/ui/) - never manually edit them
- Supabase schema is in [supabase/migrations/](supabase/migrations/) - check these for table definitions
- Edge Functions are Deno/TypeScript, not Node.js - use Deno APIs
- AI model used for chat: Google Gemini 2.5 Flash (via Lovable AI gateway)

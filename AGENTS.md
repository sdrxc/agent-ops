# Fusion Dashboard - Next.js

A production-ready Next.js application with integrated API routes, featuring React 18, TypeScript, NextAuth, Zod validation, Axios, and modern tooling.

## Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS v4
- **Authentication**: NextAuth.js with credentials provider
- **API**: Next.js API routes with Zod validation
- **HTTP Client**: Axios with interceptors
- **Testing**: Vitest
- **UI**: Radix UI + Tailwind CSS v4 + Lucide React icons
- **State Management**: TanStack Query (React Query)

## Project Structure

```
src/
├── app/                     # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── agents/         # Agent management API
│   │   ├── dashboard/      # Dashboard metrics API
│   │   ├── demo/           # Demo API endpoints
│   │   └── ping/           # Health check
│   ├── auth/               # Authentication pages
│   ├── playground/         # Agent testing interface
│   ├── incident-reporting/ # Incident management
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── providers.tsx       # Context providers
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   ├── AgentCard.tsx       # Agent display component
│   ├── Layout.tsx          # Main layout wrapper
│   ├── CollapsibleSidebar.tsx # Navigation sidebar
│   └── UserProfileModal.tsx   # User profile
├── lib/                    # Utility libraries
│   ├── auth.ts             # NextAuth configuration
│   ├── axios.ts            # HTTP client setup
│   └── utils.ts            # Utility functions
├── types/                  # TypeScript definitions
│   ├── api.ts              # API schemas with Zod
│   └── next-auth.d.ts      # NextAuth type extensions
└── hooks/                  # Custom React hooks
    ├── use-mobile.tsx      # Mobile detection
    └── use-toast.ts        # Toast notifications
```

## Key Features

### Authentication System

The app uses NextAuth.js with a credentials provider for demo purposes:

**Demo Accounts:**

- Admin: `admin@fusion.ai` / `admin123`
- User: `user@fusion.ai` / `user123`
- Demo: `demo@fusion.ai` / `demo123`

### API Architecture

- **Next.js API Routes**: RESTful endpoints with built-in middleware
- **Zod Validation**: Runtime type checking and validation
- **Axios Integration**: HTTP client with authentication interceptors
- **Type Safety**: Full TypeScript support from API to UI

#### Example API Routes

- `GET /api/ping` - Health check
- `GET /api/agents` - Fetch all agents (authenticated)
- `GET /api/dashboard/metrics` - Dashboard KPIs (authenticated)
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Routing System

Next.js 14 app directory with:

- **File-based routing**: Pages defined by folder structure
- **Layout nesting**: Shared layouts with `layout.tsx`
- **Client components**: Interactive components with `"use client"`
- **Server components**: Default server-side rendering

### Styling System

- **Primary**: Tailwind CSS v4 with CSS-first approach
- **Configuration**: No `tailwind.config` - uses CSS variables in `globals.css`
- **Theme**: CSS variables with light/dark mode support via `@theme` directive
- **Components**: Radix UI primitives with custom styling
- **Utility**: `cn()` function for conditional classes

```typescript
// cn utility usage
className={cn(
  "base-classes",
  { "conditional-class": condition },
  props.className  // User overrides
)}
```

#### Tailwind v4 CSS-First Approach

All theme customizations are defined in CSS using the `@theme` directive in `src/app/globals.css`:

```css
@theme {
  --color-primary: #your-color;
  --sidebar-width: 16rem;
  --sidebar-width-icon: 3.5rem;
}
```

No JavaScript configuration file is needed. All customization happens in CSS.

## Development Commands

```bash
npm run dev        # Start Next.js dev server
npm run build      # Production build
npm start          # Start production server
npm run lint       # ESLint validation
npm run type-check # TypeScript validation
npm test           # Run Vitest tests
```

## Authentication Flow

1. **Login**: User visits `/auth/signin`
2. **Credentials**: Enter demo account credentials
3. **Session**: NextAuth creates secure session
4. **Protection**: API routes verify authentication
5. **Logout**: Session terminated via NextAuth

## API Development

### Adding New API Route

1. Create route handler in `src/app/api/your-route/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your API logic here
  return NextResponse.json({ data: "success" });
}
```

2. **Optional**: Add Zod schema in `src/types/api.ts`:

```typescript
export const YourDataSchema = z.object({
  field: z.string(),
});
export type YourData = z.infer<typeof YourDataSchema>;
```

3. Use in components with Axios:

```typescript
const { data } = useQuery({
  queryKey: ["your-data"],
  queryFn: async () => {
    const response = await apiClient.get("/your-route");
    return response.data;
  },
});
```

### New Page Route

1. Create page in `src/app/your-page/page.tsx`
2. Add authentication check:

```typescript
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function YourPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  return <div>Your page content</div>;
}
```

## Production Deployment

- **Build**: `npm run build` creates optimized production build
- **Start**: `npm start` runs production server
- **Environment**: Configure `.env.local` for production secrets
- **Cloud**: Deploy to Vercel, Netlify, or any Node.js hosting

### Environment Variables

```env
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

## Security Features

- **Authentication**: Secure session management with NextAuth
- **CSRF Protection**: Built-in CSRF protection
- **Type Safety**: Runtime validation with Zod
- **API Security**: Protected routes with session verification
- **XSS Protection**: React's built-in XSS protection

## Architecture Benefits

- **Full-stack TypeScript**: End-to-end type safety
- **Modern React**: Latest React 18 features and patterns
- **Production Ready**: Enterprise-grade security and performance
- **Developer Experience**: Hot reload, TypeScript, modern tooling
- **Scalable**: Component-based architecture with clear separation

## Migration from Express

This app was migrated from a React SPA + Express setup to Next.js:

- **Old**: React Router → **New**: Next.js file-based routing
- **Old**: Express API → **New**: Next.js API routes
- **Old**: Manual auth → **New**: NextAuth.js
- **Old**: fetch() → **New**: Axios with interceptors
- **Old**: Manual validation → **New**: Zod schemas

All functionality has been preserved while gaining:

- Better SEO and performance
- Simplified deployment
- Type-safe API integration
- Modern authentication patterns

# VZNX Challenge - Project Management Workspace

A modern, full-stack project management application built with Next.js 15, tRPC, Drizzle ORM, PostgreSQL, and Better-Auth.

## 🎯 Live App Testing

**App URL**: [Your deployed app URL here]

### Test Account Credentials

```
Email: alice@example.com
Password: password123
```

### What to Test

#### 1. **Dashboard Overview** (`/dashboard`)

- View all projects with real-time progress tracking
- See project cards with status badges and progress bars
- Click on any project to view details

#### 2. **Project Management**

- Create new projects (click "New Project" button)
- Edit project details (name, description, status)
- Delete projects
- Watch progress update automatically as you complete tasks

#### 3. **Task Management** (`/dashboard/projects/[id]`)

- Click any project card to view its tasks
- Add new tasks
- Toggle task completion by clicking checkboxes
- Assign tasks to team members
- Delete tasks
- Observe automatic progress calculation

#### 4. **Team Overview** (`/dashboard/team`)

- View all team members
- See task assignments and workload
- Color-coded capacity indicators:
  - 🟢 Green (0-60%): Healthy capacity
  - 🟠 Orange (60-80%): Busy
  - 🔴 Red (80%+): Overloaded

#### 5. **UI/UX Features**

- Responsive design (try on mobile)
- Dark mode support
- Smooth animations and transitions
- Optimistic updates (instant feedback on actions)

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Backend**: tRPC for type-safe APIs
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Auth**: Better-Auth with session management
- **Monorepo**: Turborepo with pnpm workspaces

## ✨ Key Features

### Core Functionality

- **Real-time Progress Tracking** - Project progress updates automatically based on task completion
- **Drag & Drop Task Management** - Intuitive task organization
- **Team Workload Monitoring** - Visual capacity indicators for team members
- **Optimistic UI Updates** - Instant feedback on all actions
- **Auto-calculations** - Progress percentages computed automatically

### Technical Highlights

- **End-to-end Type Safety** - tRPC ensures type safety from database to UI
- **Modern Database Patterns** - PostgreSQL with Drizzle ORM using identity columns
- **Server Components** - Leveraging Next.js 15 App Router for optimal performance
- **Secure Authentication** - Better-Auth with session management

## 🗄️ Database Schema

The app uses PostgreSQL with the following main tables:

- **Projects**: Store project information (name, status, progress, description)
- **Tasks**: Task details linked to projects (name, status, assigned user, order)
- **Users**: User accounts managed by Better-Auth
- **Sessions**: Authentication sessions

All tables use modern identity columns and include proper foreign key relationships for data integrity.

## 🔄 API Architecture

Built with **tRPC** for end-to-end type safety:

- **Projects Router**: CRUD operations, progress calculation
- **Tasks Router**: Task management, status toggling
- **Team Router**: Member workload, capacity calculations

All API calls are fully type-safe from database to UI with automatic TypeScript inference.

---

## 👨‍💻 For Developers: Local Setup

<details>
<summary>Click to expand local development instructions</summary>

### Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL database (Neon recommended)

### Installation

1. Clone and install dependencies:

```bash
git clone <repository-url>
cd vznx-challenge
pnpm install
```

2. Set up environment variables:

```bash
cp apps/web/.env.example apps/web/.env
```

Update `apps/web/.env`:

```env
DATABASE_URL='postgresql://...'
BETTER_AUTH_SECRET='<generate with: openssl rand -base64 32>'
BETTER_AUTH_URL='http://localhost:3001'
CORS_ORIGIN='http://localhost:3001'
```

3. Push database schema and seed data:

```bash
pnpm run db:push
pnpm --filter @vznx-challenge/db run db:seed
```

4. Start development server:

```bash
pnpm run dev
```

Visit [http://localhost:3001](http://localhost:3001)

### Available Commands

- `pnpm run dev` - Start dev server
- `pnpm run build` - Build for production
- `pnpm run db:push` - Push schema changes
- `pnpm run db:studio` - Open database GUI
- `pnpm --filter @vznx-challenge/db run db:seed` - Seed database

</details>

---

Built with ❤️ for VZNX Challenge

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**UIGen** is an AI-powered React component generator with live preview. Users describe components in natural language, and Claude generates JSX/TSX code in real-time. The generated code lives in a virtual file system (in-memory), allowing users to see live previews without writing files to disk.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Prisma ORM with SQLite
- **AI Integration**: Vercel AI SDK + Anthropic Claude API
- **Authentication**: JWT-based (jose library)
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **Testing**: Vitest with React Testing Library
- **UI Components**: Radix UI primitives

## Quick Start

### Setup
```bash
npm run setup  # Install dependencies, generate Prisma client, run migrations
```

### Development
```bash
npm run dev        # Start Next.js dev server with hot reload
npm run dev:daemon # Run dev server in background (logs to logs.txt)
```

### Other Commands
```bash
npm run build          # Production build
npm start              # Start production server
npm run lint           # Run ESLint
npm test               # Run tests with Vitest
npm run db:reset       # Reset SQLite database
```

### Environment Setup
Create a `.env.local` file (optional):
```
ANTHROPIC_API_KEY=your-api-key-here
JWT_SECRET=your-jwt-secret-for-production
```

If `ANTHROPIC_API_KEY` is missing, the app uses a mock provider that generates static component examples.

## Architecture Overview

### 1. Virtual File System (`src/lib/file-system.ts`)
The core of the system. A VirtualFileSystem class manages an in-memory file tree structure without writing to disk. Key features:
- Create/read/update/delete files and directories
- Path normalization and validation
- Serialization/deserialization for persistence
- Used by Claude to manipulate generated code

### 2. Chat API Route (`src/app/api/chat/route.ts`)
Handles component generation requests:
- Uses Vercel AI SDK's `streamText()` for streaming responses from Claude
- Provides two tools to Claude:
  - `str_replace_editor`: Edit file contents with string replacements
  - `file_manager`: Create, delete, and manage files
- Persists successful projects to SQLite (if user is authenticated)
- Falls back to mock provider when no API key is configured

### 3. Language Model Provider (`src/lib/provider.ts`)
- **Real provider**: Uses Claude Haiku model via Anthropic SDK
- **Mock provider**: Fallback that generates example components (Counter, Form, Card)
- Mock provider implements the LanguageModelV1 interface for seamless swapping

### 4. Authentication (`src/lib/auth.ts`)
- JWT-based session management with 7-day expiration
- Email/password authentication support
- Sessions stored in HTTP-only cookies
- Used to validate project ownership before saving

### 5. Database (`prisma/schema.prisma`)
Two simple models:
- **User**: email, password hash, createdAt/updatedAt
- **Project**: name, userId (optional for anonymous sessions), messages (JSON), data (serialized file system)

Projects without a userId are anonymous (not persisted). Authenticated users can save and load projects.

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/chat/            # Chat streaming endpoint
│   ├── [projectId]/         # Project detail page (dynamic route)
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
│
├── actions/                  # Server actions
│   ├── create-project.ts    # Create new project
│   ├── get-project.ts       # Fetch project by ID
│   └── get-projects.ts      # List user's projects
│
├── components/
│   ├── auth/                # SignUp, SignIn, AuthDialog
│   ├── chat/                # ChatInterface, MessageList, MessageInput
│   ├── editor/              # CodeEditor, FileTree
│   ├── preview/             # PreviewFrame
│   └── ui/                  # Radix UI component wrappers
│
├── lib/
│   ├── file-system.ts       # VirtualFileSystem class
│   ├── auth.ts              # JWT session management
│   ├── provider.ts          # Real + mock Claude providers
│   ├── prisma.ts            # Prisma client
│   ├── tools/               # Tool implementations
│   │   ├── file-manager.ts
│   │   └── str-replace.ts
│   ├── transform/           # Code transformation utilities
│   └── prompts/             # System prompts for Claude
│
├── generated/               # Auto-generated Prisma client
└── components/...

prisma/
├── schema.prisma            # Database schema
└── dev.db                   # SQLite database (git-ignored)
```

## Key Development Workflows

### Adding a New Chat Tool
1. Create tool implementation in `src/lib/tools/`
2. Export a `build{ToolName}Tool()` function that returns a tool definition
3. Import and add to the `tools` object in `src/app/api/chat/route.ts`
4. Update the generation prompt in `src/lib/prompts/generation.ts` to instruct Claude on using it

### Creating a Server Action
1. Add file to `src/actions/` with `'use server'` directive at top
2. Use Prisma client to interact with database
3. Use `getSession()` to check authentication
4. Export action and import in client components

### Modifying the Database
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev` to create migration
3. Test migrations with `npm run db:reset` if needed

### Testing
- Use Vitest with React Testing Library
- Test files colocated in `__tests__` directories
- Example: `src/lib/__tests__/file-system.test.ts`
- Run tests: `npm test`
- Watch mode: `npm test -- --watch`
- Run specific test file: `npm test -- file-system.test.ts`

## Important Notes

### Virtual File System State
- The VirtualFileSystem lives in memory during a chat session
- It's serialized as JSON in the database `Project.data` field
- When loading a project, it's deserialized back into memory
- Closing the browser window loses unsaved changes (unless user saves project)

### Claude Context
The chat system sends Claude:
1. System prompt with detailed instructions for component generation
2. Message history from the conversation
3. Current file system state as a tool parameter
4. Tools to manipulate the file system

Claude is instructed to create React components with Tailwind CSS styling, placing them in a `/components/` directory structure.

### Anonymous vs. Authenticated Users
- **Anonymous**: Can generate components but changes are lost on page reload
- **Authenticated**: Can save projects to database and return to them later
- Projects are only saved if `projectId` is provided and user is authenticated

### Mock Provider
When ANTHROPIC_API_KEY is missing:
- Creates 3-step mock conversation
- Generates hardcoded component examples (Counter, ContactForm, Card)
- Useful for testing UI/UX without API access
- Returns plausible tool calls to make flow feel natural

### Generation Prompt (`src/lib/prompts/generation.tsx`)
Claude receives key instructions:
- Create a root `/App.jsx` file as entrypoint (default React export)
- Use Tailwind CSS for styling, never hardcoded styles
- Use `@/` import alias for relative imports
- Keep responses brief unless user asks for summary
- Operate on virtual filesystem at root `/`
- No HTML files—App.jsx is the entrypoint

## Code Patterns

### Handling Async Operations
- Use async/await in server components and actions
- Stream responses from API routes using Vercel AI SDK
- Client components handle streaming UI updates via `useChat()` hook

### Path Management
- Always normalize paths through VirtualFileSystem methods
- Paths are absolute (start with `/`)
- No trailing slashes except for root

### Type Safety
- Export types from Prisma generated files
- Use TypeScript for all React components
- Type tool parameters and responses properly for Claude integration

## Common Workflows & Debugging

### Running Locally Without API Key
The app works out-of-the-box without an Anthropic API key. The mock provider generates example components. To use the real Claude API:
```bash
# Add to .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

### Database Issues
```bash
npm run db:reset      # Wipe and recreate database
npx prisma studio    # Open Prisma Studio to inspect/edit data
```

### Checking if User is Authenticated
Server-side:
```typescript
const session = await getSession();
if (!session) {
  // User not logged in
}
```

### File System Serialization
Projects are stored as JSON in the database:
- `Project.messages` = conversation history
- `Project.data` = serialized VirtualFileSystem

When loading a project, deserialize with `fileSystem.deserializeFromNodes(projectData)`

# Wysenote

**AI-powered Personal Knowledge Base**

Wysenote is a modern note-taking application that combines the simplicity of Apple Notes with the power of AI. Built with Next.js and powered by advanced language models, Wysenote helps you capture, organize, and retrieve your thoughts, ideas, and knowledge effortlessly.

## 🌟 Key Features

### 📝 Smart Note-Taking

- **Rich Text Editor**: Powered by BlockNote for a seamless writing experience
- **Folder Organization**: Organize notes into nested folders for better structure
- **Version Control**: Track changes with automatic note versioning
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### 🤖 AI-Powered Intelligence

- **Semantic Search**: Find notes by meaning, not just keywords
- **AI Chat**: Interact with your notes through natural conversation
- **Context-Aware**: AI understands the relationship between your notes
- **Smart Retrieval**: Get relevant information when you need it, not when you search for it

### 🎨 Modern Experience

- **Dark Mode**: Beautiful light and dark themes
- **Clean Interface**: Distraction-free writing environment
- **Fast Performance**: Built on Next.js 15 with React 18
- **Real-time Updates**: Instant synchronization across devices

### 🔒 Enterprise Ready

- **Secure Authentication**: Powered by Clerk
- **Premium Features**: Stripe integration for subscription management
- **Data Privacy**: Your notes are encrypted and secure
- **Scalable Architecture**: Built to grow with your needs

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 15.4+ (App Router)
- **UI Library**: React 18.3
- **Styling**: Tailwind CSS + DaisyUI
- **Rich Text**: BlockNote
- **State Management**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Vector Store**: pgvector for embeddings
- **Authentication**: Clerk
- **Payments**: Stripe

### AI & Search

- **LLM Framework**: LlamaIndex
- **AI Provider**: OpenAI
- **Embeddings**: Vector-based semantic search
- **Workflows**: LlamaIndex Workflows

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ with pgvector extension
- OpenAI API key
- Clerk account (for authentication)
- Stripe account (for payments, optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/wysenote.git
   cd wysenote
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```

   ```

4. **Set up the database**

   Enable the pgvector extension:

   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

   Run Prisma migrations:

   ```bash
   npm run db:migrate:local
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3003`

## 📦 Available Scripts

- `npm run dev` - Start development server (port 3003)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:studio:local` - Open Prisma Studio
- `npm run db:migrate:local` - Run database migrations
- `npm run db:push:local` - Push schema changes to database

## 🗄 Database Schema

Wysenote uses PostgreSQL with the following main entities:

- **Users**: User accounts managed by Clerk
- **Notes**: Individual notes with rich content
- **NoteVersions**: Version history for each note
- **Folders**: Hierarchical folder structure
- **ChatSessions**: AI chat conversations
- **ChatMessages**: Individual chat messages
- **Embeddings**: Vector embeddings for semantic search

## 🎯 Project Structure

```
wysenote/
├── app/                    # Next.js App Router
│   ├── (app)/             # Main application routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── folder/        # Folder views
│   │   ├── note/          # Note editor
│   │   └── chat/          # AI chat interface
│   └── api/               # API routes
│       ├── note/          # Note operations
│       ├── folder/        # Folder operations
│       ├── chat/          # Chat operations
│       ├── search/        # Semantic search
│       └── stripe/        # Payment webhooks
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── web/              # Desktop components
│   ├── mobile/           # Mobile components
│   └── chat/             # Chat components
├── hooks/                # Custom React hooks
├── services/             # Business logic layer
├── lib/                  # Utility functions
├── prisma/               # Database schema
├── public/               # Static assets
│   ├── logo/            # Brand logos
│   └── icons/           # App icons
└── styles/              # Global styles
```

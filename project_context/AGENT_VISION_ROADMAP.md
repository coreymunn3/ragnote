# Agent-First Wysenote: Vision Roadmap

This document outlines the strategic roadmap for transforming Wysenote from a passive note-taking tool into an "Agent-First" Knowledge Engineer. The goal is to build a system where the AI acts as an active collaborator, capable of reading, understanding, and actively managing (refactoring, editing, linking) your personal knowledge base, similar to how an autonomous coding agent manages a software project.

## Core Philosophy

- **Agent-First UI**: The primary interaction point is an "Agent Command Bar" (Omni-bar), not just a search bar.
- **Context-Aware**: The agent implicitly understands "where" you are (Folder, Note, Global) and uses that context.
- **Active Management**: The agent doesn't just chat; it edits, creates, and refactors multiple notes at once.

---

## Core User Stories

_Real-world scenarios driving this roadmap._

### Story 1: The "Strategy Shift" (Mass Update)

**Persona**: Founder / Executive
**Context**: You have a "Corporate Strategy" folder with 12 distinct notes (Vision, Q1 Goals, Vendor Guidelines, Hiring Plan, etc.).
**Trigger**: You decide to pivot the company focus from "Growth at all costs" to "Efficiency and Profitability".
**Action**: You open the Agent Command Bar and type: _"Update our strategy documents to reflect a new focus on profitability and efficiency for 2026. Review all notes in this folder and propose edits."_
**Agent Response**:

1.  **Reads**: Scans all 12 notes.
2.  **Plans**: Identifies that `Hiring Plan` needs a hiring freeze section, `Vendor Guidelines` needs a budget cap update, and `Vision` needs a rewrite. It skips `Office Floorplan` as irrelevant.
3.  **Proposes**: Shows a "Pull Request" view:
    - _Hiring Plan_: Added "Freeze on non-essential roles."
    - _Vendor Guidelines_: Changed "Approval limit $5k" to "$1k".
4.  **Executes**: User clicks "Approve All". The agent updates 3 notes instantly.
    **Value**: Saves hours of manual document review and ensures consistency across the knowledge base.

### Story 2: The "Interview Prep" (Synthesis & Creation)

**Persona**: Job Seeker
**Context**: You have a "Jobs" folder with notes from 5 different interviews, plus a "Resume" note.
**Trigger**: You have a final round interview with Google tomorrow.
**Action**: You type: _"Create a cheat sheet for my Google interview tomorrow based on my past interview notes and my resume."_
**Agent Response**:

1.  **Reads**: Scans past interview notes for common questions asked and your specific resume highlights.
2.  **Creates**: Generates a new note titled "Google Final Round Prep". \* _Section 1_: "Your Strengths" (extracted from Resume). \* _Section 2_: "Questions to Expect" (aggregated from past interview notes). \* _Section 3_: "Talking Points" (synthesized from your best answers).
    **Value**: Turns scattered "data" into actionable "intelligence" instantly.

### Story 3: The "Daily Gardener" (Proactive Organization)

**Persona**: Researcher / Student
**Context**: You dump random thoughts into "Inbox" notes all day.
**Trigger**: You log in the next morning.
**Action**: The Agent proactively notifies you: _"You added 4 notes about 'Quantum Computing' yesterday. Should I move them to a new folder and link them to your 'Physics' class notes?"_
**Value**: Keeps the knowledge base organized without manual effort, preventing "note rot."

---

## Phase 1: The Foundation - "Command Center" & Context

_Goal: Establish the Agent as the central interface and ensure it "sees" what the user sees._

### 1.1 Context-Aware Backend (Read-Only)

- [ ] **Unified Chat Scope API**: Update `ChatService.ts` to support `folder` and `global` scopes natively.
- [ ] **The "Omni-Agent"**: Implement `scopedChatAgent.ts` to be the single entry point, switching system prompts based on scope (e.g., "You are viewing the 'Strategy' folder...").
- [ ] **Tooling - Scoped Search**: Update `ragTool.ts` to strictly filter vector searches by the current scope (Folder ID or User ID).

### 1.2 The Command UI

- [ ] **Command Bar Component**: Create a global `CommandBar` (Cmd+K style) that accepts natural language and slash commands.
- [ ] **UI Integration**: Replace/Augment the current sidebar search with this Command Bar.
- [ ] **Context Passing**: Ensure the active Folder ID or Note ID is automatically passed to the agent when opening the Command Bar.

---

## Phase 2: Active Participation - "Creation & Expansion"

_Goal: The agent shifts from "Read Only" to "Creator"._

### 2.1 Basic Creation Tools

- [ ] **Tool - Create Note**: Implement `create_note(title, content, folder_id)` tool.
- [ ] **Slash Command - /create**: Logic to parse `/create "Meeting Notes"` and trigger the agent.
- [ ] **"Generative UI" Previews**: When the agent creates a note, render a "Note Card" in the chat stream instead of just text.

### 2.2 Content Expansion

- [ ] **Tool - Append**: Implement `append_to_note(note_id, content)` for adding to lists/logs.
- [ ] **Voice Input (Mobile)**: precise voice-to-text integration for on-the-go knowledge capture ("Add this to my interview prep...").

---

## Phase 3: The "Knowledge Engineer" - Refactoring & Batch Operations

_Goal: The "Corporate Strategy" Use Case. Mass editing and structural management._

### 3.1 Architecture Shift: Multi-Agent System

- [ ] **The "Editor" Sub-Agent**: Split the monolith. Create a specialized agent with strict "Writing" tools and different safety prompts.
- [ ] **The Router**: A lightweight layer to decide if a request is "Research" (Chat Agent) or "Work" (Editor Agent).

### 3.2 Single-Note Editing

- [ ] **Tool - Update Note**: Implement `update_note(note_id, content, version_comment)`.
- [ ] **Streaming Edits**: Allow the agent to update the `RichTextEditor` in real-time while you watch.

### 3.3 Multi-Note "Refactoring" (Batch)

- [ ] **Tool - Batch Read**: `get_folder_contents(folder_id)` to read 10+ notes into context.
- [ ] **Tool - Batch Update**: `batch_update_notes(changes: [{id, diff}])`.
- [ ] **The "Review Changes" UI**: A "Pull Request" style interface for notes.
  - Lists all affected notes.
  - Shows Diff views (Before vs After).
  - "Approve All" / "Reject" buttons.
- [ ] **Safety Rollback**: "Undo Batch" functionality using `note_version` history.

---

## Phase 4: Proactive Intelligence - "The Mind"

_Goal: The agent works for you while you sleep._

### 4.1 Background Jobs

- [ ] **"Daily Brief"**: Generates a morning summary of active projects.
- [ ] **"Knowledge Graph"**: Proactively links related notes across different folders.

---

## UX Architecture: CommandBar & Progressive Disclosure

_Implemented: January 2026_

### Overview

The CommandBar component serves as the universal input interface for both chat and search functionality. It follows a "Chat-First" philosophy with toggleable search, implementing a progressive disclosure pattern that adapts complexity to the user's needs.

### CommandBar Component

**Location**: `components/commandbar/CommandBar.tsx`

**Props**:

```typescript
interface CommandBarProps {
  scope: ChatScope; // "global" | "folder" | "note"
  scopeId?: string; // Required for folder/note scopes
  onSearch?: (query: string) => void;
}
```

**Key Features**:

1. **Dual Mode Toggle**: Primary mode switches between Chat and Search
   - Default: Chat mode (agent-first philosophy)
   - Toggle allows switching to traditional search
2. **Scope Awareness**: Automatically displays appropriate scope badge and contextual placeholder
3. **Conditional UI**: Shows/hides controls based on active mode
   - Chat mode: Displays scope badge, "Send" button
   - Search mode: Displays semantic/text toggle, search results, "Clear Results" button
4. **Smart Placeholders**:
   - Global chat: "Ask about anything..."
   - Folder chat: "Ask about this folder..."
   - Note chat: "Ask about this note..."
   - Search: "Search Your Notes"

### Integration Points

**Global Scope** (Dashboard):

- `app/(app)/components/Dashboard/WebDashboardContent.tsx`
- `app/(app)/components/Dashboard/MobileDashboardContent.tsx`
- Usage: `<CommandBar scope="global" />`

**Folder Scope** (Folder Pages):

- `app/(app)/components/Folder/WebFolderPageContent.tsx`
- `app/(app)/components/Folder/MobileFolderPageContent.tsx`
- Usage: `<CommandBar scope="folder" scopeId={folder.id} />`

**Note Scope** (Future):

- Currently uses `ChatPanel` (side drawer)
- Future: May integrate CommandBar for consistency

### Progressive Disclosure Strategy

**Philosophy**: Match UI complexity to task complexity. Don't fight for sidebar space—embrace full-page navigation.

**Three Levels of Complexity**:

1. **Simple Queries** (Inline):
   - Search results appear inline below CommandBar
   - Quick information retrieval without navigation
2. **Conversations** (Full Page):
   - Chat messages navigate to `/chat/[sessionId]`
   - Full-screen dedicated chat interface
   - Rationale: Multi-turn conversations need space for context and history
3. **Complex Agent Workflows** (Future - Dedicated Interface):
   - Multi-step agent tasks navigate to `/agent/[taskId]`
   - Specialized UI for approval workflows:
     - Tab interface (Chat / Pending Approvals)
     - Swipeable approval cards for batch operations
     - Full-screen unified diff viewer for file changes
     - Progress tracking and rollback capabilities

### Why Full-Page Navigation?

**Rejected Approaches**:

- ❌ Dual sidebars (chat + notes): Horizontal space squeeze on desktop
- ❌ Resizable panels: Width management complexity, poor mobile experience
- ❌ Modal dialogs: Limited screen space, accessibility concerns
- ❌ Bottom sheets only: Insufficient space for complex conversations

**Chosen Approach**: ✅ Full-page navigation

- **Pros**:
  - Maximum space for complex interactions
  - Clean mobile experience
  - Natural browser back/forward navigation
  - Each complexity level gets appropriate real estate
  - Future-proof for agent approval workflows
- **Cons**:
  - Navigation overhead (leaving current page)
  - Mitigated by: Quick navigation, browser history, clear scope context

### Mobile vs Web Differences

**Shared**:

- Same CommandBar component with responsive adjustments
- Same progressive disclosure philosophy
- Same full-page navigation for chats

**Mobile-Specific**:

- Compact mode toggles (icons only when `isMobile`)
- Future: Bottom sheet expansion for simple chats before full-page navigation
- Future: Swipe gestures for approval workflows in `/agent/[taskId]`

**Web-Specific**:

- Text labels on mode toggle buttons
- Larger hit targets for mouse interaction
- More visible scope badges and controls

### Future: Agent Approval Workflows

When Phase 3 (Multi-Note Refactoring) is implemented:

**Route**: `/agent/[taskId]`

**UI Components**:

1. **Tab Navigation**:

   - "Chat" tab: Conversation with agent about the task
   - "Pending Approvals" tab: Review proposed changes

2. **Approval Cards** (Pending Approvals Tab):

   - Swipeable cards on mobile
   - Click-to-expand on web
   - Each card shows:
     - Note title and folder context
     - Summary of proposed changes
     - Quick approve/reject actions

3. **Unified Diff Viewer**:

   - Full-screen view when expanding a specific change
   - Side-by-side before/after comparison
   - Syntax highlighting for rich text
   - Inline comments from agent explaining changes
   - Individual line-level approve/reject (future)

4. **Progress Tracking**:
   - Visual indicator of batch operation progress
   - "Approve All" / "Reject All" bulk actions
   - Rollback functionality using version history

### Design Principles

1. **Agent-First**: Chat is the primary interaction mode, not an afterthought
2. **Context Implicit**: User's location (folder/note) automatically provides scope
3. **Progressive Complexity**: UI grows with task complexity (inline → full page → specialized interface)
4. **No Sidebar Wars**: Use full-page real estate instead of competing for horizontal space
5. **Future-Ready**: Architecture supports upcoming multi-agent batch operations
6. **Consistent Experience**: Same CommandBar component across all contexts
7. **Mobile-First Responsive**: Works equally well on phones and desktops

### Related Components

- `components/ScopeBadge.tsx`: Visual indicator of chat scope
- `components/chat/ChatPanel.tsx`: Current note-level chat (side drawer)
- `app/(app)/chat/[id]/page.tsx`: Full-page chat session view
- `hooks/chat/useChat.ts`: Chat mutation and navigation logic
- `hooks/search/useSearch.ts`: Search functionality

---

## Architecture Notes

- **Single vs Multi-Agent**: We start with Single Agent (Phase 1-2) for simplicity. We migrate to Multi-Agent (Router + Specialist Agents) in Phase 3 to handle the complexity and risk of Batch Editing.
- **Token Management**: For "Folder Context", we will need smart summarization strategies (Map-Reduce) if a folder has too many tokens to fit in the window.

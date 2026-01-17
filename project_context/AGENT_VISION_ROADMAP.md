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

## Architecture Notes

- **Single vs Multi-Agent**: We start with Single Agent (Phase 1-2) for simplicity. We migrate to Multi-Agent (Router + Specialist Agents) in Phase 3 to handle the complexity and risk of Batch Editing.
- **Token Management**: For "Folder Context", we will need smart summarization strategies (Map-Reduce) if a folder has too many tokens to fit in the window.

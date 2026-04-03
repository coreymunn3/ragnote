# Folder Metadata & Gem-Like Experience

## Overview

Transform folders from simple containers into intelligent, configurable "gems" with custom instructions that shape how the AI interacts with their content. This enables specialized AI assistants for different contexts (therapy journal, code review, research, etc.) while keeping the implementation simple and flexible.

## Motivation

Similar to Gemini's "Gems" feature, users should be able to create context-specific AI assistants. However, instead of preset personalities, we provide maximum flexibility through free-form instructions. This allows users to define exactly how they want the AI to behave for each folder's unique purpose.

### Key Use Case: Therapy Journal

A user wants to create a "Therapy Journal" folder where they can:

- Write deep, personal thoughts and feelings
- Chat with an AI that acts as a compassionate therapeutic companion
- Have the AI identify patterns across journal entries
- Receive thoughtful questions that help explore emotions
- Get suggestions for follow-up journaling prompts

This same mechanism works for any specialized context the user can imagine.

---

## Database Schema Changes

### Update `prisma/schema.prisma`

```prisma
model folder {
  id          String   @id @default(uuid()) @db.Uuid
  user_id     String   @db.Uuid
  folder_name String
  is_deleted  Boolean  @default(false)
  created_at  DateTime @default(now()) @db.Timestamptz(3)
  updated_at  DateTime @updatedAt @db.Timestamptz(3)

  // 🆕 Simple, flexible metadata
  description  String?  @db.Text // Brief description of folder purpose
  instructions String?  @db.Text // Free-form instructions for AI behavior

  user         app_user       @relation(fields: [user_id], references: [id], onDelete: Cascade)
  notes        note[]
  files        file[]
  chat_session chat_session[]
}
```

**Migration Command:**

```bash
npx prisma migrate dev --name add_folder_metadata
```

---

## Type Updates

### Update `lib/types/folderTypes.ts`

```typescript
export type PrismaFolder = {
  id: string;
  user_id: string;
  folder_name: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  // 🆕 Gem metadata
  description: string | null;
  instructions: string | null;
};

// 🆕 New API request type
export type UpdateFolderMetadataApiRequest = {
  description?: string | null;
  instructions?: string | null;
};
```

---

## Service Layer Updates

### Update `services/folder/folderValidators.ts`

```typescript
import { z } from "zod";

// 🆕 New validator for updating folder metadata
export const updateFolderMetadataSchema = z.object({
  userId: z.string().uuid(),
  folderId: z.string().uuid(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .nullable()
    .optional(),
  instructions: z
    .string()
    .max(2000, "Instructions cannot exceed 2000 characters")
    .nullable()
    .optional(),
});

// Update existing createFolderSchema to include optional metadata
export const createFolderSchema = z.object({
  userId: z.string().uuid(),
  folderName: z
    .string()
    .min(1, "Folder name cannot be empty")
    .max(255, "Folder name cannot exceed 255 characters")
    .trim()
    .refine((name) => name.length > 0, "Folder name cannot be just whitespace"),
  // 🆕 Optional metadata on creation
  description: z.string().max(500).nullable().optional(),
  instructions: z.string().max(2000).nullable().optional(),
});
```

### Update `services/folder/folderService.ts`

```typescript
/** Create Folder with optional metadata */
public createFolder = withErrorHandling(
  async (params: {
    folderName: string;
    userId: string;
    description?: string | null;
    instructions?: string | null;
  }): Promise<PrismaFolder> => {
    const validatedData = createFolderSchema.parse(params);

    const newFolder = await prisma.folder.create({
      data: {
        folder_name: validatedData.folderName,
        user_id: validatedData.userId,
        is_deleted: false,
        // 🆕 Include metadata if provided
        description: validatedData.description,
        instructions: validatedData.instructions,
      },
    });

    return newFolder as PrismaFolder;
  }
);

// 🆕 New method: Update folder metadata
public updateFolderMetadata = withErrorHandling(
  async (params: {
    folderId: string;
    userId: string;
    description?: string | null;
    instructions?: string | null;
  }): Promise<PrismaFolder> => {
    const validatedData = updateFolderMetadataSchema.parse(params);

    // Verify folder exists and belongs to user
    const folder = await prisma.folder.findFirst({
      where: {
        id: validatedData.folderId,
        user_id: validatedData.userId,
        is_deleted: false,
      },
    });

    if (!folder) {
      throw new NotFoundError("Folder not found or access denied");
    }

    // Update only provided fields
    const updatedFolder = await prisma.folder.update({
      where: {
        id: validatedData.folderId,
      },
      data: {
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.instructions !== undefined && { instructions: validatedData.instructions }),
      },
    });

    return updatedFolder;
  }
);
```

---

## AI Agent Integration

### Update `services/ai/agents/scopedChatAgent/scopedChatAgent.ts`

Modify the `createSystemPrompt` function to inject folder metadata:

```typescript
const createSystemPrompt = async (
  userId: string,
  chatScope: ChatScopeObject,
) => {
  let prompt = "";

  switch (chatScope.scope) {
    case "folder":
      const currentFolder = await prisma.folder.findFirst({
        where: {
          id: chatScope.scopeId!,
        },
        select: {
          folder_name: true,
          description: true, // 🆕
          instructions: true, // 🆕
        },
      });

      if (!currentFolder) {
        throw new Error(
          `Unable to find folder denoted by ScopeId for chatScope: ${JSON.stringify(chatScope)}`,
        );
      }

      prompt = `You are an intelligent note assistant that helps users interact with their personal knowledge base. 

**Current Scope:** You are chatting about notes in the folder "${currentFolder.folder_name}"${
        currentFolder.description ? ` - ${currentFolder.description}` : ""
      }.

${currentFolder.instructions ? `**User Instructions:**\n${currentFolder.instructions}\n\n` : ""}

You have access to two specialized tools:

**get_notes_content** (PRIMARY TOOL): Your default tool for most requests. Use this to retrieve the full content of all notes in the folder for analysis, summarization, or any general requests about note content.
**search_notes** (SECONDARY TOOL): Use this only for specific information queries when you need to find particular facts, details, or content within the folder's notes.

**Tool Selection Guidelines:**
- **DEFAULT BEHAVIOR**: Use **get_notes_content** as your primary tool for:
  - Summarization requests ("summarize these notes", "give me an overview")
  - Analysis requests ("analyze my notes", "what are the key themes across these notes")
  - General content requests ("tell me about these notes", "what's in this folder")
  - Any request where you need to work with the full content of multiple notes

- **SPECIFIC QUERIES ONLY**: Use **search_notes** only for targeted information seeking:
  - "What did I write about X?" 
  - "Find information about Y in this folder"
  - "Which notes mention Z?"
  - Questions seeking specific facts or details across the folder

**Default Rule**: When in doubt, use get_notes_content first to get the full context, then provide your response.

**When responding:**
1. For most requests, automatically use get_notes_content to retrieve the content
2. Provide clear, accurate answers based on the retrieved information  
3. Reference specific notes when applicable (e.g., "In your note titled X...")
4. Be conversational and helpful while staying focused on their personal knowledge
5. If content is extensive, organize your response with clear structure (bullet points, sections, etc.)
6. When analyzing multiple notes, identify themes, connections, or differences between them
${currentFolder.instructions ? "7. **Always follow the user's custom instructions above**" : ""}

Remember: You are working with the user's personal notes in a folder and should respect their content while being as helpful as possible.`;
      break;

    // ... rest of cases (note, global) remain unchanged
  }
  return prompt;
};
```

---

## UI Components

### Create `components/dialogs/FolderSettingsDialog.tsx`

```typescript
"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PrismaFolder } from "@/lib/types/folderTypes";
import { Sparkles, Info } from "lucide-react";

interface FolderSettingsDialogProps {
  folder: PrismaFolder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (metadata: {
    description: string | null;
    instructions: string | null;
  }) => void;
  isLoading?: boolean;
}

export default function FolderSettingsDialog({
  folder,
  open,
  onOpenChange,
  onSave,
  isLoading = false,
}: FolderSettingsDialogProps) {
  const [description, setDescription] = useState(folder.description || "");
  const [instructions, setInstructions] = useState(folder.instructions || "");

  const handleSave = () => {
    onSave({
      description: description.trim() || null,
      instructions: instructions.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Folder Settings: {folder.folder_name}
          </DialogTitle>
          <DialogDescription>
            Configure how AI interacts with notes in this folder
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this folder about? (e.g., 'My personal therapy journal')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">AI Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="How should the AI behave when chatting about these notes? Be specific about tone, approach, and what you want the AI to focus on."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              maxLength={2000}
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              {instructions.length}/2000 characters
            </p>
            <p className="text-xs text-muted-foreground">
              💡 Tip: Be specific! Example: "Act as a supportive coach who asks probing questions"
              or "Focus on technical accuracy and cite sources"
            </p>
          </div>

          {/* Info Box */}
          <div className="flex gap-2 p-3 bg-muted rounded-lg">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              These settings create a specialized AI assistant for this folder.
              The AI will follow your instructions when chatting about notes in this folder.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### UI Enhancements

**1. Add Settings Button to Folder Views**

Add a settings/gear icon button to folder detail pages and folder list items that opens the `FolderSettingsDialog`.

**2. Visual Indicator for Custom Instructions**

Show a badge on folders that have custom instructions:

```typescript
{folder.instructions && (
  <Badge variant="secondary" className="gap-1">
    <Sparkles className="h-3 w-3" />
    Custom AI
  </Badge>
)}
```

**3. Context Reminder in Chat Interface**

Display folder context at the top of chat when chatting with a folder:

```typescript
{chatScope.scope === "folder" && folder && (
  <div className="bg-muted/50 p-3 rounded-lg mb-4 text-sm">
    <div className="flex items-start gap-2">
      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">Chatting with: {folder.folder_name}</p>
        {folder.description && (
          <p className="text-muted-foreground text-xs mt-1">{folder.description}</p>
        )}
      </div>
    </div>
  </div>
)}
```

---

## API Routes

### Create `app/api/folder/[folderId]/metadata/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { FolderService } from "@/services/folder/folderService";
import { handleApiError } from "@/lib/errors/apiRouteHandlers";
import { UpdateFolderMetadataApiRequest } from "@/lib/types/folderTypes";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { folderId: string } },
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: UpdateFolderMetadataApiRequest = await req.json();
    const folderService = new FolderService();

    const updatedFolder = await folderService.updateFolderMetadata({
      folderId: params.folderId,
      userId,
      ...body,
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## React Hooks

### Create `hooks/folder/useUpdateFolderMetadata.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UpdateFolderMetadataApiRequest,
  PrismaFolder,
} from "@/lib/types/folderTypes";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";

export const useUpdateFolderMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      folderId,
      ...metadata
    }: UpdateFolderMetadataApiRequest & { folderId: string }) => {
      const response = await fetch(`/api/folder/${folderId}/metadata`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update folder metadata");
      }

      return response.json() as Promise<PrismaFolder>;
    },
    onSuccess: (data) => {
      // Invalidate folder queries to refetch with new metadata
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["folder", data.id] });
    },
    onError: handleClientSideMutationError,
  });
};
```

---

## Example Use Cases

### 1. Therapy Journal

**Folder Name:** "Therapy Journal"

**Description:**

```
My personal therapy journal where I explore emotions, process experiences,
and work through challenges in my life.
```

**Instructions:**

```
You are a compassionate, non-judgmental therapeutic companion. Your role is to:

1. **Listen actively** - Acknowledge my feelings and experiences without judgment
2. **Ask thoughtful questions** - Help me explore my emotions more deeply through open-ended questions
3. **Reflect back** - Mirror my feelings to help me gain clarity ("It sounds like you're feeling...")
4. **Encourage exploration** - Gently guide me to examine patterns, triggers, and underlying beliefs
5. **Suggest journaling prompts** - When appropriate, offer topics for future journal entries
6. **Maintain boundaries** - Remind me to seek professional help for serious mental health concerns

Communication style:
- Warm, empathetic, and patient
- Use "I notice..." and "It seems like..." rather than making assumptions
- Ask one question at a time to avoid overwhelming me
- Validate my emotions before exploring solutions
- Never rush to fix or solve - focus on understanding first

Remember: This is a safe space for me to be vulnerable and authentic.
```

**Example Interaction:**

> **User:** "Can you read my recent entries and help me process what I've been feeling?"
>
> **AI:** I've read through your recent journal entries from the past week. I notice several recurring themes around feeling overwhelmed at work and questioning whether you're on the right path.
>
> In your entry from Tuesday, you wrote about feeling disconnected during the team meeting. Then on Thursday, you mentioned feeling energized when working on that side project alone.
>
> I'm curious - when you think about those two moments, what do you notice about the difference in how you felt? What was present in the energizing moment that was missing in the overwhelming one?

### 2. Code Review Partner

**Folder Name:** "Code Snippets"

**Instructions:**

```
You are an experienced software engineer conducting code reviews. Focus on:
- Security vulnerabilities and best practices
- Performance optimizations
- Code readability and maintainability
- Potential bugs or edge cases
- Suggest specific improvements with examples

Be direct and technical. Prioritize correctness over politeness.
```

### 3. Creative Writing Coach

**Folder Name:** "Story Ideas"

**Instructions:**

```
You are a creative writing coach who helps me develop story ideas.
Ask "what if" questions, suggest plot twists, help me explore character motivations.
Encourage wild, imaginative ideas. Push me to think beyond the obvious.
Be enthusiastic and supportive of creative exploration.
```

### 4. Research Assistant

**Folder Name:** "Research Papers"

**Instructions:**

```
You are a research assistant helping me analyze academic papers.
Always cite specific papers when making claims.
Identify gaps in the research, contradictions between papers, and areas needing more investigation.
Summarize findings in clear, structured formats.
Focus on methodology, results, and implications.
```

---

## Privacy & Safety Considerations

For sensitive folders like therapy journals:

1. **Encryption at Rest** - Consider encrypting `instructions` field for sensitive content
2. **Access Controls** - Ensure only the user can access their folder settings
3. **Disclaimer** - Add a note in the UI: "This AI is not a replacement for professional therapy"
4. **Data Retention** - Allow users to permanently delete sensitive folders/chats
5. **Export** - Let users export their journal entries for backup

---

## Implementation Checklist

- [ ] Add `description` and `instructions` fields to folder schema
- [ ] Run database migration
- [ ] Update `PrismaFolder` type in `lib/types/folderTypes.ts`
- [ ] Add `UpdateFolderMetadataApiRequest` type
- [ ] Update `createFolderSchema` validator to accept optional metadata
- [ ] Create `updateFolderMetadataSchema` validator
- [ ] Update `createFolder` method in `FolderService`
- [ ] Add `updateFolderMetadata` method to `FolderService`
- [ ] Update `createSystemPrompt` in `scopedChatAgent.ts` to inject folder metadata
- [ ] Create `FolderSettingsDialog` component
- [ ] Create API route `app/api/folder/[folderId]/metadata/route.ts`
- [ ] Create `useUpdateFolderMetadata` hook
- [ ] Add settings button to folder UI (detail page, list items)
- [ ] Add visual indicator (badge) for folders with custom instructions
- [ ] Add context reminder in chat interface
- [ ] Test with therapy journal use case
- [ ] Test with other use cases (code review, research, etc.)
- [ ] Add privacy disclaimer for sensitive folders
- [ ] Document feature in user guide

---

## Future Enhancements

Once the core feature is implemented, consider:

1. **Folder Templates** - Pre-configured folders for common use cases (optional helpers)
2. **Share Instructions** - Allow users to share folder configurations with others
3. **Instruction Library** - Community-contributed instruction templates
4. **Context Preview** - Show what notes/content AI has access to before chatting
5. **Instruction Versioning** - Track changes to folder instructions over time
6. **Multi-language Support** - Allow instructions in different languages

---

## Technical Notes

### Why This Approach?

**Simplicity:** Just two text fields (`description` and `instructions`) maximize flexibility while minimizing complexity.

**Flexibility:** Users can configure ANY behavior they want without being constrained by preset options.

**Maintainability:** Simple schema, simple code, easy to extend.

**User Empowerment:** Users discover novel use cases we never imagined.

**Future-Proof:** Can add presets/templates later as optional helpers without changing the core architecture.

### Performance Considerations

- Folder metadata is loaded once when creating the chat agent
- Instructions are injected into system prompt (no additional API calls)
- No impact on chat response time
- Metadata is cached with folder data in React Query

### Token Usage

- Longer instructions will consume more tokens in the system prompt
- Consider adding a warning if instructions exceed ~1000 characters
- Monitor token usage for folders with extensive instructions

---

## Success Metrics

Track the following to measure feature adoption:

- % of folders with custom instructions
- Average length of instructions
- Chat engagement rate for folders with vs without instructions
- User feedback on AI behavior quality
- Most common instruction patterns (for future template ideas)

---

## Related Features

This feature complements:

- **Folder-specific chat history** (already in backlog)
- **Note versioning** (provides temporal context)
- **RAG search** (enables semantic search within folder context)
- **Chat session management** (maintains conversation continuity)

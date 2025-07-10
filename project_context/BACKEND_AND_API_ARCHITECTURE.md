# Ragnote Backend Architecture: Services Layer Philosophy

## 1. Core Philosophy: Layered Architecture for Scalability & Maintainability

The Ragnote backend is built upon a layered architecture pattern, primarily focusing on a class-based **Service Layer**. This approach is chosen for its benefits in promoting **separation of concerns, reusability, testability, and maintainability**, crucial for a project with an ambitious roadmap and a planned evolution from web to native mobile platforms.

## 2. Technology Stack

- **Language:** TypeScript
- **Framework:** Next.js (App Router for API Routes)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Clerk (for user authentication and session management)
- **Vector Database Integration:** pgvector extension for PostgreSQL

## 3. Guiding Principles & Conventions

- **Thin API Layer:** Next.js API Routes (`/app/api/...`) should be minimal, acting primarily as request handlers. Their responsibilities are:
  - Authentication (using Clerk).
  - Input parsing (JSON body, query params, path params).
  - Delegating business logic to the appropriate service.
  - Catching custom `ApiError` exceptions from services and mapping them to appropriate HTTP status codes.
  - Returning standardized JSON responses.
- **Robust Service Layer:** This is the core of the backend, encapsulating all business logic, data transformations, and orchestrating interactions with the database and external services. Services should be:
  - Highly cohesive (methods within a service handle related business operations).
  - Independent (services generally do not directly call other services, but might use shared utilities or dedicated sub-services like `embeddingService`).
  - Testable (business logic is isolated).
  - Stateless (services instances do not hold mutable state across requests).
- **Explicit Error Handling:** Services throw specific custom errors (`NotFoundError`, `ForbiddenError`, `ConflictError`, etc.) to clearly indicate the nature of an issue. API routes catch these and translate them into appropriate HTTP status codes. Avoid generic `throw new Error()`.
- **Strong Type Safety:** Leverage TypeScript's features extensively.
  - Define clear Data Transfer Objects (DTOs) for incoming request bodies and outgoing responses.
  - Use Zod for robust runtime input validation.
  - Ensure all data transformations are type-safe.
- **DRY (Don't Repeat Yourself):** Promote reusability through shared utility functions, centralized Prisma client, and dedicated validation/transformation modules.
- **Naming Conventions:**
  - **Prisma Models/Database Tables:** Lowercase singular words, with `snake_case` for multi-word names (e.g., `note`, `note_version`, `note_chunk`, `note_permission`).
  - **Prisma Model Fields:** `snake_case` (e.g., `created_at`, `user_id`).
  - **TypeScript Types/Interfaces:** `PascalCase` (e.g., `NoteResponse`, `CreateNoteRequest`).
  - **TypeScript Class/Function Names:** `PascalCase` for classes (e.g., `NoteService`), `camelCase` for functions/methods (e.g., `createNote`, `updateNoteVersionContent`).

## 4. Data Flow and Security Model

The data flow emphasizes clear stages and security at each step:

### A. Request Ingress (Client to API Layer)

1.  **Client Request:** A web or mobile client sends an HTTP request (e.g., POST `/api/notes`) to the Next.js backend.
2.  **API Route Handler:** The corresponding `app/api/.../route.ts` handler receives the request.
3.  **Authentication (Clerk):**
    - The API handler immediately calls `auth()` from `@clerk/nextjs/server` to verify the user's session.
    - If no `userId` is returned, an `Unauthorized` (401) response is returned early.
    - The authenticated `userId` is obtained **securely from the server's context**, not from the client's request body.
4.  **Input Parsing:** The request body is parsed into a TypeScript object (e.g., `await req.json()`).
5.  **DTO Construction (Partial):** The parsed body is typed using an `Omit` utility type (e.g., `Omit<CreateNoteRequest, 'userId'>`) to ensure the client isn't providing fields that should be server-sourced.

### B. Business Logic & Database Interaction (API Layer to Service Layer to Database)

1.  **Service Delegation:** The API route calls the relevant method on the appropriate service (e.g., `noteService.createNote({...body, userId})`), passing the validated client data and the authenticated `userId`.
2.  **Input Validation (Service Layer):**
    - Inside the service method, the incoming data is immediately validated against a Zod schema (e.g., `createNoteSchema.parse(data)`). This ensures data integrity before interacting with the database. Invalid data results in a `BadRequestError`.
3.  **Authorization Checks (Service Layer):**
    - Service methods perform fine-grained authorization checks (e.g., `if (note.user_id !== userId) throw new ForbiddenError(...)`). These checks ensure the authenticated user has the necessary permissions to perform the requested operation on the specific resource.
    - `NotFoundError` is thrown if a resource (note, folder) does not exist or if access is denied to an unknown resource.
    - `ConflictError` is thrown for logical conflicts (e.g., trying to publish a note with no draft).
4.  **Database Operations (Prisma):**
    - The service interacts with Prisma Client (`prisma.ts`) to perform database operations (create, read, update, delete).
    - **Transactions (`prisma.$transaction`):** For operations involving multiple database writes that must succeed or fail together (e.g., creating a note and its initial version, or publishing a note which updates `note_version` and `note` tables), transactions are used to ensure atomicity and prevent data inconsistency.
5.  **External Service Integration:** The service may call other services (e.g., `embeddingService.generateEmbeddingsForContent`) to handle side effects like generating embeddings after a note is published. This is crucial for RAG functionality.

### C. Response Egress (Service Layer to API Layer to Client)

1.  **Data Transformation (Service Layer):**
    - Before returning data, services **may** use transformer functions (e.g., `transformNoteToResponse`) to map Prisma database models into clean Data Transfer Objects (DTOs) suitable for API responses. This is not necessarily required in every case, but in some situations where extra data attributes must be added for the frontend to render components, this pattern may be used.
2.  **Service Method Return:** The service method returns the raw data, or transformed data, or a success indicator.
3.  **Error Handling (API Layer):**
    - The API route handler wraps the service call in a `try...catch` block.
    - It specifically catches instances of `ApiError`. If an `ApiError` is caught, its `statusCode` and `message` are used to construct the `NextResponse`.
    - Any other unexpected errors result in a generic `Internal Server Error` (500) to avoid leaking sensitive information.
4.  **JSON Response:** The API handler constructs a `NextResponse.json()` object with the appropriate data and HTTP status code.
5.  **Client Receives Response:** The client receives the JSON response.

## 5. Future Extensions (Roadmap Awareness)

The current architecture is designed to accommodate the Ragnote roadmap:

- **Audio Notes & Documents:** The `fileService` (or similar) will handle file uploads, transcription (for audio), OCR (for images/PDFs), and extract/chunk content into `file_content_chunk` for RAG.
- **Multi-Modal RAG:** The `embeddingService` will evolve to handle multi-modal embeddings from `note_chunk` and `file_content_chunk` as needed.
- **Editor Permissions (V2):** The `noteService` and `note_permission` table are designed to support 'editor' roles, allowing editors to create new drafts that an owner can approve/merge.
- **Chat Management:** `chatService` will manage `chat_session` and `chat_message` data, integrating with `note_chunk` and `file_content_chunk` for RAG retrieval.

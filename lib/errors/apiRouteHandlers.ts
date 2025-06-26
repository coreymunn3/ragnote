import { NextRequest, NextResponse } from "next/server";
import { ApiError, InternalServerError } from "./apiErrors";

/**
 * Higher-order function that wraps Next.js route handlers with automatic error handling
 * Eliminates repetitive try/catch blocks in API routes
 */
export function withApiErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  routeContext?: string
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, routeContext);
    }
  };
}

/**
 * Centralized error response handler for API routes
 * Formats errors consistently and provides proper HTTP status codes
 */
function handleApiError(error: unknown, context?: string): NextResponse {
  // Handle known API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Log unexpected errors with context
  const logMessage = context
    ? `Unexpected error in ${context}:`
    : "Unexpected API error:";
  console.error(logMessage, error);

  // Return generic internal server error
  const internalError = new InternalServerError();
  return NextResponse.json(
    { error: internalError.message },
    { status: internalError.statusCode }
  );
}

/**
 * Type-safe wrapper specifically for Next.js API route handlers
 * Provides better TypeScript inference for common route handler patterns
 */
export function withApiRouteErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>,
  routeContext?: string
) {
  return withApiErrorHandling(handler, routeContext);
}

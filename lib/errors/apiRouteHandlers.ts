import { NextRequest, NextResponse } from "next/server";
import { ApiError, InternalServerError } from "./apiErrors";

/**
 * Higher-order function that wraps Next.js route handlers with automatic error handling
 * Eliminates repetitive try/catch blocks in API routes
 * Supports both simple routes (single parameter) and dynamic routes (multiple parameters)
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

import { NextRequest, NextResponse } from "next/server";
import { ApiError, InternalServerError, RateLimitError } from "./apiErrors";

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
    // Log more detailed info for certain error types
    if (error instanceof RateLimitError) {
      console.error(
        `Rate limit exceeded in ${context || "unknown context"}:`,
        error
      );
    }

    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Handle errors that might contain "429" or "quota" in their message
  const errorMessage = error instanceof Error ? error.message : String(error);
  if (
    errorMessage.includes("429") ||
    errorMessage.toLowerCase().includes("quota")
  ) {
    const rateLimitError = new RateLimitError(
      "Rate limit exceeded. Please try again later."
    );
    console.error(
      `Detected rate limit error in ${context || "unknown context"}:`,
      error
    );

    return NextResponse.json(
      { error: rateLimitError.message },
      { status: rateLimitError.statusCode }
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

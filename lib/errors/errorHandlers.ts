import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  ApiError,
} from "./apiErrors";

/**
 * Maps Prisma errors to appropriate API errors
 */
export function mapPrismaError(error: PrismaClientKnownRequestError): ApiError {
  switch (error.code) {
    case "P2002":
      // Unique constraint violation
      const target = error.meta?.target as string[] | undefined;
      const field = target?.[0] || "field";
      return new ConflictError(`A record with this ${field} already exists`);

    case "P2003":
      // Foreign key constraint violation
      return new BadRequestError("Referenced record does not exist");

    case "P2025":
      // Record not found
      return new NotFoundError("Record not found");

    case "P2014":
      // Invalid ID
      return new BadRequestError("Invalid ID provided");

    case "P2021":
      // Table does not exist
      return new InternalServerError("Database schema error");

    case "P2022":
      // Column does not exist
      return new InternalServerError("Database schema error");

    default:
      console.error("Unhandled Prisma error:", error);
      return new InternalServerError("Database operation failed");
  }
}

/**
 * Maps Zod validation errors to BadRequestError
 */
export function mapZodError(error: ZodError): BadRequestError {
  const issues = error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");

  return new BadRequestError(`Validation error: ${issues}`);
}

/**
 * Central error handler for service methods
 * Converts known errors to appropriate API errors
 */
export function handleServiceError(error: unknown): never {
  // Re-throw if already an ApiError
  if (error instanceof ApiError) {
    throw error;
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    throw mapZodError(error);
  }

  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    throw mapPrismaError(error);
  }

  // Handle generic Error objects with specific names
  if (error instanceof Error) {
    if (error.name === "ZodError") {
      throw new BadRequestError(`Validation error: ${error.message}`);
    }
  }

  // Log unexpected errors
  console.error("Unexpected service error:", error);

  // Throw generic error for unknown cases
  throw new InternalServerError("An unexpected error occurred");
}

/**
 * Decorator for automatic error handling in service methods
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleServiceError(error);
    }
  };
}

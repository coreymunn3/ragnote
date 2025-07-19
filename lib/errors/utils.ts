import axios from "axios";
import { NotFoundError } from "./apiErrors";

// Helper to detect not found errors
export function isNotFoundError(error: Error): boolean {
  // Handle Axios error with 404 status code
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return true;
  }
  // Handle our custom NotFoundError
  if (error instanceof NotFoundError) {
    return true;
  }
  // Handle errors with specific message content
  if (
    error.message?.toLowerCase().includes("not found") ||
    error.message?.toLowerCase().includes("access denied")
  ) {
    return true;
  }

  return false;
}

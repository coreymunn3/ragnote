import axios from "axios";
import { toast } from "sonner";
import { NotFoundError } from "./apiErrors";

// Keep existing function unchanged for mutations
export function handleClientSideApiError(error: Error, toastMessage: string) {
  // Default error handling
  toast.error(toastMessage);
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.error || error.message;
    console.error("Failed to create folder:", errorMessage);
  } else {
    console.error("Failed to create folder:", error);
  }
}

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

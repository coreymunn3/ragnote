import axios from "axios";
import { toast } from "sonner";
import { NotFoundError } from "./apiErrors";

// Keep existing function unchanged for mutations
export function handleClientSideMutationError(
  error: Error,
  toastMessage: string
) {
  // Default error handling
  toast.error(toastMessage);
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.error || error.message;
    console.error("Failed to create folder:", errorMessage);
  } else {
    console.error("Failed to create folder:", error);
  }
}

import axios from "axios";
import { toast } from "sonner";

export function handleClientSideApiError(error: Error) {
  // Default error handling
  toast.error("Failed to create folder");
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.error || error.message;
    console.error("Failed to create folder:", errorMessage);
  } else {
    console.error("Failed to create folder:", error);
  }
}

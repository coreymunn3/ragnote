import axios from "axios";
import { toast } from "sonner";

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

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { toast } from "sonner";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";

export type CreateBillingPortalSessionRequest = {
  return_url: string;
};

export type CreateBillingPortalSessionResponse = {
  url: string;
};

async function createBillingPortalSession(
  data: CreateBillingPortalSessionRequest
): Promise<CreateBillingPortalSessionResponse> {
  const res = await axios.post<CreateBillingPortalSessionResponse>(
    "/api/stripe/billingportal",
    data
  );
  return res.data;
}

export type UseCreateBillingPortalSessionOptions = UseMutationHookOptions<
  CreateBillingPortalSessionResponse,
  Error,
  CreateBillingPortalSessionRequest
>;

export function useCreateBillingPortalSession(
  options?: UseCreateBillingPortalSessionOptions
) {
  return useMutation({
    ...options,
    mutationFn: createBillingPortalSession,
    onSuccess: (data, variables, context) => {
      // Redirect to billing portal
      window.location.href = data.url;

      // Custom onSuccess callback
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideMutationError(error, "Failed to open billing portal");
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

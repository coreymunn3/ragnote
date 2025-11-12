import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { toast } from "sonner";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";
import {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from "@/lib/types/stripeTypes";

async function createCheckoutSession(
  data: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> {
  const res = await axios.post<CreateCheckoutSessionResponse>(
    "/api/stripe/checkout",
    data
  );
  return res.data;
}

export type UseCreateCheckouSessionOptions = UseMutationHookOptions<
  CreateCheckoutSessionResponse,
  Error,
  CreateCheckoutSessionRequest
>;

export function useCreateCheckoutSession(
  options?: UseCreateCheckouSessionOptions
) {
  return useMutation({
    ...options,
    mutationFn: createCheckoutSession,
    onSuccess: (data, variables, context) => {
      // redirect to checkout session
      window.location.href = data.url;
      // any custom on Success cb
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideMutationError(error, "Failed to open checkout session");
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

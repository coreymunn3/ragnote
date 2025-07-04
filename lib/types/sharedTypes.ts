import { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// Base type for useQuery-based hooks
export type UseQueryHookOptions<TData, TError = Error> = Omit<
  UseQueryOptions<TData, TError>,
  "queryKey" | "queryFn"
>;

// Base type for useMutation-based hooks
export type UseMutationHookOptions<
  TData,
  TError = Error,
  TVariables = void,
> = Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">;

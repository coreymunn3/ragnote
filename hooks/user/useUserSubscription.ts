import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import { UserSubscription } from "@/lib/types/userTypes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getUserSubscription = async (): Promise<UserSubscription> => {
  const res = await axios.get("/api/user/subscription");
  return res.data;
};

export type UseGetUserSubscriptionOptions =
  UseQueryHookOptions<UserSubscription>;

export const useUserSubscription = (
  options?: UseGetUserSubscriptionOptions
) => {
  return useQuery({
    queryKey: ["userSubscription"],
    queryFn: getUserSubscription,
    ...options,
  });
};

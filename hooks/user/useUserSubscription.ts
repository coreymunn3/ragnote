import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import { UserSubscription } from "@/lib/types/userTypes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DateTime } from "luxon";

const getUserSubscription = async (): Promise<UserSubscription> => {
  const res = await axios.get("/api/user/subscription");
  return res.data;
};

export type UseGetUserSubscriptionOptions =
  UseQueryHookOptions<UserSubscription>;

export const useUserSubscription = (
  options?: UseGetUserSubscriptionOptions
) => {
  const subscriptionQuery = useQuery({
    queryKey: ["userSubscription"],
    queryFn: getUserSubscription,
    ...options,
  });

  const hasProAccess = (): boolean => {
    if (!subscriptionQuery.isSuccess || !subscriptionQuery.data) {
      return false;
    }
    const { tier, end_date } = subscriptionQuery.data;
    // if not pro, then false
    if (tier !== "PRO") {
      return false;
    }
    // if no end date, then the user is free tier
    if (!end_date) {
      return false;
    }
    // if end date is not in the future, then it has expired
    const endDateTime = DateTime.fromISO(end_date);
    const now = DateTime.now();
    return endDateTime > now;
  };

  return {
    ...subscriptionQuery,
    isPro: hasProAccess(),
  };
};

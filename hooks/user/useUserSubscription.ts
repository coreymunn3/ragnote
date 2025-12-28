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

    // If not Pro tier, no access
    if (tier !== "PRO") {
      return false;
    }

    // If no end_date, subscription is active (recurring)
    if (!end_date) {
      return true;
    }

    // Check if end_date is in the future
    const endDateTime = DateTime.fromISO(end_date);
    const now = DateTime.now();
    return endDateTime > now;
  };

  return {
    ...subscriptionQuery,
    isPro: hasProAccess(),
  };
};

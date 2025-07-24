import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { userIdSchema } from "./userValidators";
import { prisma } from "@/lib/prisma";
import { UserSubscription } from "@/lib/types/userTypes";
import { transformUserSubscription } from "./userTransformers";
import { NotFoundError } from "@/lib/errors/apiErrors";

export class UserService {
  /**
   * Get a user's subscription status
   */
  public getUserSubscription = withErrorHandling(
    async (userId: string): Promise<UserSubscription> => {
      const { userId: validatedUserId } = userIdSchema.parse({ userId });

      // First verify that the user exists
      const user = await prisma.app_user.findUnique({
        where: {
          id: validatedUserId,
        },
      });

      if (!user) {
        throw new NotFoundError(`User with ID ${validatedUserId} not found`);
      }

      // Now get the subscription - it should always exist since it's created with the user
      const subscription = await prisma.user_subscription.findUnique({
        where: {
          user_id: validatedUserId,
        },
      });

      // If no subscription is found, this indicates a data integrity issue
      if (!subscription) {
        throw new NotFoundError(
          `Subscription not found for user ${validatedUserId}. This indicates a data integrity issue.`
        );
      }

      // Transform and return the subscription
      return transformUserSubscription(subscription);
    }
  );
}

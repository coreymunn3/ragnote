import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { prisma } from "@/lib/prisma";
import {
  upsertUserFromClerkSchema,
  softDeleteUserFromClerkSchema,
} from "./clerkValidators";
import {
  CreateUserFromClerkParams,
  SoftDeleteUserFromClerkParams,
} from "@/lib/types/clerkTypes";
import { NotFoundError } from "@/lib/errors/apiErrors";
import { randomBytes } from "crypto";

export class ClerkService {
  /**
   * Generate an anonymized email for soft-deleted users
   * Uses a random hash to prevent future conflicts on re-signup
   */
  private generateAnonymizedEmail(originalEmail: string): string {
    const hash = randomBytes(8).toString("hex");
    const [localPart, domain] = originalEmail.split("@");
    return `${localPart}_deleted_${hash}@${domain || "example.com"}`;
  }

  /**
   * Upsert a user from Clerk data (webhook or JIT creation)
   * This is idempotent and safe to call from both webhooks and first request
   *
   * Uses upsert to handle race conditions:
   * - If user exists: updates their data
   * - If user doesn't exist: creates them with a FREE subscription
   */
  public upsertUserFromClerk = withErrorHandling(
    async (params: CreateUserFromClerkParams) => {
      const { clerkId, email, username, firstName, lastName, avatarUrl } =
        upsertUserFromClerkSchema.parse(params);

      // Use transaction to ensure both user and subscription are upserted atomically
      const user = await prisma.$transaction(async (tx) => {
        // 1. Upsert the user
        const upsertedUser = await tx.app_user.upsert({
          where: {
            clerk_id: clerkId,
          },
          update: {
            // Update user data if they already exist
            username: username || null,
            email: email,
            first_name: firstName || null,
            last_name: lastName || null,
            avatar_url: avatarUrl || null,
          },
          create: {
            // Create new user if they don't exist
            clerk_id: clerkId,
            username: username || null,
            email: email,
            first_name: firstName || null,
            last_name: lastName || null,
            avatar_url: avatarUrl || null,
          },
        });

        // 2. Ensure user has a subscription (upsert to handle race conditions)
        await tx.user_subscription.upsert({
          where: {
            user_id: upsertedUser.id,
          },
          update: {
            // If subscription exists, don't change it (preserve tier/stripe data)
          },
          create: {
            // Create FREE subscription if it doesn't exist
            user_id: upsertedUser.id,
            tier: "FREE",
          },
        });

        return upsertedUser;
      });

      console.log(`Successfully upserted user with clerk_id: ${clerkId}`);
      return user;
    },
  );

  /**
   * @deprecated Use upsertUserFromClerk instead
   * Kept for backward compatibility
   */
  public createUserFromClerk = this.upsertUserFromClerk;

  /**
   * @deprecated Use upsertUserFromClerk instead
   * Kept for backward compatibility
   */
  public updateUserFromClerk = this.upsertUserFromClerk;

  /**
   * Soft delete user and all their content from Clerk webhook
   * Preserves data relationships while marking everything as deleted
   */
  public softDeleteUserFromClerk = withErrorHandling(
    async (params: SoftDeleteUserFromClerkParams): Promise<void> => {
      const { clerkId } = softDeleteUserFromClerkSchema.parse(params);

      // Find the user by clerk_id
      const user = await prisma.app_user.findUnique({
        where: { clerk_id: clerkId },
        select: { id: true, email: true },
      });

      if (!user) {
        throw new NotFoundError(`User with clerk_id ${clerkId} not found`);
      }

      // Use transaction to ensure all soft deletes happen atomically
      await prisma.$transaction(async (tx) => {
        // 1. Soft delete all user folders
        await tx.folder.updateMany({
          where: { user_id: user.id },
          data: { is_deleted: true },
        });

        // 2. Soft delete all user notes
        await tx.note.updateMany({
          where: { user_id: user.id },
          data: { is_deleted: true },
        });

        // 3. Soft delete all user chat sessions
        await tx.chat_session.updateMany({
          where: { user_id: user.id },
          data: { is_deleted: true },
        });

        // 4. Soft delete all user files
        await tx.file.updateMany({
          where: { user_id: user.id },
          data: { is_deleted: true },
        });

        // 5. Cancel user subscription by setting end_date
        await tx.user_subscription.updateMany({
          where: { user_id: user.id },
          data: {
            end_date: new Date(),
          },
        });

        // 6. Mark the user as deleted and anonymize email to prevent conflicts
        const anonymizedEmail = this.generateAnonymizedEmail(user.email);
        await tx.app_user.update({
          where: { id: user.id },
          data: {
            is_deleted: true,
            email: anonymizedEmail,
          },
        });

        // Note: We intentionally keep note_permissions to preserve sharing history
        // This maintains data integrity for users who had notes shared with them
      });

      console.log(
        `Successfully soft deleted user ${clerkId} and all their content`,
      );
    },
  );
}

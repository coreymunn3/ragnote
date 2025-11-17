import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { prisma } from "@/lib/prisma";
import {
  createUserFromClerkSchema,
  updateUserFromClerkSchema,
  softDeleteUserFromClerkSchema,
} from "./clerkValidators";
import {
  CreateUserFromClerkParams,
  UpdateUserFromClerkParams,
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
   * Create a new user from Clerk webhook data
   * Creates both the user record and their initial FREE subscription
   */
  public createUserFromClerk = withErrorHandling(
    async (params: CreateUserFromClerkParams): Promise<void> => {
      const { clerkId, email, username, firstName, lastName, avatarUrl } =
        createUserFromClerkSchema.parse(params);

      // Use transaction to ensure both user and subscription are created atomically
      await prisma.$transaction(async (tx) => {
        // 1. Create the user
        const newUser = await tx.app_user.create({
          data: {
            clerk_id: clerkId,
            username: username || null,
            email: email,
            first_name: firstName || null,
            last_name: lastName || null,
            avatar_url: avatarUrl || null,
          },
        });

        // 2. Create the user subscription with FREE tier
        await tx.user_subscription.create({
          data: {
            user_id: newUser.id,
            tier: "FREE",
          },
        });
      });

      console.log(`Successfully created user with clerk_id: ${clerkId}`);
    }
  );

  /**
   * Update user profile data from Clerk webhook
   * Uses upsert to handle cases where user might not exist yet
   */
  public updateUserFromClerk = withErrorHandling(
    async (params: UpdateUserFromClerkParams): Promise<void> => {
      const { clerkId, email, username, firstName, lastName, avatarUrl } =
        updateUserFromClerkSchema.parse(params);

      // see if this user exists in our database
      const user = await prisma.app_user.findUnique({
        where: {
          clerk_id: clerkId,
        },
      });

      // if the user exists, update them
      // otherwise, create them
      if (user) {
        await prisma.app_user.update({
          where: { clerk_id: clerkId },
          data: {
            username: username || null,
            email: email,
            first_name: firstName || null,
            last_name: lastName || null,
            avatar_url: avatarUrl || null,
          },
        });
      } else {
        this.createUserFromClerk({
          clerkId,
          email,
          firstName,
          lastName,
          avatarUrl,
          username,
        });
      }

      console.log(`Successfully updated user with clerk_id: ${clerkId}`);
    }
  );

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
        `Successfully soft deleted user ${clerkId} and all their content`
      );
    }
  );
}

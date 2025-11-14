// Clerk transformers - currently minimal as ClerkService primarily handles webhook processing
// Add transformers here if needed for future Clerk-related data transformations

/**
 * Transform Clerk webhook user data to our internal format
 * Currently just passes through the data, but provides a place for future transformations
 */
export const transformClerkUserData = (userData: any) => {
  return {
    clerkId: userData.id,
    email: userData.email_addresses?.[0]?.email_address || "",
    username: userData.username || null,
    firstName: userData.first_name || null,
    lastName: userData.last_name || null,
    avatarUrl: userData.image_url || null,
  };
};

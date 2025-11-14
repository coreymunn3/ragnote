/**
 * Parameter types for StripeService methods
 */
export type CreateStripeCustomerParams = {
  userId: string;
  email: string;
  name?: string;
};

export type createBillingPortalSessionParams = {
  stripeCustomerId: string;
  returnUrl: string;
};

export type createCheckoutSessionParams = {
  stripeCustomerId: string;
  userId: string;
  returnUrl: string;
};

/**
 * API Request and Response Types
 */
export type CreateCheckoutSessionRequest = {
  return_url: string;
};

export type CreateCheckoutSessionResponse = {
  url: string;
};

export type CreateBillingPortalSessionRequest = {
  return_url: string;
};

export type CreateBillingPortalSessionResponse = {
  url: string;
};

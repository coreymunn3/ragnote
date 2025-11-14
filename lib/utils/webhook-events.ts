import { prisma } from "../prisma";

export type WebhookProvider = "CLERK" | "STRIPE";

export async function saveWebhookEvent(params: {
  provider: WebhookProvider;
  webhookId: string;
  eventType: string;
  eventPayload: any;
}): Promise<boolean> {
  try {
    await prisma.webhook_events.create({
      data: {
        provider: params.provider,
        webhook_id: params.webhookId,
        event_type: params.eventType,
        event_payload: params.eventPayload,
      },
    });
    return true; // saved, means its a new webhook event we've never seen before, safe to process
  } catch (error: any) {
    // database duplication on unique col
    if (error?.code === "P2002") {
      return false;
    }
    throw error;
  }
}

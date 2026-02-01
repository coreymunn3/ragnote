import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/getDbUser";
import { DeletedItemsService } from "@/services/deleted/deletedItemsService";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { auth } from "@clerk/nextjs/server";

const deletedItemsService = new DeletedItemsService();

/**
 * Get all deleted items for the authenticated user
 * Returns deleted folders, notes, and chat sessions
 */
const getHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();

  const deletedItems = await deletedItemsService.getDeletedItems(dbUser.id);

  return NextResponse.json(deletedItems, { status: 200 });
};

export const GET = withApiErrorHandling(getHandler, "GET /api/deleted");

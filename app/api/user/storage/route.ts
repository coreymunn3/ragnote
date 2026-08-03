import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbUser } from "@/lib/getDbUser";
import { FileService } from "@/services/file/fileService";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";

/**
 * GET /api/user/storage
 * Returns the current storage usage for the authenticated user.
 */
const getHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();

  const fileService = new FileService(dbUser.id);
  const usage = await fileService.getStorageUsage();

  // BigInt is not JSON-serializable — convert to number (safe up to 2^53 bytes ≈ 8 PB)
  return NextResponse.json(
    {
      used: Number(usage.used),
      total: usage.total,
      percentage: usage.percentage,
    },
    { status: 200 },
  );
};

export const GET = withApiErrorHandling(getHandler, "GET /api/user/storage");

import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbUser } from "@/lib/getDbUser";
import { FileService } from "@/services/file/fileService";
import { ApiError, InternalServerError } from "@/lib/errors/apiErrors";

/**
 * GET /api/files/[fileId]/view
 *
 * API proxy that streams a private R2 file to the browser.
 * This is the only way files are served — the R2 bucket is private and
 * storage keys are never exposed to the client.
 *
 * Stable, permanent URL: never expires. Access is validated on every request.
 * Browser caches the response for 1 hour via Cache-Control.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    auth.protect();
    const { fileId } = await params;
    const dbUser = await getDbUser();

    const fileService = new FileService(dbUser.id);
    const { stream, contentType, fileName } =
      await fileService.streamFile(fileId);

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Unexpected error in GET /api/files/[fileId]/view:", error);
    const internalError = new InternalServerError();
    return new Response(JSON.stringify({ error: internalError.message }), {
      status: internalError.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}

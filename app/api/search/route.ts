import { getDbUser } from "@/lib/getDbUser";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { AiService } from "@/services/ai/aiService";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";

const getHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();
  const aiService = new AiService(dbUser.id);
  // extract the query from the URL param - query is required
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("query");
  if (!query) {
    return NextResponse.json({ error: "No query provided" }, { status: 400 });
  }
  // get the results
  const results = await aiService.semanticSearch(query, dbUser.id);
  return NextResponse.json(results, { status: 200 });
};

export const GET = withApiErrorHandling(getHandler, "GET /api/search");

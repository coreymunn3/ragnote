import { getDbUser } from "@/lib/getDbUser";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "@/services/search/searchService";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";

const getHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();
  const searchService = new SearchService();
  // extract the query from the URL param - query is required
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("query");
  if (!query) {
    return NextResponse.json({ error: "No query provided" }, { status: 400 });
  }
  // get the results - SearchService will determine whether to use semantic or text search
  const results = await searchService.search({ query, userId: dbUser.id });
  return NextResponse.json(results, { status: 200 });
};

export const GET = withApiErrorHandling(getHandler, "GET /api/search");

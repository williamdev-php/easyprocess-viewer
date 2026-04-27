import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;
const MIN_SECRET_LENGTH = 32;

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (
    !REVALIDATION_SECRET ||
    REVALIDATION_SECRET.length < MIN_SECRET_LENGTH ||
    secret !== REVALIDATION_SECRET
  ) {
    if (REVALIDATION_SECRET && REVALIDATION_SECRET.length < MIN_SECRET_LENGTH) {
      console.error(
        `[revalidate] REVALIDATION_SECRET is too short (${REVALIDATION_SECRET.length} chars). ` +
        `Minimum ${MIN_SECRET_LENGTH} characters required. Rejecting all revalidation requests.`
      );
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!REVALIDATION_SECRET || secret !== REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}

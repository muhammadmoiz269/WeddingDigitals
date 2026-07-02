import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";

/**
 * Guard for admin-only API routes. Verifies the HTTP-only `admin_session`
 * cookie against the session token stored on the Admin document (same check
 * as GET /api/auth/check).
 *
 * Returns null when authenticated, otherwise a ready-to-return 401 response:
 *
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const unauthorized = NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;
    if (!sessionToken) return unauthorized;

    await connectToDatabase();
    const admin = await Admin.findOne({ session_token: sessionToken }).lean();
    if (!admin) return unauthorized;

    return null;
  } catch (error) {
    console.error("Admin auth check failed:", error);
    return unauthorized;
  }
}

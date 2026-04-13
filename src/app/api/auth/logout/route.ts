import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    // Clear the session token from DB
    if (sessionToken) {
      await connectToDatabase();
      await Admin.findOneAndUpdate(
        { session_token: sessionToken },
        { $set: { session_token: null } }
      );
    }

    // Clear the cookie
    cookieStore.delete("admin_session");

    return NextResponse.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear the cookie even if DB update fails
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    return NextResponse.json({ success: true, message: "Logged out" });
  }
}

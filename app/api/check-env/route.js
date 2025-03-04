import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "Set"
      : "Not set",
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "Set"
      : "Not set",
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "Not set",
  });
}

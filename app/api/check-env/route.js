import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    env_vars: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "Available"
        : "Missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "Available"
        : "Missing",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
        ? "Available"
        : "Missing",
    },
    note: "The SUPABASE_SERVICE_ROLE_KEY is not accessible in the browser because it doesn't have the NEXT_PUBLIC_ prefix",
  });
}

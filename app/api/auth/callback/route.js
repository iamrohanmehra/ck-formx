import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);

    // Get the session to check the user's email
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // List of authorized admin emails
    const AUTHORIZED_ADMINS = [
      "rohanmehra224466@gmail.com",
      "ashish.efslon@gmail.com",
    ];

    // If the user is authorized, redirect directly to admin
    if (session && AUTHORIZED_ADMINS.includes(session.user.email)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // If not authorized or no code, redirect to login
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

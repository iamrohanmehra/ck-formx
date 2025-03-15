import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

// List of authorized admin emails
const AUTHORIZED_ADMINS = [
  "rohanmehra224466@gmail.com",
  "ashish.efslon@gmail.com",
];

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the current path
  const path = req.nextUrl.pathname;

  // If the path starts with /admin and is not /admin/login
  if (path.startsWith("/admin") && path !== "/admin/login") {
    // If there's no session, redirect to login
    if (!session) {
      const redirectUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If the user is not authorized (not in the list of authorized emails)
    if (!AUTHORIZED_ADMINS.includes(session.user.email)) {
      // Sign out the user
      await supabase.auth.signOut();

      // Redirect to login with error
      const redirectUrl = new URL("/admin/login", req.url);
      redirectUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ["/admin/:path*"],
};

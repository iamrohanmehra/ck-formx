import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Check for cron job authentication
    const authHeader = request.headers.get("authorization");

    // If this is a Vercel cron job, it will have a specific authorization header
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET_KEY}`;

    // If it's not a Vercel cron job, we need to check if it's coming from our admin UI
    if (!isVercelCron) {
      // For requests from the admin UI, we don't need additional auth since this is a server-side endpoint
      // But you could add additional checks here if needed
      console.log("Manual refresh request received");
    } else {
      console.log("Scheduled cron job refresh request received");
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: "Missing Supabase credentials" },
        { status: 500 }
      );
    }

    // Create Supabase client with service key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Refresh all materialized views using the secure function
    const { error } = await supabase.rpc("refresh_form_stats_secure");

    if (error) {
      console.error("Error refreshing stats:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Stats refreshed successfully",
      timestamp: new Date().toISOString(),
      source: isVercelCron ? "scheduled" : "manual",
    });
  } catch (error) {
    console.error("Error refreshing stats:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

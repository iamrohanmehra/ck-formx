import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Simple in-memory cache with expiration
let statsCache = {
  data: null,
  timestamp: 0,
  expiryTime: 5 * 60 * 1000, // 5 minutes
};

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const refreshCache = searchParams.get("refresh") === "true";
    const dateRange = parseInt(searchParams.get("dateRange") || "30");

    // Check if we have valid cached data and no refresh is requested
    const now = Date.now();
    if (
      !refreshCache &&
      statsCache.data &&
      now - statsCache.timestamp < statsCache.expiryTime
    ) {
      console.log("Returning cached stats data");
      return NextResponse.json({
        success: true,
        stats: statsCache.data,
        fromCache: true,
      });
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

    // If refresh is requested, refresh the materialized views
    if (refreshCache) {
      console.log("Refreshing materialized views");
      await supabase.rpc("refresh_form_stats");
    }

    // Get total submissions from materialized view
    const { data: totalData, error: totalError } = await supabase
      .from("form_stats_overall")
      .select("total_submissions")
      .single();

    if (totalError) {
      console.error("Error fetching total submissions:", totalError);
      return NextResponse.json(
        { success: false, error: totalError.message },
        { status: 500 }
      );
    }

    // Get submissions by form type from materialized view
    const { data: formTypeData, error: formTypeError } = await supabase
      .from("form_stats_by_type")
      .select("form_type, count");

    if (formTypeError) {
      console.error("Error fetching form type stats:", formTypeError);
      return NextResponse.json(
        { success: false, error: formTypeError.message },
        { status: 500 }
      );
    }

    // Get submissions by occupation from materialized view
    const { data: occupationData, error: occupationError } = await supabase
      .from("form_stats_by_occupation")
      .select("occupation, count");

    if (occupationError) {
      console.error("Error fetching occupation stats:", occupationError);
      return NextResponse.json(
        { success: false, error: occupationError.message },
        { status: 500 }
      );
    }

    // Get submissions by date using the function
    const { data: dateData, error: dateError } = await supabase.rpc(
      "get_submissions_by_date",
      { days_limit: dateRange }
    );

    if (dateError) {
      console.error("Error fetching date stats:", dateError);
      return NextResponse.json(
        { success: false, error: dateError.message },
        { status: 500 }
      );
    }

    // Format the data for the frontend
    const submissionsByFormType = {};
    formTypeData.forEach((item) => {
      submissionsByFormType[item.form_type] = item.count;
    });

    const submissionsByOccupation = {};
    occupationData.forEach((item) => {
      submissionsByOccupation[item.occupation] = item.count;
    });

    const submissionsByDate = {};
    dateData.forEach((item) => {
      submissionsByDate[item.submission_date] = item.count;
    });

    // Compile stats
    const stats = {
      totalSubmissions: totalData?.total_submissions || 0,
      submissionsByFormType,
      submissionsByOccupation,
      submissionsByDate,
      lastUpdated: new Date().toISOString(),
    };

    // Update cache
    statsCache = {
      data: stats,
      timestamp: now,
      expiryTime: 5 * 60 * 1000,
    };

    return NextResponse.json({
      success: true,
      stats,
      refreshed: refreshCache,
    });
  } catch (error) {
    console.error("Error generating stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate stats",
      },
      { status: 500 }
    );
  }
}

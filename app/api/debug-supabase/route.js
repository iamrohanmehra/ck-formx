import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Check if credentials are available
    const credentialsStatus = {
      supabaseUrl: supabaseUrl ? "Available" : "Missing",
      supabaseAnonKey: supabaseAnonKey ? "Available" : "Missing",
      supabaseServiceKey: supabaseServiceKey ? "Available" : "Missing",
    };

    let tableInfo = null;
    let formSubmissions = null;
    let formSubmissionsCount = 0;
    let formTypes = [];
    let error = null;

    // Only proceed if we have the minimum required credentials
    if (supabaseUrl && (supabaseAnonKey || supabaseServiceKey)) {
      try {
        // Create Supabase client with available credentials - prefer service key
        const supabase = supabaseServiceKey
          ? createClient(supabaseUrl, supabaseServiceKey)
          : createClient(supabaseUrl, supabaseAnonKey);

        // Check if form_submissions table exists by trying to query it
        const { data: testData, error: testError } = await supabase
          .from("form_submissions")
          .select("id")
          .limit(1);

        // If there's no error, the table exists
        tableInfo = {
          form_submissions_exists: !testError,
          error_message: testError ? testError.message : null,
        };

        // If form_submissions exists, check for data
        if (tableInfo.form_submissions_exists) {
          // Get all submissions to count them
          const { data: allSubmissions, error: submissionsError } =
            await supabase.from("form_submissions").select("*");

          if (submissionsError) {
            throw new Error(
              `Error fetching submissions: ${submissionsError.message}`
            );
          }

          formSubmissionsCount = allSubmissions?.length || 0;
          formSubmissions = allSubmissions?.slice(0, 5) || [];

          // Extract unique form types
          formTypes = [
            ...new Set(allSubmissions?.map((item) => item.form_type) || []),
          ];

          console.log("Debug API found submissions:", formSubmissionsCount);
          console.log("Form types found:", formTypes);
        }
      } catch (err) {
        error = err.message;
      }
    }

    // Return diagnostic information
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      credentials: credentialsStatus,
      database: {
        tableInfo,
        formSubmissionsCount,
        formTypes,
        sampleSubmissions: formSubmissions,
      },
      error,
      troubleshooting: {
        checkEnvironmentVariables:
          "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly in your environment",
        checkDatabaseConnection:
          "Verify that your Supabase project is running and accessible",
        checkTableExists:
          "Make sure the form_submissions table exists in your database",
        checkDataExists: "Verify that you have submitted at least one form",
        runMigration:
          "If you've recently updated your schema, make sure to run the migration at /admin/migration",
      },
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

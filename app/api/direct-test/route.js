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

    // Try all possible credential combinations
    let results = [];
    let errors = [];

    // Try with anon key
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        console.log("Trying with anon key...");

        // Direct query to get all submissions
        const { data: allData, error: allError } = await supabase
          .from("form_submissions")
          .select("*");

        if (allError) {
          errors.push({
            source: "anon_key",
            message: allError.message,
            code: allError.code,
          });
        } else {
          results.push({
            source: "anon_key",
            count: allData?.length || 0,
            data: allData,
          });
        }
      } catch (err) {
        errors.push({
          source: "anon_key",
          message: err.message,
        });
      }
    }

    // Try with service key
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        console.log("Trying with service key...");

        // Direct query to get all submissions
        const { data: allData, error: allError } = await supabase
          .from("form_submissions")
          .select("*");

        if (allError) {
          errors.push({
            source: "service_key",
            message: allError.message,
            code: allError.code,
          });
        } else {
          results.push({
            source: "service_key",
            count: allData?.length || 0,
            data: allData,
          });
        }
      } catch (err) {
        errors.push({
          source: "service_key",
          message: err.message,
        });
      }
    }

    // Return all results
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      credentials: credentialsStatus,
      results,
      errors,
      troubleshooting: {
        checkEnvironmentVariables:
          "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly in your environment",
        checkDatabaseConnection:
          "Verify that your Supabase project is running and accessible",
        checkTableExists:
          "Make sure the form_submissions table exists in your database",
      },
    });
  } catch (error) {
    console.error("Direct test API error:", error);
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

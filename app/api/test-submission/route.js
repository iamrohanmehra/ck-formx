import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get form type from query parameter or default to formx1
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get("form_type") || "formx1";

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
      return NextResponse.json(
        { success: false, error: "Missing Supabase credentials" },
        { status: 500 }
      );
    }

    const supabase = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey)
      : createClient(supabaseUrl, supabaseAnonKey);

    // Create a test submission based on form type
    let testSubmission = {
      first_name: `Test User (${formType})`,
      email: `test-${formType}@example.com`,
      whatsapp: "1234567890",
      preference: "email",
      occupation: "student",
      form_type: formType,
    };

    // Add form-specific data
    if (formType === "formx1") {
      testSubmission.form_data = {
        recommendation: "yes",
      };
    } else if (formType === "formx4") {
      testSubmission.form_data = {
        frontend_interest: "high",
        income: "$50k-$100k",
      };
    }

    console.log("Inserting test submission:", testSubmission);

    // Insert the test submission
    const { data, error } = await supabase
      .from("form_submissions")
      .insert(testSubmission)
      .select();

    if (error) {
      // If the form_data column doesn't exist yet, try without it
      if (error.message.includes("form_data")) {
        console.log("Trying without form_data column...");
        const legacySubmission = {
          first_name: `Test User (${formType})`,
          email: `test-${formType}@example.com`,
          whatsapp: "1234567890",
          preference: "email",
          occupation: "student",
          form_type: formType,
        };

        // Add legacy fields
        if (formType === "formx1") {
          legacySubmission.recommendation = "yes";
        } else if (formType === "formx4") {
          legacySubmission.frontend_interest = "high";
          legacySubmission.income = "$50k-$100k";
        }

        const { data: legacyData, error: legacyError } = await supabase
          .from("form_submissions")
          .insert(legacySubmission)
          .select();

        if (legacyError) {
          throw new Error(`Legacy insert error: ${legacyError.message}`);
        }

        return NextResponse.json({
          success: true,
          message: "Test submission added successfully (legacy format)",
          data: legacyData,
          note: "The form_data column doesn't exist yet. Please run the migration at /admin/migration",
        });
      }

      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      message: "Test submission added successfully",
      data,
    });
  } catch (error) {
    console.error("Error adding test submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        troubleshooting: {
          checkEnvironmentVariables:
            "Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set correctly",
          checkDatabaseConnection:
            "Verify that your Supabase project is running and accessible",
          checkTableExists:
            "Make sure the form_submissions table exists in your database",
          runMigration:
            "If you've recently updated your schema, make sure to run the migration at /admin/migration",
        },
      },
      { status: 500 }
    );
  }
}

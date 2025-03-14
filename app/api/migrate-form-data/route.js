import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: "Missing Supabase credentials" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all existing submissions
    const { data: submissions, error: fetchError } = await supabase
      .from("form_submissions")
      .select("*");

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    console.log(`Found ${submissions.length} submissions to migrate`);

    // Process each submission
    const results = [];
    for (const submission of submissions) {
      // Skip if already has form_data
      if (submission.form_data) {
        results.push({
          id: submission.id,
          status: "skipped",
          reason: "Already has form_data",
        });
        continue;
      }

      // Create form_data object
      const formData = {};

      // Add form-specific fields
      if (
        submission.recommendation !== null &&
        submission.recommendation !== undefined
      ) {
        formData.recommendation = submission.recommendation;
      }

      if (submission.income !== null && submission.income !== undefined) {
        formData.income = submission.income;
      }

      if (
        submission.frontend_interest !== null &&
        submission.frontend_interest !== undefined
      ) {
        formData.frontend_interest = submission.frontend_interest;
      }

      // Update the record
      const { error: updateError } = await supabase
        .from("form_submissions")
        .update({ form_data: formData })
        .eq("id", submission.id);

      if (updateError) {
        results.push({
          id: submission.id,
          status: "error",
          error: updateError.message,
        });
      } else {
        results.push({
          id: submission.id,
          status: "success",
          form_data: formData,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. ${
        results.filter((r) => r.status === "success").length
      } records updated.`,
      results,
    });
  } catch (error) {
    console.error("Error migrating data:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

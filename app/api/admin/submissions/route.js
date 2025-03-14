import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get form type from query parameter
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get("form_type");

    if (!formType) {
      return NextResponse.json(
        { success: false, error: "Missing form_type parameter" },
        { status: 400 }
      );
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

    console.log("Fetching submissions for form type:", formType);

    // Fetch submissions for the selected form
    const { data, error } = await supabase
      .from("form_submissions")
      .select("*")
      .eq("form_type", formType);

    if (error) {
      console.error("Error fetching submissions:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`Found ${data?.length || 0} submissions`);

    // Process form_data if it exists
    const processedData =
      data?.map((submission) => {
        // Create a new processed submission object
        const processedSubmission = { ...submission };

        // If form_data is a string, try to parse it
        if (submission.form_data && typeof submission.form_data === "string") {
          try {
            processedSubmission.form_data = JSON.parse(submission.form_data);
          } catch (e) {
            console.error("Error parsing form_data:", e);
            processedSubmission.form_data = {};
          }
        } else if (!submission.form_data) {
          // If form_data doesn't exist, create an empty object
          processedSubmission.form_data = {};
        }

        // Move legacy fields to form_data if they exist
        const legacyFields = [
          "recommendation",
          "income",
          "frontend_interest",
          "frontendInterest",
        ];

        legacyFields.forEach((field) => {
          if (submission[field] !== undefined && submission[field] !== null) {
            // Handle the case where frontendInterest should be stored as frontend_interest
            const formDataKey =
              field === "frontendInterest" ? "frontend_interest" : field;
            processedSubmission.form_data[formDataKey] = submission[field];
          }
        });

        return processedSubmission;
      }) || [];

    return NextResponse.json({
      success: true,
      submissions: processedData,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch submissions",
      },
      { status: 500 }
    );
  }
}

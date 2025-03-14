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

    // Create Supabase client with service key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all form submissions
    console.log("Fetching form types from form_submissions table...");
    const { data: submissions, error: submissionsError } = await supabase
      .from("form_submissions")
      .select("form_type");

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      return NextResponse.json(
        { success: false, error: submissionsError.message },
        { status: 500 }
      );
    }

    console.log("Raw submissions data:", submissions);

    if (submissions && submissions.length > 0) {
      console.log("Found submissions:", submissions.length);

      // Extract unique form types
      const uniqueFormTypes = [
        ...new Set(submissions.map((item) => item.form_type || "unknown")),
      ].filter((type) => type); // Filter out null/undefined/empty values

      console.log("Unique form types:", uniqueFormTypes);

      // Calculate submission counts for each form type
      const submissionCounts = {};
      uniqueFormTypes.forEach((formType) => {
        submissionCounts[formType] = submissions.filter(
          (submission) => submission.form_type === formType
        ).length;
      });

      console.log("Submission counts:", submissionCounts);

      // Create form objects from unique form types
      const derivedForms = uniqueFormTypes.map((formType) => ({
        id: formType,
        title: `${formType.charAt(0).toUpperCase() + formType.slice(1)}`,
        is_active: true,
        form_type: formType,
      }));

      console.log("Derived forms:", derivedForms);

      return NextResponse.json({
        success: true,
        forms: derivedForms,
        submissionCounts,
      });
    } else {
      // No submissions found
      console.log("No submissions found");
      return NextResponse.json({
        success: false,
        error: "No form submissions found in the database",
        forms: [],
      });
    }
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch forms",
      },
      { status: 500 }
    );
  }
}

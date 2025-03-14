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
    console.log("Fetching all submissions for stats...");
    const { data: submissions, error: submissionsError } = await supabase
      .from("form_submissions")
      .select("*");

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      return NextResponse.json(
        { success: false, error: submissionsError.message },
        { status: 500 }
      );
    }

    console.log(`Found ${submissions?.length || 0} total submissions`);

    // Calculate stats
    const stats = {
      totalSubmissions: submissions?.length || 0,
      submissionsByFormType: {},
      submissionsByDate: {},
      submissionsByOccupation: {},
    };

    // Process submissions
    if (submissions && submissions.length > 0) {
      // Group by form type
      submissions.forEach((submission) => {
        const formType = submission.form_type || "unknown";

        // Count by form type
        if (!stats.submissionsByFormType[formType]) {
          stats.submissionsByFormType[formType] = 0;
        }
        stats.submissionsByFormType[formType]++;

        // Count by date (using just the date part)
        const submissionDate = new Date(submission.created_at)
          .toISOString()
          .split("T")[0];
        if (!stats.submissionsByDate[submissionDate]) {
          stats.submissionsByDate[submissionDate] = 0;
        }
        stats.submissionsByDate[submissionDate]++;

        // Count by occupation
        const occupation = submission.occupation || "unknown";
        if (!stats.submissionsByOccupation[occupation]) {
          stats.submissionsByOccupation[occupation] = 0;
        }
        stats.submissionsByOccupation[occupation]++;
      });
    }

    return NextResponse.json({
      success: true,
      stats,
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

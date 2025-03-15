import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get("form_type");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortField = searchParams.get("sortField") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const searchTerm = searchParams.get("search");

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

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build the query
    let query = supabase
      .from("form_submissions")
      .select("*", { count: "exact" })
      .eq("form_type", formType);

    // Apply date filters if provided
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      // Add one day to include the end date fully
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query = query.lt("created_at", nextDay.toISOString());
    }

    // Apply search if provided
    if (searchTerm) {
      query = query.or(
        `first_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,whatsapp.ilike.%${searchTerm}%`
      );
    }

    // Apply sorting
    query = query.order(sortField, { ascending: sortOrder === "asc" });

    // Apply pagination
    query = query.range(from, to);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching submissions:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

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
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
      filters: {
        formType,
        startDate,
        endDate,
        searchTerm,
      },
      sorting: {
        field: sortField,
        order: sortOrder,
      },
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

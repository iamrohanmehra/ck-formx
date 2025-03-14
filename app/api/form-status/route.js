import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
  try {
    // Get form_type from query parameters
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get("form_type");

    // Check if form_type is provided
    if (!formType) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing form_type parameter",
        },
        { status: 400 }
      );
    }

    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Check if Supabase credentials are available
    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase credentials not found, assuming form is active");
      return NextResponse.json({
        success: true,
        form_type: formType,
        is_active: true,
      });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to select from the form_status table to check if it exists
    const { error: tableCheckError } = await supabase
      .from("form_status")
      .select("*")
      .limit(1);

    // If the table doesn't exist, create it
    if (tableCheckError && tableCheckError.code === "42P01") {
      // Create the form_status table by calling our API endpoint
      try {
        const createTableResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/api/admin/create-form-status-table`
        );

        if (!createTableResponse.ok) {
          console.error("Failed to create form_status table");
          // If we can't create the table, assume the form is active
          return NextResponse.json({
            success: true,
            form_type: formType,
            is_active: true,
          });
        }
      } catch (createError) {
        console.error("Error creating form_status table:", createError);
        // If we can't create the table, assume the form is active
        return NextResponse.json({
          success: true,
          form_type: formType,
          is_active: true,
        });
      }
    }

    // Query the form status
    const { data, error } = await supabase
      .from("form_status")
      .select("is_active")
      .eq("form_type", formType)
      .single();

    if (error) {
      // If there's an error or the form doesn't exist in the table,
      // assume it's active to prevent blocking legitimate submissions
      console.error("Error fetching form status:", error);

      // Try to insert a default record for this form type
      try {
        await supabase
          .from("form_status")
          .upsert({ form_type: formType, is_active: true })
          .onConflict("form_type")
          .ignore();
      } catch (insertError) {
        console.error("Error inserting default form status:", insertError);
      }

      return NextResponse.json({
        success: true,
        form_type: formType,
        is_active: true,
      });
    }

    return NextResponse.json({
      success: true,
      form_type: formType,
      is_active: data ? data.is_active : true,
    });
  } catch (error) {
    console.error("Error checking form status:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Unexpected error: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

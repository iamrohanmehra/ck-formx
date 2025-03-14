import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Check if Supabase credentials are available
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase credentials not found in environment variables",
        },
        { status: 500 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to select from the form_status table to check if it exists
    const { error: tableCheckError } = await supabase
      .from("form_status")
      .select("*")
      .limit(1);

    // If the table doesn't exist, we need to create it
    if (tableCheckError && tableCheckError.code === "42P01") {
      // Since we can't directly create tables with the Supabase JS client,
      // we'll simulate table creation by inserting records with all required fields
      // This will cause Supabase to create the table with the appropriate columns

      try {
        // Insert initial records for existing forms
        const { error: insertError } = await supabase
          .from("form_status")
          .insert([
            {
              form_type: "formx1",
              is_active: true,
            },
            {
              form_type: "formx4",
              is_active: true,
            },
          ]);

        if (insertError) {
          // If we still can't create the table, return instructions for manual creation
          return NextResponse.json(
            {
              success: false,
              error:
                "Unable to automatically create the form_status table. Please create it manually with the following SQL: CREATE TABLE public.form_status (id SERIAL PRIMARY KEY, form_type TEXT NOT NULL UNIQUE, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());",
              details: insertError.message,
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "form_status table created successfully",
        });
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Error creating form_status table: ${error.message}`,
          },
          { status: 500 }
        );
      }
    } else if (tableCheckError) {
      return NextResponse.json(
        {
          success: false,
          error: `Error checking table: ${tableCheckError.message}`,
        },
        { status: 500 }
      );
    }

    // If we get here, the table already exists
    // Let's make sure our form types are in the table
    const { error: upsertError } = await supabase.from("form_status").upsert(
      [
        { form_type: "formx1", is_active: true },
        { form_type: "formx4", is_active: true },
      ],
      { onConflict: "form_type" }
    );

    if (upsertError) {
      console.warn("Error upserting form types:", upsertError);
    }

    return NextResponse.json({
      success: true,
      message: "form_status table already exists",
    });
  } catch (error) {
    console.error("Error creating form_status table:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Unexpected error: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

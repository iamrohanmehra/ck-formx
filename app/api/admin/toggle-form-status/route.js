import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { form_type, is_active } = body;

    if (!form_type) {
      return NextResponse.json(
        { success: false, error: "Missing form_type parameter" },
        { status: 400 }
      );
    }

    if (is_active === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing is_active parameter" },
        { status: 400 }
      );
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

    // Check if the form_status table exists
    const { error: tableCheckError } = await supabase
      .from("form_status")
      .select("*")
      .limit(1);

    if (tableCheckError && tableCheckError.code === "42P01") {
      // Table doesn't exist, create it
      try {
        const { error: createTableError } = await supabase.query(`
          CREATE TABLE IF NOT EXISTS public.form_status (
            id SERIAL PRIMARY KEY,
            form_type TEXT NOT NULL UNIQUE,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Add initial records for existing forms
          INSERT INTO public.form_status (form_type, is_active)
          VALUES ('formx1', true), ('formx4', true)
          ON CONFLICT (form_type) DO NOTHING;
        `);

        if (createTableError) {
          return NextResponse.json(
            {
              success: false,
              error: `Failed to create table: ${createTableError.message}`,
            },
            { status: 500 }
          );
        }
      } catch (createError) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to create table: ${createError.message}`,
          },
          { status: 500 }
        );
      }
    }

    // Check if the form exists in form_submissions
    const { data: formExists, error: formCheckError } = await supabase
      .from("form_submissions")
      .select("form_type")
      .eq("form_type", form_type)
      .limit(1);

    if (formCheckError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to check if form exists: ${formCheckError.message}`,
        },
        { status: 500 }
      );
    }

    // If the form doesn't exist in submissions, check if it's a known form type
    if (!formExists || formExists.length === 0) {
      if (form_type !== "formx1" && form_type !== "formx4") {
        return NextResponse.json(
          {
            success: false,
            error: `Form type '${form_type}' not found in submissions and is not a known form type`,
          },
          { status: 404 }
        );
      }
    }

    // Update or insert the form status
    const { data, error } = await supabase.from("form_status").upsert(
      {
        form_type,
        is_active,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "form_type",
        returning: "representation",
      }
    );

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update form status: ${error.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Form '${form_type}' status updated to ${
        is_active ? "active" : "inactive"
      }`,
      data,
    });
  } catch (error) {
    console.error("Error toggling form status:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Unexpected error: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

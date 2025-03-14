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

    // SQL commands that need to be executed
    const sqlCommands = [
      // 1. Add form_data column if it doesn't exist (using PostgreSQL's JSONB type)
      `ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}'::jsonb;`,

      // 2. Create standard B-tree indexes for common query fields
      `CREATE INDEX IF NOT EXISTS idx_form_submissions_form_type ON form_submissions (form_type);`,
      `CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions (created_at);`,

      // 3. Create a GIN index for efficient querying of the JSONB data
      // This allows fast lookups like: WHERE form_data->>'recommendation' = 'yes'
      `CREATE INDEX IF NOT EXISTS idx_form_submissions_form_data ON form_submissions USING GIN (form_data);`,
    ];

    // Return instructions for manual execution
    return NextResponse.json({
      success: false,
      message: "Manual SQL execution required",
      instructions: `
        Please follow these steps to update your PostgreSQL schema in Supabase:
        
        1. Log in to your Supabase dashboard
        2. Go to the SQL Editor
        3. Create a new query
        4. Copy and paste the following SQL commands:
        
        ${sqlCommands.join("\n\n")}
        
        5. Run the query
        6. After running these commands successfully, run the data migration API at /api/migrate-form-data
        
        Note: The GIN index (last command) is optional but recommended for performance when querying JSON fields.
      `,
      sqlCommands: sqlCommands,
    });
  } catch (error) {
    console.error("Error preparing SQL commands:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        instructions:
          "You need to run the SQL commands directly in the Supabase SQL editor.",
      },
      { status: 500 }
    );
  }
}

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

    // SQL commands to create materialized views and functions
    const sqlCommands = [
      // 1. Create a function to get submissions by date
      `
      CREATE OR REPLACE FUNCTION get_submissions_by_date(days_limit int DEFAULT 30)
      RETURNS TABLE (submission_date date, count bigint) AS $$
      BEGIN
        RETURN QUERY
        SELECT DATE(created_at) as submission_date, COUNT(*) as count
        FROM form_submissions
        WHERE created_at > CURRENT_DATE - days_limit
        GROUP BY DATE(created_at)
        ORDER BY submission_date DESC;
      END;
      $$ LANGUAGE plpgsql;
      `,

      // 2. Create materialized view for overall stats
      `
      CREATE MATERIALIZED VIEW IF NOT EXISTS form_stats_overall AS
      SELECT
        COUNT(*) as total_submissions
      FROM form_submissions;
      `,

      // 3. Create materialized view for form type stats
      `
      CREATE MATERIALIZED VIEW IF NOT EXISTS form_stats_by_type AS
      SELECT
        form_type,
        COUNT(*) as count
      FROM form_submissions
      GROUP BY form_type;
      `,

      // 4. Create materialized view for occupation stats
      `
      CREATE MATERIALIZED VIEW IF NOT EXISTS form_stats_by_occupation AS
      SELECT
        COALESCE(occupation, 'unknown') as occupation,
        COUNT(*) as count
      FROM form_submissions
      GROUP BY occupation;
      `,

      // 5. Create materialized view for recent submissions (last 30 days)
      `
      CREATE MATERIALIZED VIEW IF NOT EXISTS form_stats_recent AS
      SELECT
        DATE(created_at) as submission_date,
        COUNT(*) as count
      FROM form_submissions
      WHERE created_at > CURRENT_DATE - 30
      GROUP BY DATE(created_at)
      ORDER BY submission_date DESC;
      `,

      // 6. Create a function to refresh all materialized views
      `
      CREATE OR REPLACE FUNCTION refresh_form_stats()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW form_stats_overall;
        REFRESH MATERIALIZED VIEW form_stats_by_type;
        REFRESH MATERIALIZED VIEW form_stats_by_occupation;
        REFRESH MATERIALIZED VIEW form_stats_recent;
      END;
      $$ LANGUAGE plpgsql;
      `,

      // 7. Create a trigger to refresh stats when new submissions are added
      `
      CREATE OR REPLACE FUNCTION refresh_stats_on_submission()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Only refresh if we have accumulated enough new rows
        IF (SELECT COUNT(*) FROM form_submissions) % 10 = 0 THEN
          PERFORM refresh_form_stats();
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      `,

      // 8. Create the trigger
      `
      DROP TRIGGER IF EXISTS refresh_stats_trigger ON form_submissions;
      CREATE TRIGGER refresh_stats_trigger
      AFTER INSERT ON form_submissions
      FOR EACH ROW
      EXECUTE FUNCTION refresh_stats_on_submission();
      `,
    ];

    // Execute each SQL command
    for (const sql of sqlCommands) {
      const { error } = await supabase.rpc("exec_sql", { sql_query: sql });
      if (error) {
        console.error("Error executing SQL:", error);
        return NextResponse.json(
          { success: false, error: error.message, sql },
          { status: 500 }
        );
      }
    }

    // Initial refresh of materialized views
    await supabase.rpc("refresh_form_stats");

    return NextResponse.json({
      success: true,
      message: "Materialized views created and refreshed successfully",
      sqlCommands,
    });
  } catch (error) {
    console.error("Error creating materialized views:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

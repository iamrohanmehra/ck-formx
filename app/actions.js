"use server";

// Mock Supabase client for development
const mockSupabase = {
  from: () => ({
    insert: () => Promise.resolve({ data: { id: "mock-id" }, error: null }),
    select: () => Promise.resolve({ data: { id: "mock-id" }, error: null }),
  }),
};

// Check if we have the service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;

try {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Missing Supabase service role key, using mock client");
    supabase = mockSupabase;
  } else {
    // Only import the real client if we have credentials
    const { createClient } = require("@supabase/supabase-js");
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
} catch (error) {
  console.warn("Error initializing Supabase client, using mock client", error);
  supabase = mockSupabase;
}

export async function submitForm(formData) {
  try {
    const { data, error } = await supabase
      .from("form_submissions")
      .insert([formData])
      .select();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error submitting form:", error);
    return { success: false, error: error.message };
  }
}

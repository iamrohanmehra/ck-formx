// Mock Supabase client for development
const mockSupabase = {
  from: () => ({
    insert: () => Promise.resolve({ data: { id: "mock-id" }, error: null }),
    select: () => Promise.resolve({ data: { id: "mock-id" }, error: null }),
  }),
};

// Check if we're in development mode
const isDev = process.env.NODE_ENV === "development";

// Use a mock client if Supabase credentials are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables, using mock client");
    supabase = mockSupabase;
  } else {
    // Only import the real client if we have credentials
    const { createClient } = require("@supabase/supabase-js");
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.warn("Error initializing Supabase client, using mock client", error);
  supabase = mockSupabase;
}

export { supabase };

import { createClient } from "@supabase/supabase-js";

// Mock Supabase client for development
const mockSupabase = {
  from: () => ({
    insert: () => Promise.resolve({ data: { id: "mock-id" }, error: null }),
    select: () => Promise.resolve({ data: { id: "mock-id" }, error: null }),
  }),
};

// Check if we're in development mode
const isDev = process.env.NODE_ENV === "development";

// Use a more robust approach to initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a client for browser-side operations
export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables");
    return mockSupabase; // Return mock client instead of null
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

// Export a singleton instance for convenience
export const supabase = createSupabaseClient();

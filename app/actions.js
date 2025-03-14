"use server";

import { createClient } from "@supabase/supabase-js";

// Mock Supabase client for development
const mockSupabase = {
  from: () => ({
    insert: () => ({
      select: () => Promise.resolve({ data: { id: "mock-id" }, error: null }),
    }),
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

// Check if a form is active
export async function isFormActive(formType) {
  try {
    // If we're in mock mode, assume the form is active
    if (process.env.MOCK_SUPABASE === "true") {
      console.log("Mock mode: Assuming form is active");
      return true;
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Missing Supabase credentials, assuming form is active");
      return true;
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query the form status
    const { data, error } = await supabase
      .from("form_status")
      .select("is_active")
      .eq("form_type", formType)
      .single();

    if (error) {
      // If the table doesn't exist or there's another error, assume the form is active
      if (error.code === "42P01") {
        console.warn(
          `form_status table doesn't exist, assuming form ${formType} is active`
        );
        return true;
      }

      console.error(`Error checking if form ${formType} is active:`, error);
      // If there's an error, assume the form is active to prevent blocking legitimate submissions
      return true;
    }

    return data ? data.is_active : true;
  } catch (error) {
    console.error(
      `Unexpected error checking if form ${formType} is active:`,
      error
    );
    // If there's an error, assume the form is active to prevent blocking legitimate submissions
    return true;
  }
}

export async function submitForm(formData) {
  console.log("Form data received:", formData);

  try {
    // Get Supabase credentials directly from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("Supabase URL available:", !!supabaseUrl);
    console.log("Supabase Service Key available:", !!supabaseServiceKey);

    let supabaseResult = { success: false, data: null, error: null };
    let sheetsResult = { success: false, error: null };

    // Check if form_type is provided
    if (!formData.form_type) {
      console.warn("No form_type provided, defaulting to 'formx1'");
      formData.form_type = "formx1";
    }

    // Check if the form is active
    const formActive = await isFormActive(formData.form_type);
    if (!formActive) {
      return {
        success: false,
        error: "This form is currently not accepting submissions.",
        formInactive: true,
      };
    }

    // Try Supabase first
    if (supabaseUrl && supabaseServiceKey) {
      try {
        console.log("Creating Supabase client...");
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Separate common fields from form-specific fields
        const commonFields = {
          first_name: formData.firstName,
          email: formData.email,
          whatsapp: formData.whatsapp,
          preference: formData.preference,
          occupation: formData.occupation || null,
          form_type: formData.form_type || "formx1", // Default to formx1 if not provided
        };

        // Form-specific fields go into form_data JSON
        const formSpecificFields = {};

        // Add form-specific fields based on form type and occupation
        if (formData.recommendation !== undefined) {
          formSpecificFields.recommendation = formData.recommendation;
        }

        if (formData.income !== undefined) {
          formSpecificFields.income = formData.income;
        }

        if (formData.frontendInterest !== undefined) {
          formSpecificFields.frontend_interest = formData.frontendInterest;
        }

        console.log("Saving to Supabase...");
        console.log("Common fields:", commonFields);
        console.log("Form-specific fields:", formSpecificFields);

        const { data, error } = await supabase.from("form_submissions").insert({
          ...commonFields,
          form_data: formSpecificFields,
        });

        if (error) {
          console.error("Supabase error:", error);
          supabaseResult.error = error.message;
        } else {
          console.log("Supabase save successful");
          supabaseResult.success = true;
          supabaseResult.data = data;
        }
      } catch (error) {
        console.error("Error with Supabase:", error);
        supabaseResult.error = error.message;
      }
    } else {
      console.warn("Missing Supabase credentials, skipping Supabase save");
      supabaseResult.error = "Missing Supabase credentials";
    }

    // Always try Google Sheets
    try {
      console.log("Saving to Google Sheets...");
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

      const response = await fetch(`${baseUrl}/api/submit-form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        console.error("Google Sheets error:", result.error);
        sheetsResult.error = result.error;
      } else {
        console.log("Google Sheets save successful");
        sheetsResult.success = true;
      }
    } catch (error) {
      console.error("Error calling Google Sheets API:", error);
      sheetsResult.error = error.message;
    }

    // Return success if either service succeeded
    if (supabaseResult.success || sheetsResult.success) {
      return {
        success: true,
        data: supabaseResult.data,
        supabaseStatus: supabaseResult.success ? "success" : "failed",
        sheetsStatus: sheetsResult.success ? "success" : "failed",
      };
    } else {
      // Both failed
      throw new Error(
        `Supabase: ${supabaseResult.error}, Sheets: ${sheetsResult.error}`
      );
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    return { success: false, error: error.message };
  }
}

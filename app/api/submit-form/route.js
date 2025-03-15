import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("Google Sheets API route called");

  try {
    // Check for required environment variables
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    console.log("Google Service Account Email available:", !!email);
    console.log("Google Private Key available:", !!key);
    console.log("Google Sheet ID available:", !!sheetId);

    if (!email || !key || !sheetId) {
      console.error("Missing Google Sheets credentials");
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error",
          details: {
            email: !email
              ? "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL"
              : "Available",
            key: !key ? "Missing GOOGLE_PRIVATE_KEY" : "Available",
            sheetId: !sheetId ? "Missing GOOGLE_SHEET_ID" : "Available",
          },
        },
        { status: 500 }
      );
    }

    // Parse the form data early to ensure it's valid
    let formData;
    try {
      formData = await request.json();
      console.log("Form data received in API route:", formData);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Initialize auth with service account credentials
    let serviceAccountAuth;
    try {
      // Add more detailed logging
      console.log("Initializing JWT with email:", email);
      console.log("Key length:", key ? key.length : 0);

      // Clean the key more thoroughly
      const cleanedKey = key
        .replace(/\\n/g, "\n")
        .replace(/\s+/g, "\n") // Replace any whitespace sequences with newlines
        .trim();

      serviceAccountAuth = new JWT({
        email: email,
        key: cleanedKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      console.log("JWT authentication initialized successfully");
    } catch (authError) {
      console.error("Error initializing JWT auth:", authError);
      return NextResponse.json(
        {
          success: false,
          error: `Authentication error: ${authError.message}`,
          keyPreview: key
            ? `${key.substring(0, 10)}...${key.substring(key.length - 10)}`
            : "No key",
        },
        { status: 500 }
      );
    }

    // Initialize the sheet with timeout handling
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

    // Load document with timeout handling
    try {
      console.log("Loading Google Sheet...");
      await Promise.race([
        doc.loadInfo(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout loading sheet")), 15000)
        ),
      ]);
      console.log("Sheet loaded:", doc.title);
    } catch (loadError) {
      console.error("Error loading Google Sheet:", loadError);
      return NextResponse.json(
        { success: false, error: `Failed to load sheet: ${loadError.message}` },
        { status: 500 }
      );
    }

    // Get the first sheet
    let sheet;
    try {
      sheet = doc.sheetsByIndex[0];
      if (!sheet) {
        throw new Error("No sheets found in the document");
      }
      console.log("Using sheet:", sheet.title);
    } catch (sheetError) {
      console.error("Error accessing sheet:", sheetError);
      return NextResponse.json(
        { success: false, error: `Sheet access error: ${sheetError.message}` },
        { status: 500 }
      );
    }

    // Prepare form-specific fields
    const formSpecificData = {};

    // Add form-specific fields based on what's available
    if (formData.recommendation !== undefined) {
      formSpecificData.recommendation = formData.recommendation;
    }

    if (formData.income !== undefined) {
      formSpecificData.income = formData.income;
    }

    if (formData.frontendInterest !== undefined) {
      formSpecificData.frontend_interest = formData.frontendInterest;
    }

    // Add a row with the form data
    try {
      console.log("Adding row to sheet...");
      await Promise.race([
        sheet.addRow({
          timestamp: new Date().toISOString(),
          first_name: formData.firstName || "",
          email: formData.email || "",
          whatsapp: formData.whatsapp || "",
          preference: formData.preference || "",
          occupation: formData.occupation || "",
          form_type: formData.form_type || "formx1",
          // Add form-specific fields
          recommendation: formSpecificData.recommendation || "",
          income: formSpecificData.income || "",
          frontend_interest: formSpecificData.frontend_interest || "",
          // Add a JSON string of all form-specific data for future reference
          form_data: JSON.stringify(formSpecificData),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout adding row")), 15000)
        ),
      ]);
      console.log("Row added successfully");
    } catch (rowError) {
      console.error("Error adding row to sheet:", rowError);
      return NextResponse.json(
        { success: false, error: `Failed to add row: ${rowError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding data to Google Sheet:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

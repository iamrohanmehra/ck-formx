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

    if (!email || !key || !sheetId) {
      console.error("Missing Google Sheets credentials");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Initialize auth with service account credentials
    const serviceAccountAuth = new JWT({
      email: email,
      key: key.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

    // Parse the form data
    const formData = await request.json();
    console.log("Form data received in API route:", formData);

    // Load the document properties and sheets
    console.log("Loading Google Sheet...");
    await doc.loadInfo();
    console.log("Sheet loaded:", doc.title);

    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];
    console.log("Using sheet:", sheet.title);

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
    console.log("Adding row to sheet...");
    await sheet.addRow({
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
    });

    console.log("Row added successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding data to Google Sheet:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

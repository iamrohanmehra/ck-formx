import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export async function GET() {
  try {
    // Determine the queue directory path
    const queueDir = path.join(process.cwd(), "queue");

    // Check if the queue directory exists
    if (!fs.existsSync(queueDir)) {
      return NextResponse.json({
        success: true,
        message: "No queue directory found, nothing to process",
        processed: 0,
      });
    }

    // Get all files in the queue directory
    const files = fs
      .readdirSync(queueDir)
      .filter(
        (file) => file.startsWith("form-submission-") && file.endsWith(".json")
      );

    if (files.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No queued submissions found",
        processed: 0,
      });
    }

    // Check for required environment variables
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!email || !key || !sheetId) {
      return NextResponse.json({
        success: false,
        error: "Missing Google Sheets credentials",
        processed: 0,
      });
    }

    // Initialize auth with service account credentials
    const serviceAccountAuth = new JWT({
      email: email,
      key: key.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // Process each file
    const results = [];
    for (const file of files) {
      try {
        const filePath = path.join(queueDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const formData = JSON.parse(fileContent);

        // Prepare form-specific fields
        const formSpecificData = {};
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
        await sheet.addRow({
          timestamp: new Date().toISOString(),
          first_name: formData.firstName || "",
          email: formData.email || "",
          whatsapp: formData.whatsapp || "",
          preference: formData.preference || "",
          occupation: formData.occupation || "",
          form_type: formData.form_type || "formx1",
          recommendation: formSpecificData.recommendation || "",
          income: formSpecificData.income || "",
          frontend_interest: formSpecificData.frontend_interest || "",
          form_data: JSON.stringify(formSpecificData),
          queued_at: file.split("-")[2], // Extract timestamp from filename
        });

        // Delete the processed file
        fs.unlinkSync(filePath);

        results.push({
          file,
          success: true,
        });
      } catch (error) {
        results.push({
          file,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.filter((r) => r.success).length} out of ${
        results.length
      } queued submissions`,
      processed: results.filter((r) => r.success).length,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error("Error processing queued submissions:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

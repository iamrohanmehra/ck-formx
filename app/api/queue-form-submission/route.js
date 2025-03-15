import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    // Parse the form data
    const formData = await request.json();

    // Create a unique filename based on timestamp and a random string
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const randomString = Math.random().toString(36).substring(2, 10);
    const filename = `form-submission-${timestamp}-${randomString}.json`;

    // Determine the queue directory path
    // In production, you might want to use a more persistent storage solution
    const queueDir = path.join(process.cwd(), "queue");

    // Create the queue directory if it doesn't exist
    if (!fs.existsSync(queueDir)) {
      fs.mkdirSync(queueDir, { recursive: true });
    }

    // Write the form data to a file in the queue directory
    const filePath = path.join(queueDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(formData, null, 2));

    console.log(`Form submission queued: ${filePath}`);

    return NextResponse.json({
      success: true,
      message: "Form submission queued for later processing",
      queueId: filename,
    });
  } catch (error) {
    console.error("Error queuing form submission:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

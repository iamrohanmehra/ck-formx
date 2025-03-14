import { NextResponse } from "next/server";
import { submitForm } from "@/app/actions";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get("form_type") || "formx1";

    // Create test form data
    const testFormData = {
      firstName: `Test User (${formType})`,
      email: `test-${formType}@example.com`,
      whatsapp: "1234567890",
      preference: "email",
      occupation: "student",
      recommendation: "yes",
      income: null,
      frontendInterest: null,
      form_type: formType, // Set the form type from the query parameter
    };

    // Submit the test form data
    const result = await submitForm(testFormData);

    return NextResponse.json({
      success: result.success,
      message: `Test submission for ${formType} completed`,
      result,
      testFormData,
    });
  } catch (error) {
    console.error("Error testing form type:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

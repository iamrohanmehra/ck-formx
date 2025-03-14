"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);

      console.log("Fetching forms from API...");
      const response = await fetch("/api/admin/forms");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch forms");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch forms");
      }

      console.log("Forms data:", data);

      if (data.forms && data.forms.length > 0) {
        setForms(data.forms);
        setSelectedForm(data.forms[0]);
        fetchSubmissions(data.forms[0].form_type);
      } else {
        setForms([]);
        setError(
          "No form submissions found in the database. Please submit at least one form."
        );
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setError(err.message || "Failed to fetch forms");
      setLoading(false);
    }
  };

  const fetchSubmissions = async (formType) => {
    try {
      setLoading(true);

      console.log("Fetching submissions for form type:", formType);
      const response = await fetch(
        `/api/admin/submissions?form_type=${formType}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch submissions");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch submissions");
      }

      console.log(`Found ${data.submissions?.length || 0} submissions`);
      setSubmissions(data.submissions || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError(err.message || "Failed to fetch submissions");
      setLoading(false);
    }
  };

  const toggleFormStatus = async (formId, currentStatus) => {
    try {
      // Since we're using derived forms without a real forms table,
      // we'll just update the local state
      setForms(
        forms.map((form) =>
          form.id === formId ? { ...form, is_active: !currentStatus } : form
        )
      );

      // Show a success message
      alert(
        `Form status updated successfully. This is a client-side only change since there's no forms table in the database.`
      );
    } catch (err) {
      console.error("Error toggling form status:", err);
      setError(err.message || "Failed to toggle form status");
    }
  };

  const handleFormSelect = (form) => {
    setSelectedForm(form);
    fetchSubmissions(form.form_type);
  };

  // Generate table headers based on form type
  const getTableHeaders = (formType) => {
    // Common headers for all forms
    const commonHeaders = [
      { key: "first_name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "whatsapp", label: "WhatsApp" },
      { key: "preference", label: "Preference" },
      { key: "occupation", label: "Occupation" },
    ];

    // Form-specific headers
    let formSpecificHeaders = [];

    if (formType === "formx1") {
      formSpecificHeaders = [
        { key: "form_data.recommendation", label: "Recommendation" },
      ];
    } else if (formType === "formx4") {
      formSpecificHeaders = [
        { key: "form_data.frontend_interest", label: "Frontend Interest" },
        { key: "form_data.income", label: "Income Range" },
      ];
    }

    // Add created_at as the last column
    return [
      ...commonHeaders,
      ...formSpecificHeaders,
      { key: "created_at", label: "Date Submitted" },
    ];
  };

  // Get a value from a submission using a key path (e.g., 'form_data.recommendation')
  const getSubmissionValue = (submission, keyPath) => {
    if (!submission) return null;

    if (!keyPath.includes(".")) {
      return submission[keyPath];
    }

    const [parent, child] = keyPath.split(".");

    // Handle form_data as an object
    if (submission[parent] && typeof submission[parent] === "object") {
      return submission[parent][child];
    }

    // Handle form_data as a string
    if (parent === "form_data" && typeof submission[parent] === "string") {
      try {
        const formData = JSON.parse(submission[parent]);
        return formData[child];
      } catch (e) {
        console.error("Error parsing form_data:", e);
        return null;
      }
    }

    // Handle legacy fields
    if (parent === "form_data" && submission[child] !== undefined) {
      return submission[child];
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white font-karla">
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[30px] font-[500] leading-[36px] text-[#37404A] mb-[20px]">
            Admin Dashboard
          </h1>

          {loading && (
            <p className="text-[18px] text-[#37404AB3]">Loading...</p>
          )}

          {error && (
            <div className="bg-red-50 p-4 rounded-lg mb-6">
              <p className="text-red-500">Error: {error}</p>
              <div className="mt-4">
                <h3 className="font-medium text-red-800">Troubleshooting:</h3>
                <ul className="list-disc list-inside mt-2 text-sm text-red-700">
                  <li>
                    Check that your Supabase credentials are correctly set in
                    your environment variables
                  </li>
                  <li>
                    Verify that your Supabase project is running and accessible
                  </li>
                  <li>
                    Make sure the form_submissions table exists in your database
                  </li>
                  <li>Verify that you have submitted at least one form</li>
                  <li>
                    If you've recently updated your schema, run the migration at{" "}
                    <a href="/admin/migration" className="underline">
                      Migration Helper
                    </a>
                  </li>
                  <li>
                    Check the{" "}
                    <a
                      href="/api/debug-supabase"
                      className="underline"
                      target="_blank"
                    >
                      Debug API
                    </a>{" "}
                    for more information
                  </li>
                </ul>
              </div>
            </div>
          )}

          {!loading && !error && (
            <Tabs defaultValue="forms" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="forms">Forms</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
              </TabsList>

              <TabsContent value="forms" className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Form Title</TableHead>
                        <TableHead>Form Type</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {forms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No forms found
                          </TableCell>
                        </TableRow>
                      ) : (
                        forms.map((form) => {
                          // Count submissions for this form
                          const submissionCount = submissions.filter(
                            (s) => s.form_type === form.form_type
                          ).length;

                          return (
                            <TableRow key={form.id}>
                              <TableCell className="font-medium">
                                {form.title}
                              </TableCell>
                              <TableCell>{form.form_type}</TableCell>
                              <TableCell>{submissionCount}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={form.is_active}
                                    onCheckedChange={() =>
                                      toggleFormStatus(form.id, form.is_active)
                                    }
                                  />
                                  <span
                                    className={
                                      form.is_active
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {form.is_active ? "Active" : "Inactive"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  onClick={() => handleFormSelect(form)}
                                  className="bg-[#37404A] hover:bg-[#37404acc] text-white rounded-[6px]"
                                >
                                  View Submissions
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="submissions" className="space-y-6">
                {selectedForm ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-[24px] font-[500] text-[#37404A]">
                        {selectedForm.title} Submissions
                      </h2>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {getTableHeaders(selectedForm.form_type).map(
                              (header) => (
                                <TableHead key={header.key}>
                                  {header.label}
                                </TableHead>
                              )
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {submissions.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={
                                  getTableHeaders(selectedForm.form_type).length
                                }
                                className="text-center py-4"
                              >
                                No submissions found
                              </TableCell>
                            </TableRow>
                          ) : (
                            submissions.map((submission) => (
                              <TableRow key={submission.id}>
                                {getTableHeaders(selectedForm.form_type).map(
                                  (header) => (
                                    <TableCell
                                      key={header.key}
                                      className={
                                        header.key === "first_name"
                                          ? "font-medium"
                                          : ""
                                      }
                                    >
                                      {header.key === "created_at"
                                        ? new Date(
                                            submission.created_at
                                          ).toLocaleDateString()
                                        : getSubmissionValue(
                                            submission,
                                            header.key
                                          )}
                                    </TableCell>
                                  )
                                )}
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[18px] text-[#37404AB3]">
                      Select a form to view submissions
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>
    </div>
  );
}

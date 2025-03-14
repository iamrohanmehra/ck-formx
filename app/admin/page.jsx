"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
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

      // Get Supabase credentials from environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      console.log("Supabase URL available:", !!supabaseUrl);
      console.log("Supabase Anon Key available:", !!supabaseAnonKey);

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase credentials");
      }

      // Create Supabase client
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Get all form submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from("form_submissions")
        .select("form_type");

      if (submissionsError) {
        console.error("Error fetching submissions:", submissionsError);
        throw submissionsError;
      }

      if (submissions && submissions.length > 0) {
        console.log("Found submissions:", submissions.length);

        // Extract unique form types
        const uniqueFormTypes = [
          ...new Set(submissions.map((item) => item.form_type)),
        ];
        console.log("Unique form types:", uniqueFormTypes);

        // Create form objects from unique form types
        const derivedForms = uniqueFormTypes.map((formType) => ({
          id: formType,
          title: `${formType.charAt(0).toUpperCase() + formType.slice(1)}`,
          is_active: true,
          form_type: formType,
        }));

        setForms(derivedForms);
        if (derivedForms.length > 0) {
          setSelectedForm(derivedForms[0]);
          fetchSubmissions(derivedForms[0].form_type);
        }
      } else {
        // No submissions found
        console.log("No submissions found");
        setForms([]);
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

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase credentials");
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      console.log("Fetching submissions for form type:", formType);

      // Fetch submissions for the selected form
      const { data, error } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("form_type", formType);

      if (error) {
        console.error("Error fetching submissions:", error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} submissions`);
      setSubmissions(data || []);
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
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>WhatsApp</TableHead>
                            <TableHead>Preference</TableHead>
                            <TableHead>Occupation</TableHead>
                            <TableHead>Date Submitted</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {submissions.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center py-4"
                              >
                                No submissions found
                              </TableCell>
                            </TableRow>
                          ) : (
                            submissions.map((submission) => (
                              <TableRow key={submission.id}>
                                <TableCell className="font-medium">
                                  {submission.first_name}
                                </TableCell>
                                <TableCell>{submission.email}</TableCell>
                                <TableCell>{submission.whatsapp}</TableCell>
                                <TableCell>{submission.preference}</TableCell>
                                <TableCell>{submission.occupation}</TableCell>
                                <TableCell>
                                  {new Date(
                                    submission.created_at
                                  ).toLocaleDateString()}
                                </TableCell>
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

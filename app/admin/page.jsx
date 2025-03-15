"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// List of authorized admin emails
const AUTHORIZED_ADMINS = [
  "rohanmehra224466@gmail.com",
  "ashish.efslon@gmail.com",
];

export default function AdminDashboard() {
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [submissionCounts, setSubmissionCounts] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // State for the confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formToToggle, setFormToToggle] = useState(null);

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/admin/login");
          return;
        }

        if (!AUTHORIZED_ADMINS.includes(session.user.email)) {
          await supabase.auth.signOut();
          router.push("/admin/login");
          return;
        }

        setUser(session.user);
        setAuthChecked(true);
        fetchForms();
        fetchStats();
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [router, supabase]);

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

        // Store submission counts if available
        if (data.submissionCounts) {
          setSubmissionCounts(data.submissionCounts);
        }

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

  const fetchStats = async () => {
    try {
      console.log("Fetching stats from API...");
      const response = await fetch("/api/admin/stats");
      const data = await response.json();

      if (!response.ok) {
        console.error("Error fetching stats:", data.error);
        return;
      }

      if (!data.success) {
        console.error("Error fetching stats:", data.error);
        return;
      }

      console.log("Stats data:", data);
      setStats(data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
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

      // Update the submission count for this form type
      setSubmissionCounts((prev) => ({
        ...prev,
        [formType]: data.submissions?.length || 0,
      }));

      setLoading(false);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError(err.message || "Failed to fetch submissions");
      setLoading(false);
    }
  };

  // Show confirmation modal before toggling form status
  const handleToggleClick = (formId, currentStatus) => {
    setFormToToggle({ id: formId, currentStatus });
    setShowConfirmModal(true);
  };

  // Handle confirmation modal response
  const handleConfirmToggle = async (confirmed) => {
    setShowConfirmModal(false);

    if (confirmed && formToToggle) {
      await toggleFormStatus(formToToggle.id, formToToggle.currentStatus);
    }

    setFormToToggle(null);
  };

  const toggleFormStatus = async (formId, currentStatus) => {
    try {
      // Update the local state
      setForms(
        forms.map((form) =>
          form.id === formId ? { ...form, is_active: !currentStatus } : form
        )
      );

      // Call the API to toggle the form status
      const response = await fetch("/api/admin/toggle-form-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          form_type: formId,
          is_active: !currentStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to toggle form status");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to toggle form status");
      }

      console.log("Form status toggled:", data);
    } catch (err) {
      console.error("Error toggling form status:", err);

      // Revert the local state change if there was an error
      setForms(
        forms.map((form) =>
          form.id === formId ? { ...form, is_active: currentStatus } : form
        )
      );

      setError(`Failed to toggle form status: ${err.message}`);
    }
  };

  const handleFormSelect = (form) => {
    setSelectedForm(form);
    fetchSubmissions(form.form_type);
    setShowSubmissions(true);

    // Scroll to top of page after a short delay
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
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
    if (parent === "form_data") {
      // If form_data is an object
      if (submission.form_data && typeof submission.form_data === "object") {
        return submission.form_data[child];
      }

      // If form_data is a string, try to parse it
      if (submission.form_data && typeof submission.form_data === "string") {
        try {
          const formData = JSON.parse(submission.form_data);
          return formData[child];
        } catch (e) {
          console.error("Error parsing form_data:", e);
        }
      }

      // Check for legacy fields directly on the submission object
      if (submission[child] !== undefined) {
        return submission[child];
      }

      // For frontend_interest field, check both naming conventions
      if (
        child === "frontend_interest" &&
        submission.frontendInterest !== undefined
      ) {
        return submission.frontendInterest;
      }

      // For recommendation field, check both naming conventions
      if (
        child === "recommendation" &&
        submission.recommendation !== undefined
      ) {
        return submission.recommendation;
      }

      // For income field, check both naming conventions
      if (child === "income" && submission.income !== undefined) {
        return submission.income;
      }
    }

    return null;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // Only render the dashboard content if authentication has been checked
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-white font-karla flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#37404A]"></div>
          <p className="mt-4 text-[#37404A]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-karla">
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-[20px]">
            <h1 className="text-[30px] font-[500] leading-[36px] text-[#37404A]">
              {showSubmissions && selectedForm
                ? `${selectedForm.title} Submissions`
                : "Admin Dashboard"}
            </h1>

            <div className="flex items-center gap-4">
              {user && (
                <div className="text-sm text-gray-600">
                  Logged in as: {user.email}
                </div>
              )}

              {showSubmissions && selectedForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowSubmissions(false)}
                  className="bg-white hover:bg-[#37404acc] text-[#37404A] rounded-[6px]"
                >
                  Back to Dashboard
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="bg-white hover:bg-red-100 text-red-600 border-red-200 rounded-[6px]"
                >
                  Sign Out
                </Button>
              )}
            </div>
          </div>

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
            <div className="space-y-8">
              {/* Dashboard View (Stats and Forms) */}
              {!showSubmissions && (
                <>
                  {/* Stats Section */}
                  <section className="mb-8">
                    <h2 className="text-[24px] font-[500] text-[#37404A] mb-4">
                      Dashboard Statistics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Total Submissions Card */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-[20px] font-[500] text-[#37404A] mb-4">
                          Total Submissions
                        </h3>
                        <p className="text-[36px] font-bold text-[#37404A]">
                          {stats?.totalSubmissions || 0}
                        </p>
                      </div>

                      {/* Submissions by Form Type */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-[20px] font-[500] text-[#37404A] mb-4">
                          Submissions by Form Type
                        </h3>
                        {stats?.submissionsByFormType &&
                        Object.keys(stats.submissionsByFormType).length > 0 ? (
                          <div className="space-y-2">
                            {Object.entries(stats.submissionsByFormType).map(
                              ([formType, count]) => (
                                <div
                                  key={formType}
                                  className="flex justify-between items-center"
                                >
                                  <span className="text-[16px] text-[#37404A]">
                                    {formType.charAt(0).toUpperCase() +
                                      formType.slice(1)}
                                  </span>
                                  <span className="text-[18px] font-semibold text-[#37404A]">
                                    {count}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-[16px] text-[#37404AB3]">
                            No data available
                          </p>
                        )}
                      </div>

                      {/* Submissions by Occupation */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-[20px] font-[500] text-[#37404A] mb-4">
                          Submissions by Occupation
                        </h3>
                        {stats?.submissionsByOccupation &&
                        Object.keys(stats.submissionsByOccupation).length >
                          0 ? (
                          <div className="space-y-2">
                            {Object.entries(stats.submissionsByOccupation).map(
                              ([occupation, count]) => (
                                <div
                                  key={occupation}
                                  className="flex justify-between items-center"
                                >
                                  <span className="text-[16px] text-[#37404A]">
                                    {occupation === "unknown"
                                      ? "Unknown"
                                      : occupation
                                          .split("-")
                                          .map(
                                            (word) =>
                                              word.charAt(0).toUpperCase() +
                                              word.slice(1)
                                          )
                                          .join(" ")}
                                  </span>
                                  <span className="text-[18px] font-semibold text-[#37404A]">
                                    {count}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-[16px] text-[#37404AB3]">
                            No data available
                          </p>
                        )}
                      </div>

                      {/* Recent Submissions */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-[20px] font-[500] text-[#37404A] mb-4">
                          Recent Submissions
                        </h3>
                        {stats?.submissionsByDate &&
                        Object.keys(stats.submissionsByDate).length > 0 ? (
                          <div className="space-y-2">
                            {Object.entries(stats.submissionsByDate)
                              .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                              .slice(0, 5)
                              .map(([date, count]) => (
                                <div
                                  key={date}
                                  className="flex justify-between items-center"
                                >
                                  <span className="text-[16px] text-[#37404A]">
                                    {new Date(date).toLocaleDateString()}
                                  </span>
                                  <span className="text-[18px] font-semibold text-[#37404A]">
                                    {count}
                                  </span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-[16px] text-[#37404AB3]">
                            No data available
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Forms Section */}
                  <section className="mb-8">
                    <h2 className="text-[24px] font-[500] text-[#37404A] mb-4">
                      Available Forms
                    </h2>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[25%]">
                              Form Title
                            </TableHead>
                            <TableHead className="w-[20%]">Form Type</TableHead>
                            <TableHead className="w-[15%]">
                              Submissions
                            </TableHead>
                            <TableHead className="w-[20%]">Status</TableHead>
                            <TableHead className="w-[20%]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {forms.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-4"
                              >
                                No forms found
                              </TableCell>
                            </TableRow>
                          ) : (
                            forms.map((form) => {
                              // Get submission count from the state
                              const submissionCount =
                                submissionCounts[form.form_type] || 0;

                              return (
                                <TableRow key={form.id}>
                                  <TableCell className="font-medium w-[25%]">
                                    {form.title}
                                  </TableCell>
                                  <TableCell className="w-[20%]">
                                    {form.form_type}
                                  </TableCell>
                                  <TableCell className="w-[15%]">
                                    {submissionCount}
                                  </TableCell>
                                  <TableCell className="w-[20%]">
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={form.is_active}
                                        onCheckedChange={() =>
                                          handleToggleClick(
                                            form.id,
                                            form.is_active
                                          )
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
                                  <TableCell className="w-[20%]">
                                    <Button
                                      variant="outline"
                                      onClick={() => handleFormSelect(form)}
                                      className="bg-white hover:bg-[#37404acc] text-[#37404A] rounded-[6px]"
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
                  </section>
                </>
              )}

              {/* Submissions Section */}
              {showSubmissions && selectedForm && (
                <section className="mb-8">
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
                </section>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              {formToToggle && (
                <>
                  Are you sure you want to{" "}
                  {formToToggle.currentStatus ? "deactivate" : "activate"} this
                  form?
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Status message outside of DialogDescription to avoid nested p tags */}
          {formToToggle && (
            <div
              className={
                formToToggle.currentStatus
                  ? "text-red-600 mt-2"
                  : "text-green-600 mt-2"
              }
            >
              {formToToggle.currentStatus
                ? "When inactive, users will not be able to submit this form."
                : "When active, users will be able to submit this form."}
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleConfirmToggle(false)}
            >
              No
            </Button>
            <Button
              type="button"
              onClick={() => handleConfirmToggle(true)}
              className={
                formToToggle?.currentStatus
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

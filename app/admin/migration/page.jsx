"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function MigrationHelper() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [sqlCommands, setSqlCommands] = useState([]);
  const [migrationResults, setMigrationResults] = useState(null);

  const fetchSqlCommands = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/db-migration");
      const data = await response.json();

      if (data.sqlCommands) {
        setSqlCommands(data.sqlCommands);
        setResults(data);
      } else {
        setError(
          "Failed to get SQL commands. Please check the console for details."
        );
        console.error("Unexpected response:", data);
      }

      setLoading(false);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  const runMigration = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/migrate-form-data");
      const data = await response.json();

      setMigrationResults(data);
      setLoading(false);

      if (data.success) {
        setStep(3);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
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
            Form Data Migration Helper
          </h1>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="text-[18px] font-[500] text-[#37404A] mb-2">
              PostgreSQL Benefits
            </h2>
            <p className="text-[16px] text-[#37404AB3] mb-2">
              Since Supabase uses PostgreSQL, we're leveraging powerful features
              like:
            </p>
            <ul className="list-disc list-inside text-[16px] text-[#37404AB3] space-y-1 ml-2">
              <li>
                <strong>JSONB Data Type:</strong> More efficient than regular
                JSON for querying and indexing
              </li>
              <li>
                <strong>GIN Indexing:</strong> Specialized index type for faster
                JSON queries
              </li>
              <li>
                <strong>JSON Operators:</strong> Easy extraction of values from
                JSON fields
              </li>
              <li>
                <strong>Advanced Querying:</strong> Filter and aggregate data
                using JSON fields
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  step >= 1 ? "bg-[#37404A] text-white" : "bg-gray-200"
                }`}
              >
                1
              </div>
              <h2 className="text-[20px] font-[500] text-[#37404A]">
                Update Database Schema
              </h2>
            </div>

            {step === 1 && (
              <div className="ml-11">
                <p className="text-[16px] text-[#37404AB3] mb-4">
                  First, we need to update the PostgreSQL schema to add the
                  JSONB column and create indexes.
                </p>

                <Button
                  onClick={fetchSqlCommands}
                  disabled={loading}
                  className="bg-[#37404A] hover:bg-[#37404acc] text-white rounded-[6px] mb-4"
                >
                  {loading ? "Loading..." : "Get SQL Commands"}
                </Button>

                {error && (
                  <div className="bg-red-50 p-4 rounded-lg mb-4">
                    <p className="text-red-500">{error}</p>
                  </div>
                )}

                {results && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="text-[18px] font-[500] text-[#37404A] mb-2">
                      Instructions:
                    </h3>
                    <div className="whitespace-pre-line text-[14px] text-[#37404AB3] mb-4">
                      {results.instructions}
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
                      <pre className="text-[14px]">
                        {sqlCommands.join("\n\n")}
                      </pre>
                    </div>

                    <Button
                      onClick={() => setStep(2)}
                      className="bg-[#37404A] hover:bg-[#37404acc] text-white rounded-[6px]"
                    >
                      I've Run the SQL Commands
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div
              className={`flex items-center mb-4 mt-8 ${
                step < 2 ? "opacity-50" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  step >= 2 ? "bg-[#37404A] text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <h2 className="text-[20px] font-[500] text-[#37404A]">
                Migrate Existing Data
              </h2>
            </div>

            {step === 2 && (
              <div className="ml-11">
                <p className="text-[16px] text-[#37404AB3] mb-4">
                  Now, let's migrate the existing data to use the new JSONB
                  structure.
                </p>

                <Button
                  onClick={runMigration}
                  disabled={loading}
                  className="bg-[#37404A] hover:bg-[#37404acc] text-white rounded-[6px] mb-4"
                >
                  {loading ? "Migrating..." : "Run Data Migration"}
                </Button>

                {error && (
                  <div className="bg-red-50 p-4 rounded-lg mb-4">
                    <p className="text-red-500">{error}</p>
                  </div>
                )}

                {migrationResults && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="text-[18px] font-[500] text-[#37404A] mb-2">
                      Migration Results:
                    </h3>
                    <p className="text-[16px] text-[#37404AB3] mb-2">
                      {migrationResults.message}
                    </p>

                    {migrationResults.results && (
                      <div>
                        <p className="text-[14px] text-[#37404AB3] mb-2">
                          Success:{" "}
                          {
                            migrationResults.results.filter(
                              (r) => r.status === "success"
                            ).length
                          }{" "}
                          records
                        </p>
                        <p className="text-[14px] text-[#37404AB3] mb-2">
                          Skipped:{" "}
                          {
                            migrationResults.results.filter(
                              (r) => r.status === "skipped"
                            ).length
                          }{" "}
                          records
                        </p>
                        <p className="text-[14px] text-[#37404AB3] mb-2">
                          Errors:{" "}
                          {
                            migrationResults.results.filter(
                              (r) => r.status === "error"
                            ).length
                          }{" "}
                          records
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div
              className={`flex items-center mb-4 mt-8 ${
                step < 3 ? "opacity-50" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  step >= 3 ? "bg-[#37404A] text-white" : "bg-gray-200"
                }`}
              >
                3
              </div>
              <h2 className="text-[20px] font-[500] text-[#37404A]">
                Verify Migration
              </h2>
            </div>

            {step === 3 && (
              <div className="ml-11">
                <p className="text-[16px] text-[#37404AB3] mb-4">
                  Migration completed! Now let's verify that everything is
                  working correctly.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="text-[18px] font-[500] text-[#37404A] mb-2">
                    Next Steps:
                  </h3>
                  <ol className="list-decimal list-inside text-[16px] text-[#37404AB3] space-y-2">
                    <li>
                      Go to the{" "}
                      <a href="/admin" className="text-blue-600 underline">
                        Admin Dashboard
                      </a>{" "}
                      to verify that forms and submissions are displayed
                      correctly.
                    </li>
                    <li>
                      Submit a new form to verify that the new data structure
                      works.
                    </li>
                    <li>
                      Check that form-specific fields are correctly displayed in
                      the submissions table.
                    </li>
                  </ol>
                </div>

                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <p className="text-green-600">
                    Congratulations! You've successfully migrated to the
                    enhanced single table approach with PostgreSQL JSONB.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-[18px] font-[500] text-[#37404A] mb-2">
                    Advanced PostgreSQL Queries:
                  </h3>
                  <p className="text-[16px] text-[#37404AB3] mb-2">
                    You can now run powerful queries directly in the Supabase
                    SQL Editor:
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-[14px]">
                      {`-- Find all students who recommend Codekaro
SELECT * FROM form_submissions 
WHERE occupation = 'student' AND form_data->>'recommendation' = 'yes';

-- Find professionals interested in frontend with income > 30k
SELECT * FROM form_submissions 
WHERE occupation IN ('working-professional', 'college-passout')
AND form_data->>'frontend_interest' = 'yes'
AND form_data->>'income' IN ('30-50k', '50k-1lakh');`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

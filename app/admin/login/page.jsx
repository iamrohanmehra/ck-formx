"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// List of authorized admin emails
const AUTHORIZED_ADMINS = [
  "rohanmehra224466@gmail.com",
  "ashish.efslon@gmail.com",
];

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Verify if the user is authorized
        if (AUTHORIZED_ADMINS.includes(session.user.email)) {
          router.push("/admin");
        } else {
          setError("You are not authorized to access the admin dashboard.");
          // Sign out unauthorized users
          await supabase.auth.signOut();
          setUser(null);
        }
      }
    };

    checkUser();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        setUser(session.user);
        // Verify if the user is authorized
        if (AUTHORIZED_ADMINS.includes(session.user.email)) {
          router.push("/admin");
        } else {
          setError("You are not authorized to access the admin dashboard.");
          // Sign out unauthorized users
          await supabase.auth.signOut();
          setUser(null);
        }
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
        setError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setError(error.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-karla flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#37404A] rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>

          <h1 className="text-[30px] font-[500] leading-[36px] text-[#37404A] mb-[20px] text-center">
            Admin Login
          </h1>

          {error && (
            <div className="bg-red-50 p-4 rounded-lg mb-6">
              <p className="text-red-500 text-center">{error}</p>
            </div>
          )}

          <div className="flex flex-col items-center">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="bg-[#37404A] hover:bg-[#37404acc] text-white rounded-[6px] w-full mb-4 flex items-center justify-center gap-2 py-6"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Logging in...</span>
                </div>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="fill-current"
                  >
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  <span className="text-[18px]">Sign in with Google</span>
                </>
              )}
            </Button>

            <p className="text-[16px] text-[#37404AB3] text-center mt-4">
              Only authorized administrators can access the dashboard.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

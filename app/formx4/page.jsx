"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { submitForm } from "@/app/actions";
import { ChevronRight } from "lucide-react";

export default function FormX1() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    whatsapp: "",
    preference: "",
    occupation: "",
    recommendation: "",
    income: "",
    frontendInterest: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState({
    loading: false,
    error: null,
  });
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Handle redirection countdown
  useEffect(() => {
    if (shouldRedirect) {
      if (redirectCountdown > 0) {
        const timer = setTimeout(() => {
          setRedirectCountdown(redirectCountdown - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        router.push(
          "https://cal.com/ashish-shukla-ye5ege/onboarding-process-with-ashish"
        );
      }
    }
  }, [shouldRedirect, redirectCountdown, router]);

  // Define base questions
  const baseQuestions = [
    {
      id: "firstName",
      title: "Your First Name",
      component: (
        <div className="space-y-4 w-full">
          <Input
            id="firstName"
            placeholder="Your answer goes here"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className={cn(
              "border-0 border-b-2 rounded-none px-0 py-0 pb-[8px] text-[24px] text-[#5c5c5c] leading-[32px] w-full focus-visible:ring-0 focus-visible:border-[#37404A] transition-colors placeholder:text-[#37404A80]",
              errors.firstName ? "border-red-500" : "border-gray-300"
            )}
            autoFocus
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>
      ),
    },
    {
      id: "email",
      title: "Your Email Address",
      component: (
        <div className="space-y-4 w-full">
          <Input
            id="email"
            type="email"
            placeholder="Your answer goes here..."
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={cn(
              "border-0 border-b-2 rounded-none px-0 py-0 pb-[8px] text-[24px] leading-[32px] w-full focus-visible:ring-0 focus-visible:border-blue-500 transition-colors placeholder:text-[#37404A80]",
              errors.email ? "border-red-500" : "border-gray-300"
            )}
            autoFocus
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>
      ),
    },
    {
      id: "whatsapp",
      title: "Your WhatsApp Number",
      component: (
        <div className="space-y-4 w-full">
          <Input
            id="whatsapp"
            type="tel"
            placeholder="Your answer goes here..."
            value={formData.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            className={cn(
              "border-0 border-b-2 rounded-none px-0 py-0 pb-[8px] text-[24px] leading-[32px] w-full focus-visible:ring-0 focus-visible:border-blue-500 transition-colors placeholder:text-[#37404A80]",
              errors.whatsapp ? "border-red-500" : "border-gray-300"
            )}
            autoFocus
          />
          {errors.whatsapp && (
            <p className="text-sm text-red-500">{errors.whatsapp}</p>
          )}
        </div>
      ),
    },
    {
      id: "preference",
      title: "Your Preferred Contact Method",
      component: (
        <div className="space-y-4 w-full">
          <RadioGroup
            value={formData.preference}
            onValueChange={(value) => handleChange("preference", value)}
            className={cn("space-y-3")}
          >
            <div
              className={cn(
                "flex items-center p-3 border-2 rounded-lg transition-colors",
                formData.preference === "email"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <RadioGroupItem
                value="email"
                id="email-option"
                className="mr-3"
              />
              <Label htmlFor="email-option" className="w-full cursor-pointer">
                Email
              </Label>
            </div>
            <div
              className={cn(
                "flex items-center p-3 border-2 rounded-lg transition-colors",
                formData.preference === "whatsapp"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <RadioGroupItem
                value="whatsapp"
                id="whatsapp-option"
                className="mr-3"
              />
              <Label
                htmlFor="whatsapp-option"
                className="w-full cursor-pointer"
              >
                WhatsApp
              </Label>
            </div>
            <div
              className={cn(
                "flex items-center p-3 border-2 rounded-lg transition-colors",
                formData.preference === "both"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <RadioGroupItem value="both" id="both-option" className="mr-3" />
              <Label htmlFor="both-option" className="w-full cursor-pointer">
                Both
              </Label>
            </div>
          </RadioGroup>
          {errors.preference && (
            <p className="text-sm text-red-500">{errors.preference}</p>
          )}
        </div>
      ),
    },
    // New occupation question
    {
      id: "occupation",
      title: "What do you currently do?",
      component: (
        <div className="space-y-4 w-full">
          <RadioGroup
            value={formData.occupation}
            onValueChange={(value) => handleChange("occupation", value)}
            className={cn("space-y-3")}
          >
            <div
              className={cn(
                "flex items-center p-3 border-2 rounded-lg transition-colors",
                formData.occupation === "student"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <RadioGroupItem
                value="student"
                id="student-option"
                className="mr-3"
              />
              <Label htmlFor="student-option" className="w-full cursor-pointer">
                Student
              </Label>
            </div>
            <div
              className={cn(
                "flex items-center p-3 border-2 rounded-lg transition-colors",
                formData.occupation === "college-passout"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <RadioGroupItem
                value="college-passout"
                id="college-passout-option"
                className="mr-3"
              />
              <Label
                htmlFor="college-passout-option"
                className="w-full cursor-pointer"
              >
                College Passout
              </Label>
            </div>
            <div
              className={cn(
                "flex items-center p-3 border-2 rounded-lg transition-colors",
                formData.occupation === "working-professional"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <RadioGroupItem
                value="working-professional"
                id="working-professional-option"
                className="mr-3"
              />
              <Label
                htmlFor="working-professional-option"
                className="w-full cursor-pointer"
              >
                Working Professional
              </Label>
            </div>
          </RadioGroup>
          {errors.occupation && (
            <p className="text-sm text-red-500">{errors.occupation}</p>
          )}
        </div>
      ),
    },
  ];

  // Conditional questions for students
  const studentQuestions = [
    {
      id: "recommendation",
      title: "Would you recommend Codekaro?",
      component: (
        <div className="space-y-4 w-full">
          <RadioGroup
            value={formData.recommendation}
            onValueChange={(value) => handleChange("recommendation", value)}
            className={cn("space-y-3")}
          >
            <div
              className={cn(
                "flex items-center p-3 border-2 rounded-lg transition-colors",
                formData.recommendation === "yes"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <RadioGroupItem
                value="yes"
                id="recommendation-yes"
                className="mr-3"
              />
              <Label
                htmlFor="recommendation-yes"
                className="w-full cursor-pointer"
              >
                Yes
              </Label>
            </div>
            <div
              className={cn(
                "flex items-center p-3 border-2 rounded-lg transition-colors",
                formData.recommendation === "no"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <RadioGroupItem
                value="no"
                id="recommendation-no"
                className="mr-3"
              />
              <Label
                htmlFor="recommendation-no"
                className="w-full cursor-pointer"
              >
                No
              </Label>
            </div>
          </RadioGroup>
          {errors.recommendation && (
            <p className="text-sm text-red-500">{errors.recommendation}</p>
          )}
        </div>
      ),
    },
  ];

  // Conditional questions for college passout and working professionals
  const professionalQuestions = [
    {
      id: "income",
      title: "How much do you earn?",
      component: (
        <div className="space-y-4 w-full">
          <RadioGroup
            value={formData.income}
            onValueChange={(value) => handleChange("income", value)}
            className={cn("space-y-3")}
          >
            <div
              className={cn(
                "flex items-center p-3 border-2 rounded-lg transition-colors",
                formData.income === "0-30k"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <RadioGroupItem
                value="0-30k"
                id="income-0-30k"
                className="mr-3"
              />
              <Label htmlFor="income-0-30k" className="w-full cursor-pointer">
                0-30k
              </Label>
            </div>
            <div
              className={cn(
                "flex items-center p-3 border-2 rounded-lg transition-colors",
                formData.income === "30-50k"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <RadioGroupItem
                value="30-50k"
                id="income-30-50k"
                className="mr-3"
              />
              <Label htmlFor="income-30-50k" className="w-full cursor-pointer">
                30-50k
              </Label>
            </div>
            <div
              className={cn(
                "flex items-center p-3 border-2 rounded-lg transition-colors",
                formData.income === "50k-1lakh"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <RadioGroupItem
                value="50k-1lakh"
                id="income-50k-1lakh"
                className="mr-3"
              />
              <Label
                htmlFor="income-50k-1lakh"
                className="w-full cursor-pointer"
              >
                50k-1Lakh
              </Label>
            </div>
          </RadioGroup>
          {errors.income && (
            <p className="text-sm text-red-500">{errors.income}</p>
          )}
        </div>
      ),
    },
    {
      id: "frontendInterest",
      title: "Are you interested in taking Frontend Intensive?",
      component: (
        <div className="space-y-4 w-full">
          <RadioGroup
            value={formData.frontendInterest}
            onValueChange={(value) => handleChange("frontendInterest", value)}
            className={cn("space-y-3")}
          >
            <div
              className={cn(
                "flex items-center p-3 border-2 rounded-lg transition-colors",
                formData.frontendInterest === "yes"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <RadioGroupItem value="yes" id="frontend-yes" className="mr-3" />
              <Label htmlFor="frontend-yes" className="w-full cursor-pointer">
                Yes
              </Label>
            </div>
            <div
              className={cn(
                "flex items-center p-3 border-2 rounded-lg transition-colors",
                formData.frontendInterest === "no"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <RadioGroupItem value="no" id="frontend-no" className="mr-3" />
              <Label htmlFor="frontend-no" className="w-full cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
          {errors.frontendInterest && (
            <p className="text-sm text-red-500">{errors.frontendInterest}</p>
          )}
        </div>
      ),
    },
  ];

  // Dynamically build questions based on user's occupation
  const getQuestions = () => {
    // Start with base questions
    let allQuestions = [...baseQuestions];

    // If user has selected an occupation
    if (formData.occupation) {
      if (formData.occupation === "student") {
        // For students, add recommendation question
        allQuestions = [...allQuestions, ...studentQuestions];
      } else {
        // For college passout and working professionals
        allQuestions = [...allQuestions, ...professionalQuestions];
      }
    }

    return allQuestions;
  };

  // Get the current set of questions based on user's responses
  const questions = getQuestions();

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const validateStep = () => {
    const currentQuestion = questions[step];
    const field = currentQuestion.id;

    if (!formData[field] || formData[field].trim() === "") {
      setErrors({
        ...errors,
        [field]: "This field is required",
      });
      return false;
    }

    // Email validation
    if (field === "email" && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setErrors({
        ...errors,
        email: "Please enter a valid email address",
      });
      return false;
    }

    // Phone validation (simple check for now)
    if (
      field === "whatsapp" &&
      !/^\+?[0-9\s]{10,15}$/.test(formData.whatsapp)
    ) {
      setErrors({
        ...errors,
        whatsapp: "Please enter a valid phone number",
      });
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    if (validateStep()) {
      if (step < questions.length - 1) {
        setStep(step + 1);
      } else {
        // Form submission logic
        setSubmissionStatus({ loading: true, error: null });

        try {
          console.log("Submitting form data:", formData);

          // Use the server action to submit the form
          const result = await submitForm({
            firstName: formData.firstName,
            email: formData.email,
            whatsapp: formData.whatsapp,
            preference: formData.preference,
            occupation: formData.occupation,
            recommendation: formData.recommendation || null,
            income: formData.income || null,
            frontendInterest: formData.frontendInterest || null,
          });

          console.log("Form submission result:", result);

          if (!result.success) {
            throw new Error(result.error || "Unknown error occurred");
          }

          // Log detailed status
          console.log(
            `Supabase: ${result.supabaseStatus}, Sheets: ${result.sheetsStatus}`
          );

          // Set redirect flag if user is interested in Frontend Intensive
          if (formData.frontendInterest === "yes") {
            setShouldRedirect(true);
          }

          setIsSubmitted(true);
        } catch (error) {
          console.error("Error submitting form:", error);
          setSubmissionStatus({
            loading: false,
            error: `Failed to submit form: ${error.message}`,
          });
        }
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleNext();
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentQuestion = questions[step];

  // If the form is submitted, show the thank you message
  if (isSubmitted) {
    return (
      <div
        className="h-[100dvh] w-full flex flex-col justify-center items-center bg-white font-karla font-normal overflow-hidden"
        style={{ fontFamily: "'Karla', sans-serif" }}
      >
        <div className="w-full max-w-md flex flex-col justify-center px-4">
          <div className="w-full text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              <h2
                className="text-[30px] font-[500] leading-[36px] text-[#37404A] mb-[20px]"
                style={{ margin: "0px 0px 20px" }}
              >
                Thank you {formData.firstName}!
              </h2>

              {formData.frontendInterest === "yes" ? (
                <>
                  <p className="text-[18px] leading-[28px] text-[#37404AB3]">
                    For completing the onboarding! We're excited about your
                    interest in the Frontend Intensive Program.
                  </p>
                  <p className="text-[18px] leading-[28px] text-[#37404AB3]">
                    You will be redirected to schedule a call in{" "}
                    {redirectCountdown} seconds...
                  </p>
                </>
              ) : (
                <p className="text-[18px] leading-[28px] text-[#37404AB3]">
                  For completing the onboarding!
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[100dvh] w-full flex flex-col justify-center items-center bg-white font-karla font-normal overflow-hidden mt-[-2.75vh]"
      style={{ fontFamily: "'Karla', sans-serif" }}
    >
      <div className="w-full max-w-[628px] flex flex-col justify-center px-4">
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 sm:space-y-4"
              onKeyDown={handleKeyPress}
            >
              <div className="space-y-1 sm:space-y-2">
                <p className="text-[14px] sm:text-[16px] leading-[20px] sm:leading-[24px] text-[#37404A80] font-normal">
                  Question {step + 1} <span className="text-red-500">*</span>
                </p>
                <h2 className="text-[18px] sm:text-[20px] mb-9 md:text-[24px] leading-[24px] sm:leading-[28px] md:leading-[32px] text-[#37404a] font-medium">
                  {currentQuestion.title}
                </h2>
              </div>

              <div className="py-1">{currentQuestion.component}</div>

              <div className="flex justify-start pt-2">
                {step > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="mr-2 text-[18px] leading-[28px] py-[6px] px-[20px] rounded-[6px] border-gray-300 hover:bg-gray-50 font-karla font-medium cursor-pointer"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className="bg-[#37404A] hover:bg-[#37404acc] text-white text-[18px] leading-[28px] py-[6px] px-[20px] rounded-[6px] font-karla font-medium cursor-pointer"
                  disabled={submissionStatus.loading}
                >
                  {submissionStatus.loading ? (
                    <span>Submitting...</span>
                  ) : (
                    <span className="flex items-center">
                      {step === questions.length - 1 ? "Submit" : "Next"}
                      {step !== questions.length - 1 && (
                        <ChevronRight className="ml-4 h-5 w-5" />
                      )}
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Add error message if submission fails */}
      {submissionStatus.error && (
        <div className="text-red-500 text-center w-full mt-4 mb-2">
          {submissionStatus.error}
        </div>
      )}
    </div>
  );
}

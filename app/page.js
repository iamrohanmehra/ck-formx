"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    whatsapp: "",
    preference: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState({
    loading: false,
    error: null,
  });

  const questions = [
    {
      id: "firstName",
      title: "What's your first name?",
      description: "Please enter your first name",
      component: (
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className={cn(errors.firstName && "border-red-500")}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>
      ),
    },
    {
      id: "email",
      title: "What's your email address?",
      description: "We'll use this to contact you",
      component: (
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={cn(errors.email && "border-red-500")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>
      ),
    },
    {
      id: "whatsapp",
      title: "What's your WhatsApp number?",
      description: "We'll use this for quick updates",
      component: (
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp Number</Label>
          <Input
            id="whatsapp"
            type="tel"
            placeholder="Enter your WhatsApp number"
            value={formData.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            className={cn(errors.whatsapp && "border-red-500")}
          />
          {errors.whatsapp && (
            <p className="text-sm text-red-500">{errors.whatsapp}</p>
          )}
        </div>
      ),
    },
    {
      id: "preference",
      title: "What's your preferred contact method?",
      description: "Select one option",
      component: (
        <div className="space-y-3">
          <Label>Preferred Contact Method</Label>
          <RadioGroup
            value={formData.preference}
            onValueChange={(value) => handleChange("preference", value)}
            className={cn(
              "space-y-2",
              errors.preference && "border-red-500 border p-2 rounded-md"
            )}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email-option" />
              <Label htmlFor="email-option">Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="whatsapp" id="whatsapp-option" />
              <Label htmlFor="whatsapp-option">WhatsApp</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both-option" />
              <Label htmlFor="both-option">Both</Label>
            </div>
          </RadioGroup>
          {errors.preference && (
            <p className="text-sm text-red-500">{errors.preference}</p>
          )}
        </div>
      ),
    },
  ];

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
          // Save form data to Supabase
          const { data, error } = await supabase
            .from("form_submissions")
            .insert([
              {
                first_name: formData.firstName,
                email: formData.email,
                whatsapp: formData.whatsapp,
                preference: formData.preference,
                form_type: "default",
              },
            ]);

          if (error) throw error;

          console.log("Form submitted to Supabase:", data);
          setIsSubmitted(true);
        } catch (error) {
          console.error("Error submitting form:", error);
          setSubmissionStatus({
            loading: false,
            error: "Failed to submit form. Please try again.",
          });
        }
      }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-karla font-normal">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-[36px] text-gray-800 font-normal leading-tight">
              Thank you {formData.firstName}!
            </h2>
            <p className="text-[18px] text-gray-600 font-normal">
              For completing the onboarding!
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-karla font-normal"
      style={{ fontFamily: "'Karla', sans-serif" }}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-2xl text-gray-800 font-normal">
              {currentQuestion.title}
            </h2>
            <p className="text-gray-600 font-normal">
              {currentQuestion.description}
            </p>
            <div className="py-4">{currentQuestion.component}</div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 0}
            className="font-karla font-normal"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 font-karla font-normal"
            disabled={submissionStatus.loading}
          >
            {submissionStatus.loading ? (
              <span>Submitting...</span>
            ) : (
              <span>{step === questions.length - 1 ? "Submit" : "Next"}</span>
            )}
          </Button>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center space-x-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === step ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Add error message if submission fails */}
        {submissionStatus.error && (
          <div className="text-red-500 text-center mt-4">
            {submissionStatus.error}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  onboardingSchema,
  type OnboardingFormData,
} from "@/lib/validations";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: session?.user?.name || "",
      phoneNumber: "",
      favoriteCoffee: "",
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setServerError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        setServerError(body.error || "Something went wrong");
        return;
      }

      // Refresh the session so middleware sees onboardingComplete: true
      await update();

      router.push("/");
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl text-white tracking-tight">
            Welcome to Yazol Coffee
          </h1>
          <p className="text-slate-400 text-sm font-body mt-1.5">
            Tell us a little about yourself to complete your profile
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-slate-900 rounded-xl p-7 border border-slate-800 shadow-2xl shadow-black/20"
        >
          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-slate-400 text-xs font-body font-medium mb-1.5">
                Full Name
              </label>
              <input
                {...register("name")}
                type="text"
                className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2.5 text-white font-body text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-600 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500/40 focus:border-red-500"
                    : "border-slate-700 focus:ring-amber-500/40 focus:border-amber-500"
                }`}
                placeholder="Your full name"
              />
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs font-body mt-1"
                >
                  {errors.name.message}
                </motion.p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-slate-400 text-xs font-body font-medium mb-1.5">
                Phone Number
                <span className="text-amber-500 ml-1">*</span>
              </label>
              <input
                {...register("phoneNumber")}
                type="tel"
                className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2.5 text-white font-body text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-600 ${
                  errors.phoneNumber
                    ? "border-red-500 focus:ring-red-500/40 focus:border-red-500"
                    : "border-slate-700 focus:ring-amber-500/40 focus:border-amber-500"
                }`}
                placeholder="+14165551234"
              />
              <p className="text-slate-500 text-xs font-body mt-1">
                Essential for takeout order updates
              </p>
              {errors.phoneNumber && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs font-body mt-1"
                >
                  {errors.phoneNumber.message}
                </motion.p>
              )}
            </div>

            {/* Favorite Coffee */}
            <div>
              <label className="block text-slate-400 text-xs font-body font-medium mb-1.5">
                Favorite Coffee
                <span className="text-slate-600 text-xs ml-1">(optional)</span>
              </label>
              <input
                {...register("favoriteCoffee")}
                type="text"
                className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2.5 text-white font-body text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-600 ${
                  errors.favoriteCoffee
                    ? "border-red-500 focus:ring-red-500/40 focus:border-red-500"
                    : "border-slate-700 focus:ring-amber-500/40 focus:border-amber-500"
                }`}
                placeholder="e.g. Jebena Buna, Espresso..."
              />
              {errors.favoriteCoffee && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs font-body mt-1"
                >
                  {errors.favoriteCoffee.message}
                </motion.p>
              )}
            </div>
          </div>

          {/* Server error */}
          {serverError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm font-body mt-4"
            >
              {serverError}
            </motion.p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-amber-600 text-white font-body text-sm font-medium py-2.5 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Complete Profile"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

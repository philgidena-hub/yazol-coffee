import { z } from "zod";

export const onboardingSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  phoneNumber: z
    .string()
    .regex(
      /^\+?[1-9]\d{6,14}$/,
      "Enter a valid phone number (e.g. +14165551234)"
    ),
  favoriteCoffee: z
    .string()
    .max(100, "Must be under 100 characters")
    .optional()
    .or(z.literal("")),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

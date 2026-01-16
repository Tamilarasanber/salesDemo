import { z } from "zod";

export const demoSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, { message: "Company name is required" })
    .max(100, { message: "Company name must be less than 100 characters" }),
  contactName: z
    .string()
    .trim()
    .min(1, { message: "Contact name is required" })
    .max(100, { message: "Contact name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z
    .string()
    .trim()
    .max(20, { message: "Phone must be less than 20 characters" })
    .optional()
    .or(z.literal("")),
  productInterest: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type DemoFormData = z.infer<typeof demoSchema>;

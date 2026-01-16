import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Username is required" }),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Please enter a valid email address." }),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Minimum 8 characters" })
      .regex(/[A-Z]/, { message: "At least 1 uppercase letter" })
      .regex(/[0-9]/, { message: "At least 1 number" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

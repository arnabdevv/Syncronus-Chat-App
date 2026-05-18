import { z } from "zod";

export const signupSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Invalid email address."),
  password: z
    .string({ required_error: "Password is required." })
    .min(6, "Password must be at least 6 characters."),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Invalid email address."),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required."),
});

export const updateProfileSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required." })
    .min(4, "First name cannot be less than 4 characters."),
  lastName: z
    .string({ required_error: "Last name is required." })
    .min(1, "Last name cannot be empty."),
  color: z
    .number()
    .int("Color must be an integer.")
    .min(0, "Color must be between 0 and 8.")
    .max(8, "Color must be between 0 and 8.")
    .optional(),
});

import { z } from "zod";

// Validates recipientId from query string on GET /api/messages
export const getMessagesSchema = z.object({
  recipientId: z
    .string({ required_error: "recipientId is required." })
    .min(1, "recipientId cannot be empty."),
});

// Validates recipientId in the body for file upload
export const uploadFileSchema = z.object({
  recipientId: z
    .string({ required_error: "recipientId is required." })
    .min(1, "recipientId cannot be empty."),
});

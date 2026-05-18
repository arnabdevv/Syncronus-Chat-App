import { z } from "zod";

export const searchContactsSchema = z.object({
  searchTerm: z
    .string({ required_error: "searchTerm is required." })
    .min(1, "searchTerm cannot be empty.")
    .max(25, "searchTerm must be 25 characters or fewer."),
});

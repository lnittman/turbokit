import { z } from "zod";

export const jinaReaderInputSchema = z.object({
  url: z.string().url(),
});

export const jinaReaderOutputSchema = z.object({
  content: z.string(),
  url: z.string().url(),
  success: z.boolean(),
});

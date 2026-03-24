import { z } from "zod";

import { coverageSchema, profileSchema } from "./types";

export const structuredProfileSchema = profileSchema;
export const interviewCoverageSchema = coverageSchema;

export const structuredProfileOutputSchema = z.object({
  profile: structuredProfileSchema,
  coverage: interviewCoverageSchema,
  interviewComplete: z.boolean().default(false),
  summary: z.string().default(""),
});

export type StructuredProfileOutput = z.infer<typeof structuredProfileOutputSchema>;

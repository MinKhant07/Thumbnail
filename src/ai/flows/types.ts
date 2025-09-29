/**
 * @fileOverview Shared types and schemas for AI flows.
 */
import {z} from 'zod';

export const CritiqueThumbnailInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a YouTube thumbnail, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CritiqueThumbnailInput = z.infer<typeof CritiqueThumbnailInputSchema>;

export const CritiqueThumbnailOutputSchema = z.object({
    engagementScore: z.number().min(0).max(100).describe("A score from 0-100 on how likely the thumbnail is to attract clicks and engagement."),
    clarityScore: z.number().min(0).max(100).describe("A score from 0-100 on how clear and readable the thumbnail is, especially on small screens."),
    colorScore: z.number().min(0).max(100).describe("A score from 0-100 for the effectiveness of the color composition and contrast."),
    overallVerdict: z.string().describe("A concise, one-sentence overall verdict on the thumbnail's effectiveness."),
    suggestions: z.array(z.string()).describe("A list of 2-4 actionable suggestions for improving the thumbnail."),
});
export type CritiqueThumbnailOutput = z.infer<typeof CritiqueThumbnailOutputSchema>;

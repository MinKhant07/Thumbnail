'use server';
/**
 * @fileOverview An AI flow to critique YouTube thumbnails.
 *
 * - critiqueThumbnail - A function that handles the thumbnail critique process.
 * - CritiqueThumbnailInput - The input type for the critiqueThumbnail function.
 * - CritiqueThumbnailOutput - The return type for the critiqueThumbnail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const CritiqueThumbnailInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a YouTube thumbnail, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CritiqueThumbnailInput = z.infer<typeof CritiqueThumbnailInputSchema>;

const CritiqueThumbnailOutputSchema = z.object({
    engagementScore: z.number().min(0).max(100).describe("A score from 0-100 on how likely the thumbnail is to attract clicks and engagement."),
    clarityScore: z.number().min(0).max(100).describe("A score from 0-100 on how clear and readable the thumbnail is, especially on small screens."),
    colorScore: z.number().min(0).max(100).describe("A score from 0-100 for the effectiveness of the color composition and contrast."),
    overallVerdict: z.string().describe("A concise, one-sentence overall verdict on the thumbnail's effectiveness."),
    suggestions: z.array(z.string()).describe("A list of 2-4 actionable suggestions for improving the thumbnail."),
});
export type CritiqueThumbnailOutput = z.infer<typeof CritiqueThumbnailOutputSchema>;

export async function critiqueThumbnail(input: CritiqueThumbnailInput): Promise<CritiqueThumbnailOutput> {
  return critiqueThumbnailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'critiqueThumbnailPrompt',
  input: {schema: CritiqueThumbnailInputSchema},
  output: {schema: CritiqueThumbnailOutputSchema},
  prompt: `You are an expert YouTube content strategist and graphic designer with a keen eye for what makes a thumbnail successful.

Your task is to analyze the provided thumbnail image and give it a detailed critique. Evaluate it based on its potential to attract viewers, its clarity, and its overall design.

Provide scores for engagement, clarity, and color. Also, give a final one-sentence verdict and a few actionable suggestions for improvement.

Use the following as the source of information about the thumbnail.

Thumbnail Image: {{media url=imageDataUri}}`,
});

const critiqueThumbnailFlow = ai.defineFlow(
  {
    name: 'critiqueThumbnailFlow',
    inputSchema: CritiqueThumbnailInputSchema,
    outputSchema: CritiqueThumbnailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

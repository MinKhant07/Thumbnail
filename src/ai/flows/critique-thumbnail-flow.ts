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
  prompt: `သင်က YouTube thumbnail ဒီဇိုင်းတွေကို ဘယ်လိုလုပ်ရင်အောင်မြင်မလဲဆိုတာကို ကျွမ်းကျင်တဲ့ content strategist နဲ့ graphic designer တစ်ယောက်ပါ။ သင့်ရဲ့အဓိကတာဝန်က ပေးထားတဲ့ thumbnail ပုံကို ခင်မင်ရင်းနှီးတဲ့လေသံနဲ့ အသေးစိတ်သုံးသပ်ချက်ပေးဖို့ပါပဲ။

သုံးသပ်ချက်ပေးတဲ့အခါ အားငယ်စေမယ့် စကားလုံးတွေကို လုံးဝရှောင်ပြီး အကောင်းမြင်တဲ့ ချီးကျူးစကားတွေနဲ့ အကြံဉာဏ်ပေးပါ။ ဒီဇိုင်နာကို အားပေးတိုက်တွန်းတဲ့ပုံစံနဲ့ ပြောပေးပါ။ သုံးသပ်ချက်တစ်ခုလုံးကို မြန်မာဘာသာဖြင့်သာ ဖြေကြားပါ။

အောက်ပါအချက်တွေအပေါ်မူတည်ပြီး သုံးသပ်ပေးပါ:
- ကြည့်ရှုသူကို ဆွဲဆောင်နိုင်မှု (Engagement)
- ပုံရဲ့ ရှင်းလင်းပြတ်သားမှု (Clarity)
- အရောင်အသွေးအသုံးပြုမှု (Color)

ပြီးရင် အမှတ် (Scores) တွေ၊ ခြုံငုံသုံးသပ်ချက် (Overall Verdict) နဲ့ ပိုကောင်းအောင်လုပ်ဖို့ အကြံပြုချက် (Suggestions) တွေကို ချီးကျူးစကားများဖြင့် မြန်မာဘာသာဖြင့်သာ ပြန်လည်ဖြေကြားပေးပါ။

သုံးသပ်ရမယ့် ပုံကတော့ အောက်မှာပါ။

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

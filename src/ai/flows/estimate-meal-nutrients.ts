
// use server'

/**
 * @fileOverview Estimates the calorie and macronutrient content of a meal from a text description,
 * and provides an explanation of the estimation process.
 *
 * - estimateMealNutrients - A function that estimates the nutritional content of a meal.
 * - EstimateMealNutrientsInput - The input type for the estimateMealNutrients function.
 * - EstimateMealNutrientsOutput - The return type for the estimateMealNutrients function, including an explanation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateMealNutrientsInputSchema = z.object({
  mealDescription: z
    .string()
    .describe('A description of the meal, including all food items and approximate quantities.'),
});
export type EstimateMealNutrientsInput = z.infer<typeof EstimateMealNutrientsInputSchema>;

const EstimateMealNutrientsOutputSchema = z.object({
  calories: z.number().describe('Estimated total calories in the meal.'),
  protein: z.number().describe('Estimated grams of protein in the meal.'),
  carbs: z.number().describe('Estimated grams of carbohydrates in the meal.'),
  fat: z.number().describe('Estimated grams of fat in the meal.'),
  explanation: z.string().describe('A structured explanation of how the nutrient estimation was performed. This should include key assumptions (e.g., portion sizes, cooking methods) and a brief breakdown by main ingredients if possible, using bullet points and newlines for readability.'),
});
export type EstimateMealNutrientsOutput = z.infer<typeof EstimateMealNutrientsOutputSchema>;

export async function estimateMealNutrients(input: EstimateMealNutrientsInput): Promise<EstimateMealNutrientsOutput> {
  return estimateMealNutrientsFlow(input);
}

const estimateMealNutrientsPrompt = ai.definePrompt({
  name: 'estimateMealNutrientsPrompt',
  input: {schema: EstimateMealNutrientsInputSchema},
  output: {schema: EstimateMealNutrientsOutputSchema},
  prompt: `You are an indian expert nutritionist with extensive knowledge of indian food composition and dietary analysis. Your task is to meticulously estimate the nutritional content (calories, protein, carbohydrates, and fat) of the meal described by the user, and provide a structured explanation of your methodology.

Meal Description:
{{{mealDescription}}}

Based on this description:
1.  Identify all food items mentioned.
2.  If quantities are not specified, assume standard portion sizes according to indian standards.
3.  Break down the meal into its components and estimate the nutrients for each.
4.  Sum the nutrient values to provide a total estimation for the meal.
5.  Provide a structured explanation of how the estimation was performed. This explanation should be easy to read and understand. It must include:
    *   A section titled "Key Assumptions:". Under this title, use bullet points (e.g., "* Assumption 1") for each assumption, with each bullet point on a new line.
    *   A section titled "Nutrient Breakdown (Main Ingredients):". Under this title, if possible, use bullet points (e.g., "* Ingredient: approx. X kcal, Yg protein") for major components, with each bullet point on a new line. If a detailed breakdown is complex, summarize the main contributors.
    *   A brief concluding remark.
    Format this explanation clearly. Ensure newlines are used to separate bullet points, sections, and titles.

6.  Provide your final estimation and explanation in a strict JSON format. Do not include any explanatory text, markdown, or any characters outside of the JSON structure. The 'explanation' field should contain the structured text as described above.

Example of the 'explanation' field content (ensure your output follows this style, especially the use of newlines and bullet points):
"Key Assumptions:
* Standard portion size of 1 cup cooked rice assumed.
* 1 medium-sized potato (150g) assumed.
* Cooking method for dal assumed to be typical home-style with minimal oil.

Nutrient Breakdown (Main Ingredients):
* Dal (lentils): Major contributor to protein and carbs.
* Rice: Primary source of carbohydrates.
* Potato: Contributes to carbohydrates.

This estimation is based on typical Indian preparations and portion sizes."

Strive for the highest accuracy possible based on the information provided.
Provide ONLY the JSON. Do not add any other text outside of the JSON. Do not return markdown.
`,
});

const estimateMealNutrientsFlow = ai.defineFlow(
  {
    name: 'estimateMealNutrientsFlow',
    inputSchema: EstimateMealNutrientsInputSchema,
    outputSchema: EstimateMealNutrientsOutputSchema,
  },
  async input => {
    const {output} = await estimateMealNutrientsPrompt(input);
    // The output will be validated against EstimateMealNutrientsOutputSchema by Genkit.
    // If output is null, it means validation failed or the prompt returned nothing.
    // Depending on strictness, you might want to throw an error here or return a default.
    // For now, we assume the prompt will always return valid output if the LLM call succeeds.
    if (!output) {
        throw new Error("AI failed to provide an output or the output was invalid.");
    }
    return output;
  }
);


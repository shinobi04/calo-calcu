
'use server';

/**
 * @fileOverview Estimates the calorie and macronutrient content of a meal from a text description,
 * and provides an explanation of the estimation process, potentially using a simulated web search tool.
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
  explanation: z.string().describe('A structured explanation of how the nutrient estimation was performed. This should detail the reasoning for each major item, including key assumptions, use of the web search tool, and a breakdown by main ingredients, using bullet points and newlines for readability.'),
});
export type EstimateMealNutrientsOutput = z.infer<typeof EstimateMealNutrientsOutputSchema>;

// Define the simulated web search tool
const searchWebForNutritionInfoTool = ai.defineTool(
  {
    name: 'searchWebForNutritionInfoTool',
    description: 'Searches the web for nutritional information about a specific food item or ingredient. Use this if the provided meal description is vague or contains items for which precise data is not readily available.',
    inputSchema: z.object({
      query: z.string().describe('The food item or ingredient to search for nutritional information about (e.g., "idli", "sambar", "100g paneer").'),
    }),
    outputSchema: z.object({
      searchResult: z.string().describe('A summary of nutritional information found. This is a simulated result for demonstration.'),
    }),
  },
  async ({ query }) => {
    // In a real application, this would make an API call to a search engine or nutrition database.
    // For this simulation, we return a placeholder indicating the tool was "used".
    console.log(`Simulated web search for: ${query}`);
    return { searchResult: `Simulated web search for '${query}': Based on general knowledge, [specific details would be here if it were a real search]. This tool helps refine estimates for less common items.` };
  }
);

export async function estimateMealNutrients(input: EstimateMealNutrientsInput): Promise<EstimateMealNutrientsOutput> {
  return estimateMealNutrientsFlow(input);
}

const estimateMealNutrientsPrompt = ai.definePrompt({
  name: 'estimateMealNutrientsPrompt',
  tools: [searchWebForNutritionInfoTool], // Make the tool available to the prompt
  input: {schema: EstimateMealNutrientsInputSchema},
  output: {schema: EstimateMealNutrientsOutputSchema},
  prompt: `You are an indian expert nutritionist with extensive knowledge of indian food composition and dietary analysis. Your task is to meticulously estimate the nutritional content (calories, protein, carbohydrates, and fat) of the meal described by the user, and provide a structured, item-by-item explanation of your methodology.

Meal Description:
{{{mealDescription}}}

**Tool Usage Guidance:**
For each food item identified in the meal description, consider if its nutritional details are ambiguous or if it's an uncommon item. If so, use the 'searchWebForNutritionInfoTool' for that specific ingredient to gather more precise data. You should call this tool for individual ingredients as necessary.

Based on this description (and any information retrieved using the 'searchWebForNutritionInfoTool'):
1.  Identify all primary food items mentioned.
2.  For each item, if quantities are not specified, assume standard portion sizes according to Indian standards.
3.  Estimate the nutrients for each component.
4.  Sum the nutrient values to provide a total estimation for the meal.
5.  Provide a detailed, structured explanation of how the estimation was performed. This explanation must be easy to read, use bullet points, and ensure newlines separate distinct points and sections. It must include:
    *   A section titled "Identified Food Items & Assessment Strategy:".
        *   Under this title, list each primary food item you identified from the meal description.
        *   For each item, use a bullet point (e.g., "* Item Name: [Your brief assessment or assumption for this item, e.g., 'Standard portion of 100g assumed', 'Considered as typically prepared with minimal oil']. [If tool was used for this item: 'Web search tool consulted for XYZ reason to refine data.']"). Ensure each item is on a new line.
    *   A section titled "General Assumptions:".
        *   Under this title, list any overarching assumptions made that apply to the overall meal or multiple items (e.g., "* Standard Indian portion sizes used as a baseline unless otherwise noted.", "* Cooking methods assumed to be typical home-style unless specified."). Use bullet points, each on a new line.
    *   A section titled "Nutrient Breakdown (Main Ingredients):".
        *   Under this title, provide a summary of estimated nutrients for the main contributing ingredients. If the web search tool refined data for an item, note this (e.g., "* Basmati Rice (1 cup cooked): approx. X kcal, Yg protein.", "* Specific Curry (data refined by web search): approx. Z kcal, Wg protein."). Use bullet points, each on a new line.
    *   A brief concluding remark.

Example of the 'explanation' field content (ensure your output follows this style, especially the use of newlines and bullet points for each listed item and assumption):
"Identified Food Items & Assessment Strategy:
* Roti (2 pieces): Assumed to be whole wheat, medium size.
* Dal Makhani (1 bowl): Standard restaurant portion size assumed. Web search tool consulted for 'Dal Makhani' to account for cream and butter content.
* Mixed Vegetable Sabzi (1 bowl): Assumed standard mix of vegetables, lightly spiced.

General Assumptions:
* Standard Indian portion sizes applied where not specified.
* Minimal oil usage presumed for home-style preparations.

Nutrient Breakdown (Main Ingredients):
* Roti (2 pieces): approx. 160 kcal, 6g protein, 30g carbs, 2g fat.
* Dal Makhani (1 bowl, data refined by web search): approx. 250 kcal, 10g protein, 20g carbs, 15g fat.
* Mixed Vegetable Sabzi (1 bowl): approx. 120 kcal, 4g protein, 15g carbs, 5g fat.

This estimation is based on typical Indian preparations and portion sizes, supplemented by simulated web search for specific items as noted to improve accuracy."

Strive for the highest accuracy possible. Provide ONLY the JSON. Do not add any other text outside of the JSON. Do not return markdown.
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
    if (!output) {
        throw new Error("AI failed to provide an output or the output was invalid.");
    }
    return output;
  }
);


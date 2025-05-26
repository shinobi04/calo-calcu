
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
  explanation: z.string().describe('A structured explanation of how the nutrient estimation was performed. This should include key assumptions (e.g., portion sizes, cooking methods, use of web search tool) and a brief breakdown by main ingredients if possible, using bullet points and newlines for readability.'),
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
  prompt: `You are an indian expert nutritionist with extensive knowledge of indian food composition and dietary analysis. Your task is to meticulously estimate the nutritional content (calories, protein, carbohydrates, and fat) of the meal described by the user, and provide a structured explanation of your methodology.

Meal Description:
{{{mealDescription}}}

**Tool Usage Guidance:**
If you encounter specific ingredients where the description lacks detail, or for uncommon items where you need more precise nutritional data, use the 'searchWebForNutritionInfoTool'. You should call this tool for individual ingredients if necessary. For example, if the user says "a bowl of mixed vegetable curry", you might use the tool for "mixed vegetable curry" or specific vegetables if you need to refine the estimate.

Based on this description (and any information retrieved using the 'searchWebForNutritionInfoTool'):
1.  Identify all food items mentioned.
2.  If quantities are not specified, assume standard portion sizes according to indian standards.
3.  Break down the meal into its components and estimate the nutrients for each.
4.  Sum the nutrient values to provide a total estimation for the meal.
5.  Provide a structured explanation of how the estimation was performed. This explanation should be easy to read and understand. It must include:
    *   A section titled "Key Assumptions:". Under this title, use bullet points (e.g., "* Assumption 1") for each assumption, with each bullet point on a new line. If the 'searchWebForNutritionInfoTool' was used for any ingredient, mention it here (e.g., "* For 'XYZ ingredient', the web search tool was consulted to refine its nutritional profile.").
    *   A section titled "Nutrient Breakdown (Main Ingredients):". Under this title, if possible, use bullet points (e.g., "* Ingredient: approx. X kcal, Yg protein") for major components, with each bullet point on a new line. If a detailed breakdown is complex, summarize the main contributors. If the tool was used, you can note it like: "* Ingredient (data refined by web search): approx. X kcal..."
    *   A brief concluding remark.
    Format this explanation clearly. Ensure newlines are used to separate bullet points, sections, and titles.

6.  Provide your final estimation and explanation in a strict JSON format. Do not include any explanatory text, markdown, or any characters outside of the JSON structure. The 'explanation' field should contain the structured text as described above.

Example of the 'explanation' field content (ensure your output follows this style, especially the use of newlines and bullet points):
"Key Assumptions:
* Standard portion size of 1 cup cooked rice assumed.
* 1 medium-sized potato (150g) assumed.
* For 'Exotic Fruit Salad', the web search tool was consulted to get data on specific fruits.
* Cooking method for dal assumed to be typical home-style with minimal oil.

Nutrient Breakdown (Main Ingredients):
* Dal (lentils): Major contributor to protein and carbs.
* Rice: Primary source of carbohydrates.
* Exotic Fruit Salad (data refined by web search): Contributes to vitamins and some carbs.
* Potato: Contributes to carbohydrates.

This estimation is based on typical Indian preparations and portion sizes, supplemented by simulated web search for specific items as noted."

Strive for the highest accuracy possible based on the information provided and any tool outputs.
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
    if (!output) {
        throw new Error("AI failed to provide an output or the output was invalid.");
    }
    return output;
  }
);


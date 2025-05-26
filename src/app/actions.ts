'use server';

import { estimateMealNutrients, type EstimateMealNutrientsInput, type EstimateMealNutrientsOutput } from '@/ai/flows/estimate-meal-nutrients';

export async function getNutrientEstimationAction(mealDescription: string): Promise<EstimateMealNutrientsOutput | { error: string }> {
  try {
    if (!mealDescription.trim()) {
      return { error: 'Meal description cannot be empty.' };
    }
    const input: EstimateMealNutrientsInput = { mealDescription };
    const result = await estimateMealNutrients(input);
    return result;
  } catch (e) {
    console.error('Error in getNutrientEstimationAction:', e);
    // Check if e is an instance of Error to safely access e.message
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `Failed to estimate nutrients: ${errorMessage}` };
  }
}

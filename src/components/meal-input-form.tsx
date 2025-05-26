'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Meal } from '@/lib/types';
import { getNutrientEstimationAction } from '@/app/actions';

const MealFormSchema = z.object({
  mealDescription: z.string().min(3, { message: "Meal description must be at least 3 characters." }).max(500, { message: "Meal description must be 500 characters or less."}),
});

type MealInputFormProps = {
  onMealAdded: (meal: Meal) => void;
} & ComponentPropsWithoutRef<typeof Card>


export function MealInputForm({ onMealAdded, ...props }: MealInputFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof MealFormSchema>>({
    resolver: zodResolver(MealFormSchema),
    defaultValues: {
      mealDescription: '',
    },
  });

  async function onSubmit(data: z.infer<typeof MealFormSchema>) {
    setIsLoading(true);
    try {
      const result = await getNutrientEstimationAction(data.mealDescription);
      
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error Estimating Nutrients',
          description: result.error,
        });
      } else {
        const newMeal: Meal = {
          id: crypto.randomUUID(),
          description: data.mealDescription,
          timestamp: Date.now(),
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
        };
        onMealAdded(newMeal);
        toast({
          title: 'Meal Added!',
          description: 'Nutrients estimated and meal logged.',
        });
        form.reset();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle className="text-2xl">Log Your Meal</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="mealDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="mealDescription" className="text-lg">What did you eat?</FormLabel>
                  <FormControl>
                    <Textarea
                      id="mealDescription"
                      placeholder="e.g., Chicken breast with broccoli and rice, or a slice of pizza"
                      className="min-h-[100px] resize-none text-base"
                      {...field}
                      aria-describedby="mealDescriptionMessage"
                    />
                  </FormControl>
                  <FormMessage id="mealDescriptionMessage" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Estimating...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Meal & Estimate Nutrients
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

'use client';

import { Flame, Beef, Wheat, Droplets, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Meal } from '@/lib/types';
import { Separator } from './ui/separator';

type DailySummaryProps = {
  meals: Meal[];
  onClearTodaysMeals: () => void;
};

export function DailySummary({ meals, onClearTodaysMeals }: DailySummaryProps) {
  const today = new Date();
  const todaysMeals = meals.filter(meal => {
    const mealDate = new Date(meal.timestamp);
    return mealDate.getFullYear() === today.getFullYear() &&
           mealDate.getMonth() === today.getMonth() &&
           mealDate.getDate() === today.getDate();
  });

  const summary = todaysMeals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories;
      acc.protein += meal.protein;
      acc.carbs += meal.carbs;
      acc.fat += meal.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const summaryItem = (Icon: React.ElementType, label: string, value: number, unit: string) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <Icon className="mr-3 h-6 w-6 text-accent" />
        <span className="text-lg">{label}</span>
      </div>
      <span className="text-lg font-semibold">{value.toFixed(0)}{unit}</span>
    </div>
  );

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Today's Nutrient Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {summaryItem(Flame, 'Total Calories', summary.calories, 'kcal')}
        <Separator />
        {summaryItem(Beef, 'Total Protein', summary.protein, 'g')}
        <Separator />
        {summaryItem(Wheat, 'Total Carbs', summary.carbs, 'g')}
        <Separator />
        {summaryItem(Droplets, 'Total Fat', summary.fat, 'g')}
      </CardContent>
      {todaysMeals.length > 0 && (
         <CardFooter>
            <Button onClick={onClearTodaysMeals} variant="outline" className="w-full mt-4">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Today's Meals
            </Button>
         </CardFooter>
      )}
    </Card>
  );
}

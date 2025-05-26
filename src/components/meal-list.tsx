'use client';

import { Archive } from 'lucide-react';
import type { Meal } from '@/lib/types';
import { MealItem } from './meal-item';

type MealListProps = {
  meals: Meal[];
  onDeleteMeal: (mealId: string) => void;
};

export function MealList({ meals, onDeleteMeal }: MealListProps) {
  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-10 text-center shadow-sm bg-card">
        <Archive className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold text-card-foreground">No Meals Logged Yet</h3>
        <p className="text-muted-foreground">Start by adding a meal using the form above.</p>
      </div>
    );
  }

  // Sort meals by timestamp in descending order (newest first)
  const sortedMeals = [...meals].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-4 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
      {sortedMeals.map((meal) => (
        <MealItem key={meal.id} meal={meal} onDeleteMeal={onDeleteMeal} />
      ))}
    </div>
  );
}

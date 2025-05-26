'use client';

import { useState, useEffect, useCallback } from 'react';
import { Logo } from '@/components/logo';
import { MealInputForm } from '@/components/meal-input-form';
import { MealList } from '@/components/meal-list';
import { DailySummary } from '@/components/daily-summary';
import type { Meal } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY = 'nutrisnap_meals';

export default function HomePage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const storedMeals = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedMeals) {
        setMeals(JSON.parse(storedMeals));
      }
    } catch (error) {
      console.error("Failed to load meals from local storage:", error);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Could not load meal history from your browser.",
      });
    }
  }, [toast]);

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(meals));
      } catch (error) {
        console.error("Failed to save meals to local storage:", error);
        toast({
          variant: "destructive",
          title: "Save Error",
          description: "Could not save meal history to your browser.",
        });
      }
    }
  }, [meals, isClient, toast]);

  const handleMealAdded = useCallback((newMeal: Meal) => {
    setMeals((prevMeals) => [newMeal, ...prevMeals]);
  }, []);

  const handleDeleteMeal = useCallback((mealId: string) => {
    setMeals((prevMeals) => prevMeals.filter(meal => meal.id !== mealId));
    toast({
      title: "Meal Deleted",
      description: "The meal has been removed from your log.",
    });
  }, [toast]);

  const handleClearTodaysMeals = useCallback(() => {
    const today = new Date();
    setMeals((prevMeals) => prevMeals.filter(meal => {
      const mealDate = new Date(meal.timestamp);
      return !(mealDate.getFullYear() === today.getFullYear() &&
             mealDate.getMonth() === today.getMonth() &&
             mealDate.getDate() === today.getDate());
    }));
    toast({
      title: "Today's Meals Cleared",
      description: "All meals logged today have been removed.",
    });
  }, [toast]);
  

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 selection:bg-accent selection:text-accent-foreground">
      <header className="w-full max-w-4xl mb-8">
        <Logo />
      </header>
      
      <main className="w-full max-w-4xl space-y-8">
        <MealInputForm onMealAdded={handleMealAdded} className="shadow-xl"/>
        
        <DailySummary meals={meals} onClearTodaysMeals={handleClearTodaysMeals} />
        
        <Separator className="my-8" />
        
        <div>
          <h2 className="text-3xl font-semibold mb-6 text-center sm:text-left">Meal History</h2>
          {isClient ? (
            <MealList meals={meals} onDeleteMeal={handleDeleteMeal} />
          ) : (
            <p className="text-center text-muted-foreground">Loading meal history...</p>
          )}
        </div>
      </main>

      <footer className="w-full max-w-4xl mt-12 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} NutriSnap. All rights reserved.</p>
        <p className="text-xs mt-1">Eat well, live well.</p>
      </footer>
    </div>
  );
}

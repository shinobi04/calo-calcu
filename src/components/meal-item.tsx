
'use client';

import { Flame, Beef, Wheat, Droplets, Trash2, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Meal } from '@/lib/types';
import { Separator } from './ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type MealItemProps = {
  meal: Meal;
  onDeleteMeal: (mealId: string) => void;
};

export function MealItem({ meal, onDeleteMeal }: MealItemProps) {
  const nutrientItem = (Icon: React.ElementType, label: string, value: number, unit: string) => (
    <div className="flex items-center justify-between space-x-2 text-sm">
      <div className="flex items-center">
        <Icon className="mr-2 h-5 w-5 text-accent" />
        <span>{label}</span>
      </div>
      <span className="font-medium">{value.toFixed(0)}{unit}</span>
    </div>
  );

  return (
    <Card className="shadow-lg break-inside-avoid-column animate-in fade-in zoom-in-95 duration-500 ease-out">
      <CardHeader>
        <CardTitle className="text-xl leading-tight">{meal.description}</CardTitle>
        <CardDescription>
          Logged on: {new Date(meal.timestamp).toLocaleDateString()} at {new Date(meal.timestamp).toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {nutrientItem(Flame, 'Calories', meal.calories, 'kcal')}
        <Separator/>
        {nutrientItem(Beef, 'Protein', meal.protein, 'g')}
        <Separator/>
        {nutrientItem(Wheat, 'Carbs', meal.carbs, 'g')}
        <Separator/>
        {nutrientItem(Droplets, 'Fat', meal.fat, 'g')}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {meal.explanation ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground/70 hover:text-accent hover:bg-accent/15 rounded-full"
                aria-label="Show estimation details"
              >
                <Info className="h-5 w-5" />
                <span className="sr-only">Show estimation explanation</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>AI Estimation Details</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground max-h-[300px] overflow-y-auto whitespace-pre-line">
                  {meal.explanation}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Got it!</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          // Placeholder to keep layout consistent if explanation is missing
          <div style={{ width: '40px', height: '40px' }} /> // Same size as Button size="icon"
        )}
        <Button variant="ghost" size="sm" onClick={() => onDeleteMeal(meal.id)} className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

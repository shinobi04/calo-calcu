export interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal extends Nutrients {
  id: string;
  description: string;
  timestamp: number;
}

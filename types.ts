
export type Page = 'home' | 'profile' | 'food-analysis' | 'health-data' | 'history' | 'recommendations';

export type HealthGoal = 'weightLoss' | 'muscleGain' | 'maintenance';

export interface Profile {
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  activityLevel: number;
  healthGoal: HealthGoal;
  bmr: number;
  tdee: number;
  evaluationMessage: string;
  dietaryPreferences?: string;
  commonActivities?: string;
}

export interface UserData {
  profile: Profile | null;
  foodLog: FoodEntry[];
}

export interface Nutrients {
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sodium: number;
  vitaminC: number; // in milligrams
  calcium: number; // in milligrams
}

export interface FoodComponent {
  name: string;
  weight: number;
  calories: number;
  nutrients: Nutrients;
  analysis: string;
}

export interface AnalysisResult {
  foodName: string;
  mainComponents: FoodComponent[];
  totalCalories: number;
  nutritionTags: string[];
  dietaryAdvice: string[];
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodEntry {
  id: string;
  date: string; // ISO string
  mealType: MealType;
  analysis: AnalysisResult;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  vitaminC: number;
  calcium: number;
  sodium: number;
}

// Types for AI Recommendations
export interface Recipe {
    name: string;
    ingredients: string[];
    instructions: string[];
}

export interface Meal {
    name: string;
    calories: number;
    recipe: Recipe;
}

export interface MealPlan {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal;
}

export interface Exercise {
    name: string;
    sets: string;
    reps: string;
    description: string;
}

export interface ExerciseDay {
    day: string; // e.g., "Monday"
    focus: string; // e.g., "Full Body Strength"
    exercises: Exercise[];
}

export interface ExercisePlan {
    summary: string;
    weeklySchedule: ExerciseDay[];
}


export interface RecommendationResult {
    mealPlan: MealPlan;
    exercisePlan: ExercisePlan;
}

// Types for Health Risk Assessment
export interface PotentialRisk {
    riskName: string;
    explanation: string;
    recommendation: string;
}

export interface HealthRiskAssessment {
    overallRiskLevel: 'low' | 'medium' | 'high';
    summary: string;
    potentialRisks: PotentialRisk[];
}

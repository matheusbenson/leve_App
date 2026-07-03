export interface FoodEntry {
  id: string;
  name: string;
  kcal: number;
  time: string;
  category: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  w: number;
}

export interface UserConfig {
  calorieGoal: number;
  waterGoal: number;
  weightGoal: number | null;
  sex: 'F' | 'M';
  age: number | null;
  height: number | null;
  activity: string;
  name?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export type User = {
  id: string;
  createdAt: Date; 
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type Habit = {
  id: number;
  name: string;
  categoryId: number | null;
  userId: number | null;
  color?: string | null;
  motivation?: string | null;
  periodStart?: Date | null;
  periodEnd?: Date | null;
  frequencyType?: string | null;
  frequencyConfig?: any | null;
  createdAt: Date;
  updatedAt: Date;
}

export type Category = {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}

export type TodayHabitItem = {
  id: number;
  name: string;
  categoryName?: string | null;
  color?: string | null;
  scheduledToday: boolean;
  target: number;
  completed: number;
  doneToday: boolean;
  frequencyType?: string;
};

export type Recommendation = {
  id: number;
  title: string;
  content: string;
}
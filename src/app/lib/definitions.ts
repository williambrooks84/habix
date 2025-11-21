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
  motivation?: string | null;
  periodStart?: Date | null;
  periodEnd?: Date | null;
  frequency?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type Category = {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}
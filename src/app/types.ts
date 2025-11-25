export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type FrequencyType =
  | 'daily'
  | 'weekly'
  | 'weekly-multi'
  | 'monthly'
  | 'monthly-multi';

export type FrequencyConfig =
  | { } 
  | { interval?: number }
  | { days?: number[] }
  | { dayOfMonth?: number } 
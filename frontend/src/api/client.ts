import axios from 'axios';
import { useAuthStore } from '../store/auth';

export const client = axios.create({
  baseURL: 'http://localhost:8000',
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(err);
  }
);

// Auth
export const apiLogin = (login: string, password: string) =>
  client.post<{ access_token: string }>('/auth/token',
    new URLSearchParams({ username: login, password }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

export const apiRegister = (login: string, password: string) =>
  client.post('/users/', { login, password });

// Food
export type FoodReport = {
  id: number; user_id: number; calories: number;
  proteins: number; fats: number; carbs: number;
  gramms: number; name: string; report_time: string;
};

export type DailySummary = {
  date: string;
  total_calories: number; total_proteins: number;
  total_fats: number; total_carbs: number;
};

export type CreateFoodReport = {
  name: string; gramms: number;
  proteins: number; fats: number; carbs: number;
};

export const apiGetSummary = (date: string) =>
  client.get<DailySummary>('/food/', { params: { date } });

export const apiGetFoodList = (date: string) =>
  client.get<FoodReport[]>('/food/list', { params: { day: date } });

export const apiCreateFood = (data: CreateFoodReport) =>
  client.post<FoodReport>('/food/', data);

export const apiUpdateFood = (id: number, data: CreateFoodReport) =>
  client.put<FoodReport>(`/food/${id}`, data);
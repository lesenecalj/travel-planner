import { api } from './api';
import type { Trip, TripInput, AuthTokens } from '../types';

// Auth
export const register = async (name: string, email: string, password: string): Promise<AuthTokens> => {
  const { data } = await api.post<AuthTokens>('/users', { name, email, password });
  return data;
};

export const login = async (email: string, password: string): Promise<AuthTokens> => {
  const { data } = await api.post<AuthTokens>('/auth/login', { email, password });
  return data;
};

// Trips
export const fetchTrips = async (): Promise<Trip[]> => {
  const { data } = await api.get<Trip[]>('/trips');
  return data;
};

export const fetchTrip = async (id: string): Promise<Trip> => {
  const { data } = await api.get<Trip>(`/trips/${id}`);
  return data;
};

export const createTrip = async (input: TripInput): Promise<Trip> => {
  const { data } = await api.post<Trip>('/trips', input);
  return data;
};

export const updateTrip = async (id: string, input: TripInput): Promise<Trip> => {
  const { data } = await api.put<Trip>(`/trips/${id}`, input);
  return data;
};

export const deleteTrip = async (id: string): Promise<void> => {
  await api.delete(`/trips/${id}`);
};

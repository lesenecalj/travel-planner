import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { fetchTrips, fetchTrip, createTrip, updateTrip, deleteTrip } from '../lib/tripApi';
import type { Trip, TripInput } from '../types';

export const tripKeys = {
  all: ['trips'] as const,
  detail: (id: string) => ['trips', id] as const,
};

export function useTrips(options?: Omit<UseQueryOptions<Trip[]>, 'queryKey' | 'queryFn'>) {
  return useQuery({ queryKey: tripKeys.all, queryFn: fetchTrips, ...options });
}

export function useTrip(id: string) {
  return useQuery({ queryKey: tripKeys.detail(id), queryFn: () => fetchTrip(id) });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TripInput) => createTrip(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

export function useUpdateTrip(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TripInput) => updateTrip(id, input),
    onSuccess: (updated) => {
      qc.setQueryData(tripKeys.detail(id), updated);
      qc.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTrip(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

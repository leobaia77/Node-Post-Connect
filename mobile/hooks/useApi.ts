import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { TeenProfile, ParentProfile, DailyCheckin, SleepLog, WorkoutLog, NutritionLog } from '@/types';

export function useTeenProfile() {
  return useQuery<TeenProfile>({
    queryKey: ['teenProfile'],
    queryFn: () => api.getTeenProfile() as Promise<TeenProfile>,
  });
}

export function useUpdateTeenProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<TeenProfile>) => api.updateTeenProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teenProfile'] });
    },
  });
}

export function useUpdateTeenGoals() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (goals: unknown) => api.updateTeenGoals(goals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teenProfile'] });
    },
  });
}

export function useParentProfile() {
  return useQuery<ParentProfile>({
    queryKey: ['parentProfile'],
    queryFn: () => api.getParentProfile() as Promise<ParentProfile>,
  });
}

export function useGenerateInviteCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => api.generateInviteCode(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parentProfile'] });
    },
  });
}

export function useAcceptInviteCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (code: string) => api.acceptInviteCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teenProfile'] });
    },
  });
}

export function useUpdateGuardrails() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: unknown) => api.updateGuardrails(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardrails'] });
    },
  });
}

export function useCreateCheckin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<DailyCheckin>) => api.createCheckin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
    },
  });
}

export function useLogSleep() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<SleepLog>) => api.logSleep(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleepLogs'] });
    },
  });
}

export function useLogWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<WorkoutLog>) => api.logWorkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutLogs'] });
    },
  });
}

export function useLogNutrition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<NutritionLog>) => api.logNutrition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionLogs'] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { TeenProfile, ParentProfile, DailyCheckin, SleepLog, WorkoutLog, NutritionLog, Recommendations, MorningBrief } from '@/types';

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

export function useRecommendations(date?: string) {
  return useQuery<Recommendations>({
    queryKey: ['recommendations', date],
    queryFn: () => api.getRecommendations(date) as Promise<Recommendations>,
  });
}

export function useMorningBrief(date?: string) {
  return useQuery<MorningBrief>({
    queryKey: ['morningBrief', date],
    queryFn: () => api.getMorningBrief(date) as Promise<MorningBrief>,
  });
}

export function useCompleteAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ actionId, completed }: { actionId: string; completed: boolean }) => 
      api.completeAction(actionId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

export interface ScoliosisStatus {
  hasScoliosisSupport: boolean;
  braceSchedule: unknown;
  todayBraceHours: number;
  braceTargetHours: number;
  weeklyPtCompleted: number;
  weeklyPtTarget: number;
  hasSymptomLog: boolean;
  latestSymptom: unknown;
}

export function useScoliosisStatus() {
  return useQuery<ScoliosisStatus>({
    queryKey: ['scoliosisStatus'],
    queryFn: () => api.getScoliosisStatus() as Promise<ScoliosisStatus>,
  });
}

export function useEnableScoliosisSupport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => api.enableScoliosisSupport(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoliosisStatus'] });
      queryClient.invalidateQueries({ queryKey: ['teenProfile'] });
    },
  });
}

export function useBraceSchedule() {
  return useQuery({
    queryKey: ['braceSchedule'],
    queryFn: () => api.getBraceSchedule(),
  });
}

export function useCreateBraceSchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: unknown) => api.createBraceSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['braceSchedule'] });
      queryClient.invalidateQueries({ queryKey: ['scoliosisStatus'] });
    },
  });
}

export function useActiveBraceSession() {
  return useQuery({
    queryKey: ['activeBraceSession'],
    queryFn: () => api.getActiveBraceSession(),
    refetchInterval: 60000,
  });
}

export function useStartBraceSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notes?: string) => api.startBraceSession(notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeBraceSession'] });
      queryClient.invalidateQueries({ queryKey: ['braceLogs'] });
    },
  });
}

export function useEndBraceSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => api.endBraceSession(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeBraceSession'] });
      queryClient.invalidateQueries({ queryKey: ['braceLogs'] });
      queryClient.invalidateQueries({ queryKey: ['scoliosisStatus'] });
    },
  });
}

export function usePtRoutines() {
  return useQuery({
    queryKey: ['ptRoutines'],
    queryFn: () => api.getPtRoutines(),
  });
}

export function usePtAdherence(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['ptAdherence', startDate, endDate],
    queryFn: () => api.getPtAdherence(startDate, endDate),
  });
}

export function useLogPtAdherence() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: unknown) => api.logPtAdherence(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ptAdherence'] });
      queryClient.invalidateQueries({ queryKey: ['scoliosisStatus'] });
    },
  });
}

export function useSymptomLogs(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['symptomLogs', startDate, endDate],
    queryFn: () => api.getSymptomLogs(startDate, endDate),
  });
}

export function useLogSymptoms() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: unknown) => api.logSymptoms(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptomLogs'] });
      queryClient.invalidateQueries({ queryKey: ['scoliosisStatus'] });
    },
  });
}

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, Moon, Apple, Heart, AlertTriangle, CheckCircle2, 
  TrendingUp, Dumbbell, Clock, Zap, Flame, Droplets, Target
} from "lucide-react";
import { format, subDays } from "date-fns";
import type { DailyCheckin, SleepLog, WorkoutLog, NutritionLog, SafetyAlert } from "@shared/schema";
import { DailyCheckinForm } from "@/components/DailyCheckinForm";
import { SleepLogForm } from "@/components/SleepLogForm";
import { WorkoutLogForm } from "@/components/WorkoutLogForm";
import { NutritionLogForm } from "@/components/NutritionLogForm";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TeenDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const today = format(new Date(), "yyyy-MM-dd");
  const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");

  const { data: checkins, isLoading: checkinsLoading } = useQuery<DailyCheckin[]>({
    queryKey: ["/api/checkins", { start_date: weekAgo, end_date: today }],
  });

  const { data: sleepLogs, isLoading: sleepLoading } = useQuery<SleepLog[]>({
    queryKey: ["/api/sleep", { start_date: weekAgo, end_date: today }],
  });

  const { data: workoutLogs, isLoading: workoutsLoading } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workouts", { start_date: weekAgo, end_date: today }],
  });

  const { data: nutritionLogs, isLoading: nutritionLoading } = useQuery<NutritionLog[]>({
    queryKey: ["/api/nutrition", { start_date: weekAgo, end_date: today }],
  });

  const { data: alerts } = useQuery<SafetyAlert[]>({
    queryKey: ["/api/safety-alerts"],
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest("PUT", `/api/safety-alerts/${alertId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/safety-alerts"] });
      toast({ title: "Alert acknowledged" });
    },
  });

  const todayCheckin = checkins?.find((c) => c.date === today);
  const todaySleep = sleepLogs?.find((s) => s.date === today);
  const todayWorkouts = workoutLogs?.filter((w) => w.date === today) || [];
  const todayMeals = nutritionLogs?.filter((n) => n.date === today) || [];

  const weeklyTrainingMinutes = workoutLogs?.reduce((sum, w) => sum + w.durationMinutes, 0) || 0;
  const avgSleepHours = sleepLogs?.length
    ? sleepLogs.reduce((sum, s) => sum + Number(s.totalHours || 0), 0) / sleepLogs.length
    : 0;
  const todayCalories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const todayProtein = todayMeals.reduce((sum, m) => sum + Number(m.proteinG || 0), 0);

  const unacknowledgedAlerts = alerts?.filter((a) => !a.acknowledgedByTeen) || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Hey, {user?.profile?.displayName || "Athlete"}!
          </h1>
          <p className="text-muted-foreground">Here's your health snapshot for today</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={openDialog === "checkin"} onOpenChange={(o) => setOpenDialog(o ? "checkin" : null)}>
            <DialogTrigger asChild>
              <Button variant={todayCheckin ? "outline" : "default"} data-testid="button-daily-checkin">
                <Heart className="h-4 w-4 mr-2" />
                {todayCheckin ? "Update Check-in" : "Daily Check-in"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Daily Check-in</DialogTitle>
              </DialogHeader>
              <DailyCheckinForm onSuccess={() => setOpenDialog(null)} existing={todayCheckin} />
            </DialogContent>
          </Dialog>

          <Dialog open={openDialog === "sleep"} onOpenChange={(o) => setOpenDialog(o ? "sleep" : null)}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-log-sleep">
                <Moon className="h-4 w-4 mr-2" />
                Log Sleep
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Log Sleep</DialogTitle>
              </DialogHeader>
              <SleepLogForm onSuccess={() => setOpenDialog(null)} />
            </DialogContent>
          </Dialog>

          <Dialog open={openDialog === "workout"} onOpenChange={(o) => setOpenDialog(o ? "workout" : null)}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-log-workout">
                <Dumbbell className="h-4 w-4 mr-2" />
                Log Workout
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Log Workout</DialogTitle>
              </DialogHeader>
              <WorkoutLogForm onSuccess={() => setOpenDialog(null)} />
            </DialogContent>
          </Dialog>

          <Dialog open={openDialog === "nutrition"} onOpenChange={(o) => setOpenDialog(o ? "nutrition" : null)}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-log-meal">
                <Apple className="h-4 w-4 mr-2" />
                Log Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Log Meal</DialogTitle>
              </DialogHeader>
              <NutritionLogForm onSuccess={() => setOpenDialog(null)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {unacknowledgedAlerts.length > 0 && (
        <div className="space-y-3">
          {unacknowledgedAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`border-l-4 ${
                alert.severity === "critical"
                  ? "border-l-destructive bg-destructive/5"
                  : alert.severity === "warning"
                  ? "border-l-yellow-500 bg-yellow-500/5"
                  : "border-l-blue-500 bg-blue-500/5"
              }`}
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      alert.severity === "critical"
                        ? "text-destructive"
                        : alert.severity === "warning"
                        ? "text-yellow-500"
                        : "text-blue-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-foreground">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(alert.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => acknowledgeMutation.mutate(alert.id)}
                  disabled={acknowledgeMutation.isPending}
                  data-testid={`button-acknowledge-alert-${alert.id}`}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Acknowledge
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Energy</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {checkinsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : todayCheckin ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold">{todayCheckin.energyLevel}/5</div>
                <Progress value={(todayCheckin.energyLevel / 5) * 100} className="h-2" />
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Complete check-in</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Night's Sleep</CardTitle>
            <Moon className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            {sleepLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : todaySleep ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold">{Number(todaySleep.totalHours).toFixed(1)}h</div>
                <Progress value={Math.min((Number(todaySleep.totalHours) / 9) * 100, 100)} className="h-2" />
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Log your sleep</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Training</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {workoutsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">{weeklyTrainingMinutes} min</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(weeklyTrainingMinutes / 60)}h this week
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Calories</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {nutritionLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">{todayCalories}</div>
                <p className="text-xs text-muted-foreground">{todayProtein.toFixed(0)}g protein</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Today's Check-in
            </CardTitle>
            <CardDescription>How you're feeling today</CardDescription>
          </CardHeader>
          <CardContent>
            {checkinsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : todayCheckin ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Energy</p>
                  <div className="flex items-center gap-2">
                    <Progress value={(todayCheckin.energyLevel / 5) * 100} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{todayCheckin.energyLevel}/5</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Soreness</p>
                  <div className="flex items-center gap-2">
                    <Progress value={(todayCheckin.sorenessLevel / 5) * 100} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{todayCheckin.sorenessLevel}/5</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Mood</p>
                  <div className="flex items-center gap-2">
                    <Progress value={(todayCheckin.moodLevel / 5) * 100} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{todayCheckin.moodLevel}/5</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Stress</p>
                  <div className="flex items-center gap-2">
                    <Progress value={(todayCheckin.stressLevel / 5) * 100} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{todayCheckin.stressLevel}/5</span>
                  </div>
                </div>
                {todayCheckin.hasPainFlag && (
                  <div className="col-span-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Pain reported: {todayCheckin.painNotes || "No details provided"}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground mb-3">You haven't checked in yet today</p>
                <Button onClick={() => setOpenDialog("checkin")} data-testid="button-start-checkin">
                  Start Check-in
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Today's Workouts
            </CardTitle>
            <CardDescription>Your training sessions today</CardDescription>
          </CardHeader>
          <CardContent>
            {workoutsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : todayWorkouts.length > 0 ? (
              <div className="space-y-3">
                {todayWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`workout-item-${workout.id}`}
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {workout.workoutType.replace("_", " ")}
                        {workout.sportName && ` - ${workout.sportName}`}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {workout.durationMinutes} min
                        {workout.rpe && ` • RPE ${workout.rpe}/10`}
                      </p>
                    </div>
                    <Badge variant="secondary">{workout.source}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground mb-3">No workouts logged today</p>
                <Button variant="outline" onClick={() => setOpenDialog("workout")} data-testid="button-add-workout">
                  Add Workout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              Sleep This Week
            </CardTitle>
            <CardDescription>Average: {avgSleepHours.toFixed(1)} hours</CardDescription>
          </CardHeader>
          <CardContent>
            {sleepLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : sleepLogs && sleepLogs.length > 0 ? (
              <div className="space-y-2">
                {sleepLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(log.date), "EEE, MMM d")}
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={Math.min((Number(log.totalHours) / 9) * 100, 100)}
                        className="h-2 w-24"
                      />
                      <span className="text-sm font-medium w-12 text-right">
                        {Number(log.totalHours).toFixed(1)}h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Moon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground mb-3">No sleep logs this week</p>
                <Button variant="outline" onClick={() => setOpenDialog("sleep")} data-testid="button-add-sleep">
                  Log Sleep
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-green-500" />
              Today's Nutrition
            </CardTitle>
            <CardDescription>{todayMeals.length} meals logged</CardDescription>
          </CardHeader>
          <CardContent>
            {nutritionLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : todayMeals.length > 0 ? (
              <div className="space-y-3">
                {todayMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`meal-item-${meal.id}`}
                  >
                    <div>
                      <p className="font-medium text-foreground capitalize">{meal.mealType}</p>
                      <p className="text-sm text-muted-foreground">
                        {meal.calories && `${meal.calories} cal`}
                        {meal.proteinG && ` • ${Number(meal.proteinG).toFixed(0)}g protein`}
                      </p>
                    </div>
                    <Badge variant="outline">{meal.source}</Badge>
                  </div>
                ))}
                <div className="pt-2 border-t flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">
                    {todayCalories} cal • {todayProtein.toFixed(0)}g protein
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Apple className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground mb-3">No meals logged today</p>
                <Button variant="outline" onClick={() => setOpenDialog("nutrition")} data-testid="button-add-meal">
                  Log Meal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

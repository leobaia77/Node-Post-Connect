import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Eye, Target, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import type { Profile, TeenProfile, TeenSharingPreferences } from "@shared/schema";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <ProfileSettings />
      
      {user?.user.role === "teen" && (
        <>
          <GoalsSettings />
          <SharingSettings />
        </>
      )}
    </div>
  );
}

function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.profile?.displayName || "");
  const [ageRange, setAgeRange] = useState(user?.profile?.ageRange || "");
  const [timezone, setTimezone] = useState(user?.profile?.timezone || "America/New_York");

  useEffect(() => {
    if (user?.profile) {
      setDisplayName(user.profile.displayName);
      setAgeRange(user.profile.ageRange || "");
      setTimezone(user.profile.timezone || "America/New_York");
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      return apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: async () => {
      await refreshUser();
      toast({ title: "Profile updated!" });
    },
    onError: (error) => {
      toast({
        title: "Error updating profile",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ displayName, ageRange: ageRange as any, timezone });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Profile
        </CardTitle>
        <CardDescription>Your basic information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="display-name">Display Name</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            data-testid="input-display-name"
          />
        </div>

        {user?.user.role === "teen" && (
          <div className="space-y-2">
            <Label>Age Range</Label>
            <Select value={ageRange} onValueChange={setAgeRange}>
              <SelectTrigger data-testid="select-age-range">
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="13-14">13-14 years</SelectItem>
                <SelectItem value="15-16">15-16 years</SelectItem>
                <SelectItem value="17-19">17-19 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger data-testid="select-timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/New_York">Eastern Time</SelectItem>
              <SelectItem value="America/Chicago">Central Time</SelectItem>
              <SelectItem value="America/Denver">Mountain Time</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} disabled={updateMutation.isPending} data-testid="button-save-profile">
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}

function GoalsSettings() {
  const { toast } = useToast();
  const { data: goals, isLoading } = useQuery<TeenProfile>({
    queryKey: ["/api/teen/goals"],
  });

  const availableGoals = [
    { id: "growth", label: "Height Growth", description: "Support natural growth development" },
    { id: "muscle", label: "Muscle Building", description: "Build strength and lean muscle" },
    { id: "bone_health", label: "Bone Health", description: "Strong bones for life" },
    { id: "scoliosis_support", label: "Scoliosis Support", description: "PT adherence and brace tracking" },
    { id: "athletic_performance", label: "Athletic Performance", description: "Excel in your sport" },
  ];

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  useEffect(() => {
    if (goals?.goals) {
      setSelectedGoals(goals.goals as string[]);
    }
  }, [goals]);

  const updateMutation = useMutation({
    mutationFn: async (data: { goals: string[] }) => {
      return apiRequest("PUT", "/api/teen/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teen/goals"] });
      toast({ title: "Goals updated!" });
    },
  });

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  };

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Health Goals
        </CardTitle>
        <CardDescription>What do you want to focus on?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableGoals.map((goal) => (
          <div
            key={goal.id}
            className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedGoals.includes(goal.id) ? "bg-primary/5 border-primary" : "bg-muted/50"
            }`}
            onClick={() => toggleGoal(goal.id)}
            data-testid={`goal-${goal.id}`}
          >
            <div>
              <p className="font-medium text-foreground">{goal.label}</p>
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            </div>
            <Switch checked={selectedGoals.includes(goal.id)} onCheckedChange={() => toggleGoal(goal.id)} />
          </div>
        ))}

        <Button
          onClick={() => updateMutation.mutate({ goals: selectedGoals })}
          disabled={updateMutation.isPending}
          data-testid="button-save-goals"
        >
          {updateMutation.isPending ? "Saving..." : "Save Goals"}
        </Button>
      </CardContent>
    </Card>
  );
}

function SharingSettings() {
  const { toast } = useToast();
  const { data: prefs, isLoading } = useQuery<TeenSharingPreferences>({
    queryKey: ["/api/sharing-preferences"],
  });

  const [shareSleep, setShareSleep] = useState(true);
  const [shareTraining, setShareTraining] = useState(true);
  const [shareNutrition, setShareNutrition] = useState(true);
  const [shareDetailed, setShareDetailed] = useState(false);

  useEffect(() => {
    if (prefs) {
      setShareSleep(prefs.shareSleepTrend ?? true);
      setShareTraining(prefs.shareTrainingTrend ?? true);
      setShareNutrition(prefs.shareNutritionTrend ?? true);
      setShareDetailed(prefs.shareDetailedLogs ?? false);
    }
  }, [prefs]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<TeenSharingPreferences>) => {
      return apiRequest("PUT", "/api/sharing-preferences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sharing-preferences"] });
      toast({ title: "Sharing preferences updated!" });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Parent Sharing
        </CardTitle>
        <CardDescription>Control what your parent can see</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="font-medium">Sleep Trends</p>
            <p className="text-xs text-muted-foreground">Weekly average, not individual nights</p>
          </div>
          <Switch checked={shareSleep} onCheckedChange={setShareSleep} data-testid="switch-share-sleep" />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="font-medium">Training Trends</p>
            <p className="text-xs text-muted-foreground">Weekly totals and intensity</p>
          </div>
          <Switch checked={shareTraining} onCheckedChange={setShareTraining} data-testid="switch-share-training" />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="font-medium">Nutrition Trends</p>
            <p className="text-xs text-muted-foreground">Macro averages, not individual meals</p>
          </div>
          <Switch checked={shareNutrition} onCheckedChange={setShareNutrition} data-testid="switch-share-nutrition" />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="font-medium">Detailed Logs</p>
            <p className="text-xs text-muted-foreground">Individual entries and notes</p>
          </div>
          <Switch checked={shareDetailed} onCheckedChange={setShareDetailed} data-testid="switch-share-detailed" />
        </div>

        <Button
          onClick={() =>
            updateMutation.mutate({
              shareSleepTrend: shareSleep,
              shareTrainingTrend: shareTraining,
              shareNutritionTrend: shareNutrition,
              shareDetailedLogs: shareDetailed,
            })
          }
          disabled={updateMutation.isPending}
          data-testid="button-save-sharing"
        >
          {updateMutation.isPending ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}

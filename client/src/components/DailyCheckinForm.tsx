import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import type { DailyCheckin } from "@shared/schema";
import { Zap, Activity, Smile, Brain } from "lucide-react";

interface Props {
  onSuccess: () => void;
  existing?: DailyCheckin | null;
}

export function DailyCheckinForm({ onSuccess, existing }: Props) {
  const { toast } = useToast();
  const [energyLevel, setEnergyLevel] = useState(existing?.energyLevel ?? 3);
  const [sorenessLevel, setSorenessLevel] = useState(existing?.sorenessLevel ?? 2);
  const [moodLevel, setMoodLevel] = useState(existing?.moodLevel ?? 3);
  const [stressLevel, setStressLevel] = useState(existing?.stressLevel ?? 2);
  const [hasPainFlag, setHasPainFlag] = useState(existing?.hasPainFlag ?? false);
  const [painNotes, setPainNotes] = useState(existing?.painNotes ?? "");

  const mutation = useMutation({
    mutationFn: async (data: unknown) => {
      return apiRequest("POST", "/api/checkin", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkins"] });
      toast({ title: "Check-in saved!", description: "Your daily check-in has been recorded." });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error saving check-in",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      energyLevel,
      sorenessLevel,
      moodLevel,
      stressLevel,
      hasPainFlag,
      painNotes: hasPainFlag ? painNotes : null,
    });
  };

  const getLevelLabel = (level: number, type: "energy" | "soreness" | "mood" | "stress") => {
    const labels = {
      energy: ["Very Low", "Low", "Moderate", "Good", "Excellent"],
      soreness: ["None", "Mild", "Moderate", "High", "Severe"],
      mood: ["Very Low", "Low", "Neutral", "Good", "Great"],
      stress: ["None", "Low", "Moderate", "High", "Overwhelming"],
    };
    return labels[type][level - 1] || "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <Label>Energy Level</Label>
            <span className="ml-auto text-sm text-muted-foreground">
              {getLevelLabel(energyLevel, "energy")} ({energyLevel}/5)
            </span>
          </div>
          <Slider
            value={[energyLevel]}
            onValueChange={([v]) => setEnergyLevel(v)}
            min={1}
            max={5}
            step={1}
            className="w-full"
            data-testid="slider-energy"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-500" />
            <Label>Soreness Level</Label>
            <span className="ml-auto text-sm text-muted-foreground">
              {getLevelLabel(sorenessLevel, "soreness")} ({sorenessLevel}/5)
            </span>
          </div>
          <Slider
            value={[sorenessLevel]}
            onValueChange={([v]) => setSorenessLevel(v)}
            min={1}
            max={5}
            step={1}
            className="w-full"
            data-testid="slider-soreness"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Smile className="h-4 w-4 text-green-500" />
            <Label>Mood Level</Label>
            <span className="ml-auto text-sm text-muted-foreground">
              {getLevelLabel(moodLevel, "mood")} ({moodLevel}/5)
            </span>
          </div>
          <Slider
            value={[moodLevel]}
            onValueChange={([v]) => setMoodLevel(v)}
            min={1}
            max={5}
            step={1}
            className="w-full"
            data-testid="slider-mood"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-500" />
            <Label>Stress Level</Label>
            <span className="ml-auto text-sm text-muted-foreground">
              {getLevelLabel(stressLevel, "stress")} ({stressLevel}/5)
            </span>
          </div>
          <Slider
            value={[stressLevel]}
            onValueChange={([v]) => setStressLevel(v)}
            min={1}
            max={5}
            step={1}
            className="w-full"
            data-testid="slider-stress"
          />
        </div>
      </div>

      <div className="space-y-3 p-4 rounded-lg bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <Label>Any Pain or Discomfort?</Label>
            <p className="text-xs text-muted-foreground">This helps track injury risks</p>
          </div>
          <Switch
            checked={hasPainFlag}
            onCheckedChange={setHasPainFlag}
            data-testid="switch-pain-flag"
          />
        </div>
        {hasPainFlag && (
          <Textarea
            placeholder="Describe the pain location and intensity..."
            value={painNotes}
            onChange={(e) => setPainNotes(e.target.value)}
            className="mt-3"
            data-testid="input-pain-notes"
          />
        )}
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-checkin">
        {mutation.isPending ? "Saving..." : "Save Check-in"}
      </Button>
    </form>
  );
}

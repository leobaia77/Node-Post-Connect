import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Props {
  onSuccess: () => void;
}

export function WorkoutLogForm({ onSuccess }: Props) {
  const { toast } = useToast();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [workoutType, setWorkoutType] = useState<string>("gym");
  const [sportName, setSportName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [rpe, setRpe] = useState(6);
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState<string>("manual");

  const mutation = useMutation({
    mutationFn: async (data: unknown) => {
      return apiRequest("POST", "/api/workout", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({ title: "Workout logged!", description: "Your workout has been recorded." });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error logging workout",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      date,
      workoutType,
      sportName: workoutType === "sport_practice" ? sportName : null,
      durationMinutes,
      rpe,
      notes: notes || null,
      source,
    });
  };

  const getRpeLabel = (level: number) => {
    const labels = [
      "", "Very Easy", "Easy", "Light", "Moderate", "Somewhat Hard",
      "Hard", "Very Hard", "Very, Very Hard", "Maximum", "All Out"
    ];
    return labels[level] || "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="workout-date">Date</Label>
        <Input
          id="workout-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          data-testid="input-workout-date"
        />
      </div>

      <div className="space-y-2">
        <Label>Workout Type</Label>
        <Select value={workoutType} onValueChange={setWorkoutType}>
          <SelectTrigger data-testid="select-workout-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sport_practice">Sport Practice</SelectItem>
            <SelectItem value="gym">Gym / Strength</SelectItem>
            <SelectItem value="cardio">Cardio</SelectItem>
            <SelectItem value="mobility">Mobility / Stretching</SelectItem>
            <SelectItem value="pt_rehab">PT / Rehab</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {workoutType === "sport_practice" && (
        <div className="space-y-2">
          <Label htmlFor="sport-name">Sport Name</Label>
          <Input
            id="sport-name"
            placeholder="e.g., Basketball, Soccer"
            value={sportName}
            onChange={(e) => setSportName(e.target.value)}
            data-testid="input-sport-name"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          min={1}
          max={480}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          data-testid="input-duration"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>RPE (Rate of Perceived Exertion)</Label>
          <span className="text-sm text-muted-foreground">
            {getRpeLabel(rpe)} ({rpe}/10)
          </span>
        </div>
        <Slider
          value={[rpe]}
          onValueChange={([v]) => setRpe(v)}
          min={1}
          max={10}
          step={1}
          className="w-full"
          data-testid="slider-rpe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="How did it feel? Any highlights?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          data-testid="input-workout-notes"
        />
      </div>

      <div className="space-y-2">
        <Label>Source</Label>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger data-testid="select-workout-source">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual Entry</SelectItem>
            <SelectItem value="apple_health">Apple Health</SelectItem>
            <SelectItem value="other">Other Device</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-workout">
        {mutation.isPending ? "Saving..." : "Log Workout"}
      </Button>
    </form>
  );
}

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Props {
  onSuccess: () => void;
}

export function NutritionLogForm({ onSuccess }: Props) {
  const { toast } = useToast();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [mealType, setMealType] = useState<string>("lunch");
  const [calories, setCalories] = useState<number | "">("");
  const [proteinG, setProteinG] = useState<number | "">("");
  const [carbsG, setCarbsG] = useState<number | "">("");
  const [fatG, setFatG] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState<string>("manual");

  const mutation = useMutation({
    mutationFn: async (data: unknown) => {
      return apiRequest("POST", "/api/nutrition", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition"] });
      toast({ title: "Meal logged!", description: "Your nutrition data has been recorded." });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error logging meal",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      date,
      mealType,
      calories: calories || null,
      proteinG: proteinG ? String(proteinG) : null,
      carbsG: carbsG ? String(carbsG) : null,
      fatG: fatG ? String(fatG) : null,
      notes: notes || null,
      source,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="meal-date">Date</Label>
          <Input
            id="meal-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            data-testid="input-meal-date"
          />
        </div>
        <div className="space-y-2">
          <Label>Meal Type</Label>
          <Select value={mealType} onValueChange={setMealType}>
            <SelectTrigger data-testid="select-meal-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="calories">Calories (optional)</Label>
        <Input
          id="calories"
          type="number"
          placeholder="e.g., 500"
          min={0}
          value={calories}
          onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : "")}
          data-testid="input-calories"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="protein">Protein (g)</Label>
          <Input
            id="protein"
            type="number"
            placeholder="30"
            min={0}
            value={proteinG}
            onChange={(e) => setProteinG(e.target.value ? Number(e.target.value) : "")}
            data-testid="input-protein"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carbs">Carbs (g)</Label>
          <Input
            id="carbs"
            type="number"
            placeholder="50"
            min={0}
            value={carbsG}
            onChange={(e) => setCarbsG(e.target.value ? Number(e.target.value) : "")}
            data-testid="input-carbs"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fat">Fat (g)</Label>
          <Input
            id="fat"
            type="number"
            placeholder="15"
            min={0}
            value={fatG}
            onChange={(e) => setFatG(e.target.value ? Number(e.target.value) : "")}
            data-testid="input-fat"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meal-notes">Notes (optional)</Label>
        <Textarea
          id="meal-notes"
          placeholder="What did you eat?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          data-testid="input-meal-notes"
        />
      </div>

      <div className="space-y-2">
        <Label>Source</Label>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger data-testid="select-nutrition-source">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual Entry</SelectItem>
            <SelectItem value="apple_health">Apple Health</SelectItem>
            <SelectItem value="other">Other App</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-meal">
        {mutation.isPending ? "Saving..." : "Log Meal"}
      </Button>
    </form>
  );
}

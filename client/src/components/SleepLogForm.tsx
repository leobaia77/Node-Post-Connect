import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Props {
  onSuccess: () => void;
}

export function SleepLogForm({ onSuccess }: Props) {
  const { toast } = useToast();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [bedtime, setBedtime] = useState("22:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [source, setSource] = useState<string>("manual");

  const calculateHours = () => {
    const [bedH, bedM] = bedtime.split(":").map(Number);
    const [wakeH, wakeM] = wakeTime.split(":").map(Number);
    let hours = wakeH - bedH + (wakeM - bedM) / 60;
    if (hours < 0) hours += 24;
    return hours;
  };

  const mutation = useMutation({
    mutationFn: async (data: unknown) => {
      return apiRequest("POST", "/api/sleep", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sleep"] });
      toast({ title: "Sleep logged!", description: "Your sleep data has been recorded." });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error logging sleep",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalHours = calculateHours();
    mutation.mutate({
      date,
      totalHours: totalHours.toFixed(2),
      source,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sleep-date">Date</Label>
        <Input
          id="sleep-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          data-testid="input-sleep-date"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedtime">Bedtime</Label>
          <Input
            id="bedtime"
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            data-testid="input-bedtime"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wake-time">Wake Time</Label>
          <Input
            id="wake-time"
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            data-testid="input-wake-time"
          />
        </div>
      </div>

      <div className="p-4 rounded-lg bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground">Total Sleep</p>
        <p className="text-2xl font-bold text-primary">{calculateHours().toFixed(1)} hours</p>
      </div>

      <div className="space-y-2">
        <Label>Source</Label>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger data-testid="select-sleep-source">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual Entry</SelectItem>
            <SelectItem value="apple_health">Apple Health</SelectItem>
            <SelectItem value="other">Other Device</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-sleep">
        {mutation.isPending ? "Saving..." : "Log Sleep"}
      </Button>
    </form>
  );
}

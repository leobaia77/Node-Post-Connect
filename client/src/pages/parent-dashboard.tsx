import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Shield, AlertTriangle, CheckCircle2, Link2, Copy, 
  Moon, Activity, Apple, TrendingUp, Clock, Settings
} from "lucide-react";
import { format } from "date-fns";
import type { SafetyAlert, ParentTeenLink, ParentGuardrails } from "@shared/schema";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LinkedTeen {
  link: ParentTeenLink;
  profile: {
    displayName: string;
    ageRange: string;
  };
  stats: {
    avgSleepHours: number;
    weeklyTrainingMinutes: number;
    recentCheckin: {
      energyLevel: number;
      moodLevel: number;
    } | null;
  };
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showGuardrailsDialog, setShowGuardrailsDialog] = useState(false);
  const [selectedLink, setSelectedLink] = useState<ParentTeenLink | null>(null);

  const { data: linkStatus, isLoading: linkLoading } = useQuery<{
    linkedTeens: LinkedTeen[];
    pendingLinks: ParentTeenLink[];
  }>({
    queryKey: ["/api/link/status"],
  });

  const { data: alerts } = useQuery<SafetyAlert[]>({
    queryKey: ["/api/parent/alerts"],
  });

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/link/generate-code");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/link/status"] });
      toast({ 
        title: "Invite code generated!", 
        description: `Share this code with your teen: ${data.inviteCode}` 
      });
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest("PUT", `/api/safety-alerts/${alertId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent/alerts"] });
      toast({ title: "Alert acknowledged" });
    },
  });

  const updateGuardrailsMutation = useMutation({
    mutationFn: async (data: { linkId: string; guardrails: Partial<ParentGuardrails> }) => {
      return apiRequest("PUT", "/api/guardrails", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guardrails"] });
      toast({ title: "Guardrails updated" });
      setShowGuardrailsDialog(false);
    },
  });

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: "Invite code copied to clipboard" });
  };

  const unacknowledgedAlerts = alerts?.filter((a) => !a.acknowledgedByParent) || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Parent Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor your teen's health and set safety guardrails</p>
        </div>
        <Button onClick={() => generateCodeMutation.mutate()} disabled={generateCodeMutation.isPending} data-testid="button-generate-invite">
          <Link2 className="h-4 w-4 mr-2" />
          {generateCodeMutation.isPending ? "Generating..." : "Generate Invite Code"}
        </Button>
      </div>

      {linkStatus?.pendingLinks && linkStatus.pendingLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Pending Invitations
            </CardTitle>
            <CardDescription>Share these codes with your teens to link accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {linkStatus.pendingLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  data-testid={`pending-link-${link.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">Pending</Badge>
                    <code className="text-lg font-mono font-bold text-foreground">{link.inviteCode}</code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteCode(link.inviteCode)}
                    data-testid={`button-copy-code-${link.id}`}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {unacknowledgedAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Active Alerts
          </h2>
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

      {linkLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : linkStatus?.linkedTeens && linkStatus.linkedTeens.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {linkStatus.linkedTeens.map((teen) => (
            <Card key={teen.link.id} data-testid={`linked-teen-${teen.link.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {teen.profile.displayName}
                  </CardTitle>
                  <CardDescription>
                    Age {teen.profile.ageRange} • {teen.link.supervisionLevel.replace("_", " ")}
                  </CardDescription>
                </div>
                <Dialog open={showGuardrailsDialog && selectedLink?.id === teen.link.id} onOpenChange={(o) => {
                  setShowGuardrailsDialog(o);
                  if (o) setSelectedLink(teen.link);
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid={`button-settings-${teen.link.id}`}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Safety Guardrails for {teen.profile.displayName}</DialogTitle>
                    </DialogHeader>
                    <GuardrailsForm linkId={teen.link.id} onSubmit={(data) => updateGuardrailsMutation.mutate({ linkId: teen.link.id, guardrails: data })} />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Moon className="h-5 w-5 mx-auto mb-1 text-indigo-500" />
                    <p className="text-xl font-bold">{teen.stats.avgSleepHours.toFixed(1)}h</p>
                    <p className="text-xs text-muted-foreground">Avg Sleep</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-xl font-bold">{Math.round(teen.stats.weeklyTrainingMinutes / 60)}h</p>
                    <p className="text-xs text-muted-foreground">Weekly Training</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <p className="text-xl font-bold">
                      {teen.stats.recentCheckin ? `${teen.stats.recentCheckin.energyLevel}/5` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Energy</p>
                  </div>
                </div>

                {teen.stats.recentCheckin && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <span className="text-sm text-accent-foreground">Latest mood</span>
                    <Badge variant={teen.stats.recentCheckin.moodLevel >= 4 ? "default" : teen.stats.recentCheckin.moodLevel >= 3 ? "secondary" : "destructive"}>
                      {teen.stats.recentCheckin.moodLevel >= 4 ? "Great" : teen.stats.recentCheckin.moodLevel >= 3 ? "Good" : "Needs Attention"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Linked Teens Yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate an invite code and share it with your teen to connect accounts
            </p>
            <Button onClick={() => generateCodeMutation.mutate()} disabled={generateCodeMutation.isPending} data-testid="button-first-invite">
              <Link2 className="h-4 w-4 mr-2" />
              Generate Invite Code
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function GuardrailsForm({ linkId, onSubmit }: { linkId: string; onSubmit: (data: Partial<ParentGuardrails>) => void }) {
  const { data: guardrails } = useQuery<ParentGuardrails>({
    queryKey: ["/api/guardrails", linkId],
  });

  const [maxWeeklyTraining, setMaxWeeklyTraining] = useState(guardrails?.maxWeeklyTrainingMinutes || 600);
  const [minSleep, setMinSleep] = useState(Number(guardrails?.minNightlySleepHours) || 8);
  const [noWeightLoss, setNoWeightLoss] = useState(guardrails?.noWeightLossMode ?? true);

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label>Maximum Weekly Training (minutes)</Label>
        <Input
          type="number"
          value={maxWeeklyTraining}
          onChange={(e) => setMaxWeeklyTraining(Number(e.target.value))}
          min={0}
          max={2400}
          data-testid="input-max-training"
        />
        <p className="text-xs text-muted-foreground">
          Alert when weekly training exceeds {Math.round(maxWeeklyTraining / 60)} hours
        </p>
      </div>

      <div className="space-y-2">
        <Label>Minimum Nightly Sleep (hours)</Label>
        <Input
          type="number"
          value={minSleep}
          onChange={(e) => setMinSleep(Number(e.target.value))}
          min={5}
          max={12}
          step={0.5}
          data-testid="input-min-sleep"
        />
        <p className="text-xs text-muted-foreground">
          Alert when sleep falls below {minSleep} hours
        </p>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <div>
          <Label>No Weight Loss Mode</Label>
          <p className="text-xs text-muted-foreground">Block weight loss content for growing athletes</p>
        </div>
        <Switch
          checked={noWeightLoss}
          onCheckedChange={setNoWeightLoss}
          data-testid="switch-no-weight-loss"
        />
      </div>

      <Button
        className="w-full"
        onClick={() => onSubmit({
          maxWeeklyTrainingMinutes: maxWeeklyTraining,
          minNightlySleepHours: String(minSleep),
          noWeightLossMode: noWeightLoss,
        })}
        data-testid="button-save-guardrails"
      >
        Save Guardrails
      </Button>
    </div>
  );
}

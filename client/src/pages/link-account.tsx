import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link2, Shield, CheckCircle2 } from "lucide-react";

export default function LinkAccountPage() {
  const [, setLocation] = useLocation();
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");

  const linkMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("POST", "/api/link/accept", { inviteCode: code });
    },
    onSuccess: async () => {
      toast({
        title: "Account linked!",
        description: "You're now connected with your parent/guardian.",
      });
      await refreshUser();
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Link failed",
        description: error instanceof Error ? error.message : "Invalid or expired code",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      linkMutation.mutate(inviteCode.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Link2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Link with Parent</CardTitle>
          <CardDescription>
            Enter the invite code from your parent/guardian to connect your accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite Code</Label>
              <Input
                id="invite-code"
                placeholder="Enter 8-character code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={8}
                data-testid="input-invite-code"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={linkMutation.isPending || inviteCode.length < 6}
              data-testid="button-link-account"
            >
              {linkMutation.isPending ? "Linking..." : "Link Account"}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Your Privacy Matters</p>
                <p className="text-xs text-muted-foreground">
                  You control what data your parent can see through sharing preferences
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Stay Safe</p>
                <p className="text-xs text-muted-foreground">
                  Parent oversight helps prevent overtraining and supports healthy habits
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => setLocation("/")} data-testid="button-skip-link">
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

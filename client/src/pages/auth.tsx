import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Heart, Activity, Moon, Apple, Shield } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerRole, setRegisterRole] = useState<string>("teen");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(registerEmail, registerPassword, registerRole, registerName);
      toast({ title: "Account created!", description: "Welcome to GrowthTrack." });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">GrowthTrack</span>
            </div>
            <CardTitle className="text-xl">Welcome</CardTitle>
            <CardDescription>Sign in or create an account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      data-testid="input-login-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      data-testid="input-login-password"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login">
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Display Name</Label>
                    <Input
                      id="register-name"
                      placeholder="Your name"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      data-testid="input-register-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      data-testid="input-register-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      minLength={8}
                      data-testid="input-register-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-role">I am a</Label>
                    <Select value={registerRole} onValueChange={setRegisterRole}>
                      <SelectTrigger data-testid="select-register-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teen">Teen Athlete</SelectItem>
                        <SelectItem value="parent">Parent / Guardian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register">
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-lg text-primary-foreground">
          <h1 className="text-4xl font-bold mb-6">Track Your Health Journey</h1>
          <p className="text-lg opacity-90 mb-8">
            GrowthTrack helps teen athletes optimize their health, training, and recovery with smart insights and parent oversight.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <Moon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Sleep Tracking</h3>
                <p className="text-sm opacity-80">Monitor sleep patterns for optimal recovery</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Workout Logs</h3>
                <p className="text-sm opacity-80">Track training loads and prevent overtraining</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <Apple className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Nutrition Insights</h3>
                <p className="text-sm opacity-80">Fuel your body for peak performance</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Parent Oversight</h3>
                <p className="text-sm opacity-80">Safety guardrails with privacy controls</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Moon,
  Dumbbell,
  Apple,
  Heart,
  Target,
  Settings,
  LogOut,
  Users,
  Shield,
  AlertTriangle,
  Link2,
  Activity,
} from "lucide-react";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const isParent = user?.user.role === "parent";

  const teenNavItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Sleep", icon: Moon, path: "/sleep" },
    { title: "Workouts", icon: Dumbbell, path: "/workouts" },
    { title: "Nutrition", icon: Apple, path: "/nutrition" },
    { title: "Check-ins", icon: Heart, path: "/checkins" },
    { title: "Link Parent", icon: Link2, path: "/link" },
    { title: "Settings", icon: Settings, path: "/settings" },
  ];

  const parentNavItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Linked Teens", icon: Users, path: "/teens" },
    { title: "Alerts", icon: AlertTriangle, path: "/alerts" },
    { title: "Guardrails", icon: Shield, path: "/guardrails" },
    { title: "Settings", icon: Settings, path: "/settings" },
  ];

  const navItems = isParent ? parentNavItems : teenNavItems;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-sidebar-foreground">GrowthTrack</h2>
            <p className="text-xs text-muted-foreground capitalize">{user?.user.role} Account</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.path}
                    data-testid={`nav-${item.title.toLowerCase().replace(" ", "-")}`}
                  >
                    <a href={item.path} onClick={(e) => { e.preventDefault(); setLocation(item.path); }}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getInitials(user?.profile?.displayName || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.profile?.displayName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.user.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

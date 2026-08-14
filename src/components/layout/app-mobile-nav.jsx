import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FolderKanban,
  Megaphone,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Trophy,
  Settings,
  LogOut,
  Code2,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/members", label: "Members", icon: Users },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/forum", label: "Forum", icon: MessageSquare },
  { to: "/mentorship", label: "Mentorship", icon: GraduationCap },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  {
    to: "/admin",
    label: "Admin",
    icon: Settings,
    roles: ["president", "admin"],
  },
];

export function AppMobileNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const visibleLinks = links.filter(
    (l) => !l.roles || (user && l.roles.includes(user.role)),
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Code2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <p className="font-bold text-sm">NUBTK DevHub</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {visibleLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

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
import { UserAvatar } from "@/components/shared/user-avatar";
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

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleLinks = links.filter(
    (l) => !l.roles || (user && l.roles.includes(user.role)),
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar shrink-0">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Code2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm text-sidebar-foreground">
            NUBTK DevHub
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Club Management
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {visibleLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <UserAvatar name={user.name || user.fullName} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {user.name || user.fullName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="shrink-0 h-8 w-8"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}

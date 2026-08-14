import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { UserAvatar } from "@/components/shared/user-avatar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useAuth } from "@/context/auth-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppMobileNav } from "./app-mobile-nav";

export function AppHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <AppMobileNav />
        </SheetContent>
      </Sheet>

      <div className="relative hidden sm:block flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-9 h-9 bg-muted/40" />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <ModeToggle />
        <NotificationBell />
        {user && <UserAvatar name={user.name || user.fullName} size="sm" />}
      </div>
    </header>
  );
}

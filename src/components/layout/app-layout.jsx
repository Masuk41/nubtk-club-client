import { Outlet } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

export function AppLayout() {
  return (
    <div className="flex min-h-svh bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
        <footer className="border-t border-border py-4 px-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} NUBTK Computer Club DevHub. All rights
          reserved.
        </footer>
      </div>
    </div>
  );
}

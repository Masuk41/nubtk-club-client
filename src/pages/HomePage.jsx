import { Link, useNavigate } from "react-router-dom";
import {
  Code2,
  GraduationCap,
  FolderKanban,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";

const features = [
  {
    icon: GraduationCap,
    title: "1-on-1 Mentorship",
    description:
      "Connect with alumni and senior mentors for guided paths on React, Node.js, cloud development, and placement prep.",
  },
  {
    icon: FolderKanban,
    title: "Showcase Projects",
    description:
      "Upload projects, form teams, receive votes, and share GitHub repositories with fellow students.",
  },
  {
    icon: Trophy,
    title: "Member Leaderboard",
    description:
      "Earn points through events, forum participation, and code reviews. Rank up and earn badges.",
  },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-svh flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-md">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">NUBTK DevHub</span>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
          {isAuthenticated ? (
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Join Club</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto text-center px-6 py-16 space-y-8">
        <Badge variant="secondary" className="px-4 py-1.5 text-sm">
          Next Generation Developer Hub
        </Badge>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Build. Share. Learn. Lead.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The platform for Northern University of Business and Technology Khulna
          to showcase projects, find mentors, discuss concepts, and climb the
          club leaderboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          {isAuthenticated ? (
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="px-8"
            >
              Enter Workspace <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button size="lg" asChild className="px-8">
                <Link to="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8">
                <Link to="/login">Member Login</Link>
              </Button>
            </>
          )}
        </div>
      </main>

      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-16">
        {features.map(({ icon: Icon, title, description }) => (
          <Card
            key={title}
            className="border-border/60 hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 mb-2">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NUBTK Computer Club DevHub. All rights
        reserved.
      </footer>
    </div>
  );
}

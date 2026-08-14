import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  FolderKanban,
  Star,
  Megaphone,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";

const chartConfig = {
  count: { label: "Members", color: "var(--chart-1)" },
};

const priorityVariant = {
  Normal: "secondary",
  Important: "default",
  Urgent: "destructive",
};

export function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [
          usersData,
          eventsData,
          projectsData,
          announcementsData,
          forumData,
        ] = await Promise.all([
          api.users.getAll().catch(() => []),
          api.events.getAll().catch(() => []),
          api.projects.getAll().catch(() => []),
          api.announcements.getAll().catch(() => []),
          api.forum.getAll().catch(() => []),
        ]);
        setUsers(usersData);
        setEvents(eventsData);
        setProjects(projectsData);
        setAnnouncements(announcementsData);
        setForumPosts(forumData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Calculate stats
  const roleData = ["member", "mentor", "president", "alumni"].map((role) => ({
    role: role.charAt(0).toUpperCase() + role.slice(1),
    count: users?.filter((u) => u.role === role).length ?? 0,
  }));

  // Get upcoming events (today and future dates)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcomingEvents = events
    .filter((e) => {
      const eventDate = new Date(e.date);
      return !Number.isNaN(eventDate.getTime()) && eventDate >= startOfToday;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Get recent announcements
  const recentAnnouncements = announcements.slice(0, 3);

  // Get recent forum posts
  const recentPosts = forumPosts.slice(0, 3);

  const stats = [
    {
      label: "Total Members",
      value: users?.length ?? 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Upcoming Events",
      value: upcomingEvents.length,
      icon: Calendar,
      color: "text-green-500",
    },
    {
      label: "Projects",
      value: projects?.length ?? 0,
      icon: FolderKanban,
      color: "text-purple-500",
    },
    {
      label: "Your Points",
      value: user?.points ?? 0,
      icon: Star,
      color: "text-yellow-500",
    },
  ];

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.fullName || user?.name || "Member"}`}
        description="Here's what's happening in your club today."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Recent Announcements
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/announcements" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No announcements yet
              </p>
            ) : (
              recentAnnouncements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="rounded-md border border-border/60 p-3 space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {announcement.title}
                    </h4>
                    {announcement.priority && (
                      <Badge
                        variant={
                          priorityVariant[announcement.priority] ?? "secondary"
                        }
                        className="shrink-0 text-xs"
                      >
                        {announcement.priority}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {announcement.body}
                  </p>
                  {announcement.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Events
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/events" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming events
              </p>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event._id}
                  className="rounded-md border border-border/60 p-3 space-y-1"
                >
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    {event.venue && (
                      <span className="truncate">{event.venue}</span>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {event.attendees?.length ?? 0} attending
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Members by Role Chart */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <BarChart
                data={roleData}
                margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border/50"
                  vertical={false}
                />
                <XAxis
                  dataKey="role"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Forum Posts */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Recent Discussions
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/forum" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No discussions yet
              </p>
            ) : (
              recentPosts.map((post) => (
                <Link
                  key={post._id}
                  to={`/forum/${post._id}`}
                  className="block rounded-md border border-border/60 p-3 space-y-1 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {post.title}
                    </h4>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {post.tag}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{post.upvotes} upvotes</span>
                    <span>{post.replies?.length ?? 0} replies</span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider">
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { href: "/events", label: "Browse Events", icon: Calendar },
              {
                href: "/projects",
                label: "Explore Projects",
                icon: FolderKanban,
              },
              {
                href: "/forum",
                label: "Join Discussions",
                icon: MessageSquare,
              },
              { href: "/mentorship", label: "Find a Mentor", icon: Users },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-3 rounded-md border border-border/60 px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <link.icon className="h-4 w-4 text-muted-foreground" />
                {link.label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

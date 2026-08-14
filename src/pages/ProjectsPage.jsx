import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThumbsUp, Plus, ExternalLink, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";

const statuses = ["All", "In Progress", "Completed", "Planning"];

export function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Planning",
    github: "",
    tech: "",
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.projects.getAll();
      setProjects(
        data.map((p) => ({
          ...p,
          id: p._id || p.id,
          tech: p.techStack || p.tech || [],
        })),
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.projects.create({
        ...formData,
        tech: formData.tech
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setFormData({
        title: "",
        description: "",
        status: "Planning",
        github: "",
        tech: "",
      });
      setModalOpen(false);
      toast.success("Project created! (+15 points)");
      loadProjects();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create project",
      );
    }
  };

  const handleJoinProject = async (projectId) => {
    try {
      await api.projects.join(projectId);
      toast.success("Joined project! (+5 points)");
      loadProjects();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to join project",
      );
    }
  };

  const isTeamMember = (project) => {
    if (!user || !project.team) return false;
    const userId = user._id || user.id;
    return project.team.some((member) => {
      if (typeof member === "string") return member === userId;
      return member._id === userId || member.id === userId;
    });
  };

  const handleVote = async (projectId) => {
    try {
      await api.projects.vote(projectId);
      loadProjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to vote");
    }
  };

  const filtered = projects.filter(
    (p) => filter === "All" || p.status === filter,
  );

  if (loading) return <LoadingState message="Loading projects..." />;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Club projects and collaborations."
        action={
          user ? (
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) =>
                        setFormData({ ...formData, status: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses
                          .filter((s) => s !== "All")
                          .map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input
                      value={formData.github}
                      onChange={(e) =>
                        setFormData({ ...formData, github: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tech stack (comma-separated)</Label>
                    <Input
                      value={formData.tech}
                      onChange={(e) =>
                        setFormData({ ...formData, tech: e.target.value })
                      }
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Project
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          {statuses.map((s) => (
            <TabsTrigger key={s} value={s}>
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <Card key={p.id} className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{p.title}</CardTitle>
                {p.status && <Badge variant="secondary">{p.status}</Badge>}
              </div>
              {p.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {p.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {p.tech && p.tech.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.tech.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
              {p.team && p.team.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {p.team.length} team member{p.team.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => p.id && handleVote(p.id)}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {p.votes ?? 0}
                  </Button>
                  {user && !isTeamMember(p) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => p.id && handleJoinProject(p.id)}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Join
                    </Button>
                  )}
                  {isTeamMember(p) && (
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      Member
                    </Badge>
                  )}
                </div>
                {p.github && (
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      GitHub
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-8">
            No projects in this status.
          </p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { MessageSquare, ThumbsUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const tags = ["Q&A", "Discussion", "Announcement", "Help"];

export function ForumPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    tag: "Discussion",
    content: "",
  });

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await api.forum.getAll(selectedTag);
      setPosts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load forum");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedTag]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.forum.create(formData);
      setFormData({ title: "", tag: "Discussion", content: "" });
      setModalOpen(false);
      toast.success("Discussion posted! (+5 points)");
      loadPosts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create post");
    }
  };

  if (loading) return <LoadingState message="Loading forum..." />;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forum"
        description="Discuss ideas, ask questions, and share knowledge."
        action={
          user ? (
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Discussion
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Discussion</DialogTitle>
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
                    <Label>Tag</Label>
                    <Select
                      value={formData.tag}
                      onValueChange={(v) =>
                        setFormData({ ...formData, tag: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tags.map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            {tag}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      required
                      className="min-h-32"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Post Discussion
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="flex gap-2 flex-wrap">
        {["", ...tags].map((tag) => (
          <Button
            key={tag || "all"}
            variant={selectedTag === tag ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTag(tag)}
            className={cn("capitalize")}
          >
            {tag || "All"}
          </Button>
        ))}
      </div>

      <div className="space-y-3 space-x-1">
        {posts.map((post) => (
          <Link key={post._id} to={`/forum/${post._id}`} className="">
            <Card className="border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {post.content.substring(0, 150)}...
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {post.tag}
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
                  <span>By {post.author?.fullName || "Anonymous"}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {post.upvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.replies?.length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

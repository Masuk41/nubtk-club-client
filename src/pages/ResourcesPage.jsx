import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bookmark, ExternalLink, Play, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

const getYouTubeVideoId = (url) => {
  if (!url || typeof url !== "string") return null;
  const regExp =
    /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.trim().match(regExp);
  return match ? match[1] : null;
};

const initialResourceForm = {
  title: "",
  category: "",
  url: "",
  description: "",
};

export function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [bookmarked, setBookmarked] = useState({});
  // Add resource dialog
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceForm, setResourceForm] = useState(initialResourceForm);
  // Add topic dialog
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [topicName, setTopicName] = useState("");

  const isAdmin = user?.role === "president";
  const canAddResource = user && ["president", "mentor"].includes(user.role);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resourcesData, categoriesData] = await Promise.all([
        api.resources.getAll(),
        api.resources.getCategories(),
      ]);
      setResources(resourcesData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = resources.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      r.title?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q);
    const matchCat = category === "All" || r.category === category;
    return matchSearch && matchCat;
  });

  const canDeleteResource = (resource) => {
    if (!user) return false;
    if (isAdmin) return true;
    const creatorId =
      typeof resource.createdBy === "object"
        ? resource.createdBy?._id
        : resource.createdBy;
    return creatorId === user.id;
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!resourceForm.category) {
      toast.warning("Please select a topic");
      return;
    }
    try {
      await api.resources.create(resourceForm);
      toast.success("Resource added!");
      setResourceForm(initialResourceForm);
      setResourceModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add resource",
      );
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    try {
      await api.resources.createCategory(topicName);
      toast.success(`Topic "${topicName}" added!`);
      setTopicName("");
      setTopicModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add topic");
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      await api.resources.delete(id);
      toast.success("Resource deleted");
      loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete resource",
      );
    }
  };

  const toggleBookmark = (id) => {
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <LoadingState message="Loading resources..." />;
  if (error) return <p className="text-destructive p-4">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Learning materials and reference links."
        action={
          <div className="flex gap-2">
            {isAdmin && (
              <Dialog open={topicModalOpen} onOpenChange={setTopicModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Topic
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Learning Topic</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddTopic} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Topic name</Label>
                      <Input
                        value={topicName}
                        onChange={(e) => setTopicName(e.target.value)}
                        placeholder="e.g. HTML, CSS, JS, PHP"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Add Topic
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            {canAddResource && (
              <Dialog
                open={resourceModalOpen}
                onOpenChange={setResourceModalOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Resource
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Resource</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddResource} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={resourceForm.title}
                        onChange={(e) =>
                          setResourceForm({
                            ...resourceForm,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Topic</Label>
                      <Select
                        value={resourceForm.category}
                        onValueChange={(v) =>
                          setResourceForm({ ...resourceForm, category: v })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem
                              key={c._id}
                              value={c.name}
                              className="uppercase"
                            >
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input
                        type="url"
                        value={resourceForm.url}
                        onChange={(e) =>
                          setResourceForm({
                            ...resourceForm,
                            url: e.target.value,
                          })
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={resourceForm.description}
                        onChange={(e) =>
                          setResourceForm({
                            ...resourceForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Add Resource
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="All" className="uppercase text-xs">
              All
            </TabsTrigger>
            {categories.map((c) => (
              <TabsTrigger
                key={c._id}
                value={c.name}
                className="uppercase text-xs"
              >
                {c.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          {resources.length === 0
            ? "No resources yet."
            : "No resources match your search."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => {
            const youtubeId = getYouTubeVideoId(r.url);
            return (
              <Card
                key={r._id}
                className="border-border/60 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {youtubeId && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-video w-full overflow-hidden bg-muted block border-b border-border/40"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                        alt={r.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          if (e.currentTarget.src.includes("hqdefault")) {
                            e.currentTarget.src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="h-10 w-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <Play className="h-5 w-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </a>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-2">
                        {r.title}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="uppercase text-xs shrink-0"
                      >
                        {r.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-3">
                    {r.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {r.description}
                      </p>
                    )}
                  </CardContent>
                </div>
                <CardContent className="pt-0 pb-4">
                  <div className="flex items-center gap-2">
                    {r.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-1.5"
                      >
                        <a href={r.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open
                        </a>
                      </Button>
                    )}
                    <Button
                      variant={bookmarked[r._id] ? "default" : "ghost"}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => toggleBookmark(r._id)}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      {bookmarked[r._id] ? "Saved" : "Save"}
                    </Button>
                    {canDeleteResource(r) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-destructive hover:text-destructive"
                        onClick={() => handleDeleteResource(r._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

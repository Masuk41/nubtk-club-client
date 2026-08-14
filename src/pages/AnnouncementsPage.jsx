import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const priorityVariant = {
  Normal: "secondary",
  Important: "default",
  Urgent: "destructive",
};

const initialFormData = { title: "", body: "", priority: "Normal" };

export function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Create modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState(initialFormData);
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(initialFormData);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  // Role-based permissions
  const isPresident = user?.role === "president";
  // Check if user can manage a specific announcement (author or president)
  const canManageAnnouncement = (announcement) => {
    if (!user) return false;
    if (isPresident) return true;
    const userId = user._id || user.id;
    if (!userId || !announcement.author) return false;
    // Check if user is the author
    if (typeof announcement.author === "string") {
      return announcement.author === userId;
    }
    return (
      announcement.author._id === userId || announcement.author.id === userId
    );
  };

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.announcements.getAll();
      setAnnouncements(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load announcements",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Create announcement
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isPresident) {
      toast.warning("Only the president can create announcements");
      return;
    }
    try {
      await api.announcements.create(createFormData);
      setCreateFormData(initialFormData);
      setCreateModalOpen(false);
      toast.success("Announcement published!");
      load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create announcement",
      );
    }
  };

  // Open edit modal
  const openEditModal = (announcement) => {
    setEditingAnnouncementId(announcement._id);
    setEditFormData({
      title: announcement.title,
      body: announcement.body,
      priority: announcement.priority || "Normal",
    });
    setEditModalOpen(true);
  };

  // Update announcement
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingAnnouncementId) return;
    const announcementToEdit = announcements.find(
      (a) => a._id === editingAnnouncementId,
    );
    if (!announcementToEdit || !canManageAnnouncement(announcementToEdit)) {
      toast.warning("You don't have permission to edit this announcement");
      return;
    }
    try {
      await api.announcements.update(editingAnnouncementId, editFormData);
      setEditFormData(initialFormData);
      setEditingAnnouncementId(null);
      setEditModalOpen(false);
      toast.success("Announcement updated!");
      load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update announcement",
      );
    }
  };

  // Open delete confirmation
  const openDeleteDialog = (id) => {
    setAnnouncementToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!announcementToDelete) return;
    const announcementToDel = announcements.find(
      (a) => a._id === announcementToDelete,
    );
    if (!announcementToDel || !canManageAnnouncement(announcementToDel)) {
      toast.warning("You don't have permission to delete this announcement");
      return;
    }
    try {
      await api.announcements.delete(announcementToDelete);
      toast.success("Announcement deleted");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    }
  };

  if (loading) return <LoadingState message="Loading announcements..." />;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Official club updates and notices."
        action={
          isPresident ? (
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={createFormData.title}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body</Label>
                    <Textarea
                      value={createFormData.body}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          body: e.target.value,
                        })
                      }
                      required
                      className="min-h-32"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={createFormData.priority}
                      onValueChange={(v) =>
                        setCreateFormData({ ...createFormData, priority: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Normal", "Important", "Urgent"].map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Publish
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="space-y-4">
        {announcements.map((a) => (
          <Card key={a._id} className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  {a.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {a.priority && (
                    <Badge variant={priorityVariant[a.priority] ?? "secondary"}>
                      {a.priority}
                    </Badge>
                  )}
                  {canManageAnnouncement(a) && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditModal(a)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(a._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {a.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Announcement Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea
                value={editFormData.body}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, body: e.target.value })
                }
                required
                className="min-h-32"
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={editFormData.priority}
                onValueChange={(v) =>
                  setEditFormData({ ...editFormData, priority: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Normal", "Important", "Urgent"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this announcement? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
  Calendar,
  MapPin,
  Clock,
  Plus,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const initialFormData = {
  title: "",
  description: "",
  date: "",
  time: "",
  venue: "",
  color: "blue",
};

export function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Create modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState(initialFormData);
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(initialFormData);
  const [editingEventId, setEditingEventId] = useState(null);
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Role-based permissions
  const canCreate = user && ["president", "mentor"].includes(user.role);
  const isPresident = user?.role === "president";

  // Check if user can manage a specific event (creator or president)
  const canManageEvent = (event) => {
    if (!user) return false;
    if (isPresident) return true;
    const userId = user._id || user.id;
    if (!userId) return false;
    // Check if user is the creator
    if (typeof event.createdBy === "string") {
      return event.createdBy === userId;
    }
    if (typeof event.createdBy === "object" && event.createdBy !== null) {
      return event.createdBy._id === userId || event.createdBy.id === userId;
    }
    return false;
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.events.getAll();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const isAttending = (event) => {
    if (!user || !event.attendees || event.attendees.length === 0) return false;
    const userId = user._id || user.id;
    if (!userId) return false;
    return event.attendees.some((attendee) => {
      if (typeof attendee === "string") {
        return attendee === userId;
      }
      if (typeof attendee === "object" && attendee !== null) {
        const att = attendee;
        return att._id === userId || att.id === userId;
      }
      return false;
    });
  };

  const handleRSVP = async (eventId, alreadyAttending) => {
    try {
      await api.events.rsvp(eventId);
      toast.success(
        alreadyAttending
          ? "Registration cancelled (-10 points)"
          : "Successfully registered for event! (+10 points)",
      );
      loadEvents();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update registration",
      );
    }
  };

  // Create event
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canCreate) {
      toast.warning("Only president and mentors can create events");
      return;
    }
    try {
      await api.events.create(createFormData);
      setCreateFormData(initialFormData);
      setCreateModalOpen(false);
      toast.success("Event created!");
      loadEvents();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create event",
      );
    }
  };

  // Open edit modal
  const openEditModal = (event) => {
    setEditingEventId(event._id);
    setEditFormData({
      title: event.title,
      description: event.description || "",
      date: event.date ? String(event.date).slice(0, 10) : "",
      time: event.time || "",
      venue: event.venue || "",
      color: event.color || "blue",
    });
    setEditModalOpen(true);
  };

  // Update event
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingEventId) return;
    const eventToEdit = events.find((e) => e._id === editingEventId);
    if (!eventToEdit || !canManageEvent(eventToEdit)) {
      toast.warning("You don't have permission to edit this event");
      return;
    }
    try {
      await api.events.update(editingEventId, editFormData);
      setEditFormData(initialFormData);
      setEditingEventId(null);
      setEditModalOpen(false);
      toast.success("Event updated!");
      loadEvents();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update event",
      );
    }
  };

  // Open delete confirmation
  const openDeleteDialog = (eventId) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!eventToDelete) return;
    const eventToDel = events.find((e) => e._id === eventToDelete);
    if (!eventToDel || !canManageEvent(eventToDel)) {
      toast.warning("You don't have permission to delete this event");
      return;
    }
    try {
      await api.events.delete(eventToDelete);
      toast.success("Event deleted");
      loadEvents();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete event",
      );
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  if (loading) return <LoadingState message="Loading events..." />;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Club workshops, meetups, and competitions."
        action={
          canCreate ? (
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
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
                    <Label>Description</Label>
                    <Textarea
                      value={createFormData.description}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={createFormData.date}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={createFormData.time}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            time: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Input
                      value={createFormData.venue}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          venue: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Event
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((ev) => (
          <Card key={ev._id} className="border-border/60 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base">{ev.title}</CardTitle>
                  {ev.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {ev.description}
                    </p>
                  )}
                </div>
                {canManageEvent(ev) && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditModal(ev)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(ev._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3">
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {ev.date ? new Date(ev.date).toLocaleDateString() : "TBA"}
                </div>
                {ev.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {ev.time}
                  </div>
                )}
                {ev.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {ev.venue}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-auto pt-2">
                <Badge variant="secondary">
                  {ev.attendees?.length ?? 0} attending
                </Badge>
                {isAttending(ev) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRSVP(ev._id, true)}
                    className="gap-1.5 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-500 dark:hover:bg-green-950 dark:hover:text-green-400"
                  >
                    <Check className="h-4 w-4" />
                    Joined
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleRSVP(ev._id, false)}>
                    Join Event
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
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
              <Label>Description</Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editFormData.date}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={editFormData.time}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, time: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Venue</Label>
              <Input
                value={editFormData.venue}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, venue: e.target.value })
                }
              />
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
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
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

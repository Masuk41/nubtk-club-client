import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Star } from "lucide-react";
import { toast } from "sonner";

export function MentorshipPage() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeMentors, setActiveMentors] = useState([]);

  const isMentorUser = user?.role === "mentor";
  const isAdmin = user?.role === "president";

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const mentorsData = await api.mentors.getAll();
      const mappedMentors = mentorsData.map((m) => {
        const userId = m.userId;
        const userObj = typeof userId === "object" ? userId : undefined;
        return {
          ...m,
          id: m.id || m._id,
          name: userObj?.fullName || "Mentor",
          color: userObj?.color || "6366f1",
          rating: m.rating || 5.0,
          reviews: m.reviews || 0,
          skills: m.skills || userObj?.skills || [],
          availability: m.availability || "Flexible",
          openSlots: m.openSlots || 0,
          currentMentees: m.currentMentees || [],
          userId:
            userObj?._id || (typeof userId === "string" ? userId : undefined),
        };
      });
      setMentors(mappedMentors);

      const myProfile = mappedMentors.find((m) => m.userId === user?.id);

      if (isMentorUser && myProfile) {
        const reqs = await api.mentors.getRequests(myProfile.id);
        setReceivedRequests(reqs);
        const menteesData = await api.mentors.getMentees(myProfile.id);
        setMentees(menteesData);
      } else if (!isMentorUser) {
        try {
          const sent = await api.request("/mentors/requests/mentee");
          setSentRequests(sent);
        } catch {
          /* endpoint may not exist */
        }
        const active = mappedMentors.filter((m) =>
          m.currentMentees?.some((mentee) => {
            const mId = typeof mentee === "object" ? mentee._id : mentee;
            return mId === user?.id;
          }),
        );
        setActiveMentors(active);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load mentorship details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedMentor) return;
    try {
      await api.mentors.sendRequest(selectedMentor.id, {
        message: requestMessage,
      });
      toast.success("Request sent successfully!");
      setRequestMessage("");
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send request",
      );
    }
  };

  const handleRemoveMentor = async (mentorId) => {
    try {
      await api.mentors.delete(mentorId);
      toast.success("Mentor removed");
      loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove mentor",
      );
    }
  };

  const handleRespond = async (requestId, status) => {
    try {
      await api.mentors.respondToRequest(requestId, { status });
      toast.success(`Request ${status}`);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to respond");
    }
  };

  if (loading) return <LoadingState message="Loading mentorship..." />;
  if (error) return <p className="text-destructive p-4">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentorship Program"
        description="Connect with mentors and grow your skills."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse">Browse Mentors</TabsTrigger>
          {isMentorUser ? (
            <>
              <TabsTrigger value="mentees">My Mentees</TabsTrigger>
              <TabsTrigger value="received">Received Requests</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="sessions">My Sessions</TabsTrigger>
              <TabsTrigger value="sent">My Requests</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentors.map((m) => (
              <Card key={m.id} className="border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <UserAvatar name={m.name} />
                    <div className="flex-1">
                      <CardTitle className="text-base">{m.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {m.rating} ({m.reviews} reviews)
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Availability: {m.availability}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {m.skills?.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {m.userId !== user?.id && !isMentorUser && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedMentor(m);
                          setModalOpen(true);
                        }}
                      >
                        Request Mentorship
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveMentor(m.id)}
                      >
                        Remove Mentor
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mentees" className="mt-6">
          <Card className="border-border/60">
            <CardContent className="pt-6">
              {mentees.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No active mentees currently.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentees.map((mentee) => (
                    <div
                      key={mentee._id}
                      className="flex items-center gap-3 border rounded-lg p-4"
                    >
                      <UserAvatar name={mentee.fullName} />
                      <div>
                        <p className="font-semibold">{mentee.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {mentee.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="received" className="mt-6 space-y-4">
          {receivedRequests.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No pending requests.
            </p>
          ) : (
            receivedRequests.map((req) => (
              <Card
                key={req._id}
                className="border-l-4 border-l-primary border-border/60"
              >
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={req.menteeId?.fullName} size="sm" />
                    <div>
                      <p className="font-semibold text-sm">
                        {req.menteeId?.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {req.menteeId?.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm bg-muted/50 p-3 rounded-md">
                    {req.message || "(No message)"}
                  </p>
                  {req.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRespond(req._id, "accepted")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRespond(req._id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <Badge>{req.status}</Badge>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          {activeMentors.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No active mentors currently.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMentors.map((mentor) => (
                <Card
                  key={mentor.id}
                  className="border-primary/20 bg-primary/5"
                >
                  <CardContent className="pt-5 flex items-center gap-3">
                    <UserAvatar name={mentor.name} />
                    <div>
                      <p className="font-semibold">{mentor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {mentor.availability}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6 space-y-4">
          {sentRequests.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No sent requests yet.
            </p>
          ) : (
            sentRequests.map((req) => (
              <Card key={req._id} className="border-border/60">
                <CardContent className="pt-5 flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      Request to {req.mentorId?.userId?.fullName || "Mentor"}
                    </p>
                    {req.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-sm mt-2">{req.message || "(None)"}</p>
                  </div>
                  <Badge
                    variant={
                      req.status === "accepted"
                        ? "default"
                        : req.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {req.status.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Request Mentorship from {selectedMentor?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendRequest} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Introduce yourself and explain what you hope to learn.
            </p>
            <Textarea
              required
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Your message..."
              className="min-h-24"
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Send Request</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { toast } from "sonner";

export function ThreadDetailPage() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyText, setReplyText] = useState("");

  const loadThread = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.forum.getById(id);
      setThread(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load thread");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThread();
  }, [id]);

  const handleUpvote = async () => {
    if (!thread) return;
    try {
      const response = await api.forum.upvote(thread._id);
      setThread(response.post);
      toast.success("Vote recorded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upvote");
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !thread) return;
    try {
      const response = await api.forum.reply(thread._id, {
        content: replyText,
      });
      setThread(response.post);
      setReplyText("");
      toast.success("Reply posted! (+2 points)");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add reply");
    }
  };

  if (loading) return <LoadingState message="Loading discussion..." />;
  if (error) return <p className="text-destructive p-4">Error: {error}</p>;
  if (!thread)
    return (
      <p className="text-center text-muted-foreground py-8">
        Thread not found.
      </p>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="gap-2">
        <Link to="/forum">
          <ArrowLeft className="h-4 w-4" />
          Back to Forum
        </Link>
      </Button>

      <Card className="border-border/60">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <UserAvatar name={thread.author?.fullName} size="sm" />
            <div>
              <p className="font-semibold text-sm">
                {thread.author?.fullName || "Anonymous"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {thread.author?.role}
              </p>
            </div>
            <Badge variant="secondary">{thread.tag}</Badge>
            {thread.createdAt && (
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(thread.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold">{thread.title}</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {thread.content}
          </p>

          <div className="flex items-center gap-4 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpvote}
              className="gap-1.5"
            >
              <ArrowUp className="h-4 w-4" />
              {thread.upvotes}
            </Button>
          </div>
        </CardContent>
      </Card>

      <h3 className="font-semibold">Replies ({thread.replies?.length || 0})</h3>

      <div className="space-y-3">
        {thread.replies?.map((r) => (
          <Card
            key={r._id}
            className="border-l-4 border-l-primary border-border/60"
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <UserAvatar name={r.author?.fullName} size="sm" />
                <span className="font-semibold text-sm">
                  {r.author?.fullName || "Anonymous"}
                </span>
                {r.createdAt && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{r.content}</p>
            </CardContent>
          </Card>
        ))}
        {(!thread.replies || thread.replies.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No replies yet. Start the conversation!
          </p>
        )}
      </div>

      <Card className="border-border/60">
        <CardContent className="pt-4">
          <form onSubmit={handleAddReply} className="space-y-3">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              required
            />

            <Button type="submit">Post Reply</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

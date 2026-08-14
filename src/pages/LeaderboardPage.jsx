import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trophy,
  Medal,
  Award,
  Star,
  Calendar,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";

const podiumOrder = [1, 0, 2];
const podiumHeights = ["h-28", "h-36", "h-24"];
const podiumColors = ["bg-gray-300", "bg-yellow-400", "bg-amber-600"];
const podiumIcons = [Medal, Trophy, Award];

export function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const result = await api.users.getLeaderboard();
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load leaderboard",
        );
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (loading) return <LoadingState message="Loading leaderboard..." />;
  if (error) return <p className="text-destructive">Error: {error}</p>;
  if (!data || data.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Leaderboard"
          description="Top contributors ranked by club points."
        />
        <Card className="border-border/60">
          <CardContent className="py-12 text-center text-muted-foreground">
            No leaderboard data yet. Start participating to earn points!
          </CardContent>
        </Card>
      </div>
    );
  }

  const top3 = data.slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leaderboard"
        description="Top contributors ranked by club points."
      />

      {/* Points Info Card */}
      <Card className="border-border/60 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            How to Earn Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">+10</Badge>
              <span>Attend an event</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">+15</Badge>
              <span>Create a project</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">+5</Badge>
              <span>Join a project / Create post</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">+2</Badge>
              <span>Reply to a post</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Podium */}
      {top3.length >= 3 && (
        <div className="flex justify-center items-end gap-4 md:gap-6 py-4">
          {podiumOrder.map((pos, i) => {
            const member = top3[pos];
            if (!member) return null;
            const PodiumIcon = podiumIcons[i];
            return (
              <div key={member.rank} className="flex flex-col items-center">
                <div className="relative">
                  <UserAvatar
                    name={member.name}
                    src={member.avatar}
                    size={pos === 0 ? "lg" : "default"}
                  />

                  <div
                    className={cn(
                      "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center",
                      pos === 0
                        ? "bg-yellow-400"
                        : pos === 1
                          ? "bg-gray-300"
                          : "bg-amber-600",
                    )}
                  >
                    <PodiumIcon className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div
                  className={cn(
                    "mt-3 w-20 md:w-24 rounded-t-xl flex items-center justify-center font-bold text-lg border border-primary/20",
                    podiumHeights[i],
                    podiumColors[i],
                    "text-white",
                  )}
                >
                  #{member.rank}
                </div>
                <p className="text-sm font-medium mt-2 text-center truncate max-w-24">
                  {member.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.points} pts
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Rankings Table */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Member</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead className="hidden sm:table-cell text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className="hidden lg:inline">Events</span>
                  </div>
                </TableHead>
                <TableHead className="hidden sm:table-cell text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FolderKanban className="h-3 w-3" />
                    <span className="hidden lg:inline">Projects</span>
                  </div>
                </TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((entry) => (
                <TableRow
                  key={entry._id}
                  className={entry.rank <= 3 ? "bg-primary/5" : ""}
                >
                  <TableCell className="font-bold">
                    {entry.rank <= 3 ? (
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs",
                          entry.rank === 1
                            ? "bg-yellow-400"
                            : entry.rank === 2
                              ? "bg-gray-400"
                              : "bg-amber-600",
                        )}
                      >
                        {entry.rank}
                      </span>
                    ) : (
                      `#${entry.rank}`
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={entry.name}
                        src={entry.avatar}
                        size="sm"
                      />
                      <span className="truncate max-w-32">{entry.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {entry.role && (
                      <Badge variant="secondary" className="capitalize text-xs">
                        {entry.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    {entry.eventsAttended || 0}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    {entry.projectsDone || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold">{entry.points}</span>
                    <span className="text-muted-foreground text-xs ml-1">
                      pts
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

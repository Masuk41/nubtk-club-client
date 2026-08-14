import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ArrowLeft } from "lucide-react";

function mapMember(data) {
  return {
    ...data,
    id: data._id || data.id,
    name: data.fullName || data.name,
  };
}

export function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.users.getById(id);
        setMember(mapMember(data));
      } catch {
        try {
          const res = await fetch("/users.json");
          if (res.ok) {
            const localUsers = await res.json();
            const found = localUsers.find((u) => String(u.id) === String(id));
            if (found) {
              setMember(found);
              return;
            }
          }
        } catch {
          /* ignore */
        }
        setError("Member not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <LoadingState message="Loading profile..." />;
  if (error || !member) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground">{error || "Member not found."}</p>
        <Button onClick={() => navigate("/members")}>Back to Members</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/members")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Members
      </Button>

      <Card className="border-border/60">
        <CardContent className="pt-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <UserAvatar name={member.name || member.fullName} size="lg" />
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <h2 className="text-2xl font-bold">
                  {member.name || member.fullName}
                </h2>
                <Badge className="capitalize">{member.role}</Badge>
                {member.status && (
                  <Badge
                    variant={
                      member.status === "Active" ? "default" : "secondary"
                    }
                  >
                    {member.status}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{member.email}</p>
              <p className="text-sm text-muted-foreground italic">
                {member.bio || "This member has not provided a bio yet."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-y py-6">
            {[
              { label: "Points", value: member.points ?? 0 },
              { label: "Events", value: member.eventsAttended ?? 0 },
              { label: "Projects", value: member.projectsDone ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="text-2xl font-bold mt-1">{value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {member.skills && member.skills.length > 0 ? (
                member.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground italic">
                  No skills listed
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

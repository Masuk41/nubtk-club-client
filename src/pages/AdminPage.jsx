import { useState, useEffect } from "react";
import api from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

function mapUser(u) {
  return {
    ...u,
    id: u._id || u.id,
    name: u.fullName || u.name,
  };
}

export function AdminPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await api.users.getAll();
      setMembers(data.map(mapUser));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.users.update(id, { status: "Active" });
      toast.success("User approved!");
      loadMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.users.update(id, { status: "Inactive" });
      toast.success("User rejected/deactivated");
      loadMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject");
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.users.update(id, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      loadMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.users.update(id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      loadMembers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status",
      );
    }
  };

  const pending = members.filter((m) => m.status === "Pending");

  if (loading) return <LoadingState message="Loading admin panel..." />;
  if (error) return <p className="text-destructive p-4">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Manage applications and member roles."
      />

      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">
            Applications ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="members">Manage Members</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="mt-6">
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      {m.name || m.fullName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => m.id && handleApprove(m.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => m.id && handleReject(m.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {pending.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      No pending applications.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <p className="font-medium">{m.name || m.fullName}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={m.role}
                        onValueChange={(v) => m.id && handleRoleChange(m.id, v)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["member", "mentor", "president", "alumni"].map(
                            (r) => (
                              <SelectItem
                                key={r}
                                value={r}
                                className="capitalize"
                              >
                                {r}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={m.status || "Active"}
                        onValueChange={(v) =>
                          m.id && handleStatusChange(m.id, v)
                        }
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Active", "Pending", "Alumni", "Inactive"].map(
                            (s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {m.points ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

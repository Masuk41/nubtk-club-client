import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Search, UserPlus, Mail, User as UserIcon, Shield } from "lucide-react";
import { toast } from "sonner";

const roles = ["All", "president", "mentor", "member", "alumni"];
const assignableRoles = ["member", "mentor", "alumni"];

function mapMember(u) {
  return {
    ...u,
    id: u._id || u.id,
    name: u.fullName || u.name,
  };
}

const initialFormData = {
  fullName: "",
  email: "",
  password: "",
  role: "member",
};

export function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  // Add member modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Only president can add members
  const canAddMembers = user?.role === "president";

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data =
        roleFilter === "All"
          ? await api.users.getAll()
          : await api.users.getByRole(roleFilter);
      setMembers(data.map(mapMember));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load members");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [roleFilter]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      const username =
        formData.email.split("@")[0] + "_" + Date.now().toString().slice(-4);
      await api.auth.register({
        username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
      });
      toast.success(`Member "${formData.fullName}" added successfully!`);
      setFormData(initialFormData);
      setAddModalOpen(false);
      loadMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = members.filter(
    (m) =>
      (m.fullName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (m.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <LoadingState message="Loading members..." />;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Browse and connect with club members."
        action={
          canAddMembers ? (
            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                  <DialogDescription>
                    Create a new member account. They can change their password
                    after logging in.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="fullName"
                      className="flex items-center gap-2"
                    >
                      <UserIcon className="h-4 w-4" />
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Initial Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Min 6 characters"
                      minLength={6}
                      required
                    />

                    <p className="text-xs text-muted-foreground">
                      Member can change this after logging in
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Role
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(v) =>
                        setFormData({ ...formData, role: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableRoles.map((role) => (
                          <SelectItem
                            key={role}
                            value={role}
                            className="capitalize"
                          >
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddModalOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Adding..." : "Add Member"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={roleFilter} onValueChange={setRoleFilter}>
          <TabsList>
            {roles.map((r) => (
              <TabsTrigger key={r} value={r} className="capitalize text-xs">
                {r}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-12 text-center text-muted-foreground">
            {search
              ? "No members found matching your search."
              : "No members found."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <Link key={m.id || m._id} to={`/members/${m.id || m._id}`}>
              <Card className="hover:shadow-md transition-shadow border-border/60 h-full">
                <CardContent className="pt-6 flex items-start gap-4">
                  <UserAvatar name={m.name || m.fullName} src={m.avatar} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {m.name || m.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {m.email}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="capitalize text-xs">
                        {m.role}
                      </Badge>
                      {m.status && m.status !== "Active" && (
                        <Badge variant="outline" className="text-xs">
                          {m.status}
                        </Badge>
                      )}
                      {m.points !== undefined && m.points > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {m.points} pts
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

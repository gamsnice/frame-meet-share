import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, UserPlus, Trash2, Search, RefreshCw, Users } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { AppRole } from "@/hooks/useUserRole";

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

interface UserWithRole extends UserRole {
  email?: string;
}

export default function UserRolesManager() {
  const [userRoles, setUserRoles] = useState<UserWithRole[]>([]);
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("user");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch user roles (type assertion until types regenerate)
      const { data: rolesData, error: rolesError } = await (supabase as any)
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch users to get emails
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, email");

      if (usersError) throw usersError;

      setUsers(usersData || []);

      // Map roles with user emails
      const rolesWithEmails = (rolesData || []).map((role: UserRole) => {
        const user = usersData?.find((u) => u.id === role.user_id);
        return {
          ...role,
          email: user?.email || "Unknown",
        };
      });

      setUserRoles(rolesWithEmails);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load user roles");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newUserId) {
      toast.error("Please select a user");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from("user_roles")
        .insert({
          user_id: newUserId,
          role: newRole,
        });

      if (error) throw error;

      toast.success("Role assigned successfully");
      setDialogOpen(false);
      setNewUserId("");
      setNewRole("user");
      fetchData();
    } catch (error: any) {
      console.error("Error adding role:", error);
      if (error.code === "23505") {
        toast.error("User already has this role");
      } else {
        toast.error("Failed to assign role");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast.success("Role removed successfully");
      fetchData();
    } catch (error) {
      console.error("Error removing role:", error);
      toast.error("Failed to remove role");
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      default:
        return "secondary";
    }
  };

  const filteredRoles = userRoles.filter(
    (role) =>
      role.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get users without roles for the dropdown
  const usersWithoutRoles = users.filter(
    (user) => !userRoles.some((role) => role.user_id === user.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Roles</h2>
          <p className="text-muted-foreground">
            Manage user permissions and access levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Role to User</DialogTitle>
                <DialogDescription>
                  Select a user and assign them a role.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">User</label>
                  <Select value={newUserId} onValueChange={setNewUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {usersWithoutRoles.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email}
                        </SelectItem>
                      ))}
                      {usersWithoutRoles.length === 0 && (
                        <SelectItem value="" disabled>
                          All users have roles assigned
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={newRole}
                    onValueChange={(value) => setNewRole(value as AppRole)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddRole} disabled={isSubmitting}>
                  {isSubmitting ? "Assigning..." : "Assign Role"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Shield className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userRoles.filter((r) => r.role === "super_admin").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userRoles.filter((r) => r.role === "admin").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRoles.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Roles</CardTitle>
          <CardDescription>
            Users with special permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">User</th>
                  <th className="text-left py-3 px-2">Role</th>
                  <th className="text-left py-3 px-2">Assigned</th>
                  <th className="text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="border-b last:border-0">
                    <td className="py-3 px-2">
                      <span className="font-medium">{role.email}</span>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={getRoleBadgeVariant(role.role)}>
                        {role.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {format(new Date(role.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRole(role.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRoles.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm
                  ? "No roles match your search"
                  : "No roles assigned yet"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

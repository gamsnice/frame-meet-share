import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Search, Shield, User, Crown, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  email: string;
  name: string;
  organization_name: string | null;
  created_at: string;
  role: 'user' | 'admin' | 'super_admin';
  subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise';
}

type AppRole = 'user' | 'admin' | 'super_admin';

export default function UsersManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<AppRole>('user');

  const fetchUsers = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch all roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Fetch all subscriptions
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select('user_id, tier');

      // Map roles and subscriptions to users
      const rolesMap = new Map(rolesData?.map((r) => [r.user_id, r.role as AppRole]) || []);
      const subsMap = new Map(subsData?.map((s) => [s.user_id, s.tier]) || []);

      const usersWithRoles: UserWithRole[] = (usersData || []).map((user) => ({
        ...user,
        role: rolesMap.get(user.id) || 'user',
        subscription_tier: (subsMap.get(user.id) as UserWithRole['subscription_tier']) || 'free',
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async () => {
    if (!selectedUser) return;

    try {
      // First, delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id);

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: selectedUser.id, role: newRole });

      if (error) throw error;

      toast.success(`Role updated to ${newRole}`);
      setRoleDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const openRoleDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="destructive" className="gap-1"><Crown className="h-3 w-3" /> Super Admin</Badge>;
      case 'admin':
        return <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" /> Admin</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><User className="h-3 w-3" /> User</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      free: 'bg-muted text-muted-foreground',
      starter: 'bg-blue-500/20 text-blue-400',
      pro: 'bg-primary/20 text-primary',
      enterprise: 'bg-secondary/20 text-secondary',
    };
    return <Badge className={colors[tier] || colors.free}>{tier}</Badge>;
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.organization_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>{users.length} total users</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name || 'No name'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.organization_name || '-'}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getTierBadge(user.subscription_tier)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => toast.info('Delete functionality coming soon')}
                          >
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={(value) => setNewRole(value as AppRole)}>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

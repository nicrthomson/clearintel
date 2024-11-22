import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { MoreHorizontal, Plus, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'READ_ONLY';
  title?: string;
}

type UserRole = 'ADMIN' | 'USER' | 'READ_ONLY';

export function UserManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'USER' as UserRole,
    title: '',
    password: ''
  });
  const [editForm, setEditForm] = useState({
    email: '',
    name: '',
    title: '',
    role: 'USER' as UserRole,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        email: selectedUser.email,
        name: selectedUser.name,
        title: selectedUser.title || '',
        role: selectedUser.role,
      });
    }
  }, [selectedUser]);

  async function loadUsers() {
    try {
      const response = await fetch('/api/settings/users');
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteUser() {
    try {
      if (!newUser.password) {
        toast({
          title: "Error",
          description: "Password is required",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) throw new Error('Failed to invite user');

      const createdUser = await response.json();
      setUsers([...users, createdUser]);
      setNewUser({ email: '', name: '', role: 'USER', title: '', password: '' });
      setShowDialog(false);

      toast({
        title: "Success",
        description: "User invitation sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to invite user",
        variant: "destructive",
      });
    }
  }

  async function handleUpdateRole(userId: number, newRole: UserRole) {
    try {
      const response = await fetch(`/api/settings/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update user role');

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  }

  async function handleUpdateUser() {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/settings/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to update user');

      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      setShowEditDialog(false);
      setSelectedUser(null);

      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return <div>You don't have permission to manage users.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">User Management</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  placeholder="Email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                />
                <Input
                  placeholder="Name"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                />
                <Input
                  placeholder="Title"
                  value={newUser.title}
                  onChange={e => setNewUser({ ...newUser, title: e.target.value })}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                />
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1"
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="READ_ONLY">Read Only</option>
                </select>
              </div>
              <Button onClick={handleInviteUser}>Invite User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1"
                value={editForm.role}
                onChange={e => setEditForm({ ...editForm, role: e.target.value as UserRole })}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="READ_ONLY">Read Only</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.title}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(user.id, 'ADMIN')}
                        disabled={user.role === 'ADMIN'}
                      >
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(user.id, 'USER')}
                        disabled={user.role === 'USER'}
                      >
                        Make User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(user.id, 'READ_ONLY')}
                        disabled={user.role === 'READ_ONLY'}
                      >
                        Make Read Only
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

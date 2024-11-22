"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "@/components/ui/use-toast";
import { Loader2, Users2, Building2, Mail, Phone, Globe, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrganizationData {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  domain: string | null;
  subdomain: string | null;
  maxUsers: number;
  maxReadOnlyUsers: number;
  subscription: string;
  subscriptionEnds: string | null;
}

interface User {
  id: number;
  name: string | null;
  email: string;
  role: string;
  isOrgAdmin: boolean;
  createdAt: string;
}

export default function OrganizationPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ email: '', role: 'USER' });

  useEffect(() => {
    if (session) {
      fetchOrganizationData();
      fetchUsers();
    }
  }, [session]);

  const fetchOrganizationData = async () => {
    try {
      const response = await fetch('/api/organization');
      if (!response.ok) throw new Error('Failed to fetch organization data');
      const data = await response.json();
      setOrganization(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load organization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/organization/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!organization) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(organization),
      });
      
      if (!response.ok) throw new Error('Failed to update organization');
      
      toast({
        title: "Success",
        description: "Organization details updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update organization details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/organization/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      toast({
        title: "Success",
        description: "User invitation sent successfully",
      });
      
      setNewUser({ email: '', role: 'USER' });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to invite user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      const response = await fetch('/api/organization/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="p-6">
          <h2 className="text-lg font-medium">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Please log in to access organization settings
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Organization</h1>
        <p className="text-muted-foreground">
          Manage your organization settings and team members
        </p>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="bg-background w-full justify-start border-b rounded-none h-auto p-0 space-x-6">
          <TabsTrigger 
            value="details" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background"
          >
            Details
          </TabsTrigger>
          <TabsTrigger 
            value="users"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background"
          >
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="subscription"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background"
          >
            Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="p-6">
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      className="pl-9"
                      value={organization?.name || ''}
                      onChange={(e) => setOrganization(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9"
                      value={organization?.email || ''}
                      onChange={(e) => setOrganization(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-9"
                      value={organization?.phone || ''}
                      onChange={(e) => setOrganization(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      className="pl-9"
                      value={organization?.website || ''}
                      onChange={(e) => setOrganization(prev => prev ? ({ ...prev, website: e.target.value }) : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="domain"
                      className="pl-9"
                      value={organization?.domain || ''}
                      onChange={(e) => setOrganization(prev => prev ? ({ ...prev, domain: e.target.value }) : null)}
                      placeholder="e.g., lapd.clear-intel.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="subdomain"
                      className="pl-9"
                      value={organization?.subdomain || ''}
                      onChange={(e) => setOrganization(prev => prev ? ({ ...prev, subdomain: e.target.value }) : null)}
                      placeholder="e.g., lapd"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    className="pl-9"
                    value={organization?.address || ''}
                    onChange={(e) => setOrganization(prev => prev ? ({ ...prev, address: e.target.value }) : null)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={organization?.city || ''}
                    onChange={(e) => setOrganization(prev => prev ? ({ ...prev, city: e.target.value }) : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={organization?.state || ''}
                    onChange={(e) => setOrganization(prev => prev ? ({ ...prev, state: e.target.value }) : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipcode">ZIP Code</Label>
                  <Input
                    id="zipcode"
                    value={organization?.zipcode || ''}
                    onChange={(e) => setOrganization(prev => prev ? ({ ...prev, zipcode: e.target.value }) : null)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium">Team Members</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your organization's team members and their roles
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {users.length} / {organization?.maxUsers} Users
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(users) && users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name || 'N/A'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isOrgAdmin ? 'bg-primary/10 text-primary' :
                            user.role === 'USER' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {user.isOrgAdmin ? 'Admin' : user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateUserRole(user.id, user.role === 'USER' ? 'READ_ONLY' : 'USER')}
                            disabled={user.isOrgAdmin}
                          >
                            Change Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {users.length < (organization?.maxUsers || 0) && (
                <form onSubmit={handleInviteUser} className="space-y-4">
                  <h3 className="text-lg font-medium">Invite New User</h3>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Email address"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        type="email"
                        required
                      />
                    </div>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="READ_ONLY">Read Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit">Invite User</Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium">Subscription Details</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your subscription and billing details
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Current Plan</div>
                    <div className="text-2xl font-bold">{organization?.subscription}</div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Subscription Ends</div>
                    <div className="text-2xl font-bold">
                      {organization?.subscriptionEnds ? new Date(organization.subscriptionEnds).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </Card>

                <Card className="p-6 md:col-span-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">User Limits</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Regular Users</div>
                        <div className="text-2xl font-bold">
                          {users.filter(u => u.role === 'USER').length} / {organization?.maxUsers}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Read-only Users</div>
                        <div className="text-2xl font-bold">
                          {users.filter(u => u.role === 'READ_ONLY').length} / {organization?.maxReadOnlyUsers}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button variant="outline">Manage Subscription</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

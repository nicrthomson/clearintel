"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface OrganizationSettings {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  caseNumberFormat: string;
  evidenceNumberFormat: string;
  storageNumberFormat: string;
}

export function OrganizationSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<OrganizationSettings>({
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    caseNumberFormat: "",
    evidenceNumberFormat: "",
    storageNumberFormat: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch('/api/settings/organization');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data || {});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load organization settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/settings/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Failed to update settings');
      
      toast({
        title: "Settings updated",
        description: "Your organization settings have been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium">Organization Information</h2>
            <p className="text-sm text-muted-foreground">
              Basic information about your organization
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Name</label>
              <Input 
                value={settings.name}
                onChange={e => setSettings({ ...settings, name: e.target.value })}
                placeholder="Enter organization name" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                placeholder="organization@example.com" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input 
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                placeholder="Enter phone number" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Website</label>
              <Input 
                value={settings.website}
                onChange={e => setSettings({ ...settings, website: e.target.value })}
                placeholder="https://example.com" 
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Textarea 
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                placeholder="Enter organization address" 
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium">Number Formats</h2>
            <p className="text-sm text-muted-foreground">
              Configure how case, evidence, and storage numbers are generated
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Case Number Format</label>
              <Input 
                value={settings.caseNumberFormat}
                onChange={e => setSettings({ ...settings, caseNumberFormat: e.target.value })}
                placeholder="Example: CASE-{YYYY}-{0000}" 
              />
              <p className="text-xs text-muted-foreground">
                Available placeholders: {'{YYYY}'} for year, {'{MM}'} for month, {'{0000}'} for sequential number
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Evidence Number Format</label>
              <Input 
                value={settings.evidenceNumberFormat}
                onChange={e => setSettings({ ...settings, evidenceNumberFormat: e.target.value })}
                placeholder="Example: {CASE}-EV-{000}" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Storage Number Format</label>
              <Input 
                value={settings.storageNumberFormat}
                onChange={e => setSettings({ ...settings, storageNumberFormat: e.target.value })}
                placeholder="Example: STOR-{YYYY}-{0000}" 
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
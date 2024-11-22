"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { OrganizationSettings } from '@/components/Settings/OrganizationSettings';
import { UserManagement } from '@/components/Settings/UserManagement';
import { EvidenceLocations } from '@/components/Settings/EvidenceLocations';
import { EvidenceSettings } from '@/components/Settings/EvidenceSettings';

import {
  Settings,
  Users,
  Building2,
  ListChecks,
  Tag,
  Database,
  ClipboardList,
  MapPin,
  Box,
  CheckSquare,
} from 'lucide-react';

interface OrganizationSettings {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState('organization');
  const router = useRouter();

  if (!session) {
    return (
      <div className="text-center py-8">
        Please log in to access settings
      </div>
    );
  }

  const sections = [
    {
      id: 'organization',
      label: 'Organization',
      icon: Building2,
      description: 'Configure your organization details and preferences'
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      description: 'Manage user accounts and permissions'
    },
    {
      id: 'locations',
      label: 'Evidence Locations',
      icon: MapPin,
      description: 'Manage evidence storage locations'
    },
    {
      id: 'case-settings',
      label: 'Case Settings',
      icon: Tag,
      description: 'Configure case numbering and default values'
    },
    {
      id: 'evidence',
      label: 'Evidence Settings',
      icon: Database,
      description: 'Set up evidence types and handling procedures'
    },
    {
      id: 'quality-assurance',
      label: 'Quality Assurance',
      icon: ClipboardList,
      description: 'Define QA checklists and procedures'
    },
    {
      id: 'task-templates',
      label: 'Task Templates',
      icon: CheckSquare,
      description: 'Manage reusable task templates'
    }
  ];

  const handleNavigation = (sectionId: string) => {
    switch (sectionId) {
      case 'quality-assurance':
        router.push('/settings/qa-checklist');
        break;
      case 'task-templates':
        router.push('/settings/task-templates');
        break;
      default:
        setActiveSection(sectionId);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your organization and case management preferences
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        <Card className="w-64 p-2">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => handleNavigation(section.id)}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-sm
                    ${activeSection === section.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-secondary'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </Card>

        <Card className="flex-1 p-6">
          {activeSection === 'organization' && <OrganizationSettings />}
          {activeSection === 'evidence' && <EvidenceSettings />}
          {activeSection === 'users' && <UserManagement />}
          {activeSection === 'locations' && <EvidenceLocations />}
          {activeSection === 'case-settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium">Case Settings</h2>
                <p className="text-sm text-muted-foreground">
                  Configure case numbering format and default values
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Case Number Format</label>
                  <Input placeholder="Example: CASE-{YYYY}-{0000}" />
                  <p className="text-xs text-muted-foreground">
                    Available placeholders: {'{YYYY}'} for year, {'{MM}'} for month, {'{0000}'} for sequential number
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Case Types</h3>
                  <div className="border rounded-md p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input placeholder="Add new case type" />
                        <Button variant="outline">Add</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Case Status Options</h3>
                  <div className="border rounded-md p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input placeholder="Add new status" />
                        <Button variant="outline">Add</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Pencil, 
  HardDrive,
  ListTodo,
  User,
  ArrowRight
} from 'lucide-react';
import { formatDate, formatBytes } from "@/lib/utils";
import type { CaseWithRelations } from "@/lib/db/types";

interface OverviewProps {
  caseData: CaseWithRelations;
  onUpdate?: (data: Partial<CaseWithRelations>) => void;
}

const stages = [
  'pending',
  'collection',
  'analysis',
  'debrief',
  'reporting',
  'court'
] as const;

export function Overview({ caseData, onUpdate }: OverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const currentStageIndex = stages.indexOf(caseData.stage as typeof stages[number]);

  // Get the chain of custody entries from all evidence items
  const allChainOfCustodyEntries = caseData.evidence
    .flatMap(evidence => evidence.chainOfCustody)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5); // Get only the 5 most recent entries

  return (
    <div className="space-y-6 py-4 mb-4">
      {/* Stage Timeline */}
      <Card className="p-6">
        <div className="relative">
          <div className="absolute left-0 right-0 top-8 h-0.5 bg-border" />
          <div className="relative flex justify-between">
            {stages.map((stage, index) => {
              const isComplete = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              
              return (
                <div 
                  key={stage}
                  className={`
                    relative flex flex-col items-center
                    ${isComplete ? 'text-primary' : isCurrent ? 'text-blue-500' : 'text-muted-foreground'}
                  `}
                >
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center bg-background border-2 z-10
                    ${isComplete ? 'border-primary' : isCurrent ? 'border-blue-500' : 'border-muted'}
                  `}>
                    {index + 1}
                  </div>
                  <div className="mt-4 text-center">
                    <div className="font-medium capitalize">{stage}</div>
                    {isCurrent && (
                      <div className="text-sm text-muted-foreground mt-1">Current Stage</div>
                    )}
                  </div>
                  {isComplete && index < stages.length - 1 && (
                    <ArrowRight className="absolute -right-4 top-5 h-6 w-6 text-primary" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Evidence Items</div>
              <div className="text-2xl font-medium">{caseData.evidenceCount}</div>
            </div>
            <HardDrive className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Storage Total</div>
              <div className="text-2xl font-medium">{formatBytes(caseData.storageTotal)}</div>
            </div>
            <HardDrive className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Active Tasks</div>
              <div className="text-2xl font-medium">{caseData.activeTasks}</div>
            </div>
            <ListTodo className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Case Lead</div>
              <div className="text-lg font-medium truncate">{caseData.caseLead || '-'}</div>
            </div>
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Case Details and Personnel */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Case Details</h3>
          <dl className="space-y-2">
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-muted-foreground">Case Number</dt>
              <dd className="col-span-2">{caseData.name}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="col-span-2">{caseData.status}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-muted-foreground">Priority</dt>
              <dd className="col-span-2">{caseData.casePriority || '-'}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="col-span-2">{caseData.caseType || '-'}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-muted-foreground">Date</dt>
              <dd className="col-span-2">{caseData.caseDate ? formatDate(caseData.caseDate) : '-'}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="col-span-2">{formatDate(caseData.createdAt)}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-muted-foreground">Last Updated</dt>
              <dd className="col-span-2">{formatDate(caseData.updatedAt)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Personnel</h3>
          <dl className="space-y-2">
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-muted-foreground">Assignee</dt>
              <dd className="col-span-2">{caseData.caseAssignee || '-'}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-muted-foreground">Examiner</dt>
              <dd className="col-span-2">{caseData.caseExaminer || '-'}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-muted-foreground">Investigator</dt>
              <dd className="col-span-2">{caseData.caseInvestigator || '-'}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-muted-foreground">Organization</dt>
              <dd className="col-span-2">{caseData.organizationName || '-'}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Description and Chain of Custody */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Description</h3>
            {onUpdate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="whitespace-pre-wrap">
            {caseData.description || 'No description provided.'}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Chain of Custody</h3>
          
          {/* Case-level chain of custody */}
          {caseData.chainOfCustody && (
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Case Chain of Custody</h4>
              <div className="whitespace-pre-wrap">
                {caseData.chainOfCustody}
              </div>
            </div>
          )}

          {/* Evidence chain of custody events */}
          <div>
            <h4 className="text-md font-medium mb-2">Evidence Chain of Custody Events</h4>
            {allChainOfCustodyEntries.length > 0 ? (
              <div className="space-y-4">
                {allChainOfCustodyEntries.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-4">
                    <div className="min-w-[100px] text-sm text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {entry.action}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        By: {entry.user.name}
                      </div>
                      {entry.reason && (
                        <div className="text-sm mt-1">
                          {entry.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">
                No chain of custody events recorded.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

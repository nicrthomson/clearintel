"use client"

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatBytes, formatDate } from "@/lib/utils";
import { NewEvidenceDialog } from "./NewEvidenceDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { CustodyActionManager } from "./CustodyActionManager";
import { FileIcon, HardDrive, Image, FileText, File, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface EvidenceType {
  id: number;
  name: string;
}

interface Evidence {
  id: number;
  name: string;
  evidenceNumber: string;
  type: EvidenceType;
  status: string;
  storageLocation: string | null;
  size: bigint | null;
  createdAt: Date;
  mimeType: string | null;
  filePath: string | null;
}

interface EvidenceListProps {
  caseId: number;
  evidence: Evidence[];
  onEvidenceCreated?: () => void;
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return <File className="h-4 w-4" />;
  
  if (mimeType.startsWith('image/')) {
    return <Image className="h-4 w-4" />;
  }
  
  if (mimeType.includes('pdf')) {
    return <FileText className="h-4 w-4" />;
  }
  
  if (mimeType.includes('disk') || mimeType.includes('drive')) {
    return <HardDrive className="h-4 w-4" />;
  }
  
  return <FileIcon className="h-4 w-4" />;
}

export function EvidenceList({ caseId, evidence, onEvidenceCreated }: EvidenceListProps) {
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const router = useRouter();
  const { toast } = useToast();

  // Get unique types and statuses for filters
  const types = useMemo(() => {
    const uniqueTypes = new Set(evidence.map(item => item.type.name));
    return Array.from(uniqueTypes);
  }, [evidence]);

  const statuses = useMemo(() => {
    const uniqueStatuses = new Set(evidence.map(item => item.status));
    return Array.from(uniqueStatuses);
  }, [evidence]);

  // Filter evidence items
  const filteredEvidence = useMemo(() => {
    return evidence.filter(item => {
      const matchesSearch = searchTerm === "" || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.evidenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.storageLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesType = typeFilter === "all" || item.type.name === typeFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [evidence, searchTerm, typeFilter, statusFilter]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search evidence"]')?.focus();
      }
      // Ctrl/Cmd + N for new evidence
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setIsNewDialogOpen(true);
      }
      // Escape to clear selection
      if (e.key === 'Escape' && selectedItems.size > 0) {
        e.preventDefault();
        setSelectedItems(new Set());
      }
      // Ctrl/Cmd + A to select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        if (selectedItems.size === filteredEvidence.length) {
          setSelectedItems(new Set());
        } else {
          setSelectedItems(new Set(filteredEvidence.map(item => item.id)));
        }
      }
      // Delete key to show delete dialog
      if (e.key === 'Delete' && selectedItems.size > 0) {
        e.preventDefault();
        setShowDeleteDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedItems, filteredEvidence]);

  const handleViewEvidence = (id: number) => {
    router.push(`/case/${caseId}/evidence/${id}`);
  };

  const toggleSelection = (id: number) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedItems.size === filteredEvidence.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredEvidence.map(item => item.id)));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.size === 0) return;

    try {
      switch (action) {
        case 'download':
          // Download selected files
          for (const id of selectedItems) {
            const item = evidence.find(e => e.id === id);
            if (item?.filePath) {
              const fileName = item.filePath.split('/').pop();
              window.open(`/api/evidence/files/${fileName}`, '_blank');
            }
          }
          toast({
            title: "Download Started",
            description: `Downloading ${selectedItems.size} file(s)`,
          });
          break;

        case 'delete':
          setShowDeleteDialog(true);
          break;

        case 'export':
          // Export selected items
          const selectedData = evidence.filter(item => selectedItems.has(item.id));
          const blob = new Blob([JSON.stringify(selectedData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `evidence-export-${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast({
            title: "Export Complete",
            description: `Exported ${selectedItems.size} item(s)`,
          });
          break;
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    const response = await fetch('/api/evidence/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids: Array.from(selectedItems),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete items');
    }

    setSelectedItems(new Set());
    onEvidenceCreated?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Evidence Items</h2>
        <div className="flex items-center space-x-2">
          <CustodyActionManager caseId={caseId} />
          {selectedItems.size > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions ({selectedItems.size})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction('download')}>
                  Download Files
                  <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                  Export Data
                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleBulkAction('delete')}
                  className="text-destructive"
                >
                  Delete Items
                  <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button onClick={() => setIsNewDialogOpen(true)}>
            Add Evidence
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search evidence... (⌘F)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select
          value={typeFilter}
          onValueChange={setTypeFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map(status => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground text-right">
          {filteredEvidence.length} items found
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]">
                <Checkbox
                  checked={selectedItems.size === filteredEvidence.length && filteredEvidence.length > 0}
                  onCheckedChange={toggleAllSelection}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead>Evidence #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvidence.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => toggleSelection(item.id)}
                    aria-label={`Select ${item.name}`}
                  />
                </TableCell>
                <TableCell>
                  {getFileIcon(item.mimeType)}
                </TableCell>
                <TableCell>{item.evidenceNumber}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.type.name}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.storageLocation}</TableCell>
                <TableCell>{item.size ? formatBytes(Number(item.size)) : "N/A"}</TableCell>
                <TableCell>{formatDate(item.createdAt.toString())}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewEvidence(item.id)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredEvidence.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  {evidence.length === 0 ? (
                    "No evidence items found"
                  ) : (
                    "No matching evidence items"
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground">
        Keyboard shortcuts: ⌘F to search • ⌘N to add new evidence • ⌘A to select all • Delete to remove • Esc to clear selection
      </div>

      <NewEvidenceDialog
        caseId={caseId}
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        onEvidenceCreated={onEvidenceCreated}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        itemCount={selectedItems.size}
        onConfirm={handleDelete}
      />
    </div>
  );
}

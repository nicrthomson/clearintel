import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatBytes } from "@/lib/utils";

interface Evidence {
  id: number;
  evidenceNumber: string;
  name: string;
  description: string | null;
  type: { name: string };
  status: string;
  location: string | null;
  acquisitionDate: Date | null;
  mimeType: string | null;
  md5Hash: string | null;
  size: bigint | null;
}

interface EvidenceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: Evidence[];
  onSelect: (evidence: Evidence) => void;
}

export function EvidenceSelector({ isOpen, onClose, evidence = [], onSelect }: EvidenceSelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-0">
        <DialogTitle className="px-4 pt-4">Select Evidence</DialogTitle>
        <Command>
          <CommandInput placeholder="Search evidence..." />
          <CommandList>
            <CommandEmpty>No evidence found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[300px]">
                {evidence.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.evidenceNumber}
                    onSelect={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.evidenceNumber}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.size ? formatBytes(Number(item.size)) : 'N/A'}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.name} - {item.type.name}
                      </span>
                      {item.acquisitionDate && (
                        <span className="text-xs text-muted-foreground">
                          Acquired: {new Date(item.acquisitionDate).toLocaleDateString()}
                        </span>
                      )}
                      {item.md5Hash && (
                        <span className="text-xs font-mono text-muted-foreground">
                          MD5: {item.md5Hash}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
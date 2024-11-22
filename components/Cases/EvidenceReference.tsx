interface EvidenceReferenceProps {
  evidence: {
    id: number;
    evidenceNumber: string;
    name: string;
    type: { name: string };
  };
  onSelect: (evidence: any) => void;
}

export function EvidenceReference({ evidence, onSelect }: EvidenceReferenceProps) {
  return (
    <div
      className="flex items-center p-2 hover:bg-accent cursor-pointer"
      onClick={() => onSelect(evidence)}
    >
      <div>
        <div className="font-medium">{evidence.evidenceNumber}</div>
        <div className="text-sm text-muted-foreground">
          {evidence.name} ({evidence.type.name})
        </div>
      </div>
    </div>
  );
} 
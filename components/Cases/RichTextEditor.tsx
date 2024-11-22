interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  onEvidenceMatch?: (match: RegExpMatchArray, editor: HTMLDivElement) => void;
}

interface EvidenceReference {
  evidenceNumber: string;
  name: string;
  type: {
    name: string;
  };
  status: string;
  storageLocation?: string;
  size?: number;
  md5Hash?: string;
  sha256Hash?: string;
  acquisitionDate?: Date;
}

export function RichTextEditor({ content, onChange, onEvidenceMatch }: RichTextEditorProps) {
  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerHTML;
    const match = text.match(/\[E([^\]]*)\]$/);
    if (match && onEvidenceMatch) {
      onEvidenceMatch(match, e.currentTarget);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  return (
    <div 
      className="rich-text-editor"
      contentEditable
      dangerouslySetInnerHTML={{ __html: content }}
      onInput={handleInput}
      onKeyUp={handleKeyUp}
    />
  );
} 
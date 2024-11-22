import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import { useEffect, useState } from "react";
import { 
  Bold, 
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { Button } from './button';
import { EvidenceSelector } from "@/app/components/EvidenceSelector";
import { formatBytes } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  editable?: boolean;
  caseId: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace('px', ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: size })
          .run();
      },
    };
  },
});

const fontSizes = [
  { label: '12px', value: '12' },
  { label: '14px', value: '14' },
  { label: '16px', value: '16' },
  { label: '18px', value: '18' },
  { label: '20px', value: '20' },
  { label: '24px', value: '24' },
  { label: '30px', value: '30' },
  { label: '36px', value: '36' },
];

export function RichTextEditor({ content, onChange, editable = true, caseId }: RichTextEditorProps) {
  const [showEvidenceSelector, setShowEvidenceSelector] = useState(false);
  const [evidence, setEvidence] = useState<any[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontSize,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!caseId) return;

    const fetchEvidence = async () => {
      try {
        const response = await fetch(`/api/evidence?case_id=${caseId}`);
        if (response.ok) {
          const data = await response.json();
          setEvidence(data);
        }
      } catch (error) {
        console.error("Failed to fetch evidence:", error);
      }
    };
    fetchEvidence();
  }, [caseId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setShowEvidenceSelector(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEvidenceSelect = (selectedEvidence: any) => {
    const evidenceText = `
Evidence #${selectedEvidence.evidenceNumber}
Name: ${selectedEvidence.name}
Type: ${selectedEvidence.type.name}
${selectedEvidence.description ? `Description: ${selectedEvidence.description}` : ''}
Status: ${selectedEvidence.status}
Location: ${selectedEvidence.location || 'N/A'}
Acquisition Date: ${selectedEvidence.acquisitionDate ? new Date(selectedEvidence.acquisitionDate).toLocaleDateString() : 'N/A'}
Size: ${selectedEvidence.size ? formatBytes(Number(selectedEvidence.size)) : 'N/A'}
MD5 Hash: ${selectedEvidence.md5Hash || 'N/A'}
MIME Type: ${selectedEvidence.mimeType || 'N/A'}
`;
    
    editor?.commands.insertContent(evidenceText);
  };

  const setFontSize = (size: string) => {
    if (!editor) return;
    editor.chain().focus().setFontSize(size).run();
  };

  const ToolbarButton = ({ 
    isActive = false, 
    onClick, 
    children 
  }: { 
    isActive?: boolean; 
    onClick: () => void; 
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`h-8 px-2 rounded-none ${isActive ? 'bg-secondary' : ''}`}
    >
      {children}
    </Button>
  );

  if (!editor) {
    return null;
  }

  return (
    <div>
      <div className="border rounded-none">
        {editable && (
          <div className="border-b p-1 flex flex-wrap gap-1 items-center">
            <div className="flex items-center border rounded-none">
              <select
                className="h-8 px-2 bg-transparent border-r rounded-none"
                onChange={(e) => setFontSize(e.target.value)}
                value={editor.getAttributes('textStyle').fontSize || '16'}
              >
                {fontSizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-px h-8 bg-border mx-1" />

            <ToolbarButton
              isActive={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              isActive={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              isActive={editor.isActive('strike')}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>

            <div className="w-px h-8 bg-border mx-1" />

            <ToolbarButton
              isActive={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              isActive={editor.isActive('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>

            <div className="w-px h-8 bg-border mx-1" />

            <ToolbarButton
              isActive={editor.isActive({ textAlign: 'left' })}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              isActive={editor.isActive({ textAlign: 'center' })}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              isActive={editor.isActive({ textAlign: 'right' })}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
          </div>
        )}

        <EditorContent 
          editor={editor} 
          className={`prose dark:prose-invert max-w-none p-4 ${
            !editable ? 'cursor-default' : ''
          }`}
        />
      </div>

      <EvidenceSelector
        isOpen={showEvidenceSelector}
        onClose={() => setShowEvidenceSelector(false)}
        evidence={evidence}
        onSelect={handleEvidenceSelect}
      />
    </div>
  );
}

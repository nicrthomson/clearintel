"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { formatDate } from '@/lib/utils';
import { Loader2, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/ui/use-toast';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: number;
}

interface NotesProps {
  caseId: number;
}

export function Notes({ caseId }: NotesProps) {
  const { data: session } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [caseId]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/notes?caseId=${caseId}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      setNotes(data);
      if (data.length > 0 && !selectedNote) {
        setSelectedNote(data[0]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatEvidenceData = (content: string) => {
    const evidencePattern = /Evidence #([\w-]+)\s+([\s\S]+?)(?=Evidence #|$)/g;
    
    return content.replace(evidencePattern, (match, id, details) => {
      // Convert HTML to plain text and split by HTML tags
      const plainText = details
        .replace(/<[^>]+>/g, '\n')
        .replace(/&nbsp;/g, ' ')
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line)
        .join('\n');

      // Format the evidence block
      const formattedBlock = `Evidence #${id}\n${plainText}\n\n`;
      
      // Convert back to HTML with proper line breaks
      return formattedBlock
        .split('\n')
        .map((line: string) => `<p>${line}</p>`)
        .join('');
    });
  };

  const handleCreateNote = async (note: { title: string; content: string }) => {
    setIsSaving(true);
    try {
      const formattedContent = formatEvidenceData(note.content);
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId,
          title: note.title,
          content: formattedContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create note');
      }

      await fetchNotes();
      setShowEditor(false);
      toast({
        title: "Success",
        description: "Note created successfully",
      });
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create note",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateNote = async (id: number, note: { title: string; content: string }) => {
    setIsSaving(true);
    try {
      const formattedContent = formatEvidenceData(note.content);
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...note,
          content: formattedContent,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await fetchNotes();
      setIsEditing(null);
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update note",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchNotes();
        if (selectedNote?.id === id) {
          setSelectedNote(null);
        }
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)]">
      {/* Notes Sidebar */}
      <div className={`border-r border-border transition-all ${sidebarCollapsed ? 'w-12' : 'w-64'}`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!sidebarCollapsed && <h3 className="font-semibold">Notes</h3>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={sidebarCollapsed ? 'w-full' : ''}
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        <div className="p-2">
          {!sidebarCollapsed && (
            <Button
              onClick={() => {
                setShowEditor(true);
                setSelectedNote(null);
              }}
              className="w-full mb-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          )}
          <div className="space-y-1">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  setSelectedNote(note);
                  setShowEditor(false);
                }}
                className={`p-2 rounded-md cursor-pointer hover:bg-secondary ${
                  selectedNote?.id === note.id ? 'bg-secondary' : ''
                } ${sidebarCollapsed ? 'w-8 h-8 flex items-center justify-center' : ''}`}
              >
                {sidebarCollapsed ? (
                  <span className="text-xs">{note.title.charAt(0)}</span>
                ) : (
                  <div>
                    <div className="font-medium truncate">{note.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(note.updated_at)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {showEditor ? (
          <NoteEditor
            onSave={handleCreateNote}
            onCancel={() => setShowEditor(false)}
            isSaving={isSaving}
            caseId={caseId}
          />
        ) : selectedNote ? (
          <Card className="p-4">
            {isEditing === selectedNote.id ? (
              <NoteEditor
                initialData={selectedNote}
                onSave={(data) => handleUpdateNote(selectedNote.id, data)}
                onCancel={() => setIsEditing(null)}
                isSaving={isSaving}
                caseId={caseId}
              />
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedNote.title}</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(selectedNote.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(selectedNote.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedNote.content }} />
                </div>
                <div className="text-sm text-muted-foreground mt-4">
                  Last updated {formatDate(selectedNote.updated_at)}
                </div>
              </div>
            )}
          </Card>
        ) : !showEditor && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>Select a note or create a new one</p>
            <Button
              onClick={() => setShowEditor(true)}
              variant="outline"
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface NoteEditorProps {
  initialData?: {
    title: string;
    content: string;
  };
  onSave: (note: { title: string; content: string }) => void;
  onCancel: () => void;
  isSaving: boolean;
  caseId: number;
}

function NoteEditor({ initialData, onSave, onCancel, isSaving, caseId }: NoteEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, content });
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full px-3 py-2 border rounded-md"
            required
            disabled={isSaving}
          />
        </div>
        <div>
          <RichTextEditor
            content={content}
            onChange={setContent}
            editable={!isSaving}
            caseId={caseId}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {initialData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{initialData ? 'Update' : 'Create'} Note</>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

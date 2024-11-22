import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { EvidenceType } from '@prisma/client';

interface EvidenceItem {
  id: number;
  name: string;
  evidenceNumber: string;
  type: EvidenceType;
}

interface EvidenceListProps {
  items: EvidenceItem[];
  command: (item: EvidenceItem) => void;
}

const EvidenceList = ({ items, command }: EvidenceListProps) => {
  return (
    <div className="evidence-list">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => command(item)}
          className="flex items-center gap-2 w-full p-2 hover:bg-muted"
        >
          <span>{item.evidenceNumber}</span>
          <span>{item.name}</span>
          <span className="text-muted-foreground">({item.type.name})</span>
        </button>
      ))}
    </div>
  );
};

const suggestion = {
  items: ({ query }: { query: string }) => {
    // This would be replaced with your actual evidence fetching logic
    return fetch('/api/evidence/search?q=' + query)
      .then(res => res.json())
      .then(items => items.slice(0, 5));
  },

  render: () => {
    let component: any;
    let popup: any;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(EvidenceList, {
          props,
          editor: props.editor,
        });

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }
        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};

export default suggestion; 
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AnalyticsDashboard } from "@/components/Dashboard/AnalyticsDashboard";
import { RecentCases } from "@/components/Dashboard/RecentCases";
import { PendingTasks } from "@/components/Dashboard/PendingTasks";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DashboardCard {
  id: string;
  title: string;
  component: React.ReactNode;
  colSpan?: number;
}

function SortableCard({ id, title, children, colSpan = 1 }: { 
  id: string; 
  title: string;
  children: React.ReactNode;
  colSpan?: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`${colSpan > 1 ? 'col-span-' + colSpan : ''}`}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <GripVertical 
            className="h-5 w-5 text-muted-foreground cursor-move" 
            {...attributes} 
            {...listeners}
          />
        </div>
        {children}
      </Card>
    </div>
  );
}

export function DashboardView() {
  const [cards, setCards] = useState<DashboardCard[]>([
    { id: 'analytics', title: 'Analytics Overview', component: <AnalyticsDashboard />, colSpan: 2 },
    { id: 'recent-cases', title: 'Recent Cases', component: <RecentCases /> },
    { id: 'pending-tasks', title: 'Pending Tasks', component: <PendingTasks /> },
    { id: 'quick-stats', title: 'Quick Stats', component: <QuickStats /> },
    { id: 'recent-activity', title: 'Recent Activity', component: <RecentActivity /> },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cards.map(c => c.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-6">
            {cards.map((card) => (
              <SortableCard
                key={card.id}
                id={card.id}
                title={card.title}
                colSpan={card.colSpan}
              >
                {card.component}
              </SortableCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function QuickStats() {
  const [stats, setStats] = useState({
    totalCases: 0,
    totalEvidence: 0,
    pendingTasks: 0,
  });

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(setStats);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Active Cases</p>
        <p className="text-2xl font-bold">{stats.totalCases}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Total Evidence Items</p>
        <p className="text-2xl font-bold">{stats.totalEvidence}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Pending Tasks</p>
        <p className="text-2xl font-bold">{stats.pendingTasks}</p>
      </div>
    </div>
  );
}

function RecentActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetch('/api/dashboard/activities')
      .then(res => res.json())
      .then(setActivities);
  }, []);

  return (
    <div className="space-y-4">
      {activities.map((activity: any) => (
        <div key={activity.id} className="text-sm">
          <p className="font-medium">{activity.description}</p>
          <p className="text-muted-foreground">{activity.createdAt}</p>
        </div>
      ))}
    </div>
  );
} 
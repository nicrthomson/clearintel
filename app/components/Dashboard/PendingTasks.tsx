"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface Task {
  id: number;
  name: string;
  status: string;
  dueDate: string | null;
  priority: string;
  case: {
    id: number;
    name: string;
  };
}

export function PendingTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/tasks?limit=5')
      .then(res => res.json())
      .then(setTasks);
  }, []);

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <div
          key={task.id}
          className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
          onClick={() => router.push(`/case/${task.case.id}?tab=tasks`)}
        >
          <div>
            <p className="font-medium">{task.name}</p>
            <p className="text-sm text-muted-foreground">
              {task.case.name}
              {task.dueDate && ` • Due ${formatDate(task.dueDate)}`}
              {task.priority && ` • ${task.priority}`}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {task.status}
          </div>
        </div>
      ))}
    </div>
  );
}
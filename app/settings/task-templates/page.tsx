import { TaskTemplates } from "@/components/Settings/TaskTemplates/TaskTemplates";

export default function TaskTemplatesPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Task Templates</h1>
      <TaskTemplates />
    </div>
  );
}

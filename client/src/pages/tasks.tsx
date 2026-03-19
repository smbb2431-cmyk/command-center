import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useData, type Task } from "@/lib/data-context";
import { useToast } from "@/hooks/use-toast";

const statusColumns = [
  { key: "todo", label: "To Do", color: "bg-muted" },
  { key: "in-progress", label: "In Progress", color: "bg-blue-500/10" },
  { key: "done", label: "Done", color: "bg-green-500/10" },
] as const;

const priorityColors: Record<string, string> = {
  urgent: "destructive",
  high: "default",
  medium: "secondary",
  low: "outline",
};

function TaskCard({ task, onStatusChange, onDelete }: { task: Task; onStatusChange: (id: number, status: string) => void; onDelete: (id: number) => void }) {
  const { projects } = useData();
  const project = projects.find(p => p.id === task.projectId);
  return (
    <div className="rounded-md border bg-card p-3 space-y-2 group" data-testid={`task-card-${task.id}`}>
      <div className="flex items-start justify-between gap-1">
        <p className="text-sm font-medium leading-tight">{task.title}</p>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-destructive"
          data-testid={`button-delete-task-${task.id}`}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant={priorityColors[task.priority] as any} className="text-[10px] px-1.5 py-0">
          {task.priority}
        </Badge>
        {project && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: project.color, color: project.color }}>
            {project.name}
          </Badge>
        )}
        {task.dueDate && (
          <span className="text-[10px] text-muted-foreground tabular-nums">{task.dueDate}</span>
        )}
      </div>
      <Select value={task.status} onValueChange={(val) => onStatusChange(task.id, val)}>
        <SelectTrigger className="h-7 text-xs" data-testid={`select-status-${task.id}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default function Tasks() {
  const { toast } = useToast();
  const { tasks, projects, addTask, updateTask, deleteTask } = useData();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [projectId, setProjectId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");

  const handleCreate = () => {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      projectId: projectId && projectId !== "none" ? parseInt(projectId) : null,
      dueDate: dueDate || null,
      status: "todo",
    });
    setTitle(""); setDescription(""); setPriority("medium"); setProjectId(""); setDueDate("");
    setOpen(false);
    toast({ title: "Task created" });
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{tasks.length} total tasks</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-task">
              <Plus className="size-4 mr-1" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} data-testid="input-task-title" />
              <Textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="min-h-[80px]" data-testid="input-task-description" />
              <div className="grid grid-cols-2 gap-3">
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger data-testid="select-priority"><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger data-testid="select-project"><SelectValue placeholder="Project" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} data-testid="input-due-date" />
              <Button onClick={handleCreate} disabled={!title.trim()} className="w-full" data-testid="button-submit-task">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {statusColumns.map(col => {
          const columnTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium">{col.label}</h2>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 tabular-nums">{columnTasks.length}</Badge>
              </div>
              <div className={`rounded-lg p-3 space-y-2 min-h-[200px] ${col.color}`}>
                {columnTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={(id, status) => updateTask(id, { status })}
                    onDelete={(id) => { deleteTask(id); toast({ title: "Task deleted" }); }}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No tasks</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

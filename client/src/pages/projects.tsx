import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Pencil } from "lucide-react";
import type { Project, Task } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const colors = [
  { value: "#0e7490", label: "Teal" },
  { value: "#7c3aed", label: "Purple" },
  { value: "#ea580c", label: "Orange" },
  { value: "#2563eb", label: "Blue" },
  { value: "#16a34a", label: "Green" },
  { value: "#dc2626", label: "Red" },
];

export default function Projects() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState("#0e7490");

  const { data: projects, isLoading } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: tasks } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      resetForm();
      toast({ title: "Project created" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/projects/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      resetForm();
      toast({ title: "Project updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project deleted" });
    },
  });

  function resetForm() {
    setName(""); setDescription(""); setStatus("active"); setProgress(0); setColor("#0e7490");
    setEditingId(null); setOpen(false);
  }

  function startEdit(project: Project) {
    setEditingId(project.id);
    setName(project.name);
    setDescription(project.description ?? "");
    setStatus(project.status);
    setProgress(project.progress);
    setColor(project.color);
    setOpen(true);
  }

  function handleSubmit() {
    if (!name.trim()) return;
    const data = { name: name.trim(), description: description.trim() || null, status, progress, color };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-7 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{projects?.length ?? 0} projects</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-project">
              <Plus className="size-4 mr-1" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Project" : "New Project"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Project name"
                value={name}
                onChange={e => setName(e.target.value)}
                data-testid="input-project-name"
              />
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="min-h-[80px]"
                data-testid="input-project-description"
              />
              <div className="grid grid-cols-2 gap-3">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger data-testid="select-project-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger data-testid="select-project-color">
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map(c => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <span className="size-3 rounded-full" style={{ backgroundColor: c.value }} />
                          <span>{c.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Progress</label>
                  <span className="text-xs text-muted-foreground tabular-nums">{progress}%</span>
                </div>
                <Slider
                  value={[progress]}
                  onValueChange={([v]) => setProgress(v)}
                  min={0}
                  max={100}
                  step={5}
                  data-testid="slider-progress"
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}
                className="w-full"
                data-testid="button-submit-project"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map(project => {
          const projectTasks = tasks?.filter(t => t.projectId === project.id) ?? [];
          const doneTasks = projectTasks.filter(t => t.status === "done").length;
          return (
            <Card key={project.id} className="group" data-testid={`project-card-${project.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                    <CardTitle className="text-sm font-medium truncate">{project.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => startEdit(project)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                      data-testid={`button-edit-project-${project.id}`}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(project.id)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                      data-testid={`button-delete-project-${project.id}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                )}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant={project.status === "active" ? "default" : project.status === "completed" ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">
                    {project.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{doneTasks}/{projectTasks.length} tasks</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(!projects || projects.length === 0) && (
          <div className="col-span-full text-center py-12">
            <p className="text-sm text-muted-foreground">No projects yet. Create your first project to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

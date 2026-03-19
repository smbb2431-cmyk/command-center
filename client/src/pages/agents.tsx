import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Play, Pause, Square, Bot, Zap, Activity, RefreshCw } from "lucide-react";
import type { Agent, Project } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const agentTypes = [
  { value: "route-planner", label: "Route Planner", icon: "🗺" },
  { value: "dispatch", label: "Dispatch", icon: "📨" },
  { value: "monitor", label: "Monitor", icon: "📊" },
  { value: "marketing", label: "Marketing", icon: "📣" },
  { value: "custom", label: "Custom", icon: "⚙" },
];

const statusConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  running: { label: "Running", color: "default", dotColor: "bg-green-500 animate-pulse" },
  idle: { label: "Idle", color: "secondary", dotColor: "bg-gray-400" },
  paused: { label: "Paused", color: "outline", dotColor: "bg-yellow-500" },
  error: { label: "Error", color: "destructive", dotColor: "bg-red-500" },
};

export default function Agents() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("custom");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string>("");

  const { data: agents, isLoading } = useQuery<Agent[]>({ queryKey: ["/api/agents"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/agents", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      setName(""); setType("custom"); setDescription(""); setProjectId("");
      setOpen(false);
      toast({ title: "Agent created" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/agents/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({ title: "Agent removed" });
    },
  });

  function handleCreate() {
    if (!name.trim()) return;
    createMutation.mutate({
      name: name.trim(),
      type,
      description: description.trim() || null,
      projectId: projectId && projectId !== "none" ? parseInt(projectId) : null,
      status: "idle",
    });
  }

  function toggleStatus(agent: Agent) {
    const next = agent.status === "running" ? "paused" : agent.status === "paused" ? "running" : "running";
    updateMutation.mutate({ id: agent.id, data: { status: next } });
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-7 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const runningCount = agents?.filter(a => a.status === "running").length ?? 0;
  const totalRuns = agents?.reduce((sum, a) => sum + a.runsToday, 0) ?? 0;
  const avgSuccess = agents?.length ? Math.round(agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length) : 0;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">AI Agents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{agents?.length ?? 0} agents configured</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-agent">
              <Plus className="size-4 mr-1" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Agent name"
                value={name}
                onChange={e => setName(e.target.value)}
                data-testid="input-agent-name"
              />
              <Select value={type} onValueChange={setType}>
                <SelectTrigger data-testid="select-agent-type">
                  <SelectValue placeholder="Agent type" />
                </SelectTrigger>
                <SelectContent>
                  {agentTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="What does this agent do?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="min-h-[80px]"
                data-testid="input-agent-description"
              />
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger data-testid="select-agent-project">
                  <SelectValue placeholder="Assign to project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects?.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || createMutation.isPending}
                className="w-full"
                data-testid="button-submit-agent"
              >
                {createMutation.isPending ? "Creating..." : "Create Agent"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Agent Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-green-500/10">
              <Zap className="size-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">{runningCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-500/10">
              <Activity className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">{totalRuns}</p>
              <p className="text-xs text-muted-foreground">Runs today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-purple-500/10">
              <RefreshCw className="size-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">{avgSuccess}%</p>
              <p className="text-xs text-muted-foreground">Avg success</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents?.map(agent => {
          const project = projects?.find(p => p.id === agent.projectId);
          const cfg = statusConfig[agent.status] ?? statusConfig.idle;
          return (
            <Card key={agent.id} className="group" data-testid={`agent-card-${agent.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Bot className="size-4 text-muted-foreground shrink-0" />
                    <CardTitle className="text-sm font-medium truncate">{agent.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`size-2 rounded-full ${cfg.dotColor}`} />
                    <Badge variant={cfg.color as any} className="text-[10px] px-1.5 py-0">{cfg.label}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {agent.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Type: <span className="text-foreground font-medium">{agentTypes.find(t => t.value === agent.type)?.label ?? agent.type}</span></span>
                  {project && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: project.color, color: project.color }}>
                      {project.name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="tabular-nums">{agent.runsToday} runs today</span>
                  <span className="tabular-nums">{agent.successRate}% success</span>
                  {agent.lastRun && <span>Last: {agent.lastRun}</span>}
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <Button
                    size="sm"
                    variant={agent.status === "running" ? "outline" : "default"}
                    className="h-7 text-xs"
                    onClick={() => toggleStatus(agent)}
                    data-testid={`button-toggle-agent-${agent.id}`}
                  >
                    {agent.status === "running" ? <Pause className="size-3 mr-1" /> : <Play className="size-3 mr-1" />}
                    {agent.status === "running" ? "Pause" : "Start"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(agent.id)}
                    data-testid={`button-delete-agent-${agent.id}`}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(!agents || agents.length === 0) && (
          <div className="col-span-full text-center py-12">
            <Bot className="size-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No agents configured. Add your first AI agent to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

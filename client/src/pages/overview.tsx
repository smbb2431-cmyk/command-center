import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, FolderKanban, Bot, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { useData } from "@/lib/data-context";

function KpiCard({ title, value, subtitle, icon: Icon, color }: { title: string; value: string | number; subtitle: string; icon: any; color: string }) {
  return (
    <Card data-testid={`kpi-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-xl font-semibold tabular-nums tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`p-2 rounded-md ${color}`}>
            <Icon className="size-4 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Overview() {
  const { tasks, projects, agents } = useData();

  const todoCount = tasks.filter(t => t.status === "todo").length;
  const inProgressCount = tasks.filter(t => t.status === "in-progress").length;
  const doneCount = tasks.filter(t => t.status === "done").length;
  const urgentCount = tasks.filter(t => t.priority === "urgent" || t.priority === "high").length;
  const activeProjects = projects.filter(p => p.status === "active").length;
  const runningAgents = agents.filter(a => a.status === "running").length;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your logistics command center at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Open Tasks" value={todoCount + inProgressCount} subtitle={`${doneCount} completed`} icon={CheckSquare} color="bg-[hsl(188,70%,30%)]" />
        <KpiCard title="Active Projects" value={activeProjects} subtitle={`${projects.length} total`} icon={FolderKanban} color="bg-[hsl(262,45%,50%)]" />
        <KpiCard title="Agents Running" value={runningAgents} subtitle={`${agents.length} total`} icon={Bot} color="bg-[hsl(160,50%,40%)]" />
        <KpiCard title="Urgent Items" value={urgentCount} subtitle="Need attention" icon={AlertTriangle} color="bg-[hsl(35,80%,52%)]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center justify-between gap-2" data-testid={`task-row-${task.id}`}>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.dueDate ? `Due ${task.dueDate}` : "No due date"}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant={task.priority === "urgent" ? "destructive" : task.priority === "high" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                    {task.priority}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {task.status}
                  </Badge>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No tasks yet. Create your first task to get started.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="size-4 text-muted-foreground" />
              Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map(project => (
              <div key={project.id} className="space-y-1.5" data-testid={`project-progress-${project.id}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <span className="text-xs text-muted-foreground tabular-nums">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
                <div className="flex items-center gap-1.5">
                  <Badge variant={project.status === "active" ? "default" : project.status === "completed" ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">
                    {project.status}
                  </Badge>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No projects yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bot className="size-4 text-muted-foreground" />
            Agent Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {agents.map(agent => (
              <div key={agent.id} className="rounded-md border p-3 space-y-2" data-testid={`agent-card-${agent.id}`}>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-sm font-medium truncate">{agent.name}</p>
                  <span className={`size-2 rounded-full shrink-0 ${
                    agent.status === "running" ? "bg-green-500 animate-pulse" :
                    agent.status === "error" ? "bg-red-500" :
                    agent.status === "paused" ? "bg-yellow-500" :
                    "bg-gray-400"
                  }`} />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="tabular-nums">{agent.runsToday} runs</span>
                  <span className="tabular-nums">{agent.successRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

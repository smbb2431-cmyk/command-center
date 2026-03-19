import {
  type Project, type InsertProject,
  type Task, type InsertTask,
  type Agent, type InsertAgent,
} from "@shared/schema";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Agents
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project> = new Map();
  private tasks: Map<number, Task> = new Map();
  private agents: Map<number, Agent> = new Map();
  private nextProjectId = 1;
  private nextTaskId = 1;
  private nextAgentId = 1;

  constructor() {
    // Seed with logistics-relevant sample data
    this.seedData();
  }

  private seedData() {
    // Projects
    const p1: Project = { id: this.nextProjectId++, name: "Route Optimization MVP", description: "AI-powered route optimization for small fleet operators (5-50 trucks)", status: "active", progress: 45, color: "#0e7490" };
    const p2: Project = { id: this.nextProjectId++, name: "Dispatch Automation", description: "Automated dispatch communicator agent for driver route notifications", status: "active", progress: 20, color: "#7c3aed" };
    const p3: Project = { id: this.nextProjectId++, name: "Fleet Monitor Dashboard", description: "Real-time fleet tracking and performance monitoring system", status: "on-hold", progress: 10, color: "#ea580c" };
    this.projects.set(p1.id, p1);
    this.projects.set(p2.id, p2);
    this.projects.set(p3.id, p3);

    // Tasks
    const seedTasks: InsertTask[] = [
      { title: "Build VRP solver module", status: "in-progress", priority: "high", projectId: 1, description: "Implement Vehicle Routing Problem solver using OR-Tools", dueDate: "2026-03-25" },
      { title: "Design stop-list import UI", status: "todo", priority: "medium", projectId: 1, description: "CSV/Excel import for daily stop lists", dueDate: "2026-03-28" },
      { title: "Set up SMS gateway integration", status: "todo", priority: "high", projectId: 2, description: "Twilio integration for driver notifications", dueDate: "2026-03-22" },
      { title: "Create driver mobile view", status: "todo", priority: "medium", projectId: 2, description: "Responsive route view for drivers on mobile", dueDate: "2026-04-01" },
      { title: "Define fleet KPI metrics", status: "done", priority: "low", projectId: 3, description: "Identify key metrics: on-time %, fuel cost, idle time", dueDate: "2026-03-15" },
      { title: "API rate limiter for route calls", status: "in-progress", priority: "urgent", projectId: 1, description: "Prevent abuse of Google Maps API quota", dueDate: "2026-03-20" },
      { title: "Write beta onboarding flow", status: "todo", priority: "medium", projectId: 1, description: "Guided setup for new fleet operator accounts", dueDate: "2026-04-05" },
    ];
    for (const t of seedTasks) {
      const id = this.nextTaskId++;
      this.tasks.set(id, { ...t, id, title: t.title, status: t.status ?? "todo", priority: t.priority ?? "medium", projectId: t.projectId ?? null, description: t.description ?? null, dueDate: t.dueDate ?? null });
    }

    // Agents
    const seedAgents: InsertAgent[] = [
      { name: "Route Planner Agent", type: "route-planner", status: "running", description: "Optimizes multi-vehicle routes using VRP algorithms", projectId: 1, lastRun: "2 min ago", runsToday: 47, successRate: 98 },
      { name: "Dispatch Communicator", type: "dispatch", status: "idle", description: "Sends optimized routes to drivers via SMS/app", projectId: 2, lastRun: "1 hr ago", runsToday: 12, successRate: 100 },
      { name: "Fleet Monitor", type: "monitor", status: "paused", description: "Tracks carrier scores, weather, and port delays", projectId: 3, lastRun: "3 hrs ago", runsToday: 5, successRate: 92 },
      { name: "Lead Outreach Agent", type: "marketing", status: "running", description: "LinkedIn auto-connect to fleet managers and dispatch supervisors", projectId: null, lastRun: "15 min ago", runsToday: 23, successRate: 85 },
    ];
    for (const a of seedAgents) {
      const id = this.nextAgentId++;
      this.agents.set(id, { ...a, id, name: a.name, type: a.type, status: a.status ?? "idle", description: a.description ?? null, projectId: a.projectId ?? null, lastRun: a.lastRun ?? null, runsToday: a.runsToday ?? 0, successRate: a.successRate ?? 100 });
    }
  }

  // Projects
  async getProjects(): Promise<Project[]> { return Array.from(this.projects.values()); }
  async getProject(id: number): Promise<Project | undefined> { return this.projects.get(id); }
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.nextProjectId++;
    const p: Project = { id, name: project.name, description: project.description ?? null, status: project.status ?? "active", progress: project.progress ?? 0, color: project.color ?? "#4F98A3" };
    this.projects.set(id, p);
    return p;
  }
  async updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.projects.set(id, updated);
    return updated;
  }
  async deleteProject(id: number): Promise<boolean> { return this.projects.delete(id); }

  // Tasks
  async getTasks(): Promise<Task[]> { return Array.from(this.tasks.values()); }
  async getTask(id: number): Promise<Task | undefined> { return this.tasks.get(id); }
  async createTask(task: InsertTask): Promise<Task> {
    const id = this.nextTaskId++;
    const t: Task = { id, title: task.title, description: task.description ?? null, status: task.status ?? "todo", priority: task.priority ?? "medium", projectId: task.projectId ?? null, dueDate: task.dueDate ?? null };
    this.tasks.set(id, t);
    return t;
  }
  async updateTask(id: number, data: Partial<InsertTask>): Promise<Task | undefined> {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.tasks.set(id, updated);
    return updated;
  }
  async deleteTask(id: number): Promise<boolean> { return this.tasks.delete(id); }

  // Agents
  async getAgents(): Promise<Agent[]> { return Array.from(this.agents.values()); }
  async getAgent(id: number): Promise<Agent | undefined> { return this.agents.get(id); }
  async createAgent(agent: InsertAgent): Promise<Agent> {
    const id = this.nextAgentId++;
    const a: Agent = { id, name: agent.name, type: agent.type, description: agent.description ?? null, status: agent.status ?? "idle", projectId: agent.projectId ?? null, lastRun: agent.lastRun ?? null, runsToday: agent.runsToday ?? 0, successRate: agent.successRate ?? 100 };
    this.agents.set(id, a);
    return a;
  }
  async updateAgent(id: number, data: Partial<InsertAgent>): Promise<Agent | undefined> {
    const existing = this.agents.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.agents.set(id, updated);
    return updated;
  }
  async deleteAgent(id: number): Promise<boolean> { return this.agents.delete(id); }
}

export const storage = new MemStorage();

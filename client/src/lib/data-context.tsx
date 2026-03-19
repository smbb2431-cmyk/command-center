import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// Types
export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  color: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: number | null;
  dueDate: string | null;
}

export interface Agent {
  id: number;
  name: string;
  type: string;
  status: string;
  description: string | null;
  projectId: number | null;
  lastRun: string | null;
  runsToday: number;
  successRate: number;
}

// Seed data
const seedProjects: Project[] = [
  { id: 1, name: "Route Optimization MVP", description: "AI-powered route optimization for small fleet operators (5-50 trucks)", status: "active", progress: 45, color: "#0e7490" },
  { id: 2, name: "Dispatch Automation", description: "Automated dispatch communicator agent for driver route notifications", status: "active", progress: 20, color: "#7c3aed" },
  { id: 3, name: "Fleet Monitor Dashboard", description: "Real-time fleet tracking and performance monitoring system", status: "on-hold", progress: 10, color: "#ea580c" },
];

const seedTasks: Task[] = [
  { id: 1, title: "Build VRP solver module", status: "in-progress", priority: "high", projectId: 1, description: "Implement Vehicle Routing Problem solver using OR-Tools", dueDate: "2026-03-25" },
  { id: 2, title: "Design stop-list import UI", status: "todo", priority: "medium", projectId: 1, description: "CSV/Excel import for daily stop lists", dueDate: "2026-03-28" },
  { id: 3, title: "Set up SMS gateway integration", status: "todo", priority: "high", projectId: 2, description: "Twilio integration for driver notifications", dueDate: "2026-03-22" },
  { id: 4, title: "Create driver mobile view", status: "todo", priority: "medium", projectId: 2, description: "Responsive route view for drivers on mobile", dueDate: "2026-04-01" },
  { id: 5, title: "Define fleet KPI metrics", status: "done", priority: "low", projectId: 3, description: "Identify key metrics: on-time %, fuel cost, idle time", dueDate: "2026-03-15" },
  { id: 6, title: "API rate limiter for route calls", status: "in-progress", priority: "urgent", projectId: 1, description: "Prevent abuse of Google Maps API quota", dueDate: "2026-03-20" },
  { id: 7, title: "Write beta onboarding flow", status: "todo", priority: "medium", projectId: 1, description: "Guided setup for new fleet operator accounts", dueDate: "2026-04-05" },
];

const seedAgents: Agent[] = [
  { id: 1, name: "Route Planner Agent", type: "route-planner", status: "running", description: "Optimizes multi-vehicle routes using VRP algorithms", projectId: 1, lastRun: "2 min ago", runsToday: 47, successRate: 98 },
  { id: 2, name: "Dispatch Communicator", type: "dispatch", status: "idle", description: "Sends optimized routes to drivers via SMS/app", projectId: 2, lastRun: "1 hr ago", runsToday: 12, successRate: 100 },
  { id: 3, name: "Fleet Monitor", type: "monitor", status: "paused", description: "Tracks carrier scores, weather, and port delays", projectId: 3, lastRun: "3 hrs ago", runsToday: 5, successRate: 92 },
  { id: 4, name: "Lead Outreach Agent", type: "marketing", status: "running", description: "LinkedIn auto-connect to fleet managers and dispatch supervisors", projectId: null, lastRun: "15 min ago", runsToday: 23, successRate: 85 },
];

interface DataContextType {
  projects: Project[];
  tasks: Task[];
  agents: Agent[];
  addProject: (p: Omit<Project, "id">) => void;
  updateProject: (id: number, data: Partial<Project>) => void;
  deleteProject: (id: number) => void;
  addTask: (t: Omit<Task, "id">) => void;
  updateTask: (id: number, data: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  addAgent: (a: Omit<Agent, "id">) => void;
  updateAgent: (id: number, data: Partial<Agent>) => void;
  deleteAgent: (id: number) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

let nextId = 100;

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [agents, setAgents] = useState<Agent[]>(seedAgents);

  const addProject = useCallback((p: Omit<Project, "id">) => {
    setProjects(prev => [...prev, { ...p, id: nextId++ }]);
  }, []);
  const updateProject = useCallback((id: number, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);
  const deleteProject = useCallback((id: number) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const addTask = useCallback((t: Omit<Task, "id">) => {
    setTasks(prev => [...prev, { ...t, id: nextId++ }]);
  }, []);
  const updateTask = useCallback((id: number, data: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);
  const deleteTask = useCallback((id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const addAgent = useCallback((a: Omit<Agent, "id">) => {
    setAgents(prev => [...prev, { ...a, id: nextId++ }]);
  }, []);
  const updateAgent = useCallback((id: number, data: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  }, []);
  const deleteAgent = useCallback((id: number) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <DataContext.Provider value={{
      projects, tasks, agents,
      addProject, updateProject, deleteProject,
      addTask, updateTask, deleteTask,
      addAgent, updateAgent, deleteAgent,
    }}>
      {children}
    </DataContext.Provider>
  );
}

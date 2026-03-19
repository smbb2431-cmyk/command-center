import { LayoutDashboard, CheckSquare, FolderKanban, Bot, Sun, Moon } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

const navItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "AI Agents", url: "/agents", icon: Bot },
];

export function AppSidebar({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-label="Command Center Logo">
            <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <path d="M9 12h14M9 16h10M9 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
            <circle cx="24" cy="20" r="3" fill="currentColor" className="text-primary" />
          </svg>
          <span className="font-semibold text-sm tracking-tight">Command Center</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} data-testid={`nav-${item.title.toLowerCase()}`}>
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-md transition-colors"
          data-testid="button-theme-toggle"
        >
          {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          <span>{isDark ? "Light mode" : "Dark mode"}</span>
        </button>
        <PerplexityAttribution />
      </SidebarFooter>
    </Sidebar>
  );
}

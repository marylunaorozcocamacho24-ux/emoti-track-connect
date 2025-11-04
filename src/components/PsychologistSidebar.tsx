import { NavLink } from "react-router-dom";
import { Users, FileText, ClipboardList, MessageSquare, Calendar, BarChart3, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Mis Pacientes", url: "/psicologo", icon: Users },
  { title: "Plantillas", url: "/psicologo/plantillas", icon: FileText },
  { title: "Mis Exámenes", url: "/psicologo/tests", icon: ClipboardList },
  { title: "Mensajería", url: "/psicologo/mensajeria", icon: MessageSquare },
  { title: "Agenda", url: "/psicologo/agenda", icon: Calendar },
  { title: "Reportes", url: "/psicologo/reportes", icon: BarChart3 },
  { title: "Configuración", url: "/configuracion-psicologo", icon: Settings },
];

export function PsychologistSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className={cn(
        "border-r border-sidebar-border transition-all",
        isCollapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar">
        {/* Logo/Header */}
        <div className="px-4 py-6 border-b border-sidebar-border">
          {!isCollapsed && (
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">EmotiTrack</h2>
              <p className="text-xs text-muted-foreground">Panel Profesional</p>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                E
              </div>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                        )
                      }
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

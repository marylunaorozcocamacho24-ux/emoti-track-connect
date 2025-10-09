import { NavLink } from "react-router-dom";
import { Home, PenTool, BarChart3, User, Users, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  userType?: 'patient' | 'psychologist';
}

export const Navigation = ({ userType = 'patient' }: NavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary border-t border-border/20 shadow-2xl">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {userType === 'patient' ? (
            <>
              <NavItem to="/paciente" icon={Home} label="Inicio" />
              <NavItem to="/evaluacion-diaria" icon={PenTool} label="Evaluación" />
              <NavItem to="/historial" icon={BarChart3} label="Historial" />
              <NavItem to="/perfil" icon={User} label="Perfil" />
            </>
          ) : (
            <>
              <NavItem to="/psicologo" icon={Users} label="Pacientes" />
              <NavItem to="/alertas" icon={Bell} label="Alertas" />
              <NavItem to="/configuracion-psicologo" icon={Settings} label="Configuración" />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const NavItem = ({ to, icon: Icon, label }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200",
          isActive
            ? "text-emotion-happy"
            : "text-background/80 hover:text-background"
        )
      }
    >
      <Icon className="w-6 h-6 mb-1" />
      <span className="text-xs font-medium">{label}</span>
    </NavLink>
  );
};
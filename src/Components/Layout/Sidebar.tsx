// Sidebar component (placeholder for future use)
import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  icon: ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: <Home size={20} />, label: "Home", path: "/home" },
  { icon: <BarChart3 size={20} />, label: "Dashboard", path: "/sales" },
  { icon: <FileText size={20} />, label: "Reports", path: "/reports" },
  { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
];

const Sidebar = ({ collapsed = false, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-screen bg-twilight text-primary-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Toggle button */}
        <button
          onClick={onToggle}
          className="p-4 hover:bg-grey-blue/50 transition-colors flex justify-end"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors mb-1",
                location.pathname === item.path
                  ? "bg-azure text-accent-foreground"
                  : "hover:bg-grey-blue/50"
              )}
            >
              {item.icon}
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

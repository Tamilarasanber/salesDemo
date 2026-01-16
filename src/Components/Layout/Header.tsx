import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import BrandLogo from "@/Components/Common/BrandLogo";
import { useTheme } from "@/Store/contexts/ThemeContext";

export interface HeaderProps {
  /** Page title displayed next to the logo */
  title?: string;
  /** Subtitle displayed below the title */
  subtitle?: string;
  /** Additional action buttons/elements to show between title and theme toggle */
  actions?: ReactNode;
  /** If true, shows admin user info in profile dropdown (default: false) */
  showAdminProfile?: boolean;
  /** If true, hides the title section (logo only mode, used for Home page) */
  logoOnly?: boolean;
}

const Header = ({
  title,
  subtitle,
  actions,
  showAdminProfile = false,
  logoOnly = false,
}: HeaderProps) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-twilight text-primary-foreground">
      <div className="w-full px-6 h-16 flex items-center justify-between">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/home")}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Go to home"
          >
            <BrandLogo className="h-8 w-auto" forceWhite />
          </button>
          {!logoOnly && title && (
            <div className="border-l border-primary-foreground/20 pl-4">
              <h1 className="text-lg font-bold">{title}</h1>
              {subtitle && (
                <p className="text-xs text-primary-foreground/60">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {actions}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full bg-grey-blue flex items-center justify-center hover:bg-azure/20 transition-colors"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-grey-blue flex items-center justify-center hover:bg-azure/20 transition-colors">
                <User size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {showAdminProfile && (
                <div className="px-3 py-2 border-b border-border">
                  <p className="font-medium text-sm">Admin User</p>
                  <p className="text-xs text-muted-foreground">
                    admin@newage.com
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Role: Administrator
                  </p>
                </div>
              )}
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                <User size={16} />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive cursor-pointer"
                onClick={() => navigate("/")}
              >
                <LogOut size={16} />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;

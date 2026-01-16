import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Shield,
  Building2,
  Globe,
  Clock,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
import { useTheme } from "@/Store/contexts/ThemeContext";
import { toast } from "@/Utils/useToast";
import Header from "@/Components/Layout/Header";
import { changePasswordSchema, ChangePasswordFormData } from "@/schemas/auth.schema";

const Profile = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // User info (mock data - in real app would come from auth context)
  const userInfo = {
    fullName: "Admin User",
    email: "admin@newage.com",
    role: "Administrator",
    department: "Operations",
    company: "Newage Software & Solutions",
    timezone: "Asia/Dubai (GMT+4)",
    lastLogin: new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Password form with React Hook Form + Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handlePasswordChange = async (data: ChangePasswordFormData) => {
    setIsChangingPassword(true);
    // Simulate password change
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsChangingPassword(false);

    // Reset form
    reset();

    toast({
      title: "Password Updated",
      description: "Your password has been updated successfully.",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Header actions for profile page
  const headerActions = (
    <button
      onClick={() => navigate("/home")}
      className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
    >
      <ArrowLeft size={16} />
      Back to Dashboard
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header logoOnly actions={headerActions} />

      {/* Main Content */}
      <main className="w-full max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User size={20} />
                  Basic Information
                </CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-azure/20 flex items-center justify-center text-azure text-2xl font-bold">
                    {getInitials(userInfo.fullName)}
                  </div>

                  {/* Info Grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Full Name
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {userInfo.fullName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Mail size={12} /> Email Address
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {userInfo.email}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Shield size={12} /> Role
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {userInfo.role}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Department
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {userInfo.department}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Building2 size={12} /> Company
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {userInfo.company}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Globe size={12} /> Time Zone
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {userInfo.timezone}
                      </p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Clock size={12} /> Last Login
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {userInfo.lastLogin}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield size={20} />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        {...register("currentPassword")}
                        className="pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-destructive">
                        {errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        {...register("newPassword")}
                        className="pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Min. 8 characters, at least 1 uppercase letter and 1
                      number
                    </p>
                    {errors.newPassword && (
                      <p className="text-sm text-destructive">
                        {errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        {...register("confirmPassword")}
                        className="pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full sm:w-auto bg-azure hover:bg-azure/90 text-accent-foreground"
                  >
                    {isChangingPassword ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Check size={16} />
                        Update Password
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preferences */}
          <div className="space-y-6">
            {/* Account Preferences Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-muted-foreground">
                      {theme === "dark" ? "Dark mode" : "Light mode"}
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                </div>

                <Separator />

                {/* Language */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Language</p>
                    <p className="text-xs text-muted-foreground">
                      English (US)
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Default
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/home")}
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => navigate("/")}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

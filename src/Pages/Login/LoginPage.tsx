import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Eye, EyeOff, LogIn, Moon, Sun, X } from "lucide-react";
import BrandLogo from "@/Components/Common/BrandLogo";
import { useTheme } from "@/Store/contexts/ThemeContext";
import newageLogoWhite from "@/assets/newage-logo-white.png";
import {
  loginSchema,
  forgotPasswordSchema,
  LoginFormData,
  ForgotPasswordFormData,
} from "@/schemas/auth.schema";

const Login = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmailSuccess, setForgotEmailSuccess] = useState(false);
  const [forgotEmailLoading, setForgotEmailLoading] = useState(false);

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Forgot password form
  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
    reset: resetForgot,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
    setForgotEmailLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setForgotEmailLoading(false);
    setForgotEmailSuccess(true);
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    resetForgot();
    setForgotEmailSuccess(false);
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-twilight via-grey-blue to-twilight relative overflow-hidden">
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-twilight/50 to-transparent" />

        {/* Decorative background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-azure/5 blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-lime/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground w-full">
          {/* Logo - Always use white logo on dark gradient background */}
          <div>
            <img
              src={newageLogoWhite}
              alt="Newage Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Hero Text */}
          <div className="space-y-6">
            <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
              Business Intelligence,
              <br />
              <span className="text-azure">Simplified for Logistics</span>
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Turn your logistics and operational data into clear, actionable
              insights with enterprise-grade analytics built for
              decision-makers.
            </p>
          </div>

          {/* Footer */}
          <p className="text-sm text-primary-foreground/50">
            © 2025 Newage Software & Solutions. All rights reserved.
          </p>
        </div>

        {/* Decorative geometric elements */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border border-azure/20" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full border border-azure/10" />
        <div className="absolute top-20 right-20 w-40 h-40 rounded-full bg-azure/5" />
        <div className="absolute top-1/2 right-10 w-2 h-24 bg-lime/20 rounded-full" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Theme toggle - top right */}
        <div className="flex justify-end p-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <BrandLogo className="h-10 w-auto mx-auto" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Welcome back
              </h2>
              <p className="text-muted-foreground">
                Sign in to access your analytics dashboard
              </p>
            </div>

            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  {...registerLogin("username")}
                  className="h-12 bg-muted/50 border-border focus:border-azure focus:ring-azure/20 transition-all duration-150"
                  autoComplete="username"
                />
                {loginErrors.username && (
                  <p className="text-sm text-destructive animate-fade-up">
                    {loginErrors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...registerLogin("password")}
                    className="h-12 bg-muted/50 border-border focus:border-azure focus:ring-azure/20 pr-12 transition-all duration-150"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-sm text-destructive animate-fade-up">
                    {loginErrors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-twilight hover:bg-grey-blue text-primary-foreground font-medium transition-all duration-150 focus:ring-2 focus:ring-azure focus:ring-offset-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn size={18} />
                    Sign In
                  </span>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-azure hover:text-azure/80 transition-colors duration-150 focus:outline-none focus:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="p-6 flex justify-end gap-4">
          <Link
            to="/contact"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Contact Us
          </Link>
          <span className="text-border">|</span>
          <Link
            to="/demo"
            className="text-sm text-azure hover:text-azure/80 font-medium transition-colors duration-150"
          >
            Get a Demo
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeForgotPasswordModal}
          />

          {/* Modal */}
          <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            {/* Close button */}
            <button
              onClick={closeForgotPasswordModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors duration-150"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">
                Forgot Password
              </h3>

              {!forgotEmailSuccess ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Enter your registered email address to reset your password.
                  </p>

                  <form
                    onSubmit={handleForgotSubmit(handleForgotPasswordSubmit)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="forgot-email"
                        className="text-sm font-medium"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="name@domain.com"
                        {...registerForgot("email")}
                        className="h-12 bg-muted/50 border-border focus:border-azure focus:ring-azure/20 transition-all duration-150"
                        autoComplete="email"
                      />
                      {forgotErrors.email && (
                        <p className="text-sm text-destructive">
                          {forgotErrors.email.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={forgotEmailLoading}
                      className="w-full h-12 bg-twilight hover:bg-grey-blue text-primary-foreground font-medium transition-all duration-150"
                    >
                      {forgotEmailLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-lime/10 border border-lime/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      If this email is registered, a password reset link has
                      been sent.
                    </p>
                  </div>
                  <Button
                    onClick={closeForgotPasswordModal}
                    className="w-full h-12 bg-twilight hover:bg-grey-blue text-primary-foreground font-medium transition-all duration-150"
                  >
                    Back to Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

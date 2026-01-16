import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import {
  ArrowLeft,
  CheckCircle,
  Sparkles,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";
import BrandLogo from "@/Components/Common/BrandLogo";
import { useTheme } from "@/Store/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { demoSchema, DemoFormData } from "@/schemas/demo.schema";

const Demo = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      productInterest: "",
    },
  });

  const onSubmit = async (data: DemoFormData) => {
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-twilight via-grey-blue to-twilight flex items-center justify-center p-8">
        <div className="bg-card rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-border/30">
          <div className="w-16 h-16 bg-lime/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-lime" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Demo Request Received!
          </h2>
          <p className="text-muted-foreground mb-6">
            Our team will contact you within 24 hours to schedule your
            personalized demo.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-twilight hover:bg-grey-blue text-primary-foreground"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-twilight via-grey-blue to-twilight">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <BrandLogo className="h-8 w-auto" />
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-all"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Value Proposition */}
          <div className="space-y-8 text-primary-foreground">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                See Our Platform
                <br />
                <span className="text-azure">In Action</span>
              </h1>
              <p className="text-primary-foreground/80 text-lg">
                Get a personalized demo of our enterprise BI solutions and
                discover how we can transform your logistics data into
                actionable insights.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-azure/20 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-azure" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Real-time Analytics</h3>
                  <p className="text-sm text-primary-foreground/70">
                    Live dashboards with instant insights into your operations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-lime/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-lime" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Lightning Fast Reports</h3>
                  <p className="text-sm text-primary-foreground/70">
                    Generate comprehensive reports in seconds, not hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-azure/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-azure" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Enterprise Security</h3>
                  <p className="text-sm text-primary-foreground/70">
                    Bank-grade security with full compliance support
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-lime/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-lime" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">AI-Powered Insights</h3>
                  <p className="text-sm text-primary-foreground/70">
                    Smart recommendations powered by machine learning
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/20">
              <p className="text-sm text-primary-foreground/60">
                Trusted by 500+ logistics companies worldwide
              </p>
            </div>
          </div>

          {/* Demo Request Form */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/30">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Request a Demo
            </h2>
            <p className="text-muted-foreground mb-6">
              Fill out the form and we'll be in touch shortly.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Acme Logistics Inc."
                  {...register("companyName")}
                  className="h-12 bg-muted/50 border-border focus:border-azure focus:ring-azure/20 transition-all duration-150"
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactName" className="text-sm font-medium">
                  Contact Name
                </Label>
                <Input
                  id="contactName"
                  type="text"
                  placeholder="John Doe"
                  {...register("contactName")}
                  className="h-12 bg-muted/50 border-border focus:border-azure focus:ring-azure/20 transition-all duration-150"
                />
                {errors.contactName && (
                  <p className="text-sm text-destructive">
                    {errors.contactName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    {...register("email")}
                    className="h-12 bg-muted/50 border-border focus:border-azure focus:ring-azure/20 transition-all duration-150"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 890"
                    {...register("phone")}
                    className="h-12 bg-muted/50 border-border focus:border-azure focus:ring-azure/20 transition-all duration-150"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="productInterest"
                  className="text-sm font-medium"
                >
                  Product Interest
                </Label>
                <Controller
                  name="productInterest"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-12 bg-muted/50 border-border focus:border-azure focus:ring-azure/20">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bi-dashboard">BI Dashboard</SelectItem>
                        <SelectItem value="freight-management">
                          Freight Management
                        </SelectItem>
                        <SelectItem value="warehouse-analytics">
                          Warehouse Analytics
                        </SelectItem>
                        <SelectItem value="full-suite">Full Suite</SelectItem>
                        <SelectItem value="custom">Custom Solution</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.productInterest && (
                  <p className="text-sm text-destructive">
                    {errors.productInterest.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-lime hover:bg-lime/90 text-twilight font-medium transition-all duration-150"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-twilight/30 border-t-twilight rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles size={18} />
                    Request Demo
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;

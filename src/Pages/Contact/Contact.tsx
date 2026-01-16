import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
} from "lucide-react";
import BrandLogo from "@/Components/Common/BrandLogo";
import { useTheme } from "@/Store/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { contactSchema, ContactFormData } from "@/schemas/contact.schema";

const Contact = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
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
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Message Sent!
          </h2>
          <p className="text-muted-foreground mb-6">
            Thank you for reaching out. Our team will get back to you within 24
            hours.
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
          {/* Contact Information */}
          <div className="space-y-8 text-primary-foreground">
            <div>
              <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
              <p className="text-primary-foreground/80 text-lg">
                Have questions about our solutions? We're here to help.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-azure/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-azure" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a
                    href="mailto:info@newage-global.com"
                    className="text-azure hover:underline"
                  >
                    info@newage-global.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-azure/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-azure" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <a
                    href="tel:+971-4-123-4567"
                    className="text-azure hover:underline"
                  >
                    +971 4 123 4567
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-azure/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-azure" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Office Location</h3>
                  <p className="text-primary-foreground/80">
                    Dubai Internet City
                    <br />
                    Building 1, Office 301
                    <br />
                    Dubai, United Arab Emirates
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/20">
              <p className="text-sm text-primary-foreground/60">
                © 2025 Newage Software & Solutions. All rights reserved.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/30">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Your Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  className="h-12 bg-muted/50 border-border focus:border-azure focus:ring-azure/20 transition-all duration-150"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
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
                <Label htmlFor="message" className="text-sm font-medium">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="How can we help you?"
                  {...register("message")}
                  rows={5}
                  className="bg-muted/50 border-border focus:border-azure focus:ring-azure/20 resize-none transition-all duration-150"
                />
                {errors.message && (
                  <p className="text-sm text-destructive">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-azure hover:bg-azure/90 text-twilight font-medium transition-all duration-150"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-twilight/30 border-t-twilight rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send size={18} />
                    Send Message
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

export default Contact;

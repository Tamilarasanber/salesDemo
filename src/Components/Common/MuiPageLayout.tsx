// Reusable Page Layout container with Tailwind flex/grid support
import React, { ReactNode } from "react";
import { Box, Container, Typography } from "@mui/material";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  containerClassName?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  headerActions?: ReactNode;
  fullWidth?: boolean;
}

const MuiPageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  className,
  containerClassName,
  maxWidth = "xl",
  headerActions,
  fullWidth = false,
}) => {
  return (
    <Box 
      component="main"
      className={cn("min-h-screen bg-background", className)}
    >
      <Container 
        maxWidth={fullWidth ? false : maxWidth}
        className={cn("py-6 px-4 md:px-6", containerClassName)}
      >
        {(title || headerActions) && (
          <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <Box>
              {title && (
                <Typography 
                  variant="h4" 
                  component="h1"
                  className="text-foreground font-semibold"
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography 
                  variant="body1" 
                  className="text-muted-foreground mt-1"
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            {headerActions && (
              <Box className="flex items-center gap-2">
                {headerActions}
              </Box>
            )}
          </Box>
        )}
        {children}
      </Container>
    </Box>
  );
};

export default MuiPageLayout;

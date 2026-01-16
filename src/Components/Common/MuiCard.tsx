// Reusable MUI Card wrapper component with Tailwind support
import React, { ReactNode } from "react";
import { 
  Card as MuiCard, 
  CardContent, 
  CardHeader, 
  CardActions,
  CardProps as MuiCardProps 
} from "@mui/material";
import { cn } from "@/lib/utils";

interface CardProps extends MuiCardProps {
  className?: string;
  title?: string;
  subheader?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  contentClassName?: string;
}

const Card: React.FC<CardProps> = ({ 
  className, 
  title,
  subheader,
  headerAction,
  children,
  actions,
  contentClassName,
  ...props 
}) => {
  return (
    <MuiCard className={cn(className)} {...props}>
      {(title || subheader) && (
        <CardHeader 
          title={title} 
          subheader={subheader}
          action={headerAction}
        />
      )}
      <CardContent className={cn(contentClassName)}>
        {children}
      </CardContent>
      {actions && (
        <CardActions>
          {actions}
        </CardActions>
      )}
    </MuiCard>
  );
};

export default Card;

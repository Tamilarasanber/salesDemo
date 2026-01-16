// Reusable MUI Button wrapper component
import React from "react";
import { Button as MuiButton, ButtonProps as MuiButtonProps } from "@mui/material";
import { cn } from "@/lib/utils";

interface ButtonProps extends MuiButtonProps {
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = "contained",
  ...props 
}) => {
  return (
    <MuiButton
      variant={variant}
      className={cn(className)}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;

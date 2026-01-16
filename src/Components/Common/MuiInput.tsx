// Reusable MUI TextField wrapper component
import React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { cn } from "@/lib/utils";

interface InputProps extends Omit<TextFieldProps, "variant"> {
  className?: string;
  variant?: "outlined" | "filled" | "standard";
}

const Input: React.FC<InputProps> = ({ 
  className, 
  variant = "outlined",
  size = "small",
  ...props 
}) => {
  return (
    <TextField
      variant={variant}
      size={size}
      className={cn(className)}
      {...props}
    />
  );
};

export default Input;

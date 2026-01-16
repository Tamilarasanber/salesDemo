// Reusable MUI Dialog/Modal wrapper component
import React, { ReactNode } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  DialogProps,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { cn } from "@/lib/utils";

interface ModalProps extends Omit<DialogProps, "open"> {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  showCloseButton?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
}

const Modal: React.FC<ModalProps> = ({ 
  open,
  onClose,
  title,
  children,
  actions,
  className,
  contentClassName,
  showCloseButton = true,
  maxWidth = "sm",
  ...props 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      className={cn(className)}
      {...props}
    >
      {title && (
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {title}
          {showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent className={cn(contentClassName)}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;

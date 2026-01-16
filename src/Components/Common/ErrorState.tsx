// Error State component
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/Components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({
  title = "Something went wrong",
  message = "An error occurred while loading the data.",
  onRetry,
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw size={16} />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;

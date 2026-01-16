// No Data component
import { FileX } from "lucide-react";

interface NoDataProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

const NoData = ({
  title = "No data available",
  message = "There is no data to display at this time.",
  icon,
}: NoDataProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon || <FileX className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{message}</p>
    </div>
  );
};

export default NoData;

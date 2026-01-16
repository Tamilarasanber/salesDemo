import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { useDashboardData } from "@/Store/contexts/DashboardDataContext";

const ResetFiltersButton: React.FC<{ className?: string }> = ({ className }) => {
  const { resetFilters } = useDashboardData();

  return (
    <Button
      variant="outline"
      onClick={() => resetFilters()}
      className={`bg-grey-blue border-grey-blue text-primary-foreground hover:bg-azure hover:border-azure hover:text-accent-foreground ${className ?? ""}`}
    >
      <RefreshCw size={16} className="mr-2" />
      Reset
    </Button>
  );
};

export default ResetFiltersButton;

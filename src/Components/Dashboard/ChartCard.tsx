import { useState, useRef, useCallback } from "react";
import {
  Download,
  Maximize2,
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/Components/ui/tooltip";
import ChartExpandModal from "./ChartExpandModal";
import { toast } from "sonner";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  expandedChildren?: React.ReactNode;
  onChartTypeChange?: (type: string) => void;
  chartType?: string;
  className?: string;
  chartId?: string;
}

const chartTypes = [
  { id: "bar", label: "Bar Chart", icon: BarChart3 },
  { id: "line", label: "Line Chart", icon: LineChart },
  { id: "area", label: "Area Chart", icon: AreaChart },
  { id: "pie", label: "Pie Chart", icon: PieChart },
];

const ChartCard = ({
  title,
  subtitle,
  children,
  expandedChildren,
  onChartTypeChange,
  chartType = "bar",
  className = "",
  chartId,
}: ChartCardProps) => {
  const [selectedChartType, setSelectedChartType] = useState(chartType);
  const [isExpanded, setIsExpanded] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleChartTypeChange = (type: string) => {
    setSelectedChartType(type);
    onChartTypeChange?.(type);
  };

  // Generate filename based on chart title and date
  const generateFilename = (format: string) => {
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, "_");
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `${sanitizedTitle}_${date}.${format}`;
  };

  // Export chart as image
  const handleExport = useCallback(
    async (format: "png" | "jpeg" | "svg") => {
      const chartElement = chartRef.current;
      if (!chartElement) {
        toast.error("Unable to export chart");
        return;
      }

      try {
        // Find the SVG element inside the chart
        const svgElement = chartElement.querySelector("svg");
        if (!svgElement) {
          toast.error("No chart found to export");
          return;
        }

        // Clone the SVG
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;

        // Get computed styles and apply them inline
        const svgStyles = window.getComputedStyle(svgElement);
        clonedSvg.setAttribute("width", svgElement.clientWidth.toString());
        clonedSvg.setAttribute("height", svgElement.clientHeight.toString());

        // Add white background for better visibility
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("width", "100%");
        rect.setAttribute("height", "100%");
        rect.setAttribute("fill", "white");
        clonedSvg.insertBefore(rect, clonedSvg.firstChild);

        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const svgBlob = new Blob([svgData], {
          type: "image/svg+xml;charset=utf-8",
        });

        if (format === "svg") {
          // Direct SVG download
          const url = URL.createObjectURL(svgBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = generateFilename("svg");
          link.click();
          URL.revokeObjectURL(url);
          toast.success(`Chart exported as SVG`);
          return;
        }

        // Convert to PNG or JPEG
        const img = new Image();
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = 2; // Higher resolution
          canvas.width = svgElement.clientWidth * scale;
          canvas.height = svgElement.clientHeight * scale;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            toast.error("Unable to export chart");
            return;
          }

          // White background
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);

          const mimeType = format === "png" ? "image/png" : "image/jpeg";
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                toast.error("Unable to export chart");
                return;
              }
              const downloadUrl = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = downloadUrl;
              link.download = generateFilename(format);
              link.click();
              URL.revokeObjectURL(downloadUrl);
              toast.success(`Chart exported as ${format.toUpperCase()}`);
            },
            mimeType,
            0.95
          );

          URL.revokeObjectURL(url);
        };

        img.onerror = () => {
          toast.error("Failed to export chart");
          URL.revokeObjectURL(url);
        };

        img.src = url;
      } catch (error) {
        console.error("Export error:", error);
        toast.error("Failed to export chart");
      }
    },
    [title]
  );

  const CurrentChartIcon =
    chartTypes.find((t) => t.id === selectedChartType)?.icon || BarChart3;

  return (
    <>
      <div className={`chart-container ${className}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Chart Type Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                  <CurrentChartIcon
                    size={16}
                    className="text-muted-foreground"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {chartTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <DropdownMenuItem
                      key={type.id}
                      onClick={() => handleChartTypeChange(type.id)}
                      className={
                        selectedChartType === type.id ? "bg-muted" : ""
                      }
                    >
                      <Icon size={16} className="mr-2" />
                      {type.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                  <Download size={16} className="text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("png")}>
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("jpeg")}>
                  Export as JPEG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("svg")}>
                  Export as SVG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                  onClick={() => setIsExpanded(true)}
                >
                  <Maximize2 size={16} className="text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Expand</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="h-[280px]" ref={chartRef}>
          {children}
        </div>
      </div>

      {/* Expanded Modal */}
      <ChartExpandModal
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        title={title}
        subtitle={subtitle}
        chartType={selectedChartType}
        onChartTypeChange={handleChartTypeChange}
        onExport={handleExport}
      >
        {expandedChildren || children}
      </ChartExpandModal>
    </>
  );
};

export default ChartCard;

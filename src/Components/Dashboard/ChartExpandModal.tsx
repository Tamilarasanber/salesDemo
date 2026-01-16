import { useEffect, useCallback, useRef } from "react";
import {
  X,
  Download,
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
import { Button } from "@/Components/ui/button";
import { toast } from "sonner";

interface ChartExpandModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onExport?: (format: "png" | "jpeg" | "svg") => void;
  chartType?: string;
  onChartTypeChange?: (type: string) => void;
}

const chartTypes = [
  { id: "bar", label: "Bar Chart", icon: BarChart3 },
  { id: "line", label: "Line Chart", icon: LineChart },
  { id: "area", label: "Area Chart", icon: AreaChart },
  { id: "pie", label: "Pie Chart", icon: PieChart },
];

const ChartExpandModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  onExport,
  chartType = "bar",
  onChartTypeChange,
}: ChartExpandModalProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  // Export chart from modal
  const handleModalExport = useCallback(
    async (format: "png" | "jpeg" | "svg") => {
      const chartElement = chartContainerRef.current;
      if (!chartElement) {
        toast.error("Unable to export chart");
        return;
      }

      try {
        const svgElement = chartElement.querySelector("svg");
        if (!svgElement) {
          toast.error("No chart found to export");
          return;
        }

        const clonedSvg = svgElement.cloneNode(true) as SVGElement;
        clonedSvg.setAttribute("width", svgElement.clientWidth.toString());
        clonedSvg.setAttribute("height", svgElement.clientHeight.toString());

        // Add white background
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

        const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, "_");
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const filename = `${sanitizedTitle}_${date}.${format}`;

        if (format === "svg") {
          const url = URL.createObjectURL(svgBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
          toast.success(`Chart exported as SVG`);
          return;
        }

        const img = new Image();
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = 2;
          canvas.width = svgElement.clientWidth * scale;
          canvas.height = svgElement.clientHeight * scale;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            toast.error("Unable to export chart");
            return;
          }

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
              link.download = filename;
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

  if (!isOpen) return null;

  const CurrentChartIcon =
    chartTypes.find((t) => t.id === chartType)?.icon || BarChart3;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[95vw] h-[90vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Chart Type Selector */}
            {onChartTypeChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CurrentChartIcon size={16} />
                    Chart Type
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {chartTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <DropdownMenuItem
                        key={type.id}
                        onClick={() => onChartTypeChange(type.id)}
                        className={chartType === type.id ? "bg-muted" : ""}
                      >
                        <Icon size={16} className="mr-2" />
                        {type.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Export Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download size={16} />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleModalExport("png")}>
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModalExport("jpeg")}>
                  Export as JPEG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModalExport("svg")}>
                  Export as SVG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Close Button */}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Chart Content */}
        <div className="flex-1 p-6 overflow-hidden" ref={chartContainerRef}>
          <div className="w-full h-full">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ChartExpandModal;

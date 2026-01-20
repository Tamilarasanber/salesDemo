import { useState, useMemo } from "react";
import { X, Search, Save, Check, Trash2, Star, Edit2 } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Checkbox } from "@/Components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Components/ui/dialog";
import { useDashboardData } from "@/Store/contexts/DashboardDataContext";
import { useSalesFilterOptionsQuery } from "@/API/query/SalesPerformanceQuery";
import { useSavedFilters, SavedFilter } from "@/Utils/useSavedFilters";
import { toast } from "sonner";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const periodOptions = [
  { value: "last-4-weeks", label: "Last 4 Weeks" },
  { value: "last-2-months", label: "Last 2 Months" },
  { value: "last-6-months", label: "Last 6 Months" },
  { value: "custom", label: "Custom Range" },
];

const FilterPanel = ({ isOpen, onClose }: FilterPanelProps) => {
  const { filters, applyFilters, resetFilters } = useDashboardData();
  
  // Fetch filter options from backend API
  const { data: apiFilterOptions } = useSalesFilterOptionsQuery();
  
  // Map API response to filter options format
  const filterOptions = useMemo(() => ({
    country: apiFilterOptions?.countries || [],
    branch: apiFilterOptions?.branches || [],
    service: apiFilterOptions?.service_types || [],
    trade: apiFilterOptions?.trades || [],
    customer: apiFilterOptions?.customers || [],
    salesman: apiFilterOptions?.salesmen || [],
    agent: apiFilterOptions?.agents || [],
    carrier: apiFilterOptions?.carriers || [],
    tradelane: apiFilterOptions?.tradelanes || [],
    product: apiFilterOptions?.products || [],
    tos: apiFilterOptions?.tos_options || [],
  }), [apiFilterOptions]);

  const {
    savedFilters,
    saveCurrentFilters,
    deleteFilter,
    setAsDefault,
    renameFilter,
  } = useSavedFilters();

  const [searchTerm, setSearchTerm] = useState("");
  const [localFilters, setLocalFilters] = useState(filters);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [editName, setEditName] = useState("");

  // Sync local filters when panel opens
  useMemo(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  const handleFilterChange = (key: string, value: string | string[]) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleMultiSelectToggle = (key: string, value: string) => {
    const currentValues = (localFilters as any)[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    handleFilterChange(key, newValues);
  };

  const handleApply = () => {
    applyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    resetFilters();
    setLocalFilters({
      period: "last-6-months",
      country: [],
      branch: [],
      service: [],
      trade: [],
      customer: [],
      salesman: [],
      agent: [],
      carrier: [],
      tradelane: [],
      product: [],
      tos: [],
      chartFilters: {},
    });
  };

  const handleSaveFilters = () => {
    if (!newFilterName.trim()) {
      toast.error("Please enter a filter name");
      return;
    }
    saveCurrentFilters(newFilterName.trim(), localFilters);
    toast.success(`Filter "${newFilterName}" saved`);
    setNewFilterName("");
    setSaveDialogOpen(false);
  };

  const handleLoadFilter = (savedFilter: SavedFilter) => {
    setLocalFilters(savedFilter.filters);
    applyFilters(savedFilter.filters);
    toast.success(`Filter "${savedFilter.name}" applied`);
    onClose();
  };

  const handleDeleteFilter = (id: string, name: string) => {
    deleteFilter(id);
    toast.success(`Filter "${name}" deleted`);
  };

  const handleSetDefault = (id: string, name: string) => {
    setAsDefault(id);
    toast.success(`"${name}" set as default`);
  };

  const handleRenameFilter = () => {
    if (!editingFilter || !editName.trim()) return;
    renameFilter(editingFilter.id, editName.trim());
    toast.success("Filter renamed");
    setEditingFilter(null);
    setEditName("");
  };

  // Filter options based on search term
  const filterSearch = (options: string[]) => {
    if (!searchTerm) return options;
    return options.filter((o) =>
      o.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (!isOpen) return null;

  const MultiSelectFilter = ({
    label,
    options,
    filterKey,
  }: {
    label: string;
    options: string[];
    filterKey: keyof typeof localFilters;
  }) => {
    const selectedValues = (localFilters[filterKey] as string[]) || [];
    const filteredOptions = filterSearch(options);

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="border border-border rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
          {filteredOptions.length === 0 ? (
            <p className="text-xs text-muted-foreground p-2">
              No options available
            </p>
          ) : (
            filteredOptions.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 p-1 hover:bg-muted rounded cursor-pointer"
              >
                <Checkbox
                  checked={selectedValues.includes(opt)}
                  onCheckedChange={() =>
                    handleMultiSelectToggle(filterKey as string, opt)
                  }
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))
          )}
        </div>
        {selectedValues.length > 0 && (
          <p className="text-xs text-azure">{selectedValues.length} selected</p>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-card border-l border-border shadow-xl z-50 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Saved Views */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Saved Views</Label>
            <button
              className="text-xs text-azure hover:underline flex items-center gap-1"
              onClick={() => setSaveDialogOpen(true)}
            >
              <Save size={12} />
              Save Current
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedFilters.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No saved filters yet
              </p>
            ) : (
              savedFilters.map((view) => (
                <DropdownMenu key={view.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`filter-chip ${
                        view.isDefault ? "bg-azure/20 text-azure" : ""
                      }`}
                    >
                      {view.name}
                      {view.isDefault && <Check size={12} />}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleLoadFilter(view)}>
                      <Check size={14} className="mr-2" />
                      Apply Filter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSetDefault(view.id, view.name)}
                    >
                      <Star size={14} className="mr-2" />
                      Set as Default
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingFilter(view);
                        setEditName(view.name);
                      }}
                    >
                      <Edit2 size={14} className="mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteFilter(view.id, view.name)}
                      className="text-destructive"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))
            )}
          </div>
        </div>

        {/* Filters */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-5">
            {/* Period */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Period</Label>
              <Select
                value={localFilters.period}
                onValueChange={(value) => handleFilterChange("period", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search within filters */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search filter options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Multi-select filters */}
            <MultiSelectFilter
              label="Country"
              options={filterOptions.country}
              filterKey="country"
            />
            <MultiSelectFilter
              label="Branch"
              options={filterOptions.branch}
              filterKey="branch"
            />
            <MultiSelectFilter
              label="Service"
              options={filterOptions.service}
              filterKey="service"
            />
            <MultiSelectFilter
              label="Trade"
              options={filterOptions.trade}
              filterKey="trade"
            />
            <MultiSelectFilter
              label="Customer"
              options={filterOptions.customer}
              filterKey="customer"
            />
            <MultiSelectFilter
              label="Salesman"
              options={filterOptions.salesman}
              filterKey="salesman"
            />
            <MultiSelectFilter
              label="Agent"
              options={filterOptions.agent}
              filterKey="agent"
            />
            <MultiSelectFilter
              label="Carrier"
              options={filterOptions.carrier}
              filterKey="carrier"
            />
            <MultiSelectFilter
              label="Tradelane"
              options={filterOptions.tradelane}
              filterKey="tradelane"
            />
            <MultiSelectFilter
              label="Product"
              options={filterOptions.product}
              filterKey="product"
            />
            <MultiSelectFilter
              label="Terms of Service"
              options={filterOptions.tos}
              filterKey="tos"
            />
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Reset
          </Button>
          <Button
            className="flex-1 bg-azure hover:bg-azure/90 text-accent-foreground"
            onClick={handleApply}
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Save Filter Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current Filters</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="filterName">Filter Name</Label>
            <Input
              id="filterName"
              value={newFilterName}
              onChange={(e) => setNewFilterName(e.target.value)}
              placeholder="e.g., Q4 Export Overview"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveFilters}
              className="bg-azure hover:bg-azure/90"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Filter Dialog */}
      <Dialog
        open={!!editingFilter}
        onOpenChange={(open) => !open && setEditingFilter(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Filter</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="editFilterName">New Name</Label>
            <Input
              id="editFilterName"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFilter(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRenameFilter}
              className="bg-azure hover:bg-azure/90"
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FilterPanel;

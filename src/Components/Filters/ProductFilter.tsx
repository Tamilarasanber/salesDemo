// Product Filter component (placeholder)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";

interface ProductFilterProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

const ProductFilter = ({
  options,
  value,
  onChange,
  placeholder = "Select product...",
}: ProductFilterProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Product</label>
      <Select
        value={value[0] || ""}
        onValueChange={(v) => onChange(v ? [v] : [])}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductFilter;

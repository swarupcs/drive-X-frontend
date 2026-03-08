import { useAppDispatch, useAppSelector } from "@/store";
import { setFilterType, setSortBy } from "@/store/slices/uiSlice";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { FilterType, SortField } from "@/types";

const filters: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Folders", value: "other" },
  { label: "Documents", value: "documents" },
  { label: "Images", value: "images" },
  { label: "Videos", value: "videos" },
  { label: "Audio", value: "audio" },
  { label: "Archives", value: "archives" },
];

const sorts: { label: string; value: SortField }[] = [
  { label: "Name", value: "name" },
  { label: "Modified", value: "updatedAt" },
  { label: "Size", value: "size" },
  { label: "Type", value: "type" },
];

export function FilterChips() {
  const dispatch = useAppDispatch();
  const filterType = useAppSelector((s) => s.ui.filterType);
  const sortBy = useAppSelector((s) => s.ui.sortBy);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-border/60 px-4 py-2">
      {filters.map((f) => (
        <Button
          key={f.value}
          size="sm"
          variant="ghost"
          className={cn(
            "h-7 rounded-full px-3 text-xs flex-shrink-0 transition-colors",
            filterType === f.value
              ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          onClick={() => dispatch(setFilterType(f.value))}
          data-testid={`filter-${f.value}`}
        >
          {f.label}
        </Button>
      ))}

      <Separator orientation="vertical" className="h-4 mx-1 flex-shrink-0 opacity-40" />

      <Select value={sortBy} onValueChange={(v) => dispatch(setSortBy(v as SortField))}>
        <SelectTrigger
          className="h-7 w-32 flex-shrink-0 rounded-full text-xs border-0 bg-muted/60 hover:bg-muted focus:ring-0"
          data-testid="select-sort"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sorts.map((s) => (
            <SelectItem key={s.value} value={s.value} className="text-xs">
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

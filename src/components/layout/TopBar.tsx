import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSearchQuery, setViewMode } from "@/store/slices/uiSlice";
import { useFileSearch } from "@/hooks/api/useFileSearch";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationCenter } from "@/components/shared/NotificationCenter";
import { FileIcon } from "@/components/files/FileIcon";
import { KeyboardShortcutsDialog } from "@/components/shared/KeyboardShortcutsDialog";
import { Search, LayoutGrid, List, X, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileItem } from "@/types";

export function TopBar() {
  const dispatch = useAppDispatch();
  const viewMode = useAppSelector((s) => s.ui.viewMode);
  const searchQuery = useAppSelector((s) => s.ui.searchQuery);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [searchFocused, setSearchFocused] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const { data: searchResults } = useFileSearch(localSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchQuery(localSearch));
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, dispatch]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
        setLocalSearch("");
        dispatch(setSearchQuery(""));
      }
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch]);

  const handleSearchClear = useCallback(() => {
    setLocalSearch("");
    dispatch(setSearchQuery(""));
    setSearchFocused(false);
  }, [dispatch]);

  const handleSearch = (value: string) => {
    setLocalSearch(value);
  };

  const handleSearchSelect = (file: FileItem) => {
    if (file.type === "folder") {
      setLocation(`/drive/folder/${file.id}`);
    }
    handleSearchClear();
  };

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground" data-testid="button-sidebar-toggle" />

      <Separator orientation="vertical" className="h-4 opacity-40" />

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={localSearch}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          placeholder="Search files…"
          className={cn(
            "h-8 pl-8 pr-8 text-sm bg-muted/60 border-transparent",
            "hover:bg-muted focus:bg-background focus:border-border",
            "transition-all duration-200 rounded-md"
          )}
          data-testid="input-search"
        />
        {localSearch && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={handleSearchClear}
            data-testid="button-clear-search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {!localSearch && (
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        )}

        {/* Search results dropdown */}
        {searchFocused && localSearch.length > 1 && searchResults && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-float max-h-80 overflow-y-auto z-50">
            {searchResults.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No results for "{localSearch}"</p>
              </div>
            ) : (
              <>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                </div>
                {searchResults.slice(0, 10).map((file: FileItem) => (
                  <button
                    key={file.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50"
                    onClick={() => handleSearchSelect(file)}
                    data-testid={`search-result-${file.id}`}
                  >
                    <FileIcon type={file.type} size="sm" />
                    <div className="flex-1 min-w-0">
                      <span className="truncate font-medium block">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{file.ownerName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-auto flex-shrink-0 uppercase">{file.type}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        {/* View toggle */}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && dispatch(setViewMode(v as "grid" | "list"))}
          className="h-8"
        >
          <ToggleGroupItem value="grid" aria-label="Grid view" className="h-8 w-8 p-0" data-testid="button-grid-view">
            <LayoutGrid className="h-3.5 w-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view" className="h-8 w-8 p-0" data-testid="button-list-view">
            <List className="h-3.5 w-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="h-4 mx-0.5 opacity-40" />

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => setShortcutsOpen(true)}
          data-testid="button-keyboard-shortcuts"
          title="Keyboard shortcuts (?)"
        >
          <Keyboard className="h-3.5 w-3.5" />
        </Button>

        <NotificationCenter />
        <ThemeToggle />
      </div>

      <KeyboardShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </header>
  );
}

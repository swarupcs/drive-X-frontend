import { useState } from "react";
import { useAllFiles } from "@/hooks/api/useAdminData";
import { useDeleteItem } from "@/hooks/api/useMutations";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FileIcon } from "@/components/files/FileIcon";
import { formatFileSize, formatDate } from "@/utils/formatters";
import { Files, Search, Trash2 } from "lucide-react";

const TYPE_BADGE_COLORS: Record<string, string> = {
  pdf: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  docx: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  xlsx: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  csv: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  pptx: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
  jpg: "bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400",
  png: "bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400",
  gif: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  mp4: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  mp3: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400",
  zip: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  folder: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
};

export default function FilesPage() {
  const { data: filesResult, isLoading } = useAllFiles();
  const files = filesResult?.data;
  const deleteMutation = useDeleteItem();
  const [search, setSearch] = useState("");

  const filtered =
    files?.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
            <Files className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold leading-none" data-testid="text-page-title">
                All Files
              </h2>
              <Badge variant="secondary">{files?.length || 0}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage all files across the system
            </p>
          </div>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 bg-muted border-0 rounded-md focus-visible:ring-1"
            data-testid="input-admin-search-files"
          />
        </div>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 50).map((file) => {
                const badgeColor =
                  TYPE_BADGE_COLORS[file.type] ||
                  "bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400";
                return (
                  <TableRow
                    key={file.id}
                    data-testid={`admin-file-row-${file.id}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileIcon type={file.type} size="sm" />
                        <span className="text-sm font-medium truncate max-w-[200px]">
                          {file.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs font-medium uppercase border-0 ${badgeColor}`}
                      >
                        {file.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {file.ownerName}
                    </TableCell>
                    <TableCell className="text-sm">
                      {file.type === "folder" ? "--" : formatFileSize(file.size)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(file.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMutation.mutate(file.id)}
                        data-testid={`button-delete-${file.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

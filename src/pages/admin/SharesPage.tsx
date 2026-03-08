import { useShareLinks } from "@/hooks/api/useAdminData";
import { useRevokeLink } from "@/hooks/api/useMutations";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileIcon } from "@/components/files/FileIcon";
import { formatDate } from "@/utils/formatters";
import { Link, Eye, Edit, Lock, CheckCircle } from "lucide-react";

const permissionColors: Record<string, string> = {
  view: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  edit: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  restricted: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

export default function SharesPage() {
  const { data: linksResult, isLoading } = useShareLinks();
  const links = linksResult?.data;
  const revokeMutation = useRevokeLink();

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const permissionIcons: Record<string, typeof Eye> = {
    view: Eye,
    edit: Edit,
    restricted: Lock,
  };

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/30">
          <Link className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold leading-none" data-testid="text-page-title">
              Shared Links
            </h2>
            <Badge variant="secondary">{links?.length || 0}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor and manage all share links
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Created by</TableHead>
                <TableHead>Permission</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links?.map((link) => {
                const PermIcon = permissionIcons[link.permission] || Eye;
                const permColor =
                  permissionColors[link.permission] ||
                  "bg-slate-50 text-slate-700";
                return (
                  <TableRow key={link.id} data-testid={`link-row-${link.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileIcon type={link.fileType} size="sm" />
                        <span className="text-sm font-medium truncate max-w-[180px]">
                          {link.fileName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {link.creatorName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs border-0 ${permColor}`}
                      >
                        <PermIcon className="h-3 w-3 mr-1" />
                        {link.permission}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{link.accessCount}</TableCell>
                    <TableCell>
                      {link.active ? (
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-0 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Revoked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(link.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={link.active ? "destructive" : "default"}
                        onClick={() => revokeMutation.mutate(link.id)}
                        disabled={revokeMutation.isPending}
                      >
                        {link.active ? "Revoke" : "Activate"}
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

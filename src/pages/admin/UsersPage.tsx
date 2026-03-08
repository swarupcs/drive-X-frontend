import { useUsers } from "@/hooks/api/useAdminData";
import { useSuspendUser } from "@/hooks/api/useMutations";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { formatFileSize, formatDate } from "@/utils/formatters";
import { UserCog, Shield, User, Ban, CheckCircle } from "lucide-react";

export default function UsersPage() {
  const { data: usersResult, isLoading } = useUsers();
  const users = usersResult?.data;
  const suspendMutation = useSuspendUser();

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Page header */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
            <UserCog className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold leading-none" data-testid="text-page-title">
              User Management
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage user accounts and permissions
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {users?.length || 0} users
        </Badge>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => {
                const storagePercent =
                  user.storageQuota > 0
                    ? Math.round((user.storageUsed / user.storageQuota) * 100)
                    : 0;
                return (
                  <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {user.role === "admin" ? (
                          <Shield className="h-3 w-3 mr-1" />
                        ) : (
                          <User className="h-3 w-3 mr-1" />
                        )}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 min-w-[120px]">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(user.storageUsed)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {storagePercent}%
                          </span>
                        </div>
                        <Progress value={storagePercent} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">
                          of {formatFileSize(user.storageQuota)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.status === "active" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-0 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          active
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          <Ban className="h-3 w-3 mr-1" />
                          {user.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={user.status === "active" ? "destructive" : "default"}
                        onClick={() =>
                          suspendMutation.mutate({
                            id: user.id,
                            suspended: user.status === "active",
                          })
                        }
                        disabled={suspendMutation.isPending}
                        data-testid={`button-suspend-${user.id}`}
                      >
                        {user.status === "active" ? "Suspend" : "Activate"}
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

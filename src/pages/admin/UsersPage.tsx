import { useState, useEffect } from "react";
import { useUsers } from "@/hooks/api/useAdminData";
import { useSuspendUser, useAdminUpdateUser } from "@/hooks/api/useMutations";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { formatFileSize, formatDate } from "@/utils/formatters";
import { UserCog, Shield, User, Ban, CheckCircle, Pencil } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  storageUsed: number;
  storageQuota: number;
  createdAt: string;
}

function EditUserModal({
  user,
  open,
  onClose,
}: {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}) {
  const updateMutation = useAdminUpdateUser();
  const [role, setRole] = useState(user?.role ?? "user");
  const [quotaGB, setQuotaGB] = useState(
    user ? Math.round(user.storageQuota / (1024 * 1024 * 1024)) : 5
  );

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setRole(user.role);
      setQuotaGB(Math.round(user.storageQuota / (1024 * 1024 * 1024)));
    }
  }, [user?.id]);

  if (!user) return null;

  const handleSave = () => {
    updateMutation.mutate(
      {
        id: user.id,
        updates: {
          role,
          storageQuota: quotaGB * 1024 * 1024 * 1024,
        },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger data-testid="select-user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Storage Quota (GB)</Label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={quotaGB}
              onChange={(e) => setQuotaGB(Number(e.target.value))}
              data-testid="input-storage-quota"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending} data-testid="button-save-user">
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersPage() {
  const { data: usersResult, isLoading } = useUsers();
  const users = usersResult?.data;
  const suspendMutation = useSuspendUser();
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditUser(user as AdminUser)}
                          data-testid={`button-edit-${user.id}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
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
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditUserModal
        user={editUser}
        open={!!editUser}
        onClose={() => setEditUser(null)}
      />
    </div>
  );
}

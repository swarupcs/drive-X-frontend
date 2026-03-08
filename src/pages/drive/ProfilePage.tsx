import { useState } from "react";
import { useAppSelector } from "@/store";
import { useUpdateProfile } from "@/hooks/api/useMutations";
import { useStorageInfo } from "@/hooks/api/useStorageInfo";
import { formatFileSize } from "@/utils/formatters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Save, Shield, HardDrive, Bell, KeyRound } from "lucide-react";

export default function ProfilePage() {
  const user = useAppSelector((s) => s.auth.user);
  const { data: storage } = useStorageInfo();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notifyUploads, setNotifyUploads] = useState(true);
  const [notifyShares, setNotifyShares] = useState(true);
  const [notifyComments, setNotifyComments] = useState(false);
  const [emailDigest, setEmailDigest] = useState("weekly");

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const storagePct = storage
    ? Math.round((storage.used / storage.quota) * 100)
    : 0;

  const handleSaveProfile = () => {
    if (!name.trim()) return;
    updateProfile.mutate({ name: name.trim() });
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      toast.error("Enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password changed", { description: "Your password has been updated." });
  };

  const handleSaveNotifications = () => {
    toast.success("Notifications updated", { description: "Your notification preferences have been saved." });
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold" data-testid="text-page-title">
          Profile & Settings
        </h2>
      </div>

      {/* Profile header */}
      <div className="flex items-center gap-5 mb-6 p-5 rounded-xl border bg-card shadow-card">
        <Avatar className="h-16 w-16 flex-shrink-0">
          <AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold" data-testid="text-profile-name">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <Badge variant="secondary" className="mt-1.5">
            <Shield className="h-3 w-3 mr-1" />
            {user.role}
          </Badge>
        </div>
        {/* Storage summary */}
        {storage && (
          <div className="hidden sm:block w-48 flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Storage</span>
              <span className="text-xs font-medium">{storagePct}%</span>
            </div>
            <Progress value={storagePct} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground mt-1" data-testid="text-profile-storage-used">
              {formatFileSize(storage.used)} of {formatFileSize(storage.quota)} used
            </p>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-3.5 w-3.5 mr-1.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <KeyRound className="h-3.5 w-3.5 mr-1.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      data-testid="input-profile-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={user.email}
                      readOnly
                      disabled
                      className="opacity-60 cursor-not-allowed"
                      data-testid="input-profile-email"
                    />
                    <p className="text-[11px] text-muted-foreground">Email cannot be changed.</p>
                  </div>
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending || !name.trim() || name.trim() === user.name}
                  data-testid="button-save-profile"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {updateProfile.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Storage
                </CardTitle>
                <CardDescription>Your storage usage overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 mb-2">
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-profile-storage-used">
                      {storage ? formatFileSize(storage.used) : "..."}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      of {storage ? formatFileSize(storage.quota) : "..."} used
                    </p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {storagePct}%
                  </span>
                </div>
                <Progress value={storagePct} className="h-2" />
                {storage && storage.breakdown.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {storage.breakdown.map((b) => (
                      <div key={b.type} className="flex items-center gap-1.5 text-xs">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: b.color }}
                        />
                        <span className="text-muted-foreground">{b.type}</span>
                        <span className="font-medium">{formatFileSize(b.size)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  data-testid="input-current-password"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    data-testid="input-new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>
              <Button onClick={handleChangePassword} variant="outline" data-testid="button-change-password">
                <KeyRound className="h-4 w-4 mr-1" />
                Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Control what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label>Upload notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when uploads complete
                  </p>
                </div>
                <Switch
                  checked={notifyUploads}
                  onCheckedChange={setNotifyUploads}
                  data-testid="switch-notify-uploads"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label>Sharing notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when someone shares with you
                  </p>
                </div>
                <Switch
                  checked={notifyShares}
                  onCheckedChange={setNotifyShares}
                  data-testid="switch-notify-shares"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label>Comment notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified on comments
                  </p>
                </div>
                <Switch
                  checked={notifyComments}
                  onCheckedChange={setNotifyComments}
                  data-testid="switch-notify-comments"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label>Email digest</Label>
                  <p className="text-xs text-muted-foreground">
                    How often to receive summary emails
                  </p>
                </div>
                <Select value={emailDigest} onValueChange={setEmailDigest}>
                  <SelectTrigger className="w-32" data-testid="select-email-digest">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveNotifications} data-testid="button-save-notifications">
                <Save className="h-4 w-4 mr-1" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

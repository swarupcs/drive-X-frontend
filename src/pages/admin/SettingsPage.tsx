import { useState, useEffect } from "react";
import { useAdminSettings } from "@/hooks/api/useAdminData";
import { useUpdateAdminSettings } from "@/hooks/api/useMutations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Save, Share2, UserPlus, History, Database, Megaphone } from "lucide-react";
import type { SystemSettings } from "@/services/admin.service";

const DEFAULT_SETTINGS: SystemSettings = {
  allowPublicSharing: true,
  allowRegistration: true,
  enableFileVersioning: false,
  defaultStorageQuotaGB: 15,
  bannerMessage: "",
  showBanner: false,
};

export default function SettingsPage() {
  const { data: serverSettings, isLoading } = useAdminSettings();
  const updateMutation = useUpdateAdminSettings();
  const [form, setForm] = useState<SystemSettings>(DEFAULT_SETTINGS);

  // Sync form when server data loads
  useEffect(() => {
    if (serverSettings) {
      setForm({
        allowPublicSharing: serverSettings.allowPublicSharing,
        allowRegistration: serverSettings.allowRegistration,
        enableFileVersioning: serverSettings.enableFileVersioning,
        defaultStorageQuotaGB: serverSettings.defaultStorageQuotaGB,
        bannerMessage: serverSettings.bannerMessage,
        showBanner: serverSettings.showBanner,
      });
    }
  }, [serverSettings]);

  const set = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900/50">
          <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold leading-none" data-testid="text-page-title">
            System Settings
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure platform-wide preferences
          </p>
        </div>
      </div>

      {/* Features */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-3.5 w-3.5 text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold">Features</CardTitle>
          </div>
          <CardDescription>Toggle system features on or off</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <div className="flex items-center justify-between gap-4 py-3 border-b">
            <div className="flex items-start gap-3">
              <Share2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <Label className="text-sm font-medium">Public sharing</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow users to create public share links
                </p>
              </div>
            </div>
            <Switch
              checked={form.allowPublicSharing}
              onCheckedChange={(v) => set("allowPublicSharing", v)}
              data-testid="switch-public-sharing"
            />
          </div>
          <div className="flex items-center justify-between gap-4 py-3 border-b">
            <div className="flex items-start gap-3">
              <UserPlus className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <Label className="text-sm font-medium">User registration</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow new users to register
                </p>
              </div>
            </div>
            <Switch
              checked={form.allowRegistration}
              onCheckedChange={(v) => set("allowRegistration", v)}
              data-testid="switch-registration"
            />
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-start gap-3">
              <History className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <Label className="text-sm font-medium">File versioning</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Keep version history for files
                </p>
              </div>
            </div>
            <Switch
              checked={form.enableFileVersioning}
              onCheckedChange={(v) => set("enableFileVersioning", v)}
              data-testid="switch-versioning"
            />
          </div>
        </CardContent>
      </Card>

      {/* Default Quota */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/30">
              <Database className="h-3.5 w-3.5 text-orange-600" />
            </div>
            <CardTitle className="text-sm font-semibold">Default Quota</CardTitle>
          </div>
          <CardDescription>Default storage quota assigned to new users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={1}
              max={1000}
              value={form.defaultStorageQuotaGB}
              onChange={(e) => set("defaultStorageQuotaGB", Math.max(1, Math.min(1000, Number(e.target.value))))}
              className="w-28"
              data-testid="input-default-quota"
            />
            <span className="text-sm text-muted-foreground">GB per user</span>
          </div>
        </CardContent>
      </Card>

      {/* System Banner */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Megaphone className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <CardTitle className="text-sm font-semibold">System Banner</CardTitle>
          </div>
          <CardDescription>Display an announcement banner to all users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter banner message..."
            value={form.bannerMessage}
            onChange={(e) => set("bannerMessage", e.target.value)}
            maxLength={500}
            data-testid="input-banner"
          />
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm font-medium">Show banner</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Displays the message above to all logged-in users
              </p>
            </div>
            <Switch
              checked={form.showBanner}
              onCheckedChange={(v) => set("showBanner", v)}
              data-testid="switch-banner"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={updateMutation.isPending}
        data-testid="button-save-settings"
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        {updateMutation.isPending ? "Saving..." : "Save settings"}
      </Button>
    </div>
  );
}

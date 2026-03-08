import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Save, Share2, UserPlus, History, Database, Megaphone } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const handleSave = () => {
    toast.success("Settings saved", { description: "System settings have been updated." });
  };

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
          <div className="flex items-center justify-between gap-4 py-3 border-b last:border-0">
            <div className="flex items-start gap-3">
              <Share2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <Label className="text-sm font-medium">Public sharing</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow users to create public share links
                </p>
              </div>
            </div>
            <Switch defaultChecked data-testid="switch-public-sharing" />
          </div>
          <div className="flex items-center justify-between gap-4 py-3 border-b last:border-0">
            <div className="flex items-start gap-3">
              <UserPlus className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <Label className="text-sm font-medium">User registration</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow new users to register
                </p>
              </div>
            </div>
            <Switch defaultChecked data-testid="switch-registration" />
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
            <Switch data-testid="switch-versioning" />
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
          <CardDescription>Default storage quota for new users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              defaultValue="15"
              className="w-28 bg-muted border-0"
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
          <CardDescription>Display a banner message to all users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter banner message..."
            className="bg-muted border-0"
            data-testid="input-banner"
          />
          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm font-medium">Show banner</Label>
            <Switch data-testid="switch-banner" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} data-testid="button-save-settings" className="gap-2">
        <Save className="h-4 w-4" />
        Save settings
      </Button>
    </div>
  );
}

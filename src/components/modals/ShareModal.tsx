import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGenerateShareLink } from "@/hooks/api/useMutations";
import { Copy, Link, Globe, X, Users } from "lucide-react";
import { toast } from "sonner";
import type { FileItem, SharedUser } from "@/types";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  file: FileItem | null;
  onShare: (fileId: string, users: SharedUser[]) => void;
}

export function ShareModal({ open, onClose, file, onShare }: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"viewer" | "commenter" | "editor">("viewer");
  const [linkPermission, setLinkPermission] = useState<"view" | "edit" | "restricted">("view");
  const generateLink = useGenerateShareLink();
  const [shareLink, setShareLink] = useState<string | null>(null);

  if (!file) return null;

  const handleAddPerson = () => {
    if (!email.trim()) return;
    const newUser: SharedUser = {
      userId: email,
      email: email.trim(),
      name: email.split("@")[0],
      permission,
    };
    const updated = [...file.sharedWith.filter((u) => u.email !== email.trim()), newUser];
    onShare(file.id, updated);
    setEmail("");
  };

  const handleRemovePerson = (userId: string) => {
    const updated = file.sharedWith.filter((u) => u.userId !== userId);
    onShare(file.id, updated);
  };

  const handleGenerateLink = () => {
    generateLink.mutate(
      { fileId: file.id, permission: linkPermission, expiresAt: null },
      {
        onSuccess: (link) => {
          const url = `${window.location.origin}/share/${link.id}`;
          setShareLink(url);
        },
      }
    );
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast.success("Link copied", { description: "Share link copied to clipboard." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share "{file.name}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add people by email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPerson()}
              className="flex-1"
              data-testid="input-share-email"
            />
            <Select value={permission} onValueChange={(v) => setPermission(v as typeof permission)}>
              <SelectTrigger className="w-28" data-testid="select-share-permission">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="commenter">Commenter</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddPerson} data-testid="button-add-person">Add</Button>
          </div>

          {file.sharedWith.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">People with access</p>
              {file.sharedWith.map((user) => (
                <div key={user.userId} className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {user.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{user.permission}</span>
                  <Button size="icon" variant="ghost" onClick={() => handleRemovePerson(user.userId)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Get shareable link</span>
            </div>
            <div className="flex gap-2">
              <Select value={linkPermission} onValueChange={(v) => setLinkPermission(v as typeof linkPermission)}>
                <SelectTrigger className="w-32" data-testid="select-link-permission">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Can view</SelectItem>
                  <SelectItem value="edit">Can edit</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleGenerateLink} disabled={generateLink.isPending} data-testid="button-generate-link">
                <Link className="mr-2 h-4 w-4" />
                Generate link
              </Button>
            </div>
            {shareLink && (
              <div className="flex gap-2 items-center">
                <Input value={shareLink} readOnly className="text-xs flex-1" data-testid="input-share-link" />
                <Button size="icon" variant="outline" onClick={handleCopyLink} data-testid="button-copy-link">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

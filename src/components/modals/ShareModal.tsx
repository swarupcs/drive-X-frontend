import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useShareFile, useGenerateShareLink, useToggleShareLink, useRevokeShareLink,
} from "@/hooks/api/useMutations";
import { useFileShareLinks } from "@/hooks/api/useSharedFiles";
import { shareService } from "@/services/share.service";
import {
  Copy, Link, Globe, X, Users, Check, Power, Trash2, Clock, Eye, Pencil, MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/formatters";
import type { FileItem, SharedUser } from "@/types";

// ─── helpers ────────────────────────────────────────────────────────────────

const PERMISSION_ICONS: Record<string, React.ReactNode> = {
  viewer: <Eye className="h-3 w-3" />,
  commenter: <MessageCircle className="h-3 w-3" />,
  editor: <Pencil className="h-3 w-3" />,
};

function getLinkUrl(linkId: string) {
  return `${window.location.origin}/share/${linkId}`;
}

function isExpired(expiresAt: string | null) {
  return !!expiresAt && new Date(expiresAt) < new Date();
}

// ─── People tab ─────────────────────────────────────────────────────────────

function PeopleTab({ file }: { file: FileItem }) {
  const qc = useQueryClient();
  const shareMutation = useShareFile();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<SharedUser["permission"]>("viewer");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Invalid email address");
      return;
    }
    shareMutation.mutate(
      { fileId: file.id, emails: [trimmed], permission },
      {
        onSuccess: () => {
          toast.success(`Shared with ${trimmed}`);
          setEmail("");
        },
      }
    );
  };

  const handleChangePermission = (user: SharedUser, newPerm: SharedUser["permission"]) => {
    shareMutation.mutate({ fileId: file.id, emails: [user.email], permission: newPerm });
  };

  const handleRemove = async (user: SharedUser) => {
    setRemovingId(user.userId);
    try {
      await shareService.removeSharedUser(file.id, user.email);
      qc.invalidateQueries({ queryKey: ["files"] });
      toast.success(`Removed ${user.name}`);
    } catch {
      toast.error("Could not remove user");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add person */}
      <div className="flex gap-2">
        <Input
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 h-9"
          data-testid="input-share-email"
        />
        <Select value={permission} onValueChange={(v) => setPermission(v as SharedUser["permission"])}>
          <SelectTrigger className="w-32 h-9" data-testid="select-share-permission">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">
              <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />Viewer</span>
            </SelectItem>
            <SelectItem value="commenter">
              <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" />Commenter</span>
            </SelectItem>
            <SelectItem value="editor">
              <span className="flex items-center gap-1.5"><Pencil className="h-3.5 w-3.5" />Editor</span>
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleAdd}
          disabled={shareMutation.isPending || !email.trim()}
          size="sm"
          className="h-9"
          data-testid="button-add-person"
        >
          Share
        </Button>
      </div>

      {/* Current people */}
      {file.sharedWith.length > 0 ? (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            People with access
          </p>
          <div className="space-y-1">
            {file.sharedWith.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-muted/50 group"
              >
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                    {user.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>
                <Select
                  value={user.permission}
                  onValueChange={(v) => handleChangePermission(user, v as SharedUser["permission"])}
                >
                  <SelectTrigger className="h-7 w-28 text-xs border-0 bg-transparent hover:bg-muted focus:ring-0">
                    <span className="flex items-center gap-1">
                      {PERMISSION_ICONS[user.permission]}
                      <span className="capitalize">{user.permission}</span>
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="commenter">Commenter</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                  disabled={removingId === user.userId}
                  onClick={() => handleRemove(user)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No one else has access yet.
        </p>
      )}
    </div>
  );
}

// ─── Link tab ────────────────────────────────────────────────────────────────

function LinkTab({ file }: { file: FileItem }) {
  const { data: links, isLoading } = useFileShareLinks(file.id);
  const generateLink = useGenerateShareLink();
  const toggleLink = useToggleShareLink();
  const revokeLink = useRevokeShareLink();
  const [linkPermission, setLinkPermission] = useState<"view" | "edit" | "restricted">("view");
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const handleGenerate = () => {
    generateLink.mutate({
      fileId: file.id,
      permission: linkPermission,
      expiresAt: hasExpiry && expiryDate ? new Date(expiryDate).toISOString() : null,
    });
  };

  const handleCopy = (linkId: string) => {
    navigator.clipboard.writeText(getLinkUrl(linkId));
    setCopiedId(linkId);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedId((prev) => (prev === linkId ? null : prev)), 2000);
  };

  const activeLinks = links?.filter((l) => !isExpired(l.expiresAt)) ?? [];
  const expiredLinks = links?.filter((l) => isExpired(l.expiresAt)) ?? [];

  return (
    <div className="space-y-4">
      {/* Generate new link */}
      <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
          Create link
        </p>

        <div className="flex gap-2">
          <Select value={linkPermission} onValueChange={(v) => setLinkPermission(v as typeof linkPermission)}>
            <SelectTrigger className="flex-1 h-9" data-testid="select-link-permission">
              <Globe className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="view">Can view</SelectItem>
              <SelectItem value="edit">Can edit</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={generateLink.isPending}
            size="sm"
            className="h-9 gap-1.5"
            data-testid="button-generate-link"
          >
            <Link className="h-3.5 w-3.5" />
            Generate
          </Button>
        </div>

        {/* Optional expiry */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHasExpiry((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 text-xs rounded-md px-2 py-1 transition-colors border",
              hasExpiry
                ? "bg-primary/10 text-primary border-primary/20"
                : "text-muted-foreground border-border hover:bg-muted"
            )}
          >
            <Clock className="h-3 w-3" />
            {hasExpiry ? "Expires on" : "No expiry"}
          </button>
          {hasExpiry && (
            <Input
              type="date"
              min={today}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="h-7 w-36 text-xs"
              data-testid="input-expiry-date"
            />
          )}
        </div>
      </div>

      {/* Existing links */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : activeLinks.length === 0 && expiredLinks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">
          No share links yet.
        </p>
      ) : (
        <div className="space-y-2">
          {activeLinks.length > 0 && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Active links
              </p>
              {activeLinks.map((link) => (
                <LinkRow
                  key={link.id}
                  link={link}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                  onToggle={() => toggleLink.mutate({ linkId: link.id, fileId: file.id })}
                  onRevoke={() =>
                    toast("Revoke this link?", {
                      action: {
                        label: "Revoke",
                        onClick: () => revokeLink.mutate(link.id),
                      },
                    })
                  }
                />
              ))}
            </>
          )}
          {expiredLinks.length > 0 && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mt-3">
                Expired
              </p>
              {expiredLinks.map((link) => (
                <LinkRow
                  key={link.id}
                  link={link}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                  onToggle={() => toggleLink.mutate({ linkId: link.id, fileId: file.id })}
                  onRevoke={() => revokeLink.mutate(link.id)}
                  expired
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LinkRow({
  link, copiedId, onCopy, onToggle, onRevoke, expired = false,
}: {
  link: import("@/types").ShareLink;
  copiedId: string | null;
  onCopy: (id: string) => void;
  onToggle: () => void;
  onRevoke: () => void;
  expired?: boolean;
}) {
  const isCopied = copiedId === link.id;
  const url = getLinkUrl(link.id);

  return (
    <div
      className={cn(
        "rounded-lg border p-3 space-y-2",
        !link.active || expired ? "opacity-60" : ""
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge
            variant={link.permission === "edit" ? "default" : "secondary"}
            className="text-[10px] px-1.5 py-0 flex-shrink-0 capitalize"
          >
            {link.permission}
          </Badge>
          {link.expiresAt && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 flex-shrink-0">
              <Clock className="h-2.5 w-2.5" />
              {expired ? "Expired " : "Expires "}
              {formatDate(link.expiresAt)}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {link.accessCount} view{link.accessCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            title={link.active ? "Disable link" : "Enable link"}
            onClick={onToggle}
          >
            <Power className={cn("h-3 w-3", link.active ? "text-emerald-500" : "text-muted-foreground")} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            title="Revoke link"
            onClick={onRevoke}
          >
            <Trash2 className="h-3 w-3 text-destructive/70 hover:text-destructive" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <input
          readOnly
          value={url}
          className="flex-1 rounded-md bg-muted/60 px-2 py-1 text-[11px] text-muted-foreground outline-none truncate"
          data-testid={`input-share-link-${link.id}`}
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7 flex-shrink-0"
          onClick={() => onCopy(link.id)}
          title="Copy link"
          data-testid={`button-copy-link-${link.id}`}
        >
          {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  );
}

// ─── Main modal ──────────────────────────────────────────────────────────────

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  file: FileItem | null;
}

export function ShareModal({ open, onClose, file }: ShareModalProps) {
  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm leading-snug">
            <Users className="h-4 w-4 flex-shrink-0 text-primary" />
            <span className="truncate">Share "{file.name}"</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="people">
          <TabsList className="w-full h-8 mb-4">
            <TabsTrigger value="people" className="flex-1 text-xs gap-1.5">
              <Users className="h-3.5 w-3.5" />
              People
            </TabsTrigger>
            <TabsTrigger value="link" className="flex-1 text-xs gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Share link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="mt-0">
            <PeopleTab file={file} />
          </TabsContent>

          <TabsContent value="link" className="mt-0">
            <LinkTab file={file} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} size="sm">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

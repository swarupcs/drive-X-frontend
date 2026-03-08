import { useEffect, useState } from "react";
import { shareService } from "@/services/share.service";
import { FileIcon, getFileBgGradient } from "@/components/files/FileIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFileSize, formatDate } from "@/utils/formatters";
import { Download, HardDrive, Lock, Calendar, User, FileX, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import type { ShareLink } from "@/types";

interface PublicShareProps {
  linkId: string;
}

function ErrorState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Lock;
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function PublicShare({ linkId }: PublicShareProps) {
  const [link, setLink] = useState<ShareLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    shareService
      .getPublicShareLink(linkId)
      .then(({ link }) => {
        if (link) {
          setLink(link);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [linkId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <ErrorState
        icon={FileX}
        title="Link not found"
        description="This shared link doesn't exist or has been removed."
      />
    );
  }

  if (link && !link.active) {
    return (
      <ErrorState
        icon={ShieldOff}
        title="Access denied"
        description="This link has been revoked by the owner."
      />
    );
  }

  if (link && link.permission === "restricted") {
    return (
      <ErrorState
        icon={Lock}
        title="Restricted access"
        description="You need permission to access this file."
      />
    );
  }

  const gradient = getFileBgGradient(link!.fileType);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-2 shadow-md">
            <HardDrive className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">DriveX</span>
        </div>

        <Card className="shadow-float border-0">
          <CardContent className="pt-8 pb-8 px-8">
            {/* File icon area */}
            <div className="flex flex-col items-center text-center mb-8">
              <div
                className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-inner`}
              >
                <FileIcon type={link!.fileType} size="xl" />
              </div>
              <h2
                className="text-lg font-semibold leading-tight"
                data-testid="text-share-filename"
              >
                {link!.fileName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {formatFileSize(link!.fileSize)}
              </p>
            </div>

            {/* Metadata */}
            <div className="rounded-xl bg-muted/50 divide-y divide-border mb-6">
              <div className="flex items-center gap-3 px-4 py-3">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Shared by</span>
                <span className="text-sm font-medium ml-auto">{link!.creatorName}</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm ml-auto">{formatDate(link!.createdAt)}</span>
              </div>
            </div>

            <Button
              className="w-full gap-2"
              onClick={() =>
                toast.success("Download started", {
                  description: `Downloading "${link!.fileName}"...`,
                })
              }
              data-testid="button-download-share"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
